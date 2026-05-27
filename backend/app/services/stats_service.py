# services/stats_service.py
from datetime import datetime, timedelta, date
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
    # 1. WEEKLY — query đúng ngày/thứ trong tuần, chỉ trả về ngày có data
    # ==========================================
    async def get_weekly_trend(self, user_id: int, target_date: date):
        start_date = target_date - timedelta(days=target_date.weekday())
        end_date = start_date + timedelta(days=6)

        stmt = select(
            func.date(Transaction.transaction_date).label("date"),
            func.sum(Transaction.total_amount).label("day_total"),
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
            )
        ).group_by(func.date(Transaction.transaction_date))

        result = await self.db.execute(stmt)
        db_data = {row.date: float(row.day_total) for row in result}

        day_labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
        chart_data = [
            {
                "label": label,
                "total_amount": db_data.get(start_date + timedelta(days=i), 0.0),
            }
            for i, label in enumerate(day_labels)
        ]
        return self._format_trend_response(chart_data)

    # ==========================================
    # 2. MONTHLY — trả đủ ngày 1 → 28/29/30/31
    # ==========================================
    async def get_monthly_trend(self, user_id: int, target_date: date):
        year, month = target_date.year, target_date.month
        last_day = calendar.monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, last_day)

        stmt = select(
            func.date(Transaction.transaction_date).label("date"),
            func.sum(Transaction.total_amount).label("day_total"),
        ).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract('month', Transaction.transaction_date) == month,
                func.extract('year', Transaction.transaction_date) == year,
            )
        ).group_by(func.date(Transaction.transaction_date))

        result = await self.db.execute(stmt)
        db_data = {}
        for row in result:
            d = row.date if isinstance(row.date, date) else row.date.date()
            db_data[d.day] = float(row.day_total)

        chart_data = [
            {
                "label": str(d),
                "total_amount": db_data.get(d, 0.0),
            }
            for d in range(1, last_day + 1)
        ]

        return self._format_trend_response(chart_data)

    # ==========================================
    # 3. YEARLY — trả đủ 12 tháng, min/max trong data thực tế
    # ==========================================
    async def get_yearly_trend(self, user_id: int, target_date: date):
        year = target_date.year

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
            for m in range(1, 13)
        ]

        return self._format_trend_response(chart_data)

    # ==========================================
    # DISPATCHER
    # ==========================================
    async def get_trend(self, user_id: int, period_type: str, target_date: date):
        if period_type == "week":
            return await self.get_weekly_trend(user_id, target_date)
        elif period_type == "month":
            return await self.get_monthly_trend(user_id, target_date)
        elif period_type == "year":
            return await self.get_yearly_trend(user_id, target_date)
        else:
            raise ValueError("Invalid period type. Must be 'week', 'month', or 'year'.")

    # ==========================================
    # HÀM PHỤ: min/max tính trên toàn bộ data trả về
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