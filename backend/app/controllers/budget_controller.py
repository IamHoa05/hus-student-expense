
from ..config.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from ..services.auth_service import get_auth_service, AuthService
from ..schemas.budget import BudgetAllocationResponse, BudgetCreateSchema, BudgetResponseSchema
from ..middleware.auth import require_user # Dùng hàm định danh bạn đã viết
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.user import User
from ..services.budget_service import BudgetService

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.post("/", response_model=BudgetResponseSchema)
async def create_or_update_budget(
    payload: BudgetCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API đặt hạn mức chi tiêu cho một danh mục.
    Nếu danh mục đã có hạn mức, hệ thống sẽ tự động cập nhật.
    """
    service = BudgetService(db)
    return await service.set_budget(current_user.user_id, payload)

@router.get("/allocation", response_model=List[BudgetAllocationResponse])
async def get_allocation(
    month: int, 
    year: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API lấy dữ liệu hiển thị % phân bổ chi tiêu so với hạn mức.
    """
    service = BudgetService(db)
    return await service.get_budget_allocation(current_user.user_id, month, year)