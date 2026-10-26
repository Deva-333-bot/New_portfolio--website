
import getpass

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.all_models import AdminUser


def bootstrap_admin(email: str | None = None, password: str | None = None):
    email = (email or settings.ADMIN_BOOTSTRAP_EMAIL).strip().lower()

    if not email or "@" not in email:
        raise ValueError("A valid administrator email address is required.")

    if password is None:
        password = getpass.getpass("Enter administrator password: ")
        confirmation = getpass.getpass("Confirm administrator password: ")

        if password != confirmation:
            raise ValueError("Passwords do not match.")

    if len(password) < 14:
        raise ValueError("Password must contain at least 14 characters.")

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        user = db.query(AdminUser).filter(AdminUser.email == email).first()

        if user:
            print(
                f"Administrator {email} already exists. "
                "No changes were made."
            )
            return

        user = AdminUser(
            email=email,
            password_hash=hash_password(password),
            is_active=True,
        )
        db.add(user)
        db.commit()

        print(f"Successfully created administrator: {email}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 2:
        raise SystemExit(
            "Usage: python -m app.cli.bootstrap_admin [admin-email]. "
            "Passwords are prompted securely and must not be passed as command-line arguments."
        )

    email_arg = sys.argv[1] if len(sys.argv) > 1 else None
    bootstrap_admin(email_arg)
