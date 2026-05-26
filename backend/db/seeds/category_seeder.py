import sys
import os
import asyncio

# 1. Thêm thư mục gốc vào PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.config.database import AsyncSessionLocal, engine
from app.models.category import Category, Base
from sqlalchemy.future import select

async def init_db():
    """Tạo tất cả các bảng dựa trên khai báo Model"""
    print("🚀 Đang khởi tạo cấu trúc các bảng...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Cấu trúc CSDL đã sẵn sàng!")

async def seed_categories():
    # Cập nhật danh sách với transaction_type chuẩn: inflow/outflow
    categories = [
        # Nhóm Chi tiêu (outflow)
        {"name": "Ăn uống", "type": "outflow"},
        {"name": "Học tập", "type": "outflow"},
        {"name": "Di chuyển", "type": "outflow"},
        {"name": "Dịch vụ", "type": "outflow"},
        {"name": "Mua sắm", "type": "outflow"},
        {"name": "Giải trí", "type": "outflow"},
        {"name": "Cố định", "type": "outflow"},
        {"name": "Nhóm", "type": "outflow"},
        {"name": "Khác", "type": "outflow"},
        
        # Nhóm Thu nhập (inflow)
        {"name": "Thu nhập", "type": "inflow"},
    ]

    async with AsyncSessionLocal() as session:
        try:
            print("🌱 Đang đổ dữ liệu mẫu...")
            for cat_data in categories:
                # Kiểm tra trùng lặp dựa trên cả Tên và Loại để tránh nhầm lẫn
                stmt = select(Category).where(
                    (Category.name == cat_data["name"]) & 
                    (Category.transaction_type == cat_data["type"])
                )
                result = await session.execute(stmt)
                existing_cat = result.scalar_one_or_none()

                if not existing_cat:
                    new_cat = Category(
                        name=cat_data["name"],
                        transaction_type=cat_data["type"], # Đã mở comment và dùng đúng tên cột
                        user_id=None # Đây là danh mục hệ thống dùng chung
                    )
                    session.add(new_cat)
                    print(f"   [+] Added: {cat_data['name']} ({cat_data['type']})")
                else:
                    print(f"   [-] Skipped: {cat_data['name']} (Already exists)")
            
            await session.commit()
            print("✨ --- Seeding completed! ---")
        except Exception as e:
            print(f"❌ Lỗi khi seeding: {e}")
            await session.rollback()

async def main():
    await init_db()
    await seed_categories()

if __name__ == "__main__":
    asyncio.run(main())


# docker exec -it fastapi_app python /code/db/seeds/category_seeder.py

# # 1. Dừng và xóa các container, đồng thời xóa luôn Volume của DB (để mất cái bảng UUID cũ)
# docker-compose down -v

# # 2. Build lại image (để cập nhật code Model mới nhất vào container)
# docker-compose build

# # 3. Chạy lại hệ thống
# docker-compose up -d

# 4. Vào container và chạy Seeder
# docker exec -it fastapi_app python /code/db/seeds/category_seeder.py

# 5. xem logs để kiểm tra kết quả
#/// docker logs -f fastapi_app
#docker compose logs -f