# app/controllers/export_controller.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from typing import Optional

from ..middleware.auth import require_user
from ..models.user import User
from ..services.export_service import ExportService, get_export_service

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/excel")
async def export_excel(
    month: Optional[int] = Query(default=None, ge=1, le=12),
    year: Optional[int] = Query(default=None, ge=1970),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    current_user: User = Depends(require_user),
    service: ExportService = Depends(get_export_service)
):
    """
    Xuất báo cáo Excel gồm danh sách giao dịch và thống kê ngân sách.
    Lọc theo tháng/năm hoặc khoảng ngày tùy chọn.
    """
    return await service.export_excel(
        current_user.user_id,
        month=month,
        year=year,
        start_date=start_date,
        end_date=end_date
    )