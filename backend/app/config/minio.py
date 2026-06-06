# config/minio.py
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config  
from app.config.settings import settings

BUCKET_NAME = settings.MINIO_BUCKET_NAME

# Tự động chọn giao thức: Nếu MINIO_SECURE=True thì dùng https, ngược lại dùng http
scheme = "https" if settings.MINIO_SECURE else "http"

#Khởi tạo s3_client linh hoạt cho cả Local và Production
s3_client = boto3.client(
    "s3",
    endpoint_url=f"{scheme}://{settings.MINIO_ENDPOINT}",  
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    config=Config(
        signature_version='s3v4',
        s3={'addressing_style': 'path'}  # ✅ đổi virtual → path
    )
    # ✅ bỏ region_name hoàn toàn
)


def ensure_bucket():  
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code in ("404", "NoSuchBucket", "403"):
            try:
                s3_client.create_bucket(Bucket=BUCKET_NAME)
            except Exception:
                pass 
        else:
            raise


def upload_file(object_name: str, data: bytes, content_type: str = "image/jpeg"):
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=object_name,
        Body=data,
        ContentType=content_type,
    )


def get_public_url(object_name: str) -> str:
    """Trả về link ảnh chuẩn tùy theo môi trường"""
    if settings.MINIO_SECURE:
        # Link Public chuẩn cho môi trường chạy thật với Backblaze B2
        return f"https://f004.backblazeb2.com/file/{BUCKET_NAME}/{object_name}"
    else:
        # Link Public cũ cho môi trường Docker Local của bạn
        return f"http://{settings.MINIO_PUBLIC_ENDPOINT}/{BUCKET_NAME}/{object_name}"