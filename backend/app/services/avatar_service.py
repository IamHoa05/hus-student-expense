# app/services/upload_service.py

import uuid
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User
from ..config.minio import ensure_bucket, upload_file, get_public_url, s3_client, BUCKET_NAME

ALLOWED_TYPES = ("image/jpeg", "image/png", "image/webp")


class UploadService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload_avatar(self, current_user: User, file: UploadFile) -> dict:
        ensure_bucket()
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận jpeg, png, webp")

        ext = file.filename.split(".")[-1]
        object_name = f"avatars/{current_user.user_id}_{uuid.uuid4().hex}.{ext}"

        content = await file.read()
        upload_file(object_name, content, file.content_type)

        avt_url = get_public_url(object_name)
        current_user.avt_url = avt_url

        await self.db.commit()
        await self.db.refresh(current_user)

        return {"avt_url": avt_url}

    async def delete_avatar(self, current_user: User) -> dict:
        if not current_user.avt_url:
            raise HTTPException(status_code=404, detail="Người dùng chưa có ảnh đại diện")

        # Lấy object_name từ URL
        # URL dạng: http://host/bucket/avatars/123_abc.jpg
        object_name = "/".join(current_user.avt_url.split("/")[-2:])  # avatars/123_abc.jpg

        try:
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=object_name)
        except Exception:
            raise HTTPException(status_code=500, detail="Xóa ảnh thất bại")

        current_user.avt_url = None
        await self.db.commit()

        return {"message": "Xóa ảnh đại diện thành công"}