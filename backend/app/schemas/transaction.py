# app/schemas/transaction.py
from pydantic import BaseModel, HttpUrl, Field, field_validator
from enum import Enum
from typing import Optional, Any
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
    # --- 1. Thông tin cốt lõi (Bảng Transaction) ---
    amount: Decimal = Field(..., gt=0, description="Số tiền giao dịch")
    type: TransactionType = Field(default=TransactionType.EXPENSE)
    transaction_date: datetime = Field(default_factory=datetime.now)
    category_id: int = Field(..., description="ID danh mục chi tiêu")
    group_id: Optional[int] = Field(None, description="ID nhóm nếu là chi tiêu chung")

    # --- 2. Thông tin chi tiết (Bảng TransactionDetail) ---
    note: Optional[str] = Field(None, max_length=500, description="Ghi chú chi tiết")
    store_name: Optional[str] = Field(None, max_length=100, description="Tên cửa hàng (VinMart, Circle K...)")
    payment_method: Optional[str] = Field(None, description="Tiền mặt, Chuyển khoản, Ví điện tử...")
    location: Optional[str] = Field(None, description="Địa chỉ nơi tiêu tiền")

    # --- 3. Thông tin Media & AI (Bảng TransactionMedia) ---
    image_url: Optional[str] = Field(None, description="Link ảnh hóa đơn từ Cloud")
    ocr_raw: Optional[dict[str, Any]] = Field(None, description="Dữ liệu thô từ AI quét hóa đơn")

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 55000.0,
                "type": "outflow",
                "transaction_date": "2026-04-01T12:30:00",
                "category_id": 1,
                "group_id": None,
                "note": "Mua 1 bát phở và 1 trà đá",
                "store_name": "Phở Thìn Lò Đúc",
                "payment_method": "Chuyển khoản (Vietcombank)",
                "location": "13 Lò Đúc, Hai Bà Trưng, Hà Nội",
                "image_url": "https://storage.google.com/bills/2026/abc-123.jpg",
                "ocr_raw": {"vendor": "Pho Thin", "total": 55000, "confidence": 0.98}
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


