from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings

# 1. Tạo Engine kết nối tới PostgreSQL (thông tin lấy từ settings.py)
engine = create_engine(settings.DATABASE_URL)

# 2. Tạo SessionLocal để quản lý các phiên làm việc với DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Base class để các Model (User, Transaction) kế thừa
Base = declarative_base()

# 4. Hàm Generator để quản lý việc đóng/mở kết nối (Dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()