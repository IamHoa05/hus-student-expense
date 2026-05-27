from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List

from ..schemas.stats import CategoryStatResponse, TrendRequest, TrendResponse, ChartDataPoint
from ..services.stats_service import StatsService, get_stats_service
from ..middleware.auth import require_user
from ..models.user import User

router = APIRouter(prefix="/stats", tags=["Stats"])


# =============================================================================
# THỐNG KÊ & PHÂN TÍCH XU HƯỚNG (STATS & TRENDS)
# =============================================================================

@router.get("/statistics", response_model=List[CategoryStatResponse])
async def get_stats(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=1970),
    current_user: User = Depends(require_user),
    service: StatsService = Depends(get_stats_service),
):
    """
    Lấy số liệu thống kê chi tiêu theo từng danh mục trong tháng/năm chỉ định.
    """
    return await service.get_stats_by_category(current_user.user_id, month, year)


@router.get("/trend", response_model=TrendResponse)
async def get_trend(
    query: TrendRequest = Depends(),
    current_user: User = Depends(require_user),
    service: StatsService = Depends(get_stats_service),
):
    """
    Phân tích xu hướng chi tiêu từ đầu năm đến hiện tại.
    - **day**: từng ngày từ 01/01 → hôm nay
    - **week**: từng tuần (01/01-07/01, ...) → tuần hiện tại
    - **month**: từng tháng T1 → tháng hiện tại
    """
    try:
        result = await service.get_trend(
            user_id=current_user.user_id,
            period_type=query.period_type,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return TrendResponse(
        period_type=query.period_type,
        chart_data=[ChartDataPoint(**point) for point in result["chart_data"]],
        highest_label=result["highest_label"],
        highest_amount=result["highest_amount"],
        lowest_label=result["lowest_label"],
        lowest_amount=result["lowest_amount"],
    )