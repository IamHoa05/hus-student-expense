from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.config.database import Base
import enum

class TransactionType(str, enum.Enum):
    INFLOW = "inflow"
    OUTFLOW = "outflow"

class Category(Base):
    __tablename__ = "category"
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    category_name = Column(String(100), nullable=False)
    user_id = Column(ForeignKey("user.user_id", ondelete="SET NULL"), nullable=True)
    transaction_type = Column(Enum(TransactionType), nullable=False, default=TransactionType.OUTFLOW)
    icon = Column(String, nullable=True)
    is_system = Column(Boolean, default=False)

    user = relationship("User")
    # transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")