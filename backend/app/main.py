from fastapi import FastAPI
from app.config.database import engine, Base
from app.config.settings import settings

# Quan trọng: Bạn phải import TẤT CẢ các model vào đây 
# để SQLAlchemy nhận diện được chúng trước khi tạo bảng.
from app.models.users import User
from app.models.wallet import Wallet
from app.models.transactions import Transaction, Category
from app.models.shared import SharedWallet, SharedExpense
from app.models.budget_receipt import Budget, Receipt

# Lệnh này sẽ tự động tạo các bảng trong PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# app/main.py
from app.controllers import receipt_controller


# Đăng ký các router
# Đăng ký router OCR
app.include_router(receipt_controller.router, prefix="/api/v1/receipts", tags=["OCR"])

