from fastapi import HTTPException, status, Response, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from datetime import datetime

from ..config.database import get_db
from ..config.settings import settings
from ..models import User, GroupMember  # Dùng Model User chung mình đã chốt
from ..schemas.auth import UserRegister, UserLogin, TokenResponse
from ..utils.security import (
    hash_password, verify_password, create_access_token,
    verify_refresh_token, decode_token, issue_token
)
from ..utils.otp import create_otp
from ..utils.email_sender import send_otp_email_sync # Task gửi mail NCKH

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Kiểm tra xem email hoặc số điện thoại đã tồn tại chưa
    async def _identity_taken(self, email: str, phone: str):
        stmt = select(User).where(
            or_(User.email == email, User.phone == phone)
        )
        # Phải await cái execute này
        result = await self.db.execute(stmt) 
        
        # Ở đây KHÔNG await result.scalar_one_or_none() nữa vì nó là hàm đồng bộ
        # sau khi đã có result từ execute.
        user = result.scalar_one_or_none() 
        return user is not None
    # --- ĐĂNG KÝ ---
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
            password=hash_password(payload.password)
        )
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)

        
        # send_welcome_email_task.delay(new_user.email, new_user.full_name)

        return {"message": "Đăng ký thành công", "user_id": new_user.user_id}
    # --- YÊU CẦU ĐĂNG KÝ (GỬI OTP) ---
    async def request_registration(self, payload: UserRegister, background_tasks: BackgroundTasks):
        # 1. Kiểm tra xem email/phone đã bị chiếm chưa
        if await self._identity_taken(payload.email, payload.phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email hoặc số điện thoại đã được sử dụng"
            )

        # 2. Tạo mã OTP (VD: 123456)
        otp_code = create_otp() 
        otp_hash = hash_password(otp_code)

        # 3. Gửi mail chạy ngầm (Không làm đứng web của Hòa)
        background_tasks.add_task(send_otp_email_sync, payload.email, payload.full_name, otp_code)

        # 4. Tạo một Token tạm thời chứa thông tin người dùng và OTP đã mã hóa
        # Token này sẽ hết hạn sau 5 phút
        registration_token = create_access_token(
            sub=payload.email,
            role="user",
            expires_minutes=5,
            extra={
                "type": "registration_waiting",
                "otp_hash": otp_hash,
                "user_data": {
                    "full_name": payload.full_name,
                    "phone": payload.phone,
                    "password": hash_password(payload.password) # Lưu pass đã hash luôn cho an toàn
                }
            }
        )

        return {
            "message": f"Mã xác thực đã được gửi đến {payload.email}",
            "registration_token": registration_token
        }
    
    # --- XÁC THỰC OTP VÀ HOÀN TẤT ĐĂNG KÝ ---
    async def verify_registration_otp(self, otp: str, registration_token: str):
        try:
            # 1. Giải mã cái "vé chờ"
            payload = decode_token(registration_token)
            if payload.get("type") != "registration_waiting":
                raise Exception()
            
            # 2. Kiểm tra mã OTP Hòa nhập có khớp với mã trong token không
            if not verify_password(otp, payload.get("otp_hash")):
                raise HTTPException(status_code=400, detail="Mã xác thực không chính xác")
            
        except:
            raise HTTPException(status_code=400, detail="Phiên đăng ký đã hết hạn hoặc không hợp lệ")

        # 3. OTP đúng -> Lấy dữ liệu người dùng từ token ra để lưu vào DB
        user_info = payload.get("user_data")
        new_user = User(
            email=payload.get("sub"),
            phone=user_info["phone"],
            full_name=user_info["full_name"],
            password=user_info["password"], # Đây là pass đã hash từ bước 1
            is_active=True # Kích hoạt tài khoản luôn
        )

        try:
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            return {"message": "Đăng ký tài khoản thành công!", "user_id": new_user.user_id}
        except Exception as e:
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

        # Cấp token (Không cần role admin phức tạp, chỉ cần user_id)
        token_data = issue_token(user, role="user")
        token_data.user_id = user.user_id
        
        return token_data

    # --- LÀM MỚI TOKEN ---
    async def refresh_access_token(self, refresh_token: str):
        try:
            payload = verify_refresh_token(refresh_token)
        except:
            raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")

        email = payload.get("sub")
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

        return issue_token(email, "user")

    # --- QUÊN MẬT KHẨU (Gửi OTP) ---
    async def forgot_password_request(self, email: str, background_tasks: BackgroundTasks):
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Email này chưa đăng ký tài khoản")

        otp_code = create_otp() 
        otp_hash = hash_password(otp_code)

        # Gửi mail chạy ngầm
        background_tasks.add_task(send_otp_email_sync, email, user.full_name, otp_code)

        # 1. PHẢI LÀ: reset_waiting (Đây là cái vé để đi vào cửa xác thực)
        reset_token = create_access_token(
            sub=email,
            role="user",
            expires_minutes=5,
            extra={"type": "reset_waiting", "otp_hash": otp_hash}
        )

        return {"reset_token": reset_token}
    
    # --- XÁC THỰC OTP ---
    @staticmethod
    def verify_otp_for_reset(otp: str, reset_token: str):
        try:
            payload = decode_token(reset_token)
            token_type = payload.get("type")
            
            print(f"DEBUG: Đang xác thực Token loại: {token_type}")
            
            # 2. KIỂM TRA: Nếu Token đã là 'reset_allowed', nghĩa là đã xác thực rồi
            if token_type == "reset_allowed":
                return {"permission_token": reset_token} # Cho qua luôn nếu đã xong

            if token_type != "reset_waiting":
                raise Exception(f"Loại Token {token_type} không được phép xác thực OTP")

            input_otp = str(otp).strip()
            stored_otp_hash = payload.get("otp_hash")

            if not verify_password(input_otp, stored_otp_hash):
                print(f"DEBUG: OTP không khớp! Input: {input_otp}")
                raise Exception("OTP mismatch")

            # 3. THÀNH CÔNG: Đổi sang loại 'reset_allowed' (Cái vé để vào cửa đổi pass)
            permission_token = create_access_token(
                sub=payload.get("sub"),
                role=payload.get("role"),
                expires_minutes=5,
                extra={"type": "reset_allowed"}
            )
            return {"permission_token": permission_token}

        except Exception as e:
            print(f"❌ Lỗi xác thực: {str(e)}")
            raise HTTPException(
                status_code=400, 
                detail="Mã OTP không chính xác hoặc phiên làm việc đã hết hạn"
            )
        
    # --- ĐỔI MẬT KHẨU CUỐI CÙNG ---
    async def reset_password_final(self, new_password: str, confirm_password: str, permission_token: str):
        if new_password != confirm_password:
            raise HTTPException(status_code=400, detail="Mật khẩu xác nhận không khớp")
    
        try:
            payload = decode_token(permission_token)
            if payload.get("type") != "reset_allowed": raise Exception()
        except:
            raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn")

        email = payload.get("sub")
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        user.password = hash_password(new_password)
        await self.db.commit()
        await self.db.refresh(user)
        return {"message": "Đổi mật khẩu thành công!"}
    
    # --- ĐĂNG XUẤT ---
    @staticmethod
    def logout(response: Response):

        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/auth/refresh")

        return {"message": "Logout successfully"}

# Dependency để Controller gọi
async def get_auth_service(db: AsyncSession = Depends(get_db)):
    return AuthService(db)