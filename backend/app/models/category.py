from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base

class Category(Base):
    __tablename__ = "category"
    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False) # Tên danh mục (Ăn uống, Học tập...)
    user_id = Column(ForeignKey("user.user_id", ondelete="SET NULL"), nullable=True) # Nếu NULL là danh mục chung
    transaction_type = Column(String, nullable=False, default='outflow')

    # Relationships
    user = relationship("User") 
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")