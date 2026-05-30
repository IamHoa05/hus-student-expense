# routers/transaction_ocr.py
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status

from app.middleware.auth import require_user
from app.models.user import User
from app.schemas.ocr import (
    OcrClassifyRequest, OcrClassifyResponse,
    OcrExtractResponse, OcrConfirmRequest, OcrConfirmResponse,
)
from app.services.ocr_service import TransactionOcrService, get_transaction_ocr_service

router = APIRouter(prefix="/transactions/ocr", tags=["Transaction OCR"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post(
    "/extract",
    response_model=OcrExtractResponse,
    summary="Bước 1 - Upload ảnh hóa đơn → trích xuất thông tin",
)
async def extract_invoice(
    file: UploadFile = File(...),
    current_user: User = Depends(require_user),
    service: TransactionOcrService = Depends(get_transaction_ocr_service),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Chỉ chấp nhận: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Ảnh không được vượt quá 10MB.",
        )
    await file.seek(0)
    return await service.extract_invoice(file, current_user.user_id)


@router.post(
    "/classify",
    response_model=OcrClassifyResponse,
    summary="Bước 2 - Map category, trả về preview các giao dịch",
)
async def classify_invoice(
    body: OcrClassifyRequest,
    current_user: User = Depends(require_user),
    service: TransactionOcrService = Depends(get_transaction_ocr_service),
):
    return await service.classify_invoice(body)


@router.post(
    "/confirm",
    response_model=OcrConfirmResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bước 3 - Xác nhận tạo giao dịch từ hóa đơn OCR",
)
async def confirm_invoice(
    body: OcrConfirmRequest,
    current_user: User = Depends(require_user),
    service: TransactionOcrService = Depends(get_transaction_ocr_service),
):
    created = await service.confirm_invoice(body, current_user.user_id)
    return OcrConfirmResponse(
        message=f"Tạo thành công {len(created)} giao dịch.",
        transactions=[
            {"transaction_id": t.transaction_id, "total_amount": float(t.total_amount)}
            for t in created
        ],
    )