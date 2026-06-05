from sqlalchemy import Column, String, Boolean, Integer, DateTime, Index
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String)
    full_name = Column(String)
    password = Column(String, nullable=False)
    avt_url = Column(String)
    is_active = Column(Boolean, default=True)
    device_token = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    transactions = relationship("Transaction", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    notifications = relationship("Notification", back_populates="user")