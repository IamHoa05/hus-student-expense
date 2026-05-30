from datetime import datetime
from decimal import Decimal

from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from app.config.database import get_db
from app.models.notification import Notification, NotificationType
from app.models.financial import Budget
from app.models.transaction import Transaction, TransactionType


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

        
    # ── Helper ──────────────────────────────────────────────
    async def _push(
        self,
        user_id: int,
        title: str,
        body: str,
        type: NotificationType,
        ref_id: int | None = None,
    ) -> None:
        self.db.add(Notification(
            user_id=user_id,
            title=title,
            body=body,
            type=type,
            ref_id=ref_id,
        ))

    # ── Trigger 1: Tạo giao dịch ────────────────────────────
    async def on_transaction_created(
        self,
        user_id: int,
        amount: Decimal,
        category_name: str,
        transaction_type: TransactionType,
        transaction_id: int,
    ) -> None:
        formatted = f"{amount:,.0f}đ".replace(",", ".")

        if transaction_type == TransactionType.OUTFLOW:
            title = "Giao dịch mới"
            body = f"Đã chi {formatted} cho {category_name}"
        else:
            title = "Đã nhận tiền"
            body = f"Đã nhận {formatted} - {category_name}"

        await self._push(
            user_id=user_id,
            title=title,
            body=body,
            type=NotificationType.TRANSACTION,
            ref_id=transaction_id,
        )

    # ── Trigger 2 & 3: Kiểm tra ngân sách ───────────────────
    async def check_budget_alert(
        self,
        user_id: int,
        category_id: int,
        category_name: str,
        transaction_date: datetime,
    ) -> None:
        # Lấy budget active của user + category trong kỳ hiện tại
        budget_result = await self.db.execute(
            select(Budget).where(
                Budget.user_id == user_id,
                Budget.category_id == category_id,
                Budget.is_active == True,
                Budget.start_date <= transaction_date.date(),
                Budget.end_date >= transaction_date.date(),
                Budget.alert_sent == False,
            )
        )
        budget = budget_result.scalar_one_or_none()
        if not budget:
            return

        # Tính tổng đã chi trong kỳ
        spent_result = await self.db.execute(
            select(func.sum(Transaction.total_amount)).where(
                Transaction.user_id == user_id,
                Transaction.category_id == category_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                Transaction.transaction_date >= datetime.combine(budget.start_date, datetime.min.time()),
                Transaction.transaction_date <= datetime.combine(budget.end_date, datetime.max.time()),
            )
        )
        spent = spent_result.scalar() or Decimal("0")
        percent = (spent / budget.amount_limit) * 100

        if percent >= 100:
            await self._push(
                user_id=user_id,
                title="Vượt ngân sách!",
                body=f"Bạn đã vượt ngân sách {category_name} tháng này",
                type=NotificationType.BUDGET_EXCEEDED,
            )
            budget.alert_sent = True

        elif percent >= float(budget.alert_threshold):
            await self._push(
                user_id=user_id,
                title="Sắp vượt ngân sách",
                body=f"Bạn đã dùng {percent:.0f}% ngân sách {category_name}",
                type=NotificationType.BUDGET_WARNING,
            )
            budget.alert_sent = True


def get_notification_service(db: AsyncSession = Depends(get_db)):
    return NotificationService(db)