"""
FastAPI route dependencies (authentication, authorization, RBAC).
"""
from typing import Callable, List, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.security import decode_access_token, oauth2_scheme
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_user_by_id


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that decodes the JWT access token and resolves the authenticated User.
    Raises 401 Unauthorized if the token is absent, invalid, or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception

    return user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """
    Dependency factory to enforce role-based access control (RBAC).
    Usage: Depends(require_roles('admin', 'seller'))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of the following roles: {list(allowed_roles)}",
            )
        return current_user

    return role_checker

