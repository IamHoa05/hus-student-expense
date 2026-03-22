from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import OCRService
from app.schemas.receipt import OCRResultResponse

router = APIRouter()
ocr_service = OCRService() # Lấy instance đã load model

@router.post("/scan", response_model=OCRResultResponse)
async def scan_receipt(file: UploadFile = File(...)):
    # 1. Kiểm tra định dạng file
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPG hoặc PNG")

    try:
        # 2. Đọc dữ liệu ảnh
        image_bytes = await file.read()
        
        # 3. Gọi Service AI xử lý
        result = await ocr_service.process_receipt(image_bytes)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống OCR: {str(e)}")