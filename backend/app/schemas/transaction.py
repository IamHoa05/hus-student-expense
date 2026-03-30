# app/schemas/transaction.py
from pydantic import BaseModel, HttpUrl, Field, field_validator
from enum import Enum
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

# Định nghĩa Enum để tránh nhập sai loại giao dịch
class TransactionType(str, Enum):
    INCOME = "inflow"   # Khoản thu
    EXPENSE = "outflow" # Khoản chi

class TransactionCreateSchema(BaseModel):
    # 1. Thông tin cơ bản từ UI
    amount: Decimal = Field(..., gt=0, description="Số tiền phải lớn hơn 0")
    type: TransactionType = Field(..., description="Loại giao dịch: INCOME hoặc EXPENSE")
    transaction_date: datetime = Field(default_factory=datetime.now)
    note: Optional[str] = Field(None, max_length=255, example="Ăn trưa cùng bạn")
    
    # 2. Thông tin liên kết (Foreign Keys trong CSDL)
    category_id: int = Field(..., description="ID của danh mục (Ăn uống, Học tập...)")
    group_id: Optional[int] = Field(None, description="Nếu là chi tiêu nhóm/phòng")

    # 3. Thông tin bổ sung (nếu có tải hóa đơn)
    image_url: Optional[str] = None
    
    # Cấu hình để hiển thị ví dụ trong Swagger UI
    class Config:
        json_schema_extra = {
            "example": {
                "amount": 50000.0,
                "type": "outflow",
                "transaction_date": "2026-03-30T15:00:00",
                "note": "Mua trà sữa",
                "category_id": 1,
                "group_id": None
            }
        }
class MediaSchema(BaseModel):
    image_url: str
    ocr_raw: Optional[dict] = None # Lưu kết quả JSON từ AI vào đây

class IncomeCreateSchema(BaseModel):
    category_id: int
    amount: float = Field(..., gt=0)
    type: TransactionType = Field(..., description="Loại giao dịch: INCOME hoặc EXPENSE")
    transaction_date: datetime = Field(default_factory=datetime.now)
    note: Optional[str] = None

# Cấu hình để hiển thị ví dụ trong Swagger UI
    class Config:
        json_schema_extra = {
            "example": {
                "category_id": 1,
                "amount": 50000.0,
                "type": "inflow",
                "transaction_date": "2026-03-30T15:00:00",
                "note": "Tiền trợ cấp tháng 3"
            }
        }


