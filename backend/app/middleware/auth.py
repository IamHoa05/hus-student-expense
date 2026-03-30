from fastapi import Request, HTTPException, status, Depends, Security
from fastapi.security import SecurityScopes
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..config.database import get_db
from ..models.user import User  # Giả sử model của bạn là User
from ..utils.security import verify_access_token # Hoặc tên hàm giải mã của bạn

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # 1. Lấy token từ Cookies hoặc Header
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token"
        )

    # 2. Giải mã token
    try:
        payload = verify_access_token(token)
    except Exception: # Bạn có thể bắt cụ thể ExpiredSignatureError...
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    sub = payload.get('sub') # Email hoặc ID

    # 3. Truy vấn DB lấy User (Vì chỉ có 1 vai trò nên không cần if/else role)
    stmt = select(User).where(User.email == sub) # Hoặc User.user_id == sub
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

# Helper để dùng trong Controller cho ngắn
def require_user(user: User = Depends(get_current_user)):
    return user