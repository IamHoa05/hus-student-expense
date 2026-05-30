from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional
from pydantic import EmailStr

class Settings(BaseSettings):
    # Các thông tin cơ bản của App
    APP_NAME: str = "S-Wallet"
    DEBUG: bool = True
    
    # Cấu hình Database
    # Gán mặc định là None hoặc chuỗi rỗng để tránh lỗi nếu .env chưa load kịp
    DATABASE_URL: Optional[str] = None
    
    #OAUTH
    OAUTH2_SECRET_KEY: str
    OAUTH2_ALGORITHM: str = "HS256"
    OAUTH2_ACCESS_TOKEN_EXPIRE_MINUTES: int = 180
    OAUTH2_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    #GOOGLE AUTH API
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    FRONTEND_URL: str = "http://localhost:3000"
    # Cấu hình Security
    SECRET_KEY: str 

    # Thông tin DB từ .env
    POSTGRES_USER: Optional[str] = "user"
    POSTGRES_PASSWORD: Optional[str] = "password"
    POSTGRES_DB: Optional[str] = "spending_db"

    #SEND EMAIL
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str

    RESET_PASSWORD_TOKEN_EXPIRE_MINUTES: int = 5

    # Pydantic v2 dùng SettingsConfigDict thay vì class Config (nhưng class Config vẫn dùng được)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # config/settings.py — thêm các field Minio vào Settings hiện tại
    MINIO_ENDPOINT: str = "transminer-minio:9000"   # fix: đúng tên container
    MINIO_PUBLIC_ENDPOINT: str = "localhost:9004"    # fix: đúng port expose ra ngoài
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_SECURE: bool = False
    MINIO_BUCKET_NAME: str = "student-expense-bucket"
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()