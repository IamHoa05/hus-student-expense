# transaction.py
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base

# Thêm bảng Budget và Receipt
class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount_limit = Column(Numeric(18, 2))
    period = Column(String) # "Monthly" hoặc "Semester"

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    image_url = Column(String, nullable=False)
    raw_text = Column(String, nullable=True) # Kết quả OCR

    transaction = relationship("Transaction", back_populates="receipt")