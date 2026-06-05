import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config.settings import settings

def send_otp_email_sync(email_to: str, full_name: str, otp_code: str):
    subject = "Mã xác thực OTP - S-Wallet"  # ✅ Đổi tên app
    html_content = f"""
    <html>
        <body>
            <h3>Chào {full_name},</h3>
            <p>Bạn vừa yêu cầu xác thực tài khoản tại <b>S-Wallet</b>.</p>
            <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #2d89ef;">{otp_code}</b></p>
            <p>Mã này sẽ hết hạn sau <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ S-Wallet</p>
        </body>
    </html>
    """

    message = MIMEMultipart()
    message["From"] = settings.MAIL_FROM
    message["To"] = email_to
    message["Subject"] = subject
    message.attach(MIMEText(html_content, "html"))

    # ✅ Raise lỗi thay vì chỉ print để BackgroundTasks biết có lỗi
    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.send_message(message)