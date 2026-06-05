# services/stats_service.py
from datetime import timedelta, date, datetime
import calendar
from zoneinfo import ZoneInfo  # Quản lý múi giờ chuẩn của Python
from sqlalchemy import select, func, and_, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from ..config.database import get_db
from ..models.transaction import Transaction
from ..models.category import Category, TransactionType
from ..models.user import User

# Định nghĩa múi giờ Việt Nam
VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

class StatsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ==========================================
    # THỐNG KÊ THEO DANH MỤC
    # ==========================================
    async def get_stats_by_category(self, user_id: int, month: int, year: int):
        # Ép trường transaction_date sang múi giờ VN trước khi extract month/year
        vn_date = func.timezone('Asia/Ho_Chi_Minh', Transaction.transaction_date)
        
        total_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract('month', vn_date) == month,
                func.extract('year', vn_date) == year
            )
        )
        total_res = await self.db.execute(total_stmt)
        grand_total = float(total_res.scalar() or 0)

        if grand_total == 0:
            return []

        stmt = select(
            Category.category_id,
            Category.category_name,
            Category.icon,
            func.sum(Transaction.total_amount).label("category_total"),
            func.count(Transaction.transaction_id).label("transaction_count")
        ).join(
            Transaction, Transaction.category_id == Category.category_id
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract('month', vn_date) == month,
                func.extract('year', vn_date) == year
            )
        ).group_by(
            Category.category_id,
            Category.category_name,
            Category.icon
        ).order_by(func.sum(Transaction.total_amount).desc())

        result = await self.db.execute(stmt)
        return [
            {
                "category_id": row.category_id,
                "category_name": row.category_name,
                "icon": row.icon,
                "total": float(row.category_total),
                "percentage": round((float(row.category_total) / grand_total) * 100, 2),
                "transaction_count": int(row.transaction_count)
            }
            for row in result
        ]

    # ==========================================
    # 1. DAY — 01/01 → hôm nay, label "dd/MM"
    # ==========================================
    async def get_daily_trend(self, user_id: int, category_id: int = None):
        # Lấy ngày hôm nay theo múi giờ Việt Nam chuẩn chỉnh
        today = datetime.now(VN_TZ).date()
        
        # Chuyển đổi ngày tạo user sang múi giờ VN
        start_date_query = select(
            func.date(func.timezone('Asia/Ho_Chi_Minh', User.created_at))
        ).where(User.user_id == user_id)

        result = await self.db.execute(start_date_query)
        start_date = result.scalar() or today  

        # Ép ngày giao dịch trong DB về múi giờ VN để so sánh và group
        vn_tx_date = func.date(Transaction.transaction_date)

        conditions = [
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.OUTFLOW,
            vn_tx_date >= start_date,
            vn_tx_date <= today,
        ]
        
        if category_id is not None:
            conditions.append(Transaction.category_id == category_id)

        stmt = select(
            vn_tx_date.label("date"),
            func.sum(Transaction.total_amount).label("day_total"),
        ).where(and_(*conditions)).group_by(vn_tx_date)

        result = await self.db.execute(stmt)
        
        # 🟢 SỬA TẠI ĐÂY: Ép tất cả key ngày về chuỗi string dạng 'YYYY-MM-DD'
        db_data = {}
        for row in result:
            if row.date is not None:
                # Nếu là đối tượng date/datetime thì đổi sang string, ngược lại nếu là string sẵn thì giữ nguyên
                date_str = row.date.strftime("%Y-%m-%d") if hasattr(row.date, "strftime") else str(row.date)
                db_data[date_str] = float(row.day_total)

        chart_data = []
        current = start_date
        while current <= today:
            # 🟢 SỬA TẠI ĐÂY: Chuyển ngày hiện tại 'current' sang string để so khớp chính xác với dict
            current_str = current.strftime("%Y-%m-%d")
            
            chart_data.append({
                "label": current.strftime("%d/%m"),
                "total_amount": db_data.get(current_str, 0.0), # Lấy tiền theo key string chuẩn đét
            })
            current += timedelta(days=1)

        return self._format_trend_response(chart_data)

    # ==========================================
    # 2. WEEK — chia tuần 01/01 → tuần chứa hôm nay
    # ==========================================
    async def get_weekly_trend(self, user_id: int, category_id: int = None):
        # Lấy ngày hôm nay theo múi giờ Việt Nam
        today = datetime.now(VN_TZ).date()

        start_of_year_query = select(
            func.date(func.timezone('Asia/Ho_Chi_Minh', User.created_at))
        ).where(User.user_id == user_id)

        result = await self.db.execute(start_of_year_query)
        start_of_year = result.scalar() or today  
        
        week_start = start_of_year - timedelta(days=start_of_year.weekday())
        final_end = today

        weeks = []
        current_week_start = week_start
        while current_week_start <= final_end:
            current_week_end = min(current_week_start + timedelta(days=6), final_end)
            if current_week_end >= start_of_year:
                actual_start = max(current_week_start, start_of_year)
                weeks.append((actual_start, current_week_end))
            current_week_start += timedelta(days=7)

        if not weeks:
            return self._format_trend_response([])

        range_start = weeks[0][0]
        vn_tx_date = func.date(func.timezone('Asia/Ho_Chi_Minh', Transaction.transaction_date))

        conditions = [
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.OUTFLOW,
            vn_tx_date >= range_start,
            vn_tx_date <= final_end,
        ]
        
        if category_id is not None:
            conditions.append(Transaction.category_id == category_id)

        stmt = select(
            vn_tx_date.label("date"),
            func.sum(Transaction.total_amount).label("day_total"),
        ).where(and_(*conditions)).group_by(vn_tx_date)

        result = await self.db.execute(stmt)
        db_data = {}
        for row in result:
            d = row.date if isinstance(row.date, date) else row.date.date()
            db_data[d] = float(row.day_total)

        chart_data = []
        for (ws, we) in weeks:
            week_total = 0.0
            cur = ws
            while cur <= we:
                week_total += db_data.get(cur, 0.0)
                cur += timedelta(days=1)

            label = f"{ws.strftime('%d/%m')}-{we.strftime('%d/%m')}"
            chart_data.append({
                "label": label,
                "total_amount": week_total,
            })

        return self._format_trend_response(chart_data)

    # ==========================================
    # 3. MONTH — T1 → tháng hiện tại
    # ==========================================
    async def get_monthly_trend(self, user_id: int, category_id: int = None):
        # Lấy thông tin ngày tháng theo múi giờ Việt Nam
        today = datetime.now(VN_TZ).date()
        year = today.year
        current_month = today.month

        vn_date = func.timezone('Asia/Ho_Chi_Minh', Transaction.transaction_date)

        conditions = [
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.OUTFLOW,
            func.extract("year", vn_date) == year,
        ]
        
        if category_id is not None:
            conditions.append(Transaction.category_id == category_id)

        stmt = select(
            func.extract("month", vn_date).cast(Integer).label("month"),
            func.sum(Transaction.total_amount).label("month_total"),
        ).where(and_(*conditions)).group_by(func.extract("month", vn_date))

        result = await self.db.execute(stmt)
        db_data = {row.month: float(row.month_total) for row in result}

        chart_data = [
            {
                "label": f"T{m}",
                "total_amount": db_data.get(m, 0.0),
            }
            for m in range(1, current_month + 1)
        ]

        return self._format_trend_response(chart_data)

    # ==========================================
    # DISPATCHER
    # ==========================================
    async def get_trend(self, user_id: int, period_type: str, category_id: int = None):
        if period_type == "day":
            return await self.get_daily_trend(user_id, category_id)
        elif period_type == "week":
            return await self.get_weekly_trend(user_id, category_id)
        elif period_type == "month":
            return await self.get_monthly_trend(user_id, category_id)
        else:
            raise ValueError("Invalid period type. Must be 'day', 'week', or 'month'.")

    # ==========================================
    # HÀM PHỤ ĐỊNH DẠNG RESPONSE
    # ==========================================
    def _format_trend_response(self, chart_data: list) -> dict:
        highest = {"label": "N/A", "amount": 0.0}
        lowest = {"label": "N/A", "amount": float("inf")}
        has_data = False

        for item in chart_data:
            amount = item["total_amount"]
            if amount > 0:
                has_data = True
                if amount > highest["amount"]:
                    highest = {"label": item["label"], "amount": amount}
                if amount < lowest["amount"]:
                    lowest = {"label": item["label"], "amount": amount}

        if not has_data:
            return {
                "chart_data": chart_data,
                "highest_label": "N/A",
                "highest_amount": 0.0,
                "lowest_label": "N/A",
                "lowest_amount": 0.0,
            }

        return {
            "chart_data": chart_data,
            "highest_label": highest["label"],
            "highest_amount": highest["amount"],
            "lowest_label": lowest["label"],
            "lowest_amount": lowest["amount"],
        }


def get_stats_service(db: AsyncSession = Depends(get_db)):
    return StatsService(db)