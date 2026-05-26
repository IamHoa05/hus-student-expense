import pyotp
from ..config.settings import settings

import secrets

def create_otp() -> str:
    """Tạo mã OTP 6 chữ số ngẫu nhiên"""
    return str(secrets.randbelow(900000) + 100000)  # Luôn đủ 6 chữ số