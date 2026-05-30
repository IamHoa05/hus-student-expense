from fastapi import APIRouter, Depends, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.middleware.auth import require_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", summary="Lấy danh sách thông báo")
async def get_notifications(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    notifications = result.scalars().all()
    return {"data": notifications}


@router.get("/unread-count", summary="Đếm thông báo chưa đọc")
async def get_unread_count(
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(func.count()).where(
            Notification.user_id == current_user.user_id,
            Notification.is_read == False,
        )
    )
    count = result.scalar()
    return {"unread_count": count}


@router.put("/read-all", summary="Đánh dấu tất cả đã đọc")
async def mark_all_as_read(
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.user_id,
            Notification.is_read == False,
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "Đã đánh dấu tất cả đã đọc."}

@router.put("/{notification_id}/read", summary="Đánh dấu đã đọc")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(require_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id,
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "Đã đánh dấu đọc."}

