# schemas/stats.py
from pydantic import BaseModel
from typing import Literal, List, Optional
from datetime import date


class TrendRequest(BaseModel):
    """Query params: /stats/trend?period_type=day|week|month"""
    period_type: Literal["day", "week", "month"]


class ChartDataPoint(BaseModel):
    label: str
    total_amount: float


class TrendResponse(BaseModel):
    period_type: str
    chart_data: List[ChartDataPoint]
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
    transaction_count: int

    class Config:
        from_attributes = True