from sqlalchemy import func, delete, update, select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, HTTPException
from ..models.category import Category, TransactionType
from ..models.transaction import Transaction
from ..config.database import get_db


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_categories_by_type(self, user_id: int, trans_type: TransactionType):
        stmt = select(Category).where(
            and_(
                or_(Category.user_id == None, Category.user_id == user_id),
                Category.transaction_type == trans_type  # ✅ Enum
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create_custom_category(self, user_id: int, name: str, trans_type: TransactionType, icon: str = None):
        new_cat = Category(
            category_name=name,      # ✅
            user_id=user_id,
            transaction_type=trans_type,
            icon=icon,
            is_system=False
        )
        self.db.add(new_cat)
        await self.db.commit()
        await self.db.refresh(new_cat)
        return new_cat

    async def update_category(self, category_id: int, user_id: int, name: str = None, icon: str = None):
        # ✅ Tách kiểm tra tồn tại vs không có quyền
        stmt = select(Category).where(Category.category_id == category_id)
        result = await self.db.execute(stmt)
        category = result.scalar_one_or_none()

        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
        if category.user_id != user_id:
            raise HTTPException(status_code=403, detail="Không có quyền sửa danh mục hệ thống")

        if name is not None:
            category.category_name = name
        if icon is not None:
            category.icon = icon

        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, category_id: int, user_id: int):
        stmt = select(Category).where(Category.category_id == category_id)
        result = await self.db.execute(stmt)
        category = result.scalar_one_or_none()

        if not category:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
        if category.user_id != user_id:
            raise HTTPException(status_code=403, detail="Không có quyền xóa danh mục hệ thống")

        # ✅ Kiểm tra có transaction đang dùng không trước khi xóa
        used_stmt = select(func.count()).where(Transaction.category_id == category_id)
        used_res = await self.db.execute(used_stmt)
        if used_res.scalar() > 0:
            raise HTTPException(
                status_code=400,
                detail="Không thể xóa danh mục đang có giao dịch. Hãy xóa các giao dịch đó trước!"
            )

        await self.db.delete(category)
        await self.db.commit()
        return True

    # ✅ Mở lại — phục vụ Trend Analysis
    async def get_stats_by_category(self, user_id: int, month: int, year: int):
        total_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract('month', Transaction.transaction_date) == month,
                func.extract('year', Transaction.transaction_date) == year
            )
        )
        total_res = await self.db.execute(total_stmt)
        grand_total = float(total_res.scalar() or 0)

        if grand_total == 0:
            return []

        stmt = select(
            Category.category_name,
            func.sum(Transaction.total_amount).label("category_total")
        ).join(Transaction, Transaction.category_id == Category.category_id).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.transaction_type == TransactionType.OUTFLOW,
                func.extract('month', Transaction.transaction_date) == month,
                func.extract('year', Transaction.transaction_date) == year
            )
        ).group_by(Category.name).order_by(func.sum(Transaction.total_amount).desc())

        result = await self.db.execute(stmt)
        return [
            {
                "name": row.category_name,
                "total": float(row.category_total),
                "percentage": round((float(row.category_total) / grand_total) * 100, 2)
            }
            for row in result
        ]


async def get_category_service(db: AsyncSession = Depends(get_db)):
    return CategoryService(db)