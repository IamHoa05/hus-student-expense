# config/minio.py
import boto3
from botocore.exceptions import ClientError
from botocore.client import Config  # ← BẮT BUỘC thêm dòng này
from app.config.settings import settings

BUCKET_NAME = settings.MINIO_BUCKET_NAME

# Sửa lại s3_client để tương thích hoàn toàn với Backblaze B2
s3_client = boto3.client(
    "s3",
    # 1. Đổi sang 'https://' vì Backblaze bắt buộc bảo mật SSL, không dùng 'http://'
    endpoint_url=f"https://{settings.MINIO_ENDPOINT}",  
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    region_name="us-west-004",  # 2. Đổi vùng thành us-west-004 theo đúng endpoint của bạn
    config=Config(signature_version='s3v4')  # 3. BẮT BUỘC phải có signature v4 đối với B2
)


def ensure_bucket():  
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code in ("404", "NoSuchBucket", "403"): # Thêm 403 vì B2 có thể chặn head_bucket bừa bãi
            # Vì bạn đã tạo Bucket thủ công trên web thành công và để Public rồi,
            # hàm này chỉ cần chạy lướt qua. Nếu không thấy, ta gọi tạo lại:
            try:
                s3_client.create_bucket(Bucket=BUCKET_NAME)
            except Exception:
                pass # Nếu đã tồn tại thì bỏ qua luôn
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
    """Trả về link ảnh chuẩn từ Backblaze để Frontend Vercel có thể hiển thị công khai"""
    # Cấu trúc link public chuẩn của Backblaze B2 có dạng:
    # https://f004.backblazeb2.com/file/ten-bucket/ten-file.jpg
    # (Với cụm f004 lấy từ số đầu của cụm us-west-004)
    return f"https://f004.backblazeb2.com/file/{BUCKET_NAME}/{object_name}"