from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

class BudgetPeriod(str, Enum):
    WEEKLY = "weekly"                # ✅ Bỏ DAILY, YEARLY cho khớp model
    MONTHLY = "monthly"

class BudgetCreateSchema(BaseModel):
    category_id: int
    amount_limit: float = Field(..., gt=0)
    start_date: date
    end_date: date
    period: BudgetPeriod = BudgetPeriod.MONTHLY
    alert_threshold: float = Field(80.0, ge=0, le=100)

class BudgetResponseSchema(BaseModel):       # ✅ Tách riêng, không kế thừa Create
    budget_id: int
    category_id: int
    amount_limit: float
    spent_amount: float                      # Tính động từ service
    remaining_amount: float                  # Tính động từ service
    percentage_used: float                   # Tính động từ service
    period: BudgetPeriod
    start_date: date
    end_date: date
    alert_threshold: float
    is_active: bool
    alert_sent: bool

    class Config:
        from_attributes = True

class BudgetAllocationResponse(BaseModel):
    category_name: str
    amount_limit: float
    spent_amount: float
    percentage: float
    remaining_amount: float