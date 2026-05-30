import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.sessions import SessionMiddleware

from app.config.database import engine, Base
from app.config.settings import settings

# Import models để SQLAlchemy nhận diện khi tạo bảng
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction, TransactionDetail, TransactionMedia  
from app.models.financial import Budget  # 
from app.models.notification import Notification


# Import routers
from app.controllers.auth_controller import router as auth_router
from app.controllers.avatar_controller import router as avatar_router   
from app.controllers.transaction_controller import router as transaction_router
from app.controllers.category_controller import router as category_router
from app.controllers.budget_controller import router as budget_router
from app.controllers.stats_controller import router as stats_router
from app.controllers.ocr_controller import router as ocr_router 
from app.controllers.export_controller import router as export_router
from app.controllers.notification_controller import router as notification_router   

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Đang khởi tạo Database...")
    await init_models()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="swallet_session",  
    same_site="lax",
    https_only=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(avatar_router)   
app.include_router(ocr_router) 
app.include_router(transaction_router)
app.include_router(category_router)
app.include_router(budget_router)
app.include_router(stats_router) 
app.include_router(export_router)
app.include_router(notification_router)
