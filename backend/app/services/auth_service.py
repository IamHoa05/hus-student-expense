from fastapi import HTTPException, status, Response, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from ..config.database import get_db
from ..models.user import User
from ..schemas.auth import UserRegister, UserLogin
from ..utils.security import (
    hash_password, verify_password, create_access_token,
    verify_refresh_token, decode_token, issue_token
)
from ..utils.otp import create_otp
from ..utils.email_sender import send_otp_email_sync

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _identity_taken(self, email: str, phone: str) -> bool:
        stmt = select(User).where(or_(User.email == email, User.phone == phone))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none() is not None

    # --- ĐĂNG KÝ THẲNG (không OTP) ---
    async def register_user(self, payload: UserRegister):
        if await self._identity_taken(payload.email, payload.phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email hoặc số điện thoại đã được sử dụng"
            )
        new_user = User(
            email=payload.email,
            phone=payload.phone,
            full_name=payload.full_name,
            password=hash_password(payload.password),
            is_active=True
        )
        try:
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            return {"message": "Đăng ký tài khoản thành công!", "user_id": new_user.user_id}
        except Exception:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail="Lỗi hệ thống khi lưu người dùng")

    # --- ĐĂNG NHẬP ---
    async def login_user(self, payload: UserLogin):
        stmt = select(User).where(User.email == payload.email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác"
            )
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Tài khoản đã bị khóa")

        return issue_token(user, role="user")  # ✅ Truyền object user

    # --- LÀM MỚI TOKEN ---
    async def refresh_access_token(self, refresh_token: str):
        try:
            payload = verify_refresh_token(refresh_token)
        except Exception:
            raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")

        email = payload.get("sub")
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

        return issue_token(user, role="user")  # ✅ Truyền object user

    # --- QUÊN MẬT KHẨU: GỬI OTP ---
    async def forgot_password_request(self, email: str, background_tasks: BackgroundTasks):
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Email này chưa đăng ký tài khoản")

        otp_code = create_otp()
        otp_hash = hash_password(otp_code)

        background_tasks.add_task(send_otp_email_sync, email, user.full_name, otp_code)

        reset_token = create_access_token(
            sub=email,
            role="user",
            expires_minutes=5,
            extra={"type": "reset_waiting", "otp_hash": otp_hash}
        )
        return {"reset_token": reset_token}

    # --- XÁC THỰC OTP ĐỔI MẬT KHẨU ---
    @staticmethod
    def verify_otp_for_reset(otp: str, reset_token: str):
        try:
            payload = decode_token(reset_token)
        except Exception:
            raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn")

        token_type = payload.get("type")

        if token_type == "reset_allowed":
            return {"permission_token": reset_token}

        if token_type != "reset_waiting":
            raise HTTPException(status_code=400, detail="Token không hợp lệ")

        # ✅ Tách riêng lỗi OTP sai
        if not verify_password(str(otp).strip(), payload.get("otp_hash")):
            raise HTTPException(status_code=400, detail="Mã OTP không chính xác")

        permission_token = create_access_token(
            sub=payload.get("sub"),
            role=payload.get("role"),
            expires_minutes=5,
            extra={"type": "reset_allowed"}
        )
        return {"permission_token": permission_token}

    # --- ĐỔI MẬT KHẨU CUỐI CÙNG ---
    async def reset_password_final(self, new_password: str, confirm_password: str, permission_token: str):
        if new_password != confirm_password:
            raise HTTPException(status_code=400, detail="Mật khẩu xác nhận không khớp")

        try:
            payload = decode_token(permission_token)
            if payload.get("type") != "reset_allowed":
                raise Exception()
        except Exception:
            raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn")

        stmt = select(User).where(User.email == payload.get("sub"))
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        user.password = hash_password(new_password)
        await self.db.commit()
        return {"message": "Đổi mật khẩu thành công!"}

    # --- ĐĂNG XUẤT ---
    @staticmethod
    def logout(response: Response):
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/auth/refresh")
        return {"message": "Đăng xuất thành công"}


async def get_auth_service(db: AsyncSession = Depends(get_db)):
    return AuthService(db)