from sqlalchemy import select, and_ 
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, status
from datetime import datetime
from ..models.category import Category
from ..models.transaction import Transaction, TransactionDetail, TransactionMedia
from ..config.database import get_db
from ..schemas.transaction import TransactionCreateSchema, TransactionUpdateSchema, TransactionResponseSchema, TransactionsByDateSchema, TransactionsGroupedResponseSchema, TransactionDetailResponseSchema
from zoneinfo import ZoneInfo
from collections import defaultdict

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(self, user_id: int, data: TransactionCreateSchema) -> TransactionResponseSchema:
        try:
            vn_tz = ZoneInfo("Asia/Ho_Chi_Minh")

            new_trans = Transaction(
                user_id=user_id,
                category_id=data.category_id,
                total_amount=data.amount,
                transaction_type=data.transaction_type,
                # Convert sang VN rồi mới strip tz → DB lưu đúng giờ VN dạng naive
                transaction_date=data.transaction_date.astimezone(vn_tz).replace(tzinfo=None),
                updated_at=datetime.now(),
                source=data.source,
            )
            self.db.add(new_trans)
            await self.db.flush()

            new_detail = TransactionDetail(
                transaction_id=new_trans.transaction_id,
                note=data.note,
            )
            self.db.add(new_detail)

            await self.db.commit()
            await self.db.refresh(new_trans)

            category = await self.db.get(Category, new_trans.category_id)

            return TransactionResponseSchema(
                transaction_id=new_trans.transaction_id,
                category_id=new_trans.category_id,
                amount=new_trans.total_amount,
                transaction_type=new_trans.transaction_type,
                transaction_date=new_trans.transaction_date,  # ✅ fix: created_at -> transaction_date
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
            if trans_dt.tzinfo is None:
                trans_dt = trans_dt.replace(tzinfo=ZoneInfo("UTC"))
            vn_dt = trans_dt.astimezone(vn_tz)
            date_key = vn_dt.strftime("%Y-%m-%d")

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
        transaction = await self.get_transaction_by_id(user_id, transaction_id)
        await self.db.delete(transaction)
        await self.db.commit()
        return {"message": "Đã xóa giao dịch"}


async def get_transaction_service(db: AsyncSession = Depends(get_db)):
    return TransactionService(db)