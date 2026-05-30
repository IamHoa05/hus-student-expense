from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..utils.security import set_auth_cookies
from ..config.database import get_db
from ..schemas.auth import (
    UserRegister, UserLogin, OAuth2Token,
    ForgotPasswordRequest, VerifyOTPRequest,
    ResetPasswordRequest, RefreshTokenRequest, UpdateUserRequest
)
from ..services.auth_service import get_auth_service, AuthService
from ..services.gg_auth_service import GoogleAuthService, get_google_auth_service
from ..middleware.auth import require_user
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


# =============================================================================
# ĐĂNG KÝ
# =============================================================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Đăng ký tài khoản mới và gửi mã OTP xác thực qua email.
    """
    return await auth_service.register_user(payload)


@router.post("/verify-registration")
async def verify_registration(
    payload: VerifyOTPRequest,
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Xác thực mã OTP để hoàn tất quá trình kích hoạt tài khoản đăng ký.
    """
    token = request.cookies.get("registration_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Phiên đăng ký đã hết hạn. Vui lòng thử lại."
        )

    result = await auth_service.verify_registration_otp(payload.otp, token)
    response.delete_cookie("registration_token")
    return result


# =============================================================================
# ĐĂNG NHẬP & ĐĂNG XUẤT
# =============================================================================

@router.post("/login", response_model=OAuth2Token)
async def login(
    payload: UserLogin,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Đăng nhập hệ thống bằng email, mật khẩu và thiết lập cookie xác thực.
    """
    token_data = await auth_service.login_user(payload)
    set_auth_cookies(response, token_data.access_token, token_data.refresh_token)
    return token_data


@router.post("/refresh", response_model=OAuth2Token)
async def refresh_token(
    payload: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Cấp lại Access Token mới khi chuỗi token cũ đã hết hạn.
    """
    return await auth_service.refresh_access_token(payload.refresh_token)


@router.post("/logout")
def logout(
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Đăng xuất khỏi hệ thống và xóa toàn bộ cookie xác thực của người dùng.
    """
    return auth_service.logout(response)


# =============================================================================
# KHÔI PHỤC MẬT KHẨU
# =============================================================================

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    response: Response,
    service: AuthService = Depends(get_auth_service)
):
    """
    Yêu cầu cấp lại mật khẩu và gửi mã OTP xác nhận về email của người dùng.
    """
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


@router.post("/verify-otp")
def verify_otp(
    payload: VerifyOTPRequest,
    request: Request,
    response: Response,
    service: AuthService = Depends(get_auth_service)
):
    """
    Xác thực mã OTP khôi phục mật khẩu để cấp quyền đặt lại mật khẩu mới.
    """
    token = request.cookies.get("reset_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Phiên làm việc đã hết hạn"
        )

    result = service.verify_otp_for_reset(payload.otp, token)

    response.set_cookie(
        key="reset_token",
        value=result["permission_token"],
        httponly=True,
        max_age=300,
        samesite="lax",
        secure=False
    )
    return {"message": "Mã OTP hợp lệ"}


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    response: Response,
    service: AuthService = Depends(get_auth_service)
):
    """
    Đặt lại mật khẩu mới sau khi đã xác thực mã OTP thành công.
    """
    token = request.cookies.get("reset_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Phiên làm việc đã hết hạn"
        )

    result = await service.reset_password_final(
        new_password=payload.new_password,
        confirm_password=payload.confirm_password,
        permission_token=token
    )
    response.delete_cookie("reset_token")
    return result


# =============================================================================
# GOOGLE OAUTH2
# =============================================================================

@router.get("/google/login")
async def google_login(
    request: Request,
    next: str = "/dashboard",
    service: GoogleAuthService = Depends(get_google_auth_service)
):
    """
    Khởi tạo tiến trình và điều hướng người dùng sang trang đăng nhập Google.
    """
    return await service.login_start(request, next_url=next)


@router.get("/google/callback")
async def google_callback(
    request: Request,
    service: GoogleAuthService = Depends(get_google_auth_service)
):
    """
    Xử lý dữ liệu callback trả về từ Google sau khi người dùng xác thực.
    """
    return await service.login_callback(request)


# =============================================================================
# THÔNG TIN NGƯỜI DÙNG
# =============================================================================

@router.get("/me")
async def get_me(current_user: User = Depends(require_user)):
    """
    Lấy thông tin tài khoản chi tiết của người dùng hiện tại đang đăng nhập.
    """
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "avt_url": current_user.avt_url
    }

@router.patch("/me")
async def update_me(
    body: UpdateUserRequest,
    current_user: User = Depends(require_user),
    service: AuthService = Depends(get_auth_service)
):
    """Cập nhật thông tin tài khoản của người dùng hiện tại đang đăng nhập."""
    return await service.update_me(current_user, body)