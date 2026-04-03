from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..config.database import get_db
from ..services.category_service import CategoryService
from ..middleware.auth import require_user # Dùng hàm định danh bạn đã viết
from ..models.user import User
from ..schemas.category import CategoryResponseSchema, CategoryCreateSchema, CategoryUpdateSchema, CategoryStatResponse # Schema để format dữ liệu trả về

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryResponseSchema])
async def list_categories(
    type: str = "outflow", # Mặc định là chi, truyền "inflow" để lấy thu
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API lấy danh sách danh mục chi tiêu/thu nhập. Trả về cả danh mục hệ thống và danh mục cá nhân của user.

    """
    service = CategoryService(db)
    return await service.get_categories_by_type(current_user.user_id, type)

    
@router.post("/", response_model=CategoryResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API cho phép người dùng tự tạo danh mục chi tiêu/thu nhập cá nhân.
    """
    service = CategoryService(db)
    try:
        # Gọi hàm service bạn đã viết
        new_category = await service.create_custom_category(
            user_id=current_user.user_id, 
            name=payload.name,
            trans_type=payload.transaction_type
        )
        return new_category
    except Exception as e:
        # Trả về lỗi nếu có vấn đề (ví dụ trùng tên nếu bạn đặt unique)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể tạo danh mục: {str(e)}"
        )
    
@router.put("/{category_id}", response_model=CategoryResponseSchema)
async def update_cat(category_id: int, payload: CategoryUpdateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_user)):
    """
    API cho phép người dùng sửa tên danh mục cá nhân của mình. Không thể sửa danh mục hệ thống."""
    service = CategoryService(db)
    updated = await service.update_category(category_id, current_user.user_id, payload.name)
    if not updated:
        raise HTTPException(status_code=403, detail="Không có quyền sửa hoặc danh mục không tồn tại")
    return updated

@router.delete("/{category_id}")
async def delete_cat(category_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_user)):
    """
    API cho phép người dùng xóa danh mục cá nhân của mình. Không thể xóa danh mục hệ thống. Nếu có giao dịch nào đang sử dụng danh mục này, sẽ trả về lỗi và yêu cầu người dùng xóa các giao dịch đó trước."""
    service = CategoryService(db)
    try:
        success = await service.delete_category(category_id, current_user.user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục cá nhân này")
        return {"message": "Đã xóa danh mục thành công"}
    except Exception as e:
        # Bắt lỗi ràng buộc khóa ngoại ở đây
        raise HTTPException(
            status_code=400, 
            detail="Không thể xóa danh mục này vì đã có các giao dịch đang sử dụng nó. Hãy xóa các giao dịch đó trước!"
        )

# @router.get("/statistics", response_model=List[CategoryStatResponse])
# async def get_stats(month: int, year: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_user)):
#     service = CategoryService(db)
#     return await service.get_stats_by_category(current_user.user_id, month, year)