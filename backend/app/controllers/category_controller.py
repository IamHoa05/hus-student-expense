from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List

from ..middleware.auth import require_user
from ..models.user import User
from ..models.category import TransactionType
from ..schemas.category import (
    CategoryResponseSchema, CategoryCreateSchema,
    CategoryUpdateSchema
)
from ..services.category_service import CategoryService, get_category_service

router = APIRouter(prefix="/categories", tags=["Categories"])


# =============================================================================
# QUẢN LÝ DANH MỤC (CATEGORIES)
# =============================================================================

@router.get("", response_model=List[CategoryResponseSchema])
async def list_categories(
    type: TransactionType = Query(default=TransactionType.OUTFLOW),
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Lấy danh sách các danh mục chi tiêu hoặc thu nhập dựa theo phân loại.
    """
    return await service.get_categories_by_type(current_user.user_id, type)


@router.post("", response_model=CategoryResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateSchema,
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Tạo mới một danh mục phân loại chi tiêu hoặc thu nhập cá nhân.
    """
    return await service.create_custom_category(
        user_id=current_user.user_id,
        name=payload.name,
        trans_type=payload.transaction_type,
        icon=payload.icon
    )


@router.put("/{category_id}", response_model=CategoryResponseSchema)
async def update_category(
    category_id: int,
    payload: CategoryUpdateSchema,
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Cập nhật lại thông tin tên hoặc biểu tượng (icon) của một danh mục hiện có.
    """
    return await service.update_category(
        category_id=category_id,
        user_id=current_user.user_id,
        name=payload.name,
        icon=payload.icon
    )


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(require_user),
    service: CategoryService = Depends(get_category_service)
):
    """
    Xóa bỏ một danh mục chi tiêu hoặc thu nhập cá nhân khỏi hệ thống.
    """
    await service.delete_category(category_id, current_user.user_id)
    return {"message": "Đã xóa danh mục thành công"}