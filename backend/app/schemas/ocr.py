from decimal import Decimal
from pydantic import BaseModel, Field


# ── Shared ──────────────────────────────────────────────────
class SanPhamItem(BaseModel):
    ten_san_pham: str | None = None
    so_luong: str | None = None
    don_gia: str | None = None
    giam_gia: str | None = None
    thanh_tien: str | None = None
    phan_loai: str | None = None


# ── Bước 1: Extract ─────────────────────────────────────────
class OcrExtractResponse(BaseModel):
    image_url: str | None = None
    ten_cua_hang: str | None = None
    ngay_mua: str | None = None
    danh_sach_san_pham: list[SanPhamItem] = []
    tong_tien_hoa_don: str | None = None


# ── Bước 2: Classify ────────────────────────────────────────
class OcrClassifyRequest(BaseModel):
    image_url: str | None = None
    ten_cua_hang: str | None = None
    ngay_mua: str | None = None
    danh_sach_san_pham: list[SanPhamItem] = []
    tong_tien_hoa_don: str | None = None


class TransactionPreview(BaseModel):
    amount: Decimal
    category_id: int | None = None
    category_name: str | None = None
    note: str | None = None


class OcrClassifyResponse(BaseModel):
    image_url: str | None = None
    ten_cua_hang: str | None = None
    ngay_mua: str | None = None
    danh_sach_san_pham: list[SanPhamItem] = []
    tong_tien_hoa_don: str | None = None
    transactions_preview: list[TransactionPreview] = []


# ── Bước 3: Confirm ─────────────────────────────────────────
class TransactionConfirmItem(BaseModel):
    amount: Decimal = Field(..., ge=0)
    category_id: int
    note: str | None = None


class OcrConfirmRequest(BaseModel):
    image_url: str | None = None
    ten_cua_hang: str | None = None
    ngay_mua: str | None = None
    tong_tien_hoa_don: str | None = None
    payment_method: str | None = None
    location: str | None = None
    danh_sach_san_pham: list[SanPhamItem] = []  # giữ để lưu ocr_raw
    transactions: list[TransactionConfirmItem] = Field(..., min_length=1)


class OcrConfirmResponse(BaseModel):
    message: str
    transactions: list[dict]