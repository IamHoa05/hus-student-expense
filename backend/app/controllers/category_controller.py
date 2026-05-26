from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from ..middleware.auth import require_user
from ..models.user import User
from ..models.category import TransactionType
from ..schemas.category import (
    CategoryResponseSchema, CategoryCreateSchema,
    CategoryUpdateSchema, CategoryStatResponse
)
from ..services.category_service import CategoryService, get_category_service

router = APIRouter(prefix="/categories", tags=["Categories"])

# LẤY DANH SÁCH DANH MỤC
@router.get("", response_model=List[CategoryResponseSchema])
async def list_categories(
    type: TransactionType = Query(default=TransactionType.OUTFLOW),  # ✅ Enum, có validate
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    return await service.get_categories_by_type(current_user.user_id, type)

# TẠO DANH MỤC CÁ NHÂN
@router.post("", response_model=CategoryResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateSchema,
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    return await service.create_custom_category(
        user_id=current_user.user_id,
        name=payload.name,
        trans_type=payload.transaction_type,
        icon=payload.icon
    )

# CẬP NHẬT DANH MỤC
@router.put("/{category_id}", response_model=CategoryResponseSchema)
async def update_category(
    category_id: int,
    payload: CategoryUpdateSchema,
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    return await service.update_category(
        category_id=category_id,
        user_id=current_user.user_id,
        name=payload.name,
        icon=payload.icon
    )

# XÓA DANH MỤC
@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    await service.delete_category(category_id, current_user.user_id)
    return {"message": "Đã xóa danh mục thành công"}

# THỐNG KÊ THEO DANH MỤC (Trend Analysis)
@router.get("/statistics", response_model=List[CategoryStatResponse])
async def get_stats(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=1970),
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    return await service.get_stats_by_category(current_user.user_id, month, year)