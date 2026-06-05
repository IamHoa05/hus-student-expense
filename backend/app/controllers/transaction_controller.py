from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date

from ..middleware.auth import require_user
from ..models.user import User
from ..schemas.transaction import TransactionCreateSchema, TransactionUpdateSchema
from ..services.transaction_service import TransactionService, get_transaction_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# =============================================================================
# QUẢN LÝ GIAO DỊCH (TRANSACTIONS)
# =============================================================================

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreateSchema,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Tạo mới một giao dịch thu nhập hoặc chi tiêu (hỗ trợ cả dữ liệu nhập tay và OCR).
    """
    transaction_id = await service.create_transaction(current_user.user_id, payload)
    return {"status": "success", "data": {"transaction_id": transaction_id}}


@router.get("", status_code=status.HTTP_200_OK)
async def get_transactions(
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Lấy danh sách toàn bộ các giao dịch tài chính của người dùng hiện tại.
    """
    transactions = await service.get_transactions(current_user.user_id)
    return {"status": "success", "data": transactions}


@router.get("/invoices")
async def get_invoices_by_month(
    month: int = Query(default=None, ge=1, le=12),
    year: int = Query(default=None, ge=1970),
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Lấy tất cả ảnh hóa đơn OCR của người dùng trong tháng chỉ định.
    """
    today = date.today()
    return await service.get_invoices_by_month(
        current_user.user_id,
        month or today.month,
        year or today.year
    )

@router.get("/{transaction_id}", status_code=status.HTTP_200_OK)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Truy xuất thông tin chi tiết của một giao dịch cụ thể dựa trên ID.
    """
    transaction = await service.get_transaction_by_id(current_user.user_id, transaction_id)
    return {"status": "success", "data": transaction}


@router.patch("/{transaction_id}", status_code=status.HTTP_200_OK)
async def update_transaction(
    transaction_id: int,
    payload: TransactionUpdateSchema,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Cập nhật một phần thông tin của giao dịch hiện có (chỉ thay đổi các trường được truyền).
    """
    transaction = await service.update_transaction(current_user.user_id, transaction_id, payload)
    return {"status": "success", "data": transaction}


@router.delete("/{transaction_id}", status_code=status.HTTP_200_OK)
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Xóa bỏ hoàn toàn một giao dịch tài chính khỏi hệ thống.
    """
    return await service.delete_transaction(current_user.user_id, transaction_id)




@router.get("/{transaction_id}/invoice")
async def get_invoice_image(
    transaction_id: int,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    """
    Trả về link ảnh hóa đơn đã quét của giao dịch.
    """
    return await service.get_invoice_image(current_user.user_id, transaction_id)

