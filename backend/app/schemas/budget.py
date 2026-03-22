from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional

class BudgetBase(BaseModel):
    amount_limit: Decimal = Field(..., ge=0, description="Hạn mức chi tiêu")
    period: str = Field(..., pattern="^(Monthly|Semester)$", description="Chu kỳ: Monthly hoặc Semester")

class BudgetCreate(BudgetBase):
    user_id: int

class BudgetUpdate(BaseModel):
    amount_limit: Optional[Decimal] = None
    period: Optional[str] = None

class BudgetResponse(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True