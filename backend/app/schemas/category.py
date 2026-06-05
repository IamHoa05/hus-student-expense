from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class TransactionType(str, Enum):
    INFLOW = "inflow"
    OUTFLOW = "outflow"

class CategoryCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    transaction_type: TransactionType
    icon: Optional[str] = None                    # ✅

class CategoryUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    icon: Optional[str] = None                    # ✅

class CategoryResponseSchema(BaseModel):
    category_id: int
    category_name: str                            # ✅
    transaction_type: TransactionType
    icon: Optional[str] = None                    # ✅
    is_system: bool
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

