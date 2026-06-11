from sqlalchemy import select, and_ , extract
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from datetime import datetime

from .notification_service import NotificationService
from ..models.category import Category, TransactionType
from ..models.transaction import Transaction, TransactionDetail, TransactionMedia
from ..config.database import get_db
from ..schemas.transaction import (
    TransactionCreateSchema, 
    TransactionUpdateSchema, 
    TransactionResponseSchema, 
    TransactionsByDateSchema, 
    TransactionsGroupedResponseSchema, 
    TransactionDetailResponseSchema, 
    TransactionSource
)
  
from zoneinfo import ZoneInfo
from collections import defaultdict

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notif_service = NotificationService(db)

    async def create_transaction(self, user_id: int, data: TransactionCreateSchema) -> TransactionResponseSchema:
        try:
            transaction_date = data.transaction_date.replace(tzinfo=None)

            new_trans = Transaction(
                user_id=user_id,
                category_id=data.category_id,
                total_amount=data.amount,
                transaction_type=data.transaction_type,
                transaction_date=transaction_date,
                updated_at=datetime.now(VN_TZ).replace(tzinfo=None),
                source=data.source,
            )
            self.db.add(new_trans)
            await self.db.flush()

            new_detail = TransactionDetail(
                transaction_id=new_trans.transaction_id,
                note=data.note,
            )
            self.db.add(new_detail)

            category = await self.db.get(Category, new_trans.category_id)

            # ── Notification ─────────────────────────────────
            await self.notif_service.on_transaction_created(
                user_id=user_id,
                amount=new_trans.total_amount,
                category_name=category.category_name if category else "Khác",
                transaction_type=new_trans.transaction_type,
                transaction_id=new_trans.transaction_id,
            )

            if data.transaction_type == TransactionType.OUTFLOW and data.category_id:
                await self.notif_service.check_budget_alert(
                    user_id=user_id,
                    category_id=data.category_id,
                    category_name=category.category_name if category else "Khác",
                    transaction_date=new_trans.transaction_date,
                )
            # ─────────────────────────────────────────────────

            await self.db.commit()
            await self.db.refresh(new_trans)

            return TransactionResponseSchema(
                transaction_id=new_trans.transaction_id,
                category_id=new_trans.category_id,
                amount=new_trans.total_amount,
                transaction_type=new_trans.transaction_type,
                transaction_date=new_trans.transaction_date,
                icon=category.icon if category else None,
                category_name=category.category_name if category else None,
                is_settled=False,
                note=new_detail.note,
            )

        except Exception as e:
            await self.db.rollback()
            raise e
        
    async def get_transactions(self, user_id: int) -> TransactionsGroupedResponseSchema:
        stmt = (
            select(
                Transaction,
                TransactionDetail.note,
                Category.category_name,
                Category.icon.label("icon"),
                TransactionMedia.is_settled,
            )
            .join(TransactionDetail, TransactionDetail.transaction_id == Transaction.transaction_id, isouter=True)
            .join(Category, Category.category_id == Transaction.category_id, isouter=True)
            .join(TransactionMedia, TransactionMedia.transaction_id == Transaction.transaction_id, isouter=True)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.transaction_date.desc())
        )
        result = await self.db.execute(stmt)
        rows = result.all()

        vn_tz = ZoneInfo("Asia/Ho_Chi_Minh")
        grouped = defaultdict(list)

        for row in rows:
            trans_dt = row.Transaction.transaction_date
            date_key = trans_dt.strftime("%Y-%m-%d")
            
            grouped[date_key].append(
                TransactionResponseSchema(
                    transaction_id=row.Transaction.transaction_id,
                    category_id=row.Transaction.category_id,
                    amount=row.Transaction.total_amount,
                    transaction_type=row.Transaction.transaction_type,
                    transaction_date=row.Transaction.transaction_date,
                    icon=row.icon,
                    category_name=row.category_name,
                    is_settled=row.is_settled or False,
                    note=row.note,
                    source=row.Transaction.source,
                )
            )

        data = [
            TransactionsByDateSchema(date=date, transactions=txns)
            for date, txns in sorted(grouped.items(), reverse=True)
        ]

        return TransactionsGroupedResponseSchema(data=data)
    async def get_transaction_by_id(self, user_id: int, transaction_id: int) -> TransactionDetailResponseSchema:
        stmt = (
            select(
                Transaction,
                TransactionDetail.note,
                TransactionDetail.store_name,
                TransactionDetail.payment_method,
                TransactionDetail.location,
                TransactionDetail.tags,
                TransactionMedia.image_url,
                TransactionMedia.is_settled,
                TransactionMedia.ocr_raw,
                Category.category_name,
                Category.icon.label("icon"),
            )
            .join(TransactionDetail, TransactionDetail.transaction_id == Transaction.transaction_id, isouter=True)
            .join(TransactionMedia, TransactionMedia.transaction_id == Transaction.transaction_id, isouter=True)
            .join(Category, Category.category_id == Transaction.category_id, isouter=True)
            .where(
                and_(
                    Transaction.transaction_id == transaction_id,
                    Transaction.user_id == user_id
                )
            )
        )
        result = await self.db.execute(stmt)
        row = result.one_or_none()

        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch")

        return TransactionDetailResponseSchema(
            transaction_id=row.Transaction.transaction_id,
            category_id=row.Transaction.category_id,
            amount=row.Transaction.total_amount,
            transaction_type=row.Transaction.transaction_type,
            transaction_date=row.Transaction.transaction_date,
            source=row.Transaction.source,
            icon=row.icon,
            category_name=row.category_name,
            is_settled=row.is_settled or False,
            note=row.note,
            store_name=row.store_name,
            payment_method=row.payment_method,
            location=row.location,
            tags=row.tags,
            image_url=row.image_url,
            ocr_raw=row.ocr_raw,
        )
    async def delete_transaction(self, user_id: int, transaction_id: int):
        # 1. Truy vấn trực tiếp SQLAlchemy Model từ Database
        stmt = select(Transaction).where(
            Transaction.transaction_id == transaction_id,
            Transaction.user_id == user_id
        )
        result = await self.db.execute(stmt)
        transaction_model = result.scalar_one_or_none()

        # 2. Kiểm tra nếu không tồn tại giao dịch
        if not transaction_model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Không tìm thấy giao dịch hoặc bạn không có quyền xóa"
            )

        # 3. Tiến hành xóa Model hợp lệ
        await self.db.delete(transaction_model)
        await self.db.commit()
        
        return {"message": "Đã xóa giao dịch"}

    async def get_invoice_image(self, user_id: int, transaction_id: int) -> dict:
        # Kiểm tra transaction thuộc về user
        stmt = select(Transaction).where(
            Transaction.transaction_id == transaction_id,
            Transaction.user_id == user_id
        )
        result = await self.db.execute(stmt)
        transaction = result.scalar_one_or_none()

        if not transaction:
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch")

        # Lấy media
        stmt = select(TransactionMedia).where(
            TransactionMedia.transaction_id == transaction_id
        )
        result = await self.db.execute(stmt)
        media = result.scalar_one_or_none()

        if not media or not media.image_url:
            raise HTTPException(status_code=404, detail="Giao dịch này không có ảnh hóa đơn")

        return {
            "transaction_id": transaction_id,
            "image_url": media.image_url,
            "is_settled": media.is_settled
        }
    
    async def get_invoices_by_month(self, user_id: int, month: int, year: int) -> list:
        stmt = (
            select(Transaction, TransactionMedia)
            .join(TransactionMedia, Transaction.transaction_id == TransactionMedia.transaction_id)
            .where(
                Transaction.user_id == user_id,
                Transaction.source == TransactionSource.OCR,
                extract("month", Transaction.transaction_date) == month,
                extract("year", Transaction.transaction_date) == year,
                TransactionMedia.image_url.isnot(None),
            )
            .order_by(Transaction.transaction_date.desc())
        )
        result = await self.db.execute(stmt)
        rows = result.all()

        # Group theo image_url — mỗi hóa đơn 1 dòng
        seen = set()
        invoices = []
        for trans, media in rows:
            if media.image_url in seen:
                continue
            seen.add(media.image_url)
            invoices.append({
                "image_url": media.image_url,
                "transaction_date": trans.transaction_date,
                "total_amount": float(sum(
                    t.total_amount for t, m in rows if m.image_url == media.image_url
                )),
            })

        return invoices
async def get_transaction_service(db: AsyncSession = Depends(get_db)):
    return TransactionService(db)