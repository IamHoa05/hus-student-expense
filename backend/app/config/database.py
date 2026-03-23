from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# 1. URL phải bắt đầu bằng postgresql+asyncpg (Hoa nhớ cài pip install asyncpg nhé)
SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://postgres:password123@db:5432/spending_db"

# 2. Tạo Engine bất đồng bộ
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# 3. Tạo SessionLocal bất đồng bộ
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# 4. Sửa hàm get_db thành Async (Đây là chỗ Hoa đang bị lỗi)
async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
            await db.commit() # Tự động commit nếu không có lỗi
        except Exception:
            await db.rollback() # Rollback nếu có lỗi
            raise
        finally:
            await db.close() # Đảm bảo đóng kết nối