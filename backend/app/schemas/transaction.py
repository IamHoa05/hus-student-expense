from pydantic import BaseModel, Field, field_validator, field_serializer
from typing import Optional
from decimal import Decimal
from datetime import datetime
from enum import Enum
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

class TransactionType(str, Enum):
    INFLOW = "inflow"
    OUTFLOW = "outflow"

class TransactionSource(str, Enum):
    MANUAL = "manual"
    OCR = "ocr"

class TransactionCreateSchema(BaseModel):
    amount: Decimal = Field(..., gt=0)
    transaction_type: TransactionType = Field(default=TransactionType.OUTFLOW)
    transaction_date: datetime = Field(
        default_factory=lambda: datetime.now(VN_TZ)
    )
    category_id: int
    note: Optional[str] = Field(None, max_length=500)
    source: TransactionSource = Field(default=TransactionSource.MANUAL)

    @field_validator('transaction_date', mode='after')
    @classmethod
    def convert_to_vn_time(cls, v: datetime) -> datetime:
        if v:
            if v.tzinfo is None:
                v = v.replace(tzinfo=ZoneInfo("UTC"))
            return v.astimezone(VN_TZ)
        return v


class TransactionResponseSchema(BaseModel):
    transaction_id: int
    category_id: int
    amount: Decimal
    transaction_type: TransactionType
    transaction_date: datetime
    icon: Optional[str] = None
    category_name: Optional[str] = None
    is_settled: bool = False
    note: Optional[str] = None
    source: TransactionSource = Field(default=TransactionSource.MANUAL)

    @field_serializer('transaction_date')
    def serialize_dt(self, dt: datetime, _info):
        if dt:
            # DB lưu VN naive → format thẳng
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
        return None

    class Config:
        from_attributes = True
        populate_by_name = True


class TransactionUpdateSchema(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    transaction_type: Optional[TransactionType] = None
    transaction_date: Optional[datetime] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    store_name: Optional[str] = None
    payment_method: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[list[str]] = None


class TransactionsByDateSchema(BaseModel):
    date: str  # "2026-05-26"
    transactions: list[TransactionResponseSchema]


class TransactionsGroupedResponseSchema(BaseModel):
    status: str = "success"
    data: list[TransactionsByDateSchema]


class TransactionDetailResponseSchema(BaseModel):
    transaction_id: int
    category_id: int
    amount: Decimal
    transaction_type: TransactionType
    transaction_date: datetime
    source: TransactionSource
    icon: Optional[str] = None
    category_name: Optional[str] = None
    is_settled: bool = False
    note: Optional[str] = None
    store_name: Optional[str] = None
    payment_method: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[list[str]] = None
    image_url: Optional[str] = None
    ocr_raw: Optional[dict] = None

    @field_serializer('transaction_date')
    def serialize_dt(self, dt: datetime, _info):
        if dt:
            # DB lưu VN naive → format thẳng
            return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]
        return None

    class Config:
        from_attributes = True