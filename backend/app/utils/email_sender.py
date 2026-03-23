import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config.settings import settings # Lấy cấu hình từ file .env

def send_otp_email_sync(email_to: str, full_name: str, otp_code: str):
    """
    Hàm gửi email OTP thuần Python (Synchronous)
    Dùng để chạy ngầm với BackgroundTasks của FastAPI
    """
    # 1. Cấu hình nội dung Email (HTML cho đẹp)
    subject = "Mã xác thực OTP cho Quỹ Phòng Trọ"
    html_content = f"""
    <html>
        <body>
            <h3>Chào {full_name},</h3>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại <b>App Quản Lý Quỹ Phòng</b>.</p>
            <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #2d89ef;">{otp_code}</b></p>
            <p>Mã này sẽ hết hạn sau <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ hỗ trợ NCKH</p>
        </body>
    </html>
    """

    # 2. Thiết lập đối tượng Message
    message = MIMEMultipart()
    message["From"] = settings.MAIL_FROM
    message["To"] = email_to
    message["Subject"] = subject
    message.attach(MIMEText(html_content, "html"))

    try:
        # 3. Kết nối đến Server Gmail (SMTP)
        with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
            server.starttls() # Bảo mật kết nối
            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD) # Đăng nhập
            server.send_message(message) # Gửi đi
            
        print(f"✅ Đã gửi OTP thành công tới: {email_to}")
    except Exception as e:
        print(f"❌ Lỗi gửi email: {str(e)}")
        # Trong thực tế, Hoa có thể ghi log lỗi vào file ở đây