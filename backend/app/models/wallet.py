from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False) # Ví dụ: Ví MoMo, Tiền mặt
    balance = Column(Numeric(precision=18, scale=2), default=0.0) # Dùng Numeric cho tiền tệ

    owner = relationship("User", back_populates="wallets")