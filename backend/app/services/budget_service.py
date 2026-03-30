from ..models.financial import Budget
from sqlalchemy import select, func, extract, Integer, and_
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.budget import BudgetCreateSchema
from ..config.database import get_db
from fastapi import Depends
from ..models.transaction import Transaction # Import để tính tiền đã tiêu
from ..models.category import Category # Import để lấy tên danh mục cho UI


class BudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def set_budget(self, user_id: int, data: BudgetCreateSchema):
        # 1. Tìm ngân sách với hàm extract đã được cast về Integer
        stmt = select(Budget).where(
            and_(
                Budget.user_id == user_id,
                Budget.category_id == data.category_id,
                Budget.is_active == True,
                # Ép kiểu extract về Integer để so sánh chính xác với Python int
                func.extract('month', Budget.start_date).cast(Integer) == data.start_date.month,
                func.extract('year', Budget.start_date).cast(Integer) == data.start_date.year
            )
        )
        result = await self.db.execute(stmt)
        budget_obj = result.scalar_one_or_none()

        if budget_obj:
            budget_obj.amount_limit = data.amount_limit
            budget_obj.start_date = data.start_date
            budget_obj.end_date = data.end_date
            budget_obj.alert_threshold = data.alert_threshold
        else:
            budget_obj = Budget(
                user_id=user_id,
                category_id=data.category_id,
                amount_limit=data.amount_limit,
                start_date=data.start_date,
                end_date=data.end_date,
                period=data.period.value, # Lấy giá trị chuỗi từ Enum
                alert_threshold=data.alert_threshold
            )
            self.db.add(budget_obj)

        # 2. Tính toán spent_amount thực tế
        # Lưu ý: So sánh Transaction.transaction_date (DateTime) với data.start_date (Date)
        actual_spent_stmt = select(func.sum(Transaction.total_amount)).where(
            and_(
                Transaction.user_id == user_id,
                Transaction.category_id == data.category_id,
                Transaction.transaction_date >= data.start_date,
                Transaction.transaction_date <= data.end_date,
                Transaction.transaction_type == 'outflow' # Chỉ tính tiền chi
            )
        )
        actual_spent_res = await self.db.execute(actual_spent_stmt)
        # Gán giá trị tạm thời để Schema trả về (không lưu vào cột spent_amount nếu cột đó không tồn tại)
        budget_obj.spent_amount = float(actual_spent_res.scalar() or 0)

        await self.db.commit()
        await self.db.refresh(budget_obj)
        return budget_obj

    async def get_budget_allocation(self, user_id: int, month: int, year: int):
        """
        Lấy dữ liệu phân bổ chi tiêu so với hạn mức (dùng cho UI hiển thị %)
        """
        # 1. Lấy tất cả Budget đang active của user trong tháng/năm này
        stmt = select(Budget, Category.name).join(
            Category, Budget.category_id == Category.category_id
        ).where(
            and_(
                Budget.user_id == user_id,
                Budget.is_active == True,
                extract('month', Budget.start_date) == month,
                extract('year', Budget.start_date) == year
            )
        )
        result = await self.db.execute(stmt)
        budgets = result.all()

        allocation_data = []

        for budget_obj, cat_name in budgets:
            # 2. Tính tổng tiền thực tế đã tiêu cho Category này trong tháng
            spent_stmt = select(func.sum(Transaction.total_amount)).where(
                and_(
                    Transaction.user_id == user_id,
                    Transaction.category_id == budget_obj.category_id,
                    Transaction.transaction_type == 'outflow',
                    extract('month', Transaction.transaction_date) == month,
                    extract('year', Transaction.transaction_date) == year
                )
            )
            spent_res = await self.db.execute(spent_stmt)
            actual_spent = float(spent_res.scalar() or 0)
            
            limit = float(budget_obj.amount_limit)
            
            # 3. Tính toán các chỉ số cho UI
            percentage = round((actual_spent / limit) * 100, 1) if limit > 0 else 0
            remaining = limit - actual_spent

            allocation_data.append({
                "category_name": cat_name,
                "amount_limit": limit,
                "spent_amount": actual_spent,
                "percentage": percentage,
                "remaining_amount": max(0, remaining) # Không để số âm nếu tiêu quá
            })

        # Sắp xếp theo phần trăm tiêu nhiều nhất lên đầu giống UI của bạn
        return sorted(allocation_data, key=lambda x: x['percentage'], reverse=True)
    
async def get_budget_service(db: AsyncSession = Depends(get_db)):
    return BudgetService(db)