from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal

class OCRResultResponse(BaseModel):
    shop_name: Optional[str] = "Không xác định"
    amount: Decimal = Field(default=0)
    date: Optional[str] = None
    raw_text: str
    confidence: Optional[float] = None           # ✅ Thêm độ tin cậy của AI

class ReceiptConfirmSchema(BaseModel):           # ✅ Người dùng xác nhận sau khi OCR
    transaction_id: int
    is_confirmed: bool
    corrected_amount: Optional[Decimal] = None   # Nếu AI đọc sai, user sửa lại