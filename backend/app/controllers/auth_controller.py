from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..utils.security import set_auth_cookies

from ..config.database import get_db
from ..schemas.auth import (
    UserRegister, UserLogin, TokenResponse, 
    ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest,
    RefreshTokenRequest
)
from ..services.auth_service import get_auth_service, AuthService
from ..services.gg_auth_service import GoogleAuthService, get_google_auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


# 1. API Yêu cầu đăng ký (Bước 1: Gửi OTP)
@router.post("/register", status_code=status.HTTP_200_OK)
async def request_register(
    payload: UserRegister, 
    background_tasks: BackgroundTasks, # Để gửi mail không làm đứng web
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Bước 1: Kiểm tra thông tin và gửi OTP về Email. 
    Trả về registration_token qua Cookie.
    """
    result = await auth_service.request_registration(payload, background_tasks)
    
    # Lưu cái vé chờ (registration_token) vào Cookie để Bước 2 dùng
    response.set_cookie(
        key="registration_token", 
        value=result["registration_token"], 
        httponly=True, 
        max_age=300 # Có hiệu lực trong 5 phút
    )
    return {"message": result["message"]}

# 1b. API Xác thực đăng ký (Bước 2: Nhập OTP và Lưu vào DB)
@router.post("/verify-registration")
async def verify_registration(
    payload: VerifyOTPRequest, # Dùng chung cái Schema OTP Hòa đã có
    request: Request,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Bước 2: Nhận mã OTP từ người dùng. 
    Nếu đúng sẽ chính thức tạo tài khoản trong Database.
    """
    # Lấy cái vé chờ từ Cookie ra
    token = request.cookies.get("registration_token")
    if not token:
        raise HTTPException(status_code=400, detail="Phiên đăng ký đã hết hạn. Vui lòng thử lại.")
    
    # Gọi service để kiểm tra OTP và lưu User
    result = await auth_service.verify_registration_otp(payload.otp, token)
    
    # Xong việc thì xóa cái vé chờ đi cho sạch
    response.delete_cookie("registration_token")
    
    return result

# # 1. API Đăng ký tài khoản mới
# @router.post("/register", status_code=status.HTTP_201_CREATED)
# async def register(
#     payload: UserRegister, 
#     auth_service: AuthService = Depends(get_auth_service)
# ):
#     """
#     Tạo tài khoản mới cho sinh viên trong phòng trọ.
#     """
#     return await auth_service.register_user(payload)


# 2. API Đăng nhập
@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin, 
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Đăng nhập và nhận Access Token + Refresh Token.
    """

    token_data = await auth_service.login_user(payload)
    set_auth_cookies(response, token_data.access_token, token_data.refresh_token)
    return token_data


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


# API Gửi OTP
@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks, response: Response, service: AuthService = Depends(get_auth_service)):
    result = await service.forgot_password_request(payload.email, background_tasks)
    
    response.set_cookie(
        key="reset_token", 
        value=result["reset_token"], 
        httponly=True, 
        max_age=300, 
        samesite="lax",   # Bắt buộc để Next.js (3000) gọi FastAPI (8000)
        secure=False,     # Bắt buộc vì Hòa dùng http
        path="/",         # Bắt buộc để endpoint /verify-otp cũng thấy được cookie
        domain=None       # Quan trọng: Để None cho localhost
    )
    return {"message": "Mã OTP đã được gửi"}

# API Xác thực OTP
@router.post("/verify-otp")
async def verify_otp( # Nên để async cho đồng bộ
    payload: VerifyOTPRequest, 
    request: Request, 
    response: Response, 
    service: AuthService = Depends(get_auth_service)
):
    token = request.cookies.get("reset_token")
    if not token: 
        raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn (Session expired)")
    
    result = service.verify_otp_for_reset(payload.otp, token)
    
    # Ghi đè permission_token vào lại cookie để dùng cho bước đổi pass cuối cùng
    response.set_cookie(
        key="reset_token", 
        value=result["permission_token"], 
        httponly=True, 
        max_age=300,
        samesite="lax",
        secure=False
    )
    return {"message": "Mã OTP hợp lệ"}

# 6. API Đặt lại mật khẩu cuối cùng
@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest, 
    request: Request,
    service: AuthService = Depends(get_auth_service)
):
    token = request.cookies.get("reset_token")
    if not token: 
        raise HTTPException(status_code=400, detail="Phiên làm việc đã hết hạn (Session expired)")
    
    # Sửa tên hàm thành reset_password_final cho khớp với AuthService
    return await service.reset_password_final(
        new_password=payload.new_password,
        confirm_password=payload.confirm_password,
        permission_token=token
    )


# # 7. API Đăng xuất
# @router.post("/logout")
# def logout(
#     response: Response, 
#     auth_service: AuthService = Depends(get_auth_service)
# ):
#     """
#     Xóa Cookie và làm mất hiệu lực phiên làm việc (ở phía Client).
#     """
#     return auth_service.logout(response)

# 1. Endpoint bắt đầu luồng đăng nhập
@router.get("/google/login")
async def google_login(
    request: Request, 
    next: str = "/dashboard", # Mặc định sau khi login sẽ vào dashboard
    service: GoogleAuthService = Depends(get_google_auth_service)
):
    """
    Khi user nhấn nút 'Tiếp tục với Google', Frontend sẽ gọi link này.
    Backend sẽ chuyển hướng user sang trang chọn tài khoản của Google.
    """
    return await service.login_start(request, next_url=next)


# 2. Endpoint hứng dữ liệu Google trả về (Callback)
# Lưu ý: Cái path này phải khớp 100% với REDIRECT_URI Hòa đăng ký trên Google Console
@router.get("/google/callback")
async def google_callback(
    request: Request,
    service: GoogleAuthService = Depends(get_google_auth_service)
):
    """
    Sau khi user chọn tài khoản xong, Google sẽ gửi 'mật mã' về đây.
    Hàm này sẽ đổi mã đó lấy thông tin User, tạo tài khoản và cắm Cookie.
    """
    return await service.login_callback(request)