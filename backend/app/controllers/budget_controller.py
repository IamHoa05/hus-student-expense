from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from datetime import date

from ..middleware.auth import require_user
from ..models.user import User
from ..schemas.budget import BudgetCreateSchema, BudgetResponseSchema, BudgetAllocationResponse
from ..services.budget_service import BudgetService, get_budget_service

router = APIRouter(prefix="/budgets", tags=["Budgets"])

# ĐẶT / CẬP NHẬT NGÂN SÁCH
@router.post("", response_model=BudgetResponseSchema)
async def create_or_update_budget(
    payload: BudgetCreateSchema,
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    return await service.set_budget(current_user.user_id, payload)

# PHÂN BỔ NGÂN SÁCH THEO THÁNG
@router.get("/allocation", response_model=List[BudgetAllocationResponse])
async def get_allocation(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=1970),
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    return await service.get_budget_allocation(current_user.user_id, month, year)

# NGÂN SÁCH CÒN LẠI
@router.get("/remaining")
async def get_remaining_budget(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=1970),
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    today = date.today()
    return {
        "status": "success",
        "data": await service.get_remaining_budget(
            current_user.user_id,
            month or today.month,
            year or today.year
        )
    }

# LỊCH SỬ CHI TIÊU THEO KHOẢNG NGÀY
@router.get("/history")
async def get_history(
    start_date: date,
    end_date: date,
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Ngày bắt đầu không được lớn hơn ngày kết thúc")
    return {
        "status": "success",
        "data": await service.get_custom_range_history(current_user.user_id, start_date, end_date)
    }

# SO SÁNH CHI TIÊU THÁNG NÀY VS THÁNG TRƯỚC
@router.get("/comparison")
async def get_comparison(
    target_date: date = Query(default=date.today()),
    current_user: User = Depends(require_user),
    service: BudgetService = Depends(get_budget_service)
):
    return {
        "status": "success",
        "data": await service.get_spending_comparison(current_user.user_id, target_date)
    }