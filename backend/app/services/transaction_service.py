from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from uuid import uuid4

from ..models.category import Category
from ..models.transaction import Transaction, TransactionDetail
from ..config.database import get_db
from ..schemas.transaction import TransactionCreateSchema, MediaSchema, IncomeCreateSchema
from fastapi import  Depends

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_new_transaction(self, user_id: int, data: TransactionCreateSchema):
        try:
            # 1. Khởi tạo bản ghi chính (KHÔNG truyền transaction_id)
            new_trans = Transaction(
                user_id=user_id,
                category_id=data.category_id,
                total_amount=data.amount,
                transaction_type=data.type,
                transaction_date=data.transaction_date
            )
            self.db.add(new_trans)
            
            # 2. Để lấy được ID tự tăng, ta cần flush() để DB cấp ID tạm thời 
            # hoặc dùng trực tiếp quan hệ (Relationship)
            await self.db.flush() 
            generated_id = new_trans.transaction_id

            # 3. Khởi tạo bản ghi chi tiết với ID vừa lấy được
            new_detail = TransactionDetail(
                transaction_id=generated_id,
                note=data.note,
                payment_method="Tiền mặt"
            )
            self.db.add(new_detail)

            # 4. Xử lý ảnh (nếu có)
            if data.image_url:
                from ..models.transaction import TransactionMedia
                new_media = TransactionMedia(
                    transaction_id=generated_id,
                    image_url=data.image_url
                )
                self.db.add(new_media)

            await self.db.commit()
            return generated_id

        except Exception as e:
            await self.db.rollback()
            raise e

    async def create_income(self, user_id: int, data: IncomeCreateSchema):
        try:
            # 1. Tạo bản ghi chính trong bảng transaction
            new_trans = Transaction(
                user_id=user_id,
                category_id=data.category_id,
                total_amount=data.amount,
                transaction_type=data.type, # 'inflow'
                transaction_date=data.transaction_date
            )
            self.db.add(new_trans)
            
            await self.db.flush() 
            generated_id = new_trans.transaction_id

            # 2. Tạo chi tiết (Ghi chú khoản thu)
            new_detail = TransactionDetail(
                transaction_id=generated_id,
                note=data.note,
                payment_method="Tiền mặt/Chuyển khoản"
            )
            self.db.add(new_detail)

            await self.db.commit()
            return generated_id
        except Exception as e:
            await self.db.rollback()
            raise e
    

# Dependency để Controller gọi
async def get_transaction_service(db: AsyncSession = Depends(get_db)):
    return TransactionService(db)

