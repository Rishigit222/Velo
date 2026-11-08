"""
Authentication and user identity API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.core.rate_limiter import rate_limit_auth
from backend.app.core.security import create_access_token
from backend.app.database.connection import get_db
from backend.app.models.user import User
from backend.app.routes.deps import get_current_user
from backend.app.schemas.auth import LoginRequest, TokenResponse
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers a new user (buyer or seller) with secure Argon2 password hashing. Protected by rate limiting.",
    dependencies=[Depends(rate_limit_auth)],
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> User:
    """Create a new user account."""
    return register_user(db=db, user_in=user_in)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User login (JSON)",
    description="Authenticates user with JSON email and password, returning a JWT bearer token. Protected by rate limiting.",
    dependencies=[Depends(rate_limit_auth)],
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate user credentials and issue a JWT token."""
    user = authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/token",
    summary="OAuth2 Form Login (for Swagger UI)",
    description="Form-data based login endpoint compatible with Swagger UI's Authorize dialog. Protected by rate limiting.",
    dependencies=[Depends(rate_limit_auth)],
)
def login_for_swagger_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    """OAuth2 compatible token login for interactive Swagger documentation."""
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=user.id,
        extra_data={"email": user.email, "role": user.role},
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current authenticated user",
    description="Returns the profile of the currently authenticated user.",
)
def read_current_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the currently authenticated user profile."""
    return current_user

