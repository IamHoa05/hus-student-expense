from fastapi import APIRouter, Depends, HTTPException, status
from ..models.user import User
from sqlalchemy.ext.asyncio import AsyncSession

from ..middleware.auth import require_user
from ..config.database import get_db
from ..schemas.transaction import TransactionCreateSchema, IncomeCreateSchema, ExpenseCreateSchema
from ..services.transaction_service import TransactionService # Sửa lỗi typo trasaction_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/expenses_ocr", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreateSchema, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user) # Lấy cả object user luôn
):
    service = TransactionService(db)
    # Lấy ID trực tiếp từ object user đã xác thực
    transaction_id = await service.create_new_transaction(current_user.user_id, payload)
    
    return {
        "status": "success",
        "data": {"id": transaction_id}
    }

@router.post("/incomes", status_code=201)
async def create_income(
    payload: IncomeCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API lưu khoản thu nhập (Lương, Thưởng, Tiền tiêu vặt...)
    """
    service = TransactionService(db)
    result_id = await service.create_income(current_user.user_id, payload)
    return {
        "status": "success",
        "message": "Đã lưu khoản thu mới",
        "data": {"transaction_id": result_id}
    }

@router.post("/expenses", status_code=201)
async def create_expense(
    payload: ExpenseCreateSchema, # Bạn tạo thêm Schema này hoặc dùng chung với Income
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    """
    API lưu khoản chi tiêu (Ăn uống, Học tập, Mua sắm...)
    """
    service = TransactionService(db)
    # Logic xử lý cho outflow
    result_id = await service.create_expense(current_user.user_id, payload)
    
    return {
        "status": "success",
        "message": "Đã lưu khoản chi tiêu mới",
        "data": {"transaction_id": result_id}
    }