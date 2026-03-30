from pydantic import BaseModel, Field
from typing import Optional

class CategoryResponseSchema(BaseModel):
    """
    Schema định dạng dữ liệu trả về cho Frontend.
    Khớp với các trường trong bảng 'categories'.
    """
    category_id: int
    name: str
    user_id: Optional[int] = None  # Sẽ là null nếu là danh mục hệ thống

    class Config:
        # Quan trọng: Cho phép Pydantic đọc dữ liệu trực tiếp từ đối tượng SQLAlchemy (ORM)
        from_attributes = True

class CategoryCreateSchema(BaseModel):
    """Schema để hứng dữ liệu khi người dùng tạo danh mục mới"""
    name: str = Field(..., min_length=1, max_length=50, example="Quỹ NCKH")
    transaction_type: str = Field(..., pattern="^(inflow|outflow)$")

class CategoryUpdateSchema(BaseModel):
    name: str

class CategoryStatResponse(BaseModel):
    name: str
    total: float
    percentage: float

class CategoryAllocationResponse(BaseModel):
    category_name: str
    total_amount: float
    percentage: float
