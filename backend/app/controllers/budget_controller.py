from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List
from datetime import date

from ..middleware.auth import require_user
from ..models.user import User
from ..schemas.budget import BudgetCreateSchema, BudgetResponseSchema, BudgetAllocationResponse
from ..services.budget_service import BudgetService, get_budget_service

router = APIRouter(prefix="/budgets", tags=["Budgets"])


# =============================================================================
# QUẢN LÝ NGÂN SÁCH
# =============================================================================

@router.post("", response_model=BudgetResponseSchema)
async def create_or_update_budget(
    payload: BudgetCreateSchema,
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    """
    Thiết lập mới hoặc cập nhật cấu hình ngân sách của người dùng.
    """
    return await service.set_budget(current_user.user_id, payload)


# =============================================================================
# THỐNG KÊ & PHÂN BỔ
# =============================================================================

@router.get("/allocation", response_model=List[BudgetAllocationResponse])
async def get_allocation(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=1970),
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    """
    Lấy thông tin phân bổ ngân sách chi tiết theo từng danh mục trong tháng và năm chỉ định.
    """
    return await service.get_budget_allocation(current_user.user_id, month, year)


@router.get("/remaining")
async def get_remaining_budget(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=1970),
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    """
    Kiểm tra số dư ngân sách còn lại của tháng hiện tại hoặc một tháng cụ thể.
    """
    today = date.today()
    return {
        "status": "success",
        "data": await service.get_remaining_budget(
            current_user.user_id,
            month or today.month,
            year or today.year
        )
    }


# =============================================================================
# LỊCH SỬ & SO SÁNH
# =============================================================================

@router.get("/history")
async def get_history(
    start_date: date,
    end_date: date,
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    """
    Truy xuất lịch sử sử dụng ngân sách và chi tiêu trong một khoảng thời gian tùy chọn.
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Ngày bắt đầu không được lớn hơn ngày kết thúc"
        )
    return {
        "status": "success",
        "data": await service.get_custom_range_history(current_user.user_id, start_date, end_date)
    }


@router.get("/comparison")
async def get_comparison(
    target_date: date = Query(default_factory=date.today),
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    """
    So sánh tình hình chi tiêu và sử dụng ngân sách giữa tháng hiện tại với tháng trước đó.
    """
    return {
        "status": "success",
        "data": await service.get_spending_comparison(current_user.user_id, target_date)
    }