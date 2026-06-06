# config/minio.py
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config  # Giao thức ký v4 của AWS S3
from app.config.settings import settings

BUCKET_NAME = settings.MINIO_BUCKET_NAME

# Khởi tạo s3_client tương thích 100% với Backblaze B2
s3_client = boto3.client(
    "s3",
    endpoint_url=f"https://{settings.MINIO_ENDPOINT}",  
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    region_name="us-west-004",  # ← ĐÃ SỬA CHUẨN: Chỉ để cụm vùng vật lý us-west-004
    config=Config(signature_version='s3v4')  # Bắt buộc cho Backblaze
)


def ensure_bucket():  
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        # Backblaze đôi khi trả về 403 Forbidden nếu bucket chưa cấu hình xong quyền đầy đủ cho Key
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
    """Trả về link ảnh chuẩn từ Backblaze để hiển thị công khai lên giao diện Frontend"""
    # Vì endpoint của bạn là us-west-004, nên máy chủ phân phối ảnh công khai sẽ là f004
    return f"https://f004.backblazeb2.com/file/{BUCKET_NAME}/{object_name}"