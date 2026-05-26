from sqlalchemy import Column, String, ForeignKey, DECIMAL, Integer, Text, Boolean, DateTime, Enum, Index
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.category import TransactionType
import enum

class TransactionSource(str, enum.Enum):
    MANUAL = "manual"
    OCR = "ocr"

class Transaction(Base):
    __tablename__ = "transaction"
    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.category_id"), nullable=True)
    ai_category_id = Column(Integer, ForeignKey("category.category_id"), nullable=True)
    total_amount = Column(DECIMAL(15, 2), nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    transaction_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    source = Column(Enum(TransactionSource), nullable=False, default=TransactionSource.MANUAL)  # ✅

    __table_args__ = (
        Index('ix_transaction_user_date', 'user_id', 'transaction_date'),
        Index('ix_transaction_category', 'category_id'),
        Index('ix_transaction_type', 'transaction_type'),
    )

    user = relationship("User", back_populates="transactions")
    category = relationship("Category", foreign_keys=[category_id])        # ✅ bỏ back_populates
    ai_category = relationship("Category", foreign_keys=[ai_category_id])
    details = relationship("TransactionDetail", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    media = relationship("TransactionMedia", back_populates="transaction", uselist=False, cascade="all, delete-orphan")


class TransactionDetail(Base):
    __tablename__ = "transaction_details"
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id", ondelete="CASCADE"), primary_key=True)
    store_name = Column(String)
    note = Column(Text)
    payment_method = Column(String)
    location = Column(String)
    tags = Column(ARRAY(String), nullable=True)

    transaction = relationship("Transaction", back_populates="details")


class TransactionMedia(Base):
    __tablename__ = "transaction_media"
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id", ondelete="CASCADE"), primary_key=True)
    image_url = Column(String)
    is_settled = Column(Boolean, default=False)
    ocr_raw = Column(JSONB)

    transaction = relationship("Transaction", back_populates="media")