"""
Authentication and user management business logic.
"""
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.core.security import get_password_hash, verify_password
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by lowercase email."""
    stmt = select(User).where(User.email == email.lower().strip())
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieve a user by ID."""
    stmt = select(User).where(User.id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def register_user(db: Session, user_in: UserCreate) -> User:
    """
    Register a new user in the system.
    Enforces email uniqueness, role constraints, and hashes the password with Argon2.
    """
    # Prevent privilege escalation: Admin accounts cannot be self-registered publicly
    if user_in.role == "admin" or (hasattr(user_in.role, "value") and user_in.role.value == "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration for administrator accounts is disabled. Contact system administrator.",
        )

    normalized_email = user_in.email.lower().strip()

    # Verify email is not already registered
    existing_user = get_user_by_email(db, normalized_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Hash the password using Argon2
    hashed_password = get_password_hash(user_in.password)

    db_user = User(
        full_name=user_in.full_name.strip(),
        email=normalized_email,
        password_hash=hashed_password,
        role=user_in.role.value,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Validate user credentials against Argon2 hash.
    Returns the User object if credentials are valid, None otherwise.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

