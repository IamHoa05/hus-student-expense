from sqlalchemy import select, func, extract, Integer, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException
from datetime import date, datetime, time, timedelta
import calendar

from ..models.financial import Budget
from ..models.transaction import Transaction, TransactionDetail
from ..models.category import Category
from ..models.category import TransactionType
from ..schemas.budget import BudgetCreateSchema
from ..config.database import get_db


class BudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Helper tính tiền đã tiêu — dùng lại nhiều chỗ
    async def _calc_spent(self, user_id: int, category_id: int, start: date, end: date) -> float:
        stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.category_id == category_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,  # ✅ Dùng Enum
                Transaction.transaction_date >= datetime.combine(start, time.min),
                Transaction.transaction_date <= datetime.combine(end, time.max)
            )
        )
        result = await self.db.execute(stmt)
        return float(result.scalar() or 0)

    async def set_budget(self, user_id: int, data: BudgetCreateSchema):
        # Tìm budget đang active cùng category trong tháng
        stmt = select(Budget).where(
            and_(
                Budget.user_id == user_id,
                Budget.category_id == data.category_id,
                Budget.is_active == True,
                func.extract('month', Budget.start_date).cast(Integer) == data.start_date.month,
                func.extract('year', Budget.start_date).cast(Integer) == data.start_date.year
            )
        )
        result = await self.db.execute(stmt)
        budget_obj = result.scalar_one_or_none()

        if budget_obj:
            budget_obj.amount_limit = data.amount_limit
            budget_obj.start_date = data.start_date
            budget_obj.end_date = data.end_date
            budget_obj.alert_threshold = data.alert_threshold
            budget_obj.alert_sent = False  # ✅ Reset alert khi cập nhật hạn mức mới
        else:
            budget_obj = Budget(
                user_id=user_id,
                category_id=data.category_id,
                amount_limit=data.amount_limit,
                start_date=data.start_date,
                end_date=data.end_date,
                period=data.period,
                alert_threshold=data.alert_threshold
            )
            self.db.add(budget_obj)

        await self.db.commit()
        await self.db.refresh(budget_obj)

        # ✅ Tính động sau commit, không lưu vào DB
        spent = await self._calc_spent(user_id, data.category_id, data.start_date, data.end_date)
        limit = float(budget_obj.amount_limit)

        return {
            "budget_id": budget_obj.budget_id,
            "category_id": budget_obj.category_id,
            "amount_limit": limit,
            "spent_amount": spent,
            "remaining_amount": max(0, limit - spent),
            "percentage_used": round((spent / limit) * 100, 1) if limit > 0 else 0,
            "period": budget_obj.period,
            "start_date": budget_obj.start_date,
            "end_date": budget_obj.end_date,
            "alert_threshold": float(budget_obj.alert_threshold),
            "is_active": budget_obj.is_active,
            "alert_sent": budget_obj.alert_sent
        }

    async def get_budget_allocation(self, user_id: int, month: int, year: int):
        stmt = select(
            Budget, 
            Category.category_id, 
            Category.category_name, 
            Category.icon
        ).join(
            Category, Budget.category_id == Category.category_id
        ).where(
            and_(
                Budget.user_id == user_id,
                Budget.is_active == True,
                func.extract('month', Budget.start_date).cast(Integer) == month,
                func.extract('year', Budget.start_date).cast(Integer) == year
            )
        )
        result = await self.db.execute(stmt)
        budgets = result.all()

        allocation_data = []
        for budget_obj, cat_id, cat_name, icon in budgets:
            spent = await self._calc_spent(
                user_id, budget_obj.category_id,
                budget_obj.start_date, budget_obj.end_date
            )
            limit = float(budget_obj.amount_limit)
            percentage = round((spent / limit) * 100, 1) if limit > 0 else 0

            # Lấy giá trị alert_threshold từ model Budget (ép kiểu float/int tùy cấu trúc DB của bạn)
            # Thêm giá trị mặc định (ví dụ: 80.0) nếu trường này được phép null trong DB
            alert_threshold = float(budget_obj.alert_threshold) if budget_obj.alert_threshold is not None else 80.0

            allocation_data.append({
                "category_id": cat_id,
                "category_name": cat_name,
                "icon": icon,
                "amount_limit": limit,
                "spent_amount": spent,
                "percentage": percentage,
                "remaining_amount": max(0, limit - spent),
                "alert_threshold": alert_threshold  # <--- TRẢ VỀ THÊM TRƯỜNG NÀY
            })

        return sorted(allocation_data, key=lambda x: x['percentage'], reverse=True)

    async def get_remaining_budget(self, user_id: int, month: int, year: int):
        first_day = date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        last_date = date(year, month, last_day)

        async def _sum_by_type(ttype: TransactionType) -> float:
            stmt = select(func.sum(Transaction.total_amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_type == ttype,
                    Transaction.transaction_date >= datetime.combine(first_day, time.min),
                    Transaction.transaction_date <= datetime.combine(last_date, time.max)
                )
            )
            res = await self.db.execute(stmt)
            return float(res.scalar() or 0)

        inflow = await _sum_by_type(TransactionType.INFLOW)
        outflow = await _sum_by_type(TransactionType.OUTFLOW)
        allocations = await self.get_budget_allocation(user_id, month, year)  # ✅ Gọi thật thay vì []

        return {
            "month": month,
            "year": year,
            "inflow_total": inflow,
            "outflow_total": outflow,
            "total_remaining": inflow - outflow,
            "allocations": allocations
        }

    async def get_custom_range_history(self, user_id: int, start_date: date, end_date: date):
        start_dt = datetime.combine(start_date, time.min)
        end_dt = datetime.combine(end_date, time.max)

        stmt = (
            select(
                Transaction,
                Category.category_name,
                TransactionDetail.note,
                TransactionDetail.store_name,
                TransactionDetail.payment_method,
                TransactionDetail.location
            )
            .join(Category, Transaction.category_id == Category.category_id)
            .outerjoin(TransactionDetail, Transaction.transaction_id == TransactionDetail.transaction_id)
            .where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_type == TransactionType.OUTFLOW,  # ✅ Enum
                    Transaction.transaction_date >= start_dt,
                    Transaction.transaction_date <= end_dt
                )
            )
            .order_by(Transaction.transaction_date.desc())
        )

        result = await self.db.execute(stmt)
        rows = result.all()

        history_map = {}
        total = 0

        for row in rows:
            trans = row.Transaction
            date_key = trans.transaction_date.strftime("%Y-%m-%d")
            amount = float(trans.total_amount)
            total += amount

            if date_key not in history_map:
                history_map[date_key] = {"date": date_key, "daily_total": 0, "items": []}

            history_map[date_key]["items"].append({
                "transaction_id": trans.transaction_id,
                "title": row.note or row.store_name or row.category_name,
                "amount": amount,
                "category": row.category_name,
                "time": trans.transaction_date.strftime("%H:%M"),
                "store": row.store_name,
                "payment_method": row.payment_method or "N/A",
                "location": row.location or "N/A"
            })
            history_map[date_key]["daily_total"] += amount

        return {
            "start_date": start_date,
            "end_date": end_date,
            "total_period_amount": total,
            "history": sorted(history_map.values(), key=lambda x: x['date'], reverse=True)
        }

    async def get_spending_comparison(self, user_id: int, target_date: date):
        curr_start = target_date.replace(day=1)
        _, last_day = calendar.monthrange(target_date.year, target_date.month)
        curr_end = target_date.replace(day=last_day)

        prev_end = curr_start - timedelta(days=1)
        prev_start = prev_end.replace(day=1)

        curr_total = await self._calc_spent(user_id, None, curr_start, curr_end) \
            if False else await self._sum_outflow(user_id, curr_start, curr_end)
        prev_total = await self._sum_outflow(user_id, prev_start, prev_end)

        growth = 0
        if prev_total > 0:
            growth = round(((curr_total - prev_total) / prev_total) * 100, 2)
        elif curr_total > 0:
            growth = 100.0

        return {
            "current_month": {"month": curr_start.month, "year": curr_start.year, "total": curr_total},
            "previous_month": {"month": prev_start.month, "year": prev_start.year, "total": prev_total},
            "growth_rate": growth,
            "is_increased": growth > 0
        }

    # Helper riêng cho outflow không lọc category
    async def _sum_outflow(self, user_id: int, start: date, end: date) -> float:
        stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                Transaction.transaction_date >= datetime.combine(start, time.min),
                Transaction.transaction_date <= datetime.combine(end, time.max)
            )
        )
        result = await self.db.execute(stmt)
        return float(result.scalar() or 0)


async def get_budget_service(db: AsyncSession = Depends(get_db)):
    return BudgetService(db)