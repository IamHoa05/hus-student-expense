from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..config.database import get_db
from ..schemas.auth import (
    UserRegister, UserLogin, TokenResponse, 
    ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest,
    RefreshTokenRequest
)
from ..services.auth_service import get_auth_service, AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

# 1. API Đăng ký tài khoản mới
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister, 
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Tạo tài khoản mới cho sinh viên trong phòng trọ.
    """
    return await auth_service.register_user(payload)


# 2. API Đăng nhập
@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin, 
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Đăng nhập và nhận Access Token + Refresh Token.
    """
    return await auth_service.login_user(payload)


# 3. API Làm mới Token (Khi Access Token hết hạn)
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: RefreshTokenRequest, 
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Sử dụng Refresh Token để lấy cặp Token mới mà không cần đăng nhập lại.
    """
    return await auth_service.refresh_access_token(payload.refresh_token)


# 4. API Yêu cầu Quên mật khẩu (Gửi OTP)
@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest, 
    background_tasks: BackgroundTasks, # 1. THÊM món này vào tham số của API
    response: Response, 
    service: AuthService = Depends(get_auth_service)
):
    # 2. TRUYỀN background_tasks vào hàm của Service
    result = await service.forgot_password_request(payload.email, background_tasks)
    
    response.set_cookie(key="reset_token", value=result["reset_token"], httponly=True, max_age=300)
    return {"message": "OTP has been sent"}

# 5. API Xác thực OTP cho Reset Password
@router.post("/verify-otp")
def verify_otp(payload: VerifyOTPRequest, request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    token = request.cookies.get("reset_token")
    if not token: raise HTTPException(status_code=400, detail="Session expired")
    
    result = service.verify_otp_for_reset(payload.otp, token)
    # Ghi đè permission_token vào lại cookie cũ
    response.set_cookie(key="reset_token", value=result["permission_token"], httponly=True, max_age=300)
    return {"message": "OTP valid"}


# 6. API Đặt lại mật khẩu cuối cùng
@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, request: Request, response: Response, service: AuthService = Depends(get_auth_service)):
    token = request.cookies.get("reset_token")
    if not token: raise HTTPException(status_code=400, detail="Session expired")

    result = await service.reset_password_final(payload.new_password, payload.confirm_password, token)
    response.delete_cookie("reset_token") # Xong việc thì xóa cookie đi cho sạch
    return result


# 7. API Đăng xuất
@router.post("/logout")
def logout(
    response: Response, 
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Xóa Cookie và làm mất hiệu lực phiên làm việc (ở phía Client).
    """
    return auth_service.logout(response)