import uuid
import json
import base64
from fastapi import HTTPException, Request, status, Depends
# BackgroundTasks is no longer needed because Celery handles async execution
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from authlib.integrations.starlette_client import OAuthError
from starlette.responses import RedirectResponse

from ..config.google_auth import google
from ..config.settings import settings
from ..config.database import get_db
from ..models.user import User
from ..utils.security import hash_password, issue_token, set_auth_cookies

# from ...tasks.admin_dashboard_task import task_admin_update_user_count
# from ...tasks.notification_task import task_broadcast_admin_notification

class GoogleAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _encode_state(next_url: str) -> str:
        payload = {
            "next": next_url or "/dashboard",
            "nonce": str(uuid.uuid4())
        }
        json_str = json.dumps(payload)
        return base64.urlsafe_b64encode(json_str.encode()).decode()

    @staticmethod
    def _decode_state(state_str: str) -> dict:
        try:
            if not state_str: return {}
            json_str = base64.urlsafe_b64decode(state_str).decode()
            return json.loads(json_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid OAuth state")

    async def _get_or_create_user(self, user_info: dict):
        email = user_info.get("email")
        
        # 1. Tìm xem user đã tồn tại chưa
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # 2. Nếu chưa có thì tạo mới (Đăng ký tự động qua Google)
            user = User(
                email=email,
                full_name=user_info.get("name", ""),
                # Tạo một pass ngẫu nhiên cực khó đoán vì họ dùng Google login
                password=hash_password(str(uuid.uuid4())), 
                phone=None, # Google không trả về phone mặc định
                is_active=True
            )
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
            return user, True # Trả về True để biết là user mới

        return user, False

    async def login_start(self, request: Request, next_url: str = None):
        # Tạo state để bảo mật và điều hướng sau khi login
        custom_state = self._encode_state(next_url)
        
        # Gọi sang Google
        return await google.authorize_redirect(
            request,
            settings.GOOGLE_REDIRECT_URI,
            access_type="offline",
            prompt="consent",
            state=custom_state
        )

    async def login_callback(self, request: Request):
        try:
            # 1. Lấy thông tin từ Google trả về
            token = await google.authorize_access_token(request)
            userinfo = token.get("userinfo")
        except OAuthError as e:
            raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")

        # 2. Lấy lại đường dẫn cần quay về từ state
        state_str = request.query_params.get("state")
        state_data = self._decode_state(state_str)
        next_path = state_data.get("next", "/dashboard")

        # 3. Tìm hoặc tạo User trong Database của mình
        user, is_new = await self._get_or_create_user(userinfo)

        # 4. Cấp Token "của nhà làm được" cho User này
        # Dùng hàm issue_token cũ của Hòa
        token_data = issue_token(user, role="user")

        # 5. Tạo Response điều hướng về Frontend (Dashboard)
        redirect_url = f"{settings.FRONTEND_URL}{next_path}"
        response = RedirectResponse(url=redirect_url)

        # 6. Gắn Access Token vào Cookie (Giống login thường)
        set_auth_cookies(response, token_data.access_token, token_data.refresh_token)

        return response

def get_google_auth_service(db: AsyncSession = Depends(get_db)):
    return GoogleAuthService(db)