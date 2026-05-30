# app/routers/upload_router.py

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from ..middleware.auth import require_user
from ..models.user import User
from ..config.database import get_db
from ..services.avatar_service import UploadService

router = APIRouter(prefix="/avatars", tags=["Avatars"])


@router.post("/me")
async def upload_my_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload ảnh đại diện lên MinIO và cập nhật avt_url cho người dùng.
    """
    return await UploadService(db).upload_avatar(current_user, file)


@router.delete("/me")
async def delete_my_avatar(
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Xóa ảnh đại diện của người dùng khỏi MinIO và DB.
    """
    return await UploadService(db).delete_avatar(current_user)