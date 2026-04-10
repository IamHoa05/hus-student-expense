from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from uuid import uuid4

from ..models.category import Category
from ..models.transaction import Transaction, TransactionDetail, TransactionMedia
from ..config.database import get_db
from ..schemas.transaction import TransactionCreateSchema, MediaSchema, IncomeCreateSchema, ExpenseCreateSchema
from fastapi import  Depends

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_new_transaction(self, user_id: int, data: TransactionCreateSchema):
        try:
            # 1. Tạo bản ghi chính (Bảng Transaction)
            new_trans = Transaction(
                user_id=user_id,
                group_id=data.group_id,
                category_id=data.category_id,
                total_amount=data.amount,
                transaction_type=data.type.value if hasattr(data.type, 'value') else data.type,
                transaction_date=data.transaction_date
            )
            self.db.add(new_trans)
            
            # Đẩy dữ liệu xuống DB để lấy transaction_id tự tăng
            await self.db.flush() 
            generated_id = new_trans.transaction_id

            # 2. Tạo bản ghi chi tiết (Bảng TransactionDetail)
            # Lấy hết các trường phụ từ Schema đã thiết kế
            new_detail = TransactionDetail(
                transaction_id=generated_id,
                store_name=data.store_name,
                note=data.note,
                payment_method=data.payment_method or "Tiền mặt", # Mặc định nếu FE không gửi
                location=data.location
            )
            self.db.add(new_detail)

            # 3. Xử lý Media & OCR (Bảng TransactionMedia)
            # Chỉ tạo bản ghi này nếu có ảnh hoặc có dữ liệu quét AI
            if data.image_url or data.ocr_raw:
                new_media = TransactionMedia(
                    transaction_id=generated_id,
                    image_url=data.image_url,
                    ocr_raw=data.ocr_raw,
                    is_settled=True if data.image_url else False # Tự động đánh dấu nếu có ảnh
                )
                self.db.add(new_media)

            # 4. Commit tất cả cùng một lúc (Atomic transaction)
            await self.db.commit()
            
            # Refresh để lấy đầy đủ object sau khi đã lưu thành công (tùy chọn)
            await self.db.refresh(new_trans)
            
            return generated_id

        except Exception as e:
            # Nếu có bất kỳ lỗi nào ở 1 trong 3 bảng, rollback toàn bộ để tránh rác dữ liệu
            await self.db.rollback()
            print(f"Error creating transaction: {str(e)}") # Log lỗi để debug
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
    
    async def create_expense(self, user_id: int, data: ExpenseCreateSchema):
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

