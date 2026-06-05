from sqlalchemy import Column, String, ForeignKey, DECIMAL, Integer, Date, Boolean, DateTime, Enum, Index
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

class BudgetPeriod(str, enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class Budget(Base):
    __tablename__ = "budget"
    budget_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.category_id"), nullable=False)
    amount_limit = Column(DECIMAL(15, 2), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    alert_threshold = Column(DECIMAL(5, 2), default=80)  # Mặc định cảnh báo 80%
    period = Column(Enum(BudgetPeriod), nullable=False)
    is_active = Column(Boolean, default=True)
    alert_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    __table_args__ = (
        Index('ix_budget_user_active', 'user_id', 'is_active'),
    )

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")