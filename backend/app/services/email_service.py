import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_notification_email(subject: str, body_text: str, to_address: str = None) -> bool:
    """
    Sends an email notification via the configured provider (console or SMTP).
    """
    recipient = to_address or settings.EMAIL_FROM_ADDRESS
    sender = settings.EMAIL_FROM_ADDRESS

    if settings.APP_ENV.lower() == "production" and (
        settings.EMAIL_PROVIDER.lower() == "console" or not settings.SMTP_HOST
    ):
        # Never write personal inquiry contents or reset links into production logs.
        print("Email delivery skipped: configure SMTP to enable production notifications.")
        return False

    if settings.EMAIL_PROVIDER.lower() == "console" or not settings.SMTP_HOST:
        print("\n================== EMAIL NOTIFICATION [CONSOLE] ==================")
        print(f"From: {sender}")
        print(f"To: {recipient}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body_text}")
        print("==================================================================\n")
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = sender
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(body_text, "plain"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASS:
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email delivery error: {e}")
        return False
