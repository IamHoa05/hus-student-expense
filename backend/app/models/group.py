from sqlalchemy import Column, String, ForeignKey, DECIMAL, TIMESTAMP, PrimaryKeyConstraint, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime
from app.config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Group(Base):
    __tablename__ = "group"
    group_id = Column(Integer, primary_key=True, autoincrement=True)
    group_name = Column(String, nullable=False) # Tên phòng (VD: Phòng 302 HUS)
    invite_code = Column(String, unique=True) # Mã 6-8 ký tự để mời bạn bè vào nhóm
    group_balance = Column(DECIMAL(15, 2), default=0) # Tổng tiền hiện có trong quỹ phòng
    creator_id = Column(Integer, ForeignKey("user.user_id")) # ID của trưởng phòng
    created_at = Column(DateTime, server_default=func.now())
    # Relationships
    creator = relationship("User", back_populates="owned_groups")
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    # Đổi transaction -> transactions để khớp với Transaction.group
    transactions = relationship("Transaction", back_populates="group")

class GroupMember(Base):
    __tablename__ = "group_member"
    group_id = Column(Integer, ForeignKey("group.group_id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("user.user_id", ondelete="CASCADE"))
    role = Column(String) # Vai trò: 'admin' (Trưởng phòng), 'treasurer' (Thủ quỹ), 'member'
    contribution_balance = Column(DECIMAL(15, 2), default=0) # Số tiền thực tế đã đóng vào quỹ
    pending_reimbursement = Column(DECIMAL(15, 2), default=0) # Tiền nhóm đang nợ bạn này (do chi hộ)
    joined_at = Column(DateTime, server_default=func.now())

    __table_args__ = (PrimaryKeyConstraint('group_id', 'user_id'),) # Một người chỉ ở trong 1 nhóm 1 lần

    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="memberships")