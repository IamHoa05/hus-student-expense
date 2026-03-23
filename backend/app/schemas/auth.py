from pydantic import BaseModel, EmailStr, Field
from uuid import UUID

from typing import Optional


class UserRegister(BaseModel):
    email: EmailStr
    phone: str = Field(..., max_length=15)
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

 # 1. Dữ liệu trả về sau khi đăng nhập thành công
class OAuth2Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Giây (VD: 3600 cho 1 giờ)
    
    # Đã sửa từ int sang UUID for khớp với Database của Hoa
    user_id: int 
    full_name: Optional[str] = None
    email: EmailStr

# 2. Yêu cầu cấp lại Access Token mới
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# 3. Dữ liệu trích xuất từ Token (dùng nội bộ Backend)
class TokenData(BaseModel):
    user_id: str | None = None
    email: str | None = None

# 4. Yêu cầu quên mật khẩu
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)

class ResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8)
    confirm_password: str