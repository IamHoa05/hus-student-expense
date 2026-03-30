
from sqlalchemy import Column, String, ForeignKey, DECIMAL, TIMESTAMP, Integer, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import datetime
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class Transaction(Base):
    __tablename__ = "transaction"
    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id")) # Người tạo giao dịch
    group_id = Column(Integer, ForeignKey("group.group_id"), nullable=True) # Nếu NULL là tiêu cá nhân
    category_id = Column(Integer, ForeignKey("category.category_id")) # Thuộc danh mục nào
    total_amount = Column(DECIMAL(15, 2), nullable=False) # Tổng số tiền trên hóa đơn
    transaction_type = Column(String) # 'inflow' (Thu nhập) hoặc 'outflow' (Chi tiêu)
    transaction_date = Column(DateTime, nullable=False) # Ngày ghi trên hóa đơn (không phải ngày tạo)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions") # Khớp với User.transactions
    group = relationship("Group", back_populates="transactions") # Khớp với Group.transactions
    category = relationship("Category", back_populates="transactions") # Khớp với Category.transactions
    
    # Quan hệ 1-1 với các bảng mở rộng
    details = relationship("TransactionDetail", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    media = relationship("TransactionMedia", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    split = relationship("ExpenseSplit", back_populates="transaction", uselist=False, cascade="all, delete-orphan")

class TransactionDetail(Base):
    __tablename__ = "transaction_details"
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id", ondelete="CASCADE"), primary_key=True)
    store_name = Column(String) # Tên cửa hàng (VinMart, Circle K...)
    note = Column(Text) # Ghi chú chi tiết (Mua thịt bò, rau củ...)
    payment_method = Column(String) # Tiền mặt, Chuyển khoản, Momo...
    location = Column(String) # Địa chỉ nơi tiêu tiền

    transaction = relationship("Transaction", back_populates="details")
class TransactionMedia(Base):
    __tablename__ = "transaction_media"
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id", ondelete="CASCADE"), primary_key=True)
    image_url = Column(String) # Link ảnh hóa đơn lưu trên Cloud
    is_settled = Column(Boolean, default=False) # Đã đối soát xong giữa ảnh và số liệu chưa
    ocr_raw = Column(JSONB) # Dữ liệu thô trích xuất từ AI (dùng cho debug/NCKH)

    transaction = relationship("Transaction", back_populates="media")
class ExpenseSplit(Base):
    __tablename__ = "expense_splits"
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id", ondelete="CASCADE"), primary_key=True)
    payer_id = Column(Integer, ForeignKey("user.user_id")) # Ai là người rút ví ra trả trước?
    is_reimbursed = Column(Boolean, default=False) # Thủ quỹ đã trả lại tiền cho người chi hộ chưa?
    split_details = Column(JSONB) # Chi tiết chia tiền: {"user_A": 50k, "user_B": 50k}

    transaction = relationship("Transaction", back_populates="split")