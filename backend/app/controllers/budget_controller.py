
from ..config.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..services.auth_service import get_auth_service, AuthService
from ..schemas.budget import BudgetAllocationResponse, BudgetCreateSchema, BudgetResponseSchema
from ..middleware.auth import require_user # Dùng hàm định danh bạn đã viết
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.user import User
from ..services.budget_service import BudgetService
from datetime import date

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

@router.get("/history")
async def get_history_by_range(
    start_date: date, 
    end_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API lấy lịch sử chi tiêu theo khoảng ngày tùy chọn.
    """
    # Kiểm tra logic ngày cơ bản
    if start_date > end_date:
        raise HTTPException(
            status_code=400, 
            detail="Ngày bắt đầu không được lớn hơn ngày kết thúc"
        )

    service = BudgetService(db)
    result = await service.get_custom_range_history(
        user_id=current_user.user_id, 
        start_date=start_date, 
        end_date=end_date
    )
    
    return {
        "status": "success",
        "data": result
    }

@router.get("/comparison")
async def get_spending_growth(
    target_date: date = Query(default=date.today()),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API lấy so sánh chi tiêu tháng này so với tháng trước để thấy sự tăng trưởng.
    """
    service = BudgetService(db)
    result = await service.get_spending_comparison(current_user.user_id, target_date)
    
    return {
        "status": "success",
        "data": result
    }