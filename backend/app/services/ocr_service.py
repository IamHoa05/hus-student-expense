# services/ocr_service.py
import uuid
import httpx
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException, UploadFile, status
from zoneinfo import ZoneInfo
from app.config.database import get_db
from app.config.minio import ensure_bucket, upload_file, get_public_url
from app.models.transaction import Transaction, TransactionDetail, TransactionMedia, TransactionSource
from app.models.category import Category, TransactionType
from app.schemas.ocr import (
    OcrExtractResponse, OcrClassifyRequest, OcrClassifyResponse,
    OcrConfirmRequest, TransactionPreview
)
from .notification_service import NotificationService

HF_API_URL = "https://kieuna-vintern-invoice-api.hf.space/extract-invoice"

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

def _parse_amount(raw: str) -> Decimal:
    try:
        return Decimal(raw.replace(".", "").replace(",", "").strip())
    except InvalidOperation:
        return Decimal("0")


def _parse_date(raw: str) -> datetime:
    now_vn = datetime.now(VN_TZ)
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            date = datetime.strptime(raw.strip(), fmt).date()
            return datetime.combine(date, now_vn.time()).replace(tzinfo=None)
        except ValueError:
            continue
    return now_vn.replace(tzinfo=None)


class TransactionOcrService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notif_service = NotificationService(db)

    # ── Helper ──────────────────────────────────────────────
    async def _get_category_by_name(self, name: str) -> Category | None:
        result = await self.db.execute(
            select(Category).where(
                Category.category_name == name,
                Category.transaction_type == TransactionType.OUTFLOW,
                Category.is_system == True,
            )
        )
        return result.scalar_one_or_none()

    async def _resolve_category(self, phan_loai: str | None) -> Category | None:
        category = None
        if phan_loai:
            category = await self._get_category_by_name(phan_loai)
        if not category:
            category = await self._get_category_by_name("Khác")
        return category

    # ── Bước 1: Extract ─────────────────────────────────────
    async def extract_invoice(self, file: UploadFile, user_id: int) -> OcrExtractResponse:
        ensure_bucket()

        contents = await file.read()
        file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
        object_name = f"user_{user_id}/{uuid.uuid4()}.{file_ext}"

        upload_file(
            object_name=object_name,
            data=contents,
            content_type=file.content_type or "image/jpeg",
        )
        image_url = get_public_url(object_name)

        async with httpx.AsyncClient(timeout=420) as client:
            response = await client.post(
                HF_API_URL,
                files={"file": (file.filename or "invoice.jpg", contents, file.content_type or "image/jpeg")},
            )

        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Không thể kết nối đến dịch vụ OCR.")

        hf_data = response.json()
        if hf_data.get("status") != "ok":
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="OCR không nhận diện được hóa đơn.")

        data = hf_data["data"]
        return OcrExtractResponse(
            image_url=image_url,
            ten_cua_hang=data.get("ten_cua_hang"),
            ngay_mua=data.get("ngay_mua"),
            danh_sach_san_pham=data.get("danh_sach_san_pham", []),
            tong_tien_hoa_don=data.get("tong_tien_hoa_don"),
        )

    # ── Bước 2: Classify ────────────────────────────────────
    async def classify_invoice(self, body: OcrClassifyRequest) -> OcrClassifyResponse:
        # Group sản phẩm theo phan_loai
        groups: dict[str, list] = defaultdict(list)
        for sp in body.danh_sach_san_pham:
            key = sp.phan_loai or "Khác"
            groups[key].append(sp)

        # Tạo transactions_preview cho từng nhóm
        previews: list[TransactionPreview] = []
        for phan_loai, items in groups.items():
            category = await self._resolve_category(phan_loai)

            total = sum(_parse_amount(sp.thanh_tien) for sp in items)
           #ten_san_phams = ", ".join(sp.ten_san_pham for sp in items)
            note = f"{body.ten_cua_hang} - {phan_loai}"

            previews.append(TransactionPreview(
                amount=total,
                transaction_type="outflow",
                transaction_date=body.ngay_mua,
                category_id=category.category_id if category else None,
                category_name=category.category_name if category else "Khác",
                note=note,
                source="receipt",
            ))

        return OcrClassifyResponse(
            image_url=body.image_url,
            ten_cua_hang=body.ten_cua_hang,
            ngay_mua=body.ngay_mua,
            danh_sach_san_pham=body.danh_sach_san_pham,
            tong_tien_hoa_don=body.tong_tien_hoa_don,
            transactions_preview=previews,
        )

    # ── Bước 3: Confirm ─────────────────────────────────────
    async def confirm_invoice(self, body: OcrConfirmRequest, user_id: int) -> list[Transaction]:
        if not body.transactions:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Danh sách giao dịch trống.")

        transaction_date = _parse_date(body.ngay_mua) if body.ngay_mua else datetime.now(VN_TZ).replace(tzinfo=None)
        created: list[Transaction] = []

        for tx in body.transactions:
            if tx.amount <= 0:
                continue

            transaction = Transaction(
                user_id=user_id,
                category_id=tx.category_id,
                total_amount=tx.amount,
                transaction_type=TransactionType.OUTFLOW,
                transaction_date=transaction_date,
                source=TransactionSource.OCR,
            )
            self.db.add(transaction)
            await self.db.flush()

            self.db.add(TransactionDetail(
                transaction_id=transaction.transaction_id,
                store_name=body.ten_cua_hang,
                note=tx.note,
                payment_method=body.payment_method,
                location=body.ten_cua_hang,
            ))

            self.db.add(TransactionMedia(
                transaction_id=transaction.transaction_id,
                image_url=body.image_url,
                is_settled=True,
                ocr_raw={
                    "ten_cua_hang": body.ten_cua_hang,
                    "ngay_mua": body.ngay_mua,
                    "tong_tien_hoa_don": body.tong_tien_hoa_don,
                    "danh_sach_san_pham": [p.model_dump() for p in body.danh_sach_san_pham],
                },
            ))

            # ── Resolve category ─────────────────────────────
            category = await self.db.get(Category, tx.category_id)
            category_name = category.category_name if category else "Khác"

            # ── Notification ─────────────────────────────────
            await self.notif_service.on_transaction_created(
                user_id=user_id,
                amount=transaction.total_amount,
                category_name=category_name,
                transaction_type=TransactionType.OUTFLOW,
                transaction_id=transaction.transaction_id,
            )

            await self.notif_service.check_budget_alert(
                user_id=user_id,
                category_id=tx.category_id,
                category_name=category_name,
                transaction_date=transaction_date,
            )
            # ─────────────────────────────────────────────────

            created.append(transaction)

        await self.db.commit()
        for t in created:
            await self.db.refresh(t)

        return created


def get_transaction_ocr_service(db: AsyncSession = Depends(get_db)):
    return TransactionOcrService(db)