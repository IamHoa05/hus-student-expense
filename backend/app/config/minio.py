# config/minio.py
import boto3
from botocore.exceptions import ClientError
from app.config.settings import settings

BUCKET_NAME = settings.MINIO_BUCKET_NAME

s3_client = boto3.client(
    "s3",
    endpoint_url=f"http://{settings.MINIO_ENDPOINT}",  # → http://transminer_minio:9000
    aws_access_key_id=settings.MINIO_ACCESS_KEY,
    aws_secret_access_key=settings.MINIO_SECRET_KEY,
    region_name="us-east-1",
)


def ensure_bucket():  # sync, không phải async
    try:
        s3_client.head_bucket(Bucket=BUCKET_NAME)
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code in ("404", "NoSuchBucket"):
            s3_client.create_bucket(Bucket=BUCKET_NAME)
            policy = f'''{{
                "Version": "2012-10-17",
                "Statement": [{{
                    "Effect": "Allow",
                    "Principal": {{"AWS": "*"}},
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::{BUCKET_NAME}/*"
                }}]
            }}'''
            s3_client.put_bucket_policy(Bucket=BUCKET_NAME, Policy=policy)
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
    """URL cho client (browser/mobile) truy cập ảnh từ bên ngoài Docker"""
    scheme = "https" if settings.MINIO_SECURE else "http"
    return f"{scheme}://{settings.MINIO_PUBLIC_ENDPOINT}/{BUCKET_NAME}/{object_name}"