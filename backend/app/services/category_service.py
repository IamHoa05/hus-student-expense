from sqlalchemy import func, delete, update, select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.category import Category # Nhớ kiểm tra đường dẫn model của bạn
from ..config.database import get_db
from fastapi import Depends

class CategoryService:
    def __init__(self, db: AsyncSession):
        """
        Khởi tạo service với database session
        """
        self.db = db

    async def get_categories_by_type(self, user_id: int, trans_type: str):
        """
        Lấy danh sách danh mục theo loại giao dịch (thu/chi) và user_id.
        """
        stmt = select(Category).where(
            ((Category.user_id == None) | (Category.user_id == user_id)) &
            (Category.transaction_type == trans_type)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create_custom_category(self, user_id: int, name: str, trans_type: str):
        """
        Tạo danh mục cá nhân: Phải xác định là Thu (inflow) hay Chi (outflow)
        """
        new_cat = Category(
            name=name, 
            user_id=user_id,
            transaction_type=trans_type # Gán loại vào đây
        )
        self.db.add(new_cat)
        await self.db.commit()
        await self.db.refresh(new_cat)
        return new_cat
    
    async def update_category(self, category_id: int, user_id: int, new_name: str):
        """Chỉ cho phép sửa danh mục do chính user tạo"""
        stmt = update(Category).where(
            (Category.category_id == category_id) & (Category.user_id == user_id)
        ).values(name=new_name).returning(Category)
        
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one_or_none()

    async def delete_category(self, category_id: int, user_id: int):
        """Chỉ cho phép xóa danh mục của chính mình"""
        stmt = delete(Category).where(
            (Category.category_id == category_id) & (Category.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0 # Trả về True nếu đã xóa

    # async def get_stats_by_category(self, user_id: int, month: int, year: int):
    #     """Thống kê chi tiêu theo từng danh mục (Dùng cho biểu đồ tròn)"""
    #     # Tính tổng chi tiêu của user trong tháng đó
    #     total_stmt = select(func.sum(Transaction.total_amount)).where(
    #         (Transaction.user_id == user_id) &
    #         (func.extract('month', Transaction.transaction_date) == month) &
    #         (func.extract('year', Transaction.transaction_date) == year)
    #     )
    #     total_res = await self.db.execute(total_stmt)
    #     grand_total = total_res.scalar() or 0

    #     if grand_total == 0: return []

    #     # Nhóm theo Category và tính %
    #     stmt = select(
    #         Category.name,
    #         func.sum(Transaction.total_amount).label("category_total")
    #     ).join(Transaction).where(
    #         (Transaction.user_id == user_id) &
    #         (func.extract('month', Transaction.transaction_date) == month) &
    #         (func.extract('year', Transaction.transaction_date) == year)
    #     ).group_by(Category.name)

    #     result = await self.db.execute(stmt)
    #     stats = []
    #     for row in result:
    #         percentage = (float(row.category_total) / float(grand_total)) * 100
    #         stats.append({
    #             "name": row.name,
    #             "total": float(row.category_total),
    #             "percentage": round(percentage, 2)
    #         })
    #     return stats
    
    
# Dependency để Controller gọi
async def get_category_service(db: AsyncSession = Depends(get_db)):
    return CategoryService(db)