from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.database import engine, Base
from app.config.settings import settings
from starlette.middleware.sessions import SessionMiddleware

# Import models
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.category import Category
from app.models.transaction import Transaction, TransactionDetail, TransactionMedia, ExpenseSplit
from app.models.financial import Budget, SavingGoal

# 1. Khởi tạo bảng
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Đang khởi tạo Database...")
    await init_models()
    yield

# 2. Khởi tạo App DUY NHẤT MỘT LẦN
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan
)

import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.SECRET_KEY,
    session_cookie="momentum_session",
    same_site="lax",   # BẮT BUỘC: Cho phép gửi cookie giữa các port localhost
    https_only=False   # BẮT BUỘC: Vì Hòa đang dùng http thường
)

# 3. Cấu hình CORS (Phải có để Frontend gọi được)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. CẮM CÁC ROUTER (Link các chức năng vào đây)
from .controllers.auth_controller import router as auth_router
app.include_router(auth_router)

from .controllers.transaction_controller import router as transaction_router
app.include_router(transaction_router)

from .controllers.category_controller import router as category_router
app.include_router(category_router)

from .controllers.budget_controller import router as budget_router
app.include_router(budget_router)