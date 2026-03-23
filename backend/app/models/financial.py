from sqlalchemy import Column, String, ForeignKey, DECIMAL, Integer, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.config.database import Base
from sqlalchemy.orm import relationship
class Budget(Base):
    __tablename__ = "budget"
    budget_id = Column(Integer, primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    category_id = Column(Integer, ForeignKey("category.category_id"))
    amount_limit = Column(DECIMAL(15, 2)) # Hạn mức (VD: 2 triệu/tháng)
    spent_amount = Column(DECIMAL(15, 2), default=0) # Số tiền đã tiêu trong hạn mức này
    start_date = Column(Date)
    end_date = Column(Date)
    alert_threshold = Column(DECIMAL(5, 2)) # Ngưỡng cảnh báo % (VD: 80%)
    period = Column(String) # Chu kỳ: 'monthly', 'weekly'
    is_active = Column(Boolean, default=True) # Trạng thái đang theo dõi ngân sách này

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets") 
class SavingGoal(Base):
    __tablename__ = "saving_goal"
    goal_id = Column(Integer, primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("user.user_id"))
    goal_name = Column(String) # Tên mục tiêu (Mua Laptop, Quỹ du lịch...)
    target_amount = Column(DECIMAL(15, 2)) # Số tiền cần đạt được
    current_amount = Column(DECIMAL(15, 2), default=0) # Số tiền hiện đã tiết kiệm được
    deadline = Column(Date) # Ngày dự kiến hoàn thành
    status = Column(String, default="in_progress") # Trạng thái: 'completed', 'failed'

    user = relationship("User", back_populates="savings")