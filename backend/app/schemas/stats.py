from pydantic import BaseModel, field_validator
from typing import Literal
from datetime import date
from typing import List, Optional

# ==========================================
# REQUEST SCHEMA
# ==========================================

class TrendRequest(BaseModel):
    """
    Query params cho endpoint GET /stats/trend
    Ví dụ: /stats/trend?period_type=week&target_date=2025-06-01
    """
    period_type: Literal["week", "month", "year"]
    target_date: date | None = None  # Mặc định là hôm nay nếu không truyền

    @field_validator("target_date", mode="before")
    @classmethod
    def set_default_date(cls, v):
        return v or date.today()


# ==========================================
# RESPONSE SCHEMAS
# ==========================================

class ChartDataPoint(BaseModel):
    """Một điểm dữ liệu trên biểu đồ (ví dụ: T2, Tuần 1, T3...)"""
    label: str
    total_amount: float


class TrendResponse(BaseModel):
    """Response trả về cho client"""
    period_type: str
    target_date: date
    chart_data: list[ChartDataPoint]
    highest_label: str
    highest_amount: float
    lowest_label: str
    lowest_amount: float

class CategoryStatResponse(BaseModel):
    category_id: int
    category_name: str
    icon: Optional[str] = None
    total: float
    percentage: float
    transaction_count: int  # <--- THÊM DÒNG NÀY

    class Config:
        from_attributes = True

class ChartPoint(BaseModel):
    label: str           # "T2", "Tuần 1", "T1 (Tháng 1)", v.v.
    total_amount: float

class ExpenseTrendResponse(BaseModel):
    chart_data: List[ChartPoint]
    highest_label: str       # Nhãn của mốc cao nhất (e.g., "T7" hoặc "Tháng 5")
    highest_amount: float
    lowest_label: str        # Nhãn của mốc thấp nhất
    lowest_amount: float