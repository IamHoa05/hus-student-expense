from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Các thông tin cơ bản của App
    APP_NAME: str = "S-Wallet"
    DEBUG: bool = True
    
    # Cấu hình Database (Lấy từ .env)
    DATABASE_URL: str
    
    # Cấu hình bảo mật (Cho JWT sau này)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Thêm 3 dòng này để Pydantic chấp nhận chúng từ file .env
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    class Config:
        # Chỉ định file chứa biến môi trường
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Thêm dòng này để lỡ có biến lạ khác nó cũng không báo lỗi nữa

# Sử dụng lru_cache để không phải đọc file .env nhiều lần, giúp app chạy nhanh hơn
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()