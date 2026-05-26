from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..utils.security import set_auth_cookies
from ..config.database import get_db
from ..schemas.auth import (
    UserRegister, UserLogin, OAuth2Token,       # ✅ Đổi TokenResponse → OAuth2Token
    ForgotPasswordRequest, VerifyOTPRequest,
    ResetPasswordRequest, RefreshTokenRequest
)
from ..services.auth_service import get_auth_service, AuthService
from ..services.gg_auth_service import GoogleAuthService, get_google_auth_service
from ..middleware.auth import require_user
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

# ĐĂNG KÝ BƯỚC 1: Gửi OTP
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.register_user(payload)

# ĐĂNG KÝ BƯỚC 2: Xác thực OTP
@router.post("/verify-registration")
async def verify_registration(
    payload: VerifyOTPRequest,
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    token = request.cookies.get("registration_token")
    if not token:
        raise HTTPException(status_code=400, detail="Phiên đăng ký đã hết hạn. Vui lòng thử lại.")

    result = await auth_service.verify_registration_otp(payload.otp, token)
    response.delete_cookie("registration_token")
    return result

# ĐĂNG NHẬP
@router.post("/login", response_model=OAuth2Token)
async def login(
    payload: UserLogin,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    token_data = await auth_service.login_user(payload)
    set_auth_cookies(response, token_data.access_token, token_data.refresh_token)
    return token_data

# LÀM MỚI TOKEN
@router.post("/refresh", response_model=OAuth2Token)
async def refresh_token(
    payload: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.refresh_access_token(payload.refresh_token)

# QUÊN MẬT KHẨU: Gửi OTP
@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    response: Response,
    service: AuthService = Depends(get_auth_service)
):
    result = await service.forgot_password_request(payload.email, background_tasks)
    response.set_cookie(
        key="reset_token",
        value=result["reset_token"],
        httponly=True,
        max_age=300,
        samesite="lax",
        secure=False,
        path="/"
    )
    return {"message": "Mã OTP đã được gửi"}

# XÁC THỰC OTP
@router.post("/verify-otp")
async def verify_otp(
    payload: VerifyOTPRequest,
    request: Request,
    response: Response,
    service: AuthService = Depends(get_auth_service)
):
    token = request.cookies.get("reset_token")
    if not token:
        raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn")

    result = service.verify_otp_for_reset(payload.otp, token)  # staticmethod, không cần await

    response.set_cookie(
        key="reset_token",
        value=result["permission_token"],
        httponly=True,
        max_age=300,
        samesite="lax",
        secure=False
    )
    return {"message": "Mã OTP hợp lệ"}

# ĐỔI MẬT KHẨU
@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    response: Response,
    service: AuthService = Depends(get_auth_service)
):
    token = request.cookies.get("reset_token")
    if not token:
        raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn")

    result = await service.reset_password_final(
        new_password=payload.new_password,
        confirm_password=payload.confirm_password,
        permission_token=token
    )
    response.delete_cookie("reset_token")  # ✅ Xóa token sau khi đổi pass xong
    return result

# ĐĂNG XUẤT
@router.post("/logout")
def logout(
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.logout(response)

# GOOGLE LOGIN
@router.get("/google/login")
async def google_login(
    request: Request,
    next: str = "/dashboard",
    service: GoogleAuthService = Depends(get_google_auth_service)
):
    return await service.login_start(request, next_url=next)

@router.get("/google/callback")
async def google_callback(
    request: Request,
    service: GoogleAuthService = Depends(get_google_auth_service)
):
    return await service.login_callback(request)

@router.get("/me")
async def get_me(current_user: User = Depends(require_user)):
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "avt_url": current_user.avt_url
    }