from datetime import date
from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional

from enum import Enum

class BudgetPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"

class BudgetCreateSchema(BaseModel):
    category_id: int
    amount_limit: float = Field(..., gt=0)
    start_date: date
    end_date: date
    # Thêm dòng này để Service không bị lỗi AttributeError
    period: BudgetPeriod = BudgetPeriod.MONTHLY 
    alert_threshold: float = Field(80.0, ge=0, le=100)

class BudgetResponseSchema(BudgetCreateSchema):
    budget_id: int
    spent_amount: float
    is_active: bool
    
    class Config:
        from_attributes = True

class BudgetAllocationResponse(BaseModel):
    category_name: str
    amount_limit: float
    spent_amount: float
    percentage: float  # (spent / limit) * 100
    remaining_amount: float # Số tiền còn lại được tiêu