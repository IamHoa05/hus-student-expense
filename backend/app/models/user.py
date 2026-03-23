from sqlalchemy import Column, String, Boolean, TIMESTAMP, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "user"
    # ID duy nhất của người dùng (dùng chuẩn UUID để bảo mật hơn Integer)
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False) # Email dùng để đăng nhập
    phone = Column(String) # Số điện thoại liên lạc
    full_name = Column(String) # Họ và tên đầy đủ
    password = Column(String, nullable=False) # Mật khẩu đã được mã hóa (Hashed)
    avt_url = Column(String) # Đường dẫn ảnh đại diện (Cloudinary/S3)
    is_active = Column(Boolean, default=True) # Trạng thái tài khoản (Hoạt động/Khóa)
    created_at = Column(DateTime, server_default=func.now()) # Ngày tham gia hệ thống

    # Mối quan hệ (Relationships)
    owned_groups = relationship("Group", back_populates="creator")
    memberships = relationship("GroupMember", back_populates="user")
    # Đổi từ transaction -> transactions (số nhiều cho danh sách)
    transactions = relationship("Transaction", back_populates="user") 
    budgets = relationship("Budget", back_populates="user")
    savings = relationship("SavingGoal", back_populates="user")
