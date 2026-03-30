from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from decimal import Decimal
from ..models.transaction import Transaction
from ..config.database import get_db

class HomeService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.now = datetime.now()

    def get_current_balance(self) -> Decimal:
        """
        Tính số dư hiện tại từ bảng transactions trong ERD của bạn.
        Balance = (Tổng INCOME) - (Tổng EXPENSE)
        """
        # Lưu ý: transaction_type trong CSDL của bạn cần khớp với 'INCOME'/'EXPENSE'
        income = self.db.query(func.sum(Transaction.total_amount)).filter(
            Transaction.user_id == self.user_id,
            Transaction.transaction_type == 'INCOME'
        ).scalar() or 0

        expense = self.db.query(func.sum(Transaction.total_amount)).filter(
            Transaction.user_id == self.user_id,
            Transaction.transaction_type == 'EXPENSE'
        ).scalar() or 0

        return Decimal(income) - Decimal(expense)

    def get_monthly_spending(self) -> Decimal:
        """
        Lấy tổng chi tiêu của tháng hiện tại (con số 3.550.000 đ trong ảnh)
        """
        monthly_expense = self.db.query(func.sum(Transaction.total_amount)).filter(
            Transaction.user_id == self.user_id,
            Transaction.transaction_type == 'EXPENSE',
            extract('month', Transaction.transaction_date) == self.now.month,
            extract('year', Transaction.transaction_date) == self.now.year
        ).scalar() or 0
        
        return Decimal(monthly_expense)

    def get_balance_summary(self):
        """
        Hàm tổng hợp để trả về JSON cho API
        """
        try:
            balance = self.get_current_balance()
            spending = self.get_monthly_spending()
            
            # Logic tính % tăng trưởng (giả định lấy từ một bảng thống kê hoặc tính toán)
            growth_rate = 12 

            return {
                "status": "success",
                "data": {
                    "balance": float(balance),
                    "spending_this_month": float(spending),
                    "growth_rate": f"+{growth_rate}% tháng này",
                    "currency": "đ"
                }
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

# --- Cách sử dụng trong Route (FastAPI) ---
# @router.get("/api/v1/user/balance")
# def read_balance(user_id: int, db: Session = Depends(get_db)):
#     controller = DashboardController(db, user_id)
#     return controller.get_balance_summary()