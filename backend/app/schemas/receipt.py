from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class ReceiptBase(BaseModel):
    image_url: str
    raw_text: Optional[str] = None

class ReceiptCreate(ReceiptBase):
    transaction_id: Optional[int] = None

# Schema này dùng để trả về kết quả sau khi Model Vintern quét xong
# Để người dùng xác nhận trên điện thoại trước khi lưu chính thức
class OCRResultResponse(BaseModel):
    shop_name: Optional[str] = "Không xác định"
    amount: Decimal = Field(default=0)
    date: Optional[str] = None
    raw_text: str  # Lưu lại toàn bộ text để sau này làm Data Analysis

class ReceiptResponse(ReceiptBase):
    id: int
    transaction_id: Optional[int]

    class Config:
        from_attributes = True