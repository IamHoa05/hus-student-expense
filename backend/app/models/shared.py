from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, ARRAY
from app.config.database import Base

class SharedWallet(Base):
    __tablename__ = "shared_wallets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    members = Column(ARRAY(Integer)) # Danh sách User IDs
    balance = Column(Numeric(18, 2), default=0.0)
    created_by = Column(Integer, ForeignKey("users.id"))

class SharedExpense(Base):
    __tablename__ = "shared_expenses"
    id = Column(Integer, primary_key=True, index=True)
    shared_wallet_id = Column(Integer, ForeignKey("shared_wallets.id"))
    amount = Column(Numeric(18, 2), nullable=False)
    paid_by = Column(Integer, ForeignKey("users.id")) # Người trả trước
    owed_by = Column(ARRAY(Integer)) # Danh sách người nợ