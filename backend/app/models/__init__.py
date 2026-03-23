from app.config.database import Base
from .user import User
from .group import Group, GroupMember
from .category import Category
from .transaction import Transaction, TransactionDetail, TransactionMedia, ExpenseSplit
from .financial import Budget, SavingGoal

# Việc liệt kê ở đây giúp SQLAlchemy "thấy" tất cả các bảng 
# khi khởi tạo database từ file main.py
__all__ = [
    "Base",
    "User",
    "Group",
    "GroupMember",
    "Category",
    "Transaction",
    "TransactionDetail",
    "TransactionMedia",
    "ExpenseSplit",
    "Budget",
    "SavingGoal"
]