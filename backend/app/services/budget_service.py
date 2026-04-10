from ..models.financial import Budget
from sqlalchemy import select, func, extract, Integer, and_
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.budget import BudgetCreateSchema
from ..config.database import get_db
from fastapi import Depends
from ..models.transaction import Transaction, TransactionDetail # Import để tính tiền đã tiêu
from ..models.category import Category # Import để lấy tên danh mục cho UI
from datetime import date, datetime, time, timedelta
import calendar


class BudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def set_budget(self, user_id: int, data: BudgetCreateSchema):
        # 1. Tìm ngân sách với hàm extract đã được cast về Integer
        stmt = select(Budget).where(
            and_(
                Budget.user_id == user_id,
                Budget.category_id == data.category_id,
                Budget.is_active == True,
                # Ép kiểu extract về Integer để so sánh chính xác với Python int
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
        else:
            budget_obj = Budget(
                user_id=user_id,
                category_id=data.category_id,
                amount_limit=data.amount_limit,
                start_date=data.start_date,
                end_date=data.end_date,
                period=data.period.value, # Lấy giá trị chuỗi từ Enum
                alert_threshold=data.alert_threshold
            )
            self.db.add(budget_obj)

        # 2. Tính toán spent_amount thực tế
        # Lưu ý: So sánh Transaction.transaction_date (DateTime) với data.start_date (Date)
        actual_spent_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.category_id == data.category_id,
                Transaction.transaction_date >= data.start_date,
                Transaction.transaction_date <= data.end_date,
                Transaction.transaction_type == 'outflow' # Chỉ tính tiền chi
            )
        )
        actual_spent_res = await self.db.execute(actual_spent_stmt)
        # Gán giá trị tạm thời để Schema trả về (không lưu vào cột spent_amount nếu cột đó không tồn tại)
        budget_obj.spent_amount = float(actual_spent_res.scalar() or 0)

        await self.db.commit()
        await self.db.refresh(budget_obj)
        return budget_obj

    async def get_budget_allocation(self, user_id: int, month: int, year: int):
        """
        Lấy dữ liệu phân bổ chi tiêu so với hạn mức (dùng cho UI hiển thị %)
        """
        # 1. Lấy tất cả Budget đang active của user trong tháng/năm này
        stmt = select(Budget, Category.name).join(
            Category, Budget.category_id == Category.category_id
        ).where(
            and_(
                Budget.user_id == user_id,
                Budget.is_active == True,
                extract('month', Budget.start_date) == month,
                extract('year', Budget.start_date) == year
            )
        )
        result = await self.db.execute(stmt)
        budgets = result.all()

        allocation_data = []

        for budget_obj, cat_name in budgets:
            # 2. Tính tổng tiền thực tế đã tiêu cho Category này trong tháng
            spent_stmt = select(func.sum(Transaction.total_amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category_id == budget_obj.category_id,
                    Transaction.transaction_type == 'outflow',
                    extract('month', Transaction.transaction_date) == month,
                    extract('year', Transaction.transaction_date) == year
                )
            )
            spent_res = await self.db.execute(spent_stmt)
            actual_spent = float(spent_res.scalar() or 0)
            
            limit = float(budget_obj.amount_limit)
            
            # 3. Tính toán các chỉ số cho UI
            percentage = round((actual_spent / limit) * 100, 1) if limit > 0 else 0
            remaining = limit - actual_spent

            allocation_data.append({
                "category_name": cat_name,
                "amount_limit": limit,
                "spent_amount": actual_spent,
                "percentage": percentage,
                "remaining_amount": max(0, remaining) # Không để số âm nếu tiêu quá
            })

        # Sắp xếp theo phần trăm tiêu nhiều nhất lên đầu giống UI của bạn
        return sorted(allocation_data, key=lambda x: x['percentage'], reverse=True)

    async def get_remaining_budget(self, user_id: int, month: int, year: int):
        """
        Trả về tổng ngân sách còn lại và danh sách phân bổ theo danh mục
        cho tháng và năm được yêu cầu.
        """
        # Tính tổng inflow và outflow trong tháng (không dùng get_budget_allocation)
        # Xác định khoảng thời gian của tháng
        first_day = date(year, month, 1)
        _, last_day = calendar.monthrange(year, month)
        last_date = date(year, month, last_day)

        start_dt = datetime.combine(first_day, time.min)
        end_dt = datetime.combine(last_date, time.max)

        inflow_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == 'inflow',
                Transaction.transaction_date >= start_dt,
                Transaction.transaction_date <= end_dt,
            )
        )
        outflow_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == 'outflow',
                Transaction.transaction_date >= start_dt,
                Transaction.transaction_date <= end_dt,
            )
        )

        inflow_res = await self.db.execute(inflow_stmt)
        outflow_res = await self.db.execute(outflow_stmt)

        inflow_total = float(inflow_res.scalar() or 0)
        outflow_total = float(outflow_res.scalar() or 0)

        total_remaining = inflow_total - outflow_total

        return {
            "month": month,
            "year": year,
            "inflow_total": inflow_total,
            "outflow_total": outflow_total,
            "total_remaining": total_remaining,
            "allocations": [],
        }
    
   

    async def get_custom_range_history(self, user_id: int, start_date: date, end_date: date):
        """
        Lấy lịch sử chi tiêu trong khoảng start_date -> end_date tùy chỉnh
        """
        # 1. Thiết kế mốc thời gian chuẩn (00:00:00 -> 23:59:59)
        start_dt = datetime.combine(start_date, time.min)
        end_dt = datetime.combine(end_date, time.max)

        # 2. Truy vấn Join: Transaction + Category + TransactionDetail
        stmt = (
            select(
                Transaction, 
                Category.name.label("category_name"),
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
                    Transaction.transaction_type == 'outflow',
                    Transaction.transaction_date >= start_dt,
                    Transaction.transaction_date <= end_dt
                )
            )
            .order_by(Transaction.transaction_date.desc())
        )
        
        result = await self.db.execute(stmt)
        rows = result.all()

        # 3. Xử lý logic nhóm dữ liệu theo ngày
        history_map = {}
        total_period_amount = 0

        for row in rows:
            trans = row.Transaction
            # Lấy ngày theo định dạng YYYY-MM-DD để làm key
            date_key = trans.transaction_date.strftime("%Y-%m-%d")
            amount = float(trans.total_amount)
            total_period_amount += amount

            if date_key not in history_map:
                history_map[date_key] = {
                    "date": date_key,
                    "daily_total": 0,
                    "items": []
                }
            
            # Ưu tiên hiển thị: Ghi chú -> Tên cửa hàng -> Tên danh mục
            display_title = row.note or row.store_name or row.category_name
            
            history_map[date_key]["items"].append({
                "transaction_id": trans.transaction_id,
                "title": display_title,
                "amount": amount,
                "category": row.category_name,
                "time": trans.transaction_date.strftime("%H:%M"),
                "store": row.store_name,
                "payment_method": row.payment_method or "N/A",
                "location": row.location or "N/A"
            })
            history_map[date_key]["daily_total"] += amount

        # Trả về danh sách đã sắp xếp theo ngày mới nhất lên đầu
        sorted_history = sorted(history_map.values(), key=lambda x: x['date'], reverse=True)

        return {
            "start_date": start_date,
            "end_date": end_date,
            "total_period_amount": total_period_amount,
            "history": sorted_history
        }
    
    async def get_spending_comparison(self, user_id: int, target_date: date):
        """
        So sánh tổng chi tiêu tháng này với tháng trước
        """
        # 1. Xác định khoảng thời gian tháng hiện tại (Current Month)
        curr_start = target_date.replace(day=1)
        _, last_day_curr = calendar.monthrange(target_date.year, target_date.month)
        curr_end = target_date.replace(day=last_day_curr)

        # 2. Xác định khoảng thời gian tháng trước (Previous Month)
        # Lấy ngày đầu tiên của tháng này trừ đi 1 ngày để ra tháng trước
        prev_month_end = curr_start - timedelta(days=1)
        prev_start = prev_month_end.replace(day=1)
        
        # 3. Hàm helper để tính tổng chi tiêu trong một khoảng thời gian
        async def get_total_spent(start: date, end: date):
            stmt = select(func.sum(Transaction.total_amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.transaction_type == 'outflow',
                    Transaction.transaction_date >= datetime.combine(start, datetime.min.time()),
                    Transaction.transaction_date <= datetime.combine(end, datetime.max.time())
                )
            )
            result = await self.db.execute(stmt)
            return float(result.scalar() or 0)

        # 4. Thực thi tính toán
        current_total = await get_total_spent(curr_start, curr_end)
        previous_total = await get_total_spent(prev_start, prev_month_end)

        # 5. Tính toán tăng trưởng (%)
        growth_rate = 0
        if previous_total > 0:
            growth_rate = round(((current_total - previous_total) / previous_total) * 100, 2)
        elif current_total > 0:
            growth_rate = 100.0  # Nếu tháng trước không tiêu gì mà tháng này tiêu thì coi như tăng 100%

        return {
            "current_month": {
                "month": curr_start.month,
                "year": curr_start.year,
                "total": current_total
            },
            "previous_month": {
                "month": prev_start.month,
                "year": prev_start.year,
                "total": previous_total
            },
            "growth_rate": growth_rate, # Dương là tăng, âm là giảm
            "is_increased": growth_rate > 0
        }
    
async def get_budget_service(db: AsyncSession = Depends(get_db)):
    return BudgetService(db)