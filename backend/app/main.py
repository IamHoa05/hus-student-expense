from fastapi import FastAPI
from contextlib import asynccontextmanager # Thêm cái này để quản lý vòng đời app
from app.config.database import engine, Base
from app.config.settings import settings

# Import models (Giữ nguyên đống này của Hoa nhé)
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.category import Category
from app.models.transaction import Transaction, TransactionDetail, TransactionMedia, ExpenseSplit
from app.models.financial import Budget, SavingGoal

# 1. Định nghĩa hàm khởi tạo bảng
async def init_models():
    async with engine.begin() as conn:
        # Chạy hàm create_all (vốn là sync) trong môi trường async
        await conn.run_sync(Base.metadata.create_all)

# 2. Dùng lifespan để chạy init_models khi app vừa bật lên
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Đang khởi tạo Database...")
    await init_models()
    print("✅ Database đã sẵn sàng!")
    yield
    # (Chỗ này để code dọn dẹp nếu cần khi tắt app)

# 3. Khởi tạo App với lifespan
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan # Truyền lifespan vào đây
)


from .controllers.auth_controller import router as auth_router
app.include_router(auth_router)

from .controllers.transaction_controller import router as transaction_router
app.include_router(transaction_router)

from .controllers.category_controller import router as category_router
app.include_router(category_router)

from .controllers.budget_controller import router as budget_router
app.include_router(budget_router)