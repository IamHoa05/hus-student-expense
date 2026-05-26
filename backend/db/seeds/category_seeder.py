import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.config.database import AsyncSessionLocal, engine, Base
from app.models.category import Category, TransactionType
from sqlalchemy.future import select

async def init_db():
    print("🚀 Đang khởi tạo cấu trúc các bảng...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Cấu trúc CSDL đã sẵn sàng!")

async def seed_categories():
    categories = [
        # Chi tiêu
        {"name": "Ăn uống",       "icon": "restaurant",       "type": TransactionType.OUTFLOW},
        {"name": "Học tập",       "icon": "school",            "type": TransactionType.OUTFLOW},
        {"name": "Di chuyển",     "icon": "directions_bus",    "type": TransactionType.OUTFLOW},
        {"name": "Dịch vụ",       "icon": "settings_suggest",  "type": TransactionType.OUTFLOW},
        {"name": "Mua sắm",       "icon": "shopping_bag",      "type": TransactionType.OUTFLOW},
        {"name": "Giải trí",      "icon": "sports_esports",    "type": TransactionType.OUTFLOW},
        {"name": "Sức khỏe",      "icon": "favorite",          "type": TransactionType.OUTFLOW},
        {"name": "Cố định",       "icon": "home_work",         "type": TransactionType.OUTFLOW},
        {"name": "Khác",          "icon": "more_horiz",        "type": TransactionType.OUTFLOW},
        # Thu nhập
        {"name": "Lương",         "icon": "payments",          "type": TransactionType.INFLOW},
        {"name": "Thưởng",        "icon": "card_giftcard",     "type": TransactionType.INFLOW},
        {"name": "Tiền tiêu vặt", "icon": "savings",           "type": TransactionType.INFLOW},
        {"name": "Thu nhập khác", "icon": "account_balance",   "type": TransactionType.INFLOW},
    ]

    async with AsyncSessionLocal() as session:
        try:
            print("🌱 Đang đổ dữ liệu mẫu...")
            for cat_data in categories:
                stmt = select(Category).where(
                    (Category.category_name == cat_data["name"]) &
                    (Category.transaction_type == cat_data["type"])
                )
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()

                if not existing:
                    session.add(Category(
                    category_name=cat_data["name"],
                    transaction_type=cat_data["type"],
                    icon=cat_data["icon"],
                    is_system=True,
                    user_id=None
                ))
                    print(f"   [+] Added: {cat_data['name']} ({cat_data['type'].value})")
                else:
                    print(f"   [-] Skipped: {cat_data['name']}")

            await session.commit()
            print("✨ Seeding hoàn tất!")
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