# services/stats_service.py
from datetime import timedelta, date
import calendar
from sqlalchemy import select, func, and_, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from ..config.database import get_db
from ..models.transaction import Transaction
from ..models.category import Category, TransactionType


class StatsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ==========================================
    # THỐNG KÊ THEO DANH MỤC
    # ==========================================
    async def get_stats_by_category(self, user_id: int, month: int, year: int):
        total_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract('month', Transaction.transaction_date) == month,
                func.extract('year', Transaction.transaction_date) == year
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
                func.extract('month', Transaction.transaction_date) == month,
                func.extract('year', Transaction.transaction_date) == year
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
    async def get_daily_trend(self, user_id: int):
        today = date.today()
        year = today.year
        start_date = date(year, 1, 1)

        stmt = select(
            func.date(Transaction.transaction_date).label("date"),
            func.sum(Transaction.total_amount).label("day_total"),
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= today,
            )
        ).group_by(func.date(Transaction.transaction_date))

        result = await self.db.execute(stmt)
        db_data = {}
        for row in result:
            d = row.date if isinstance(row.date, date) else row.date.date()
            db_data[d] = float(row.day_total)

        chart_data = []
        current = start_date
        while current <= today:
            chart_data.append({
                "label": current.strftime("%d/%m"),
                "total_amount": db_data.get(current, 0.0),
            })
            current += timedelta(days=1)

        return self._format_trend_response(chart_data)

    # ==========================================
    # 2. WEEK — chia tuần 01/01 → tuần chứa hôm nay
    #    Mỗi tuần bắt đầu từ Thứ 2, tuần cuối cắt tại hôm nay
    #    Label: "dd/MM-dd/MM"
    # ==========================================
    async def get_weekly_trend(self, user_id: int):
        today = date.today()
        year = today.year
        start_of_year = date(year, 1, 1)

        # Lùi về thứ 2 của tuần chứa 01/01
        week_start = start_of_year - timedelta(days=start_of_year.weekday())
        # Tuần cuối kết thúc tại hôm nay
        final_end = today

        # Tạo danh sách các tuần
        weeks = []
        current_week_start = week_start
        while current_week_start <= final_end:
            current_week_end = min(current_week_start + timedelta(days=6), final_end)
            # Chỉ lấy tuần có overlap với năm hiện tại
            if current_week_end >= start_of_year:
                actual_start = max(current_week_start, start_of_year)
                weeks.append((actual_start, current_week_end))
            current_week_start += timedelta(days=7)

        if not weeks:
            return self._format_trend_response([])

        range_start = weeks[0][0]
        range_end = weeks[-1][1]

        stmt = select(
            func.date(Transaction.transaction_date).label("date"),
            func.sum(Transaction.total_amount).label("day_total"),
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                Transaction.transaction_date >= range_start,
                Transaction.transaction_date <= range_end,
            )
        ).group_by(func.date(Transaction.transaction_date))

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
    # 3. MONTH — T1 → tháng hiện tại, label "Tháng M"
    # ==========================================
    async def get_monthly_trend(self, user_id: int):
        today = date.today()
        year = today.year
        current_month = today.month

        stmt = select(
            func.extract("month", Transaction.transaction_date).cast(Integer).label("month"),
            func.sum(Transaction.total_amount).label("month_total"),
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract("year", Transaction.transaction_date) == year,
            )
        ).group_by(func.extract("month", Transaction.transaction_date))

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
    async def get_trend(self, user_id: int, period_type: str):
        if period_type == "day":
            return await self.get_daily_trend(user_id)
        elif period_type == "week":
            return await self.get_weekly_trend(user_id)
        elif period_type == "month":
            return await self.get_monthly_trend(user_id)
        else:
            raise ValueError("Invalid period type. Must be 'day', 'week', or 'month'.")

    # ==========================================
    # HÀM PHỤ: min/max trên toàn bộ data trả về (bỏ qua amount = 0)
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