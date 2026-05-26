from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..middleware.auth import require_user
from ..models.user import User
from ..schemas.transaction import TransactionCreateSchema, TransactionUpdateSchema
from ..services.transaction_service import TransactionService, get_transaction_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])

# TẠO GIAO DỊCH (cả thu lẫn chi, có OCR hoặc không)
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreateSchema,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    transaction_id = await service.create_transaction(current_user.user_id, payload)
    return {"status": "success", "data": {"transaction_id": transaction_id}}

# LẤY DANH SÁCH GIAO DỊCH
@router.get("", status_code=status.HTTP_200_OK)
async def get_transactions(
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    transactions = await service.get_transactions(current_user.user_id)
    return {"status": "success", "data": transactions}

# LẤY CHI TIẾT 1 GIAO DỊCH
@router.get("/{transaction_id}", status_code=status.HTTP_200_OK)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    transaction = await service.get_transaction_by_id(current_user.user_id, transaction_id)
    return {"status": "success", "data": transaction}

# CẬP NHẬT GIAO DỊCH
@router.patch("/{transaction_id}", status_code=status.HTTP_200_OK)
async def update_transaction(
    transaction_id: int,
    payload: TransactionUpdateSchema,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    transaction = await service.update_transaction(current_user.user_id, transaction_id, payload)
    return {"status": "success", "data": transaction}

# XÓA GIAO DỊCH
@router.delete("/{transaction_id}", status_code=status.HTTP_200_OK)
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(require_user),
    service: TransactionService = Depends(get_transaction_service)
):
    return await service.delete_transaction(current_user.user_id, transaction_id)