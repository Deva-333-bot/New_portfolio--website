import sys
from app.core.database import SessionLocal, Base, engine
from app.core.config import settings
from app.core.security import hash_password
from app.models.all_models import AdminUser

def bootstrap_admin(email: str = None, password: str = None):
    Base.metadata.create_all(bind=engine)
    email = (email or settings.ADMIN_BOOTSTRAP_EMAIL).lower().strip()
    password = password or settings.ADMIN_BOOTSTRAP_PASSWORD

    with SessionLocal() as db:
        user = db.query(AdminUser).filter(AdminUser.email == email).first()
        if user:
            user.password_hash = hash_password(password)
            user.is_active = True
            db.commit()
            print(f"Updated password for existing administrator: {email}")
        else:
            user = AdminUser(
                email=email,
                password_hash=hash_password(password),
                is_active=True
            )
            db.add(user)
            db.commit()
            print(f"Successfully bootstrapped new administrator: {email}")

if __name__ == "__main__":
    email_arg = sys.argv[1] if len(sys.argv) > 1 else None
    pass_arg = sys.argv[2] if len(sys.argv) > 2 else None
    bootstrap_admin(email_arg, pass_arg)
