# app/schemas/transaction.py
from pydantic import BaseModel, HttpUrl
from typing import Optional
from decimal import Decimal
from datetime import datetime

# --- SCHEMAS CHO BUDGET ---
class BudgetBase(BaseModel):
    amount_limit: Decimal
    period: str  # "Monthly" hoặc "Semester"

class BudgetCreate(BudgetBase):
    user_id: int

class BudgetResponse(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True # Giúp Pydantic hiểu được dữ liệu từ SQLAlchemy

# --- SCHEMAS CHO RECEIPT (Kết quả OCR) ---
class ReceiptBase(BaseModel):
    image_url: str
    raw_text: Optional[str] = None

class ReceiptCreate(ReceiptBase):
    transaction_id: Optional[int] = None

class ReceiptResponse(ReceiptBase):
    id: int
    transaction_id: Optional[int]

    class Config:
        from_attributes = True

# --- SCHEMA ĐẶC BIỆT KHI SCAN XONG ---
# Khi Vintern đọc xong, nó trả về thông tin này cho điện thoại xác nhận
class OCRScanResponse(BaseModel):
    status: str
    shop_name: Optional[str] = "Không xác định"
    amount: Decimal
    date: Optional[str] = None
    raw_text: str