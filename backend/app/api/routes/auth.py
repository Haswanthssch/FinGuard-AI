from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


def _auth_response(user: User) -> AuthResponse:
    token = create_access_token(user.user_id, {"email": user.email})
    return AuthResponse(
        user_id=user.user_id,
        email=user.email,
        full_name=user.full_name,
        access_token=token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_token=token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user and settings.ENVIRONMENT == "local":
        user = User(
            email=payload.email.lower(),
            username=payload.email.split("@")[0].lower(),
            full_name=payload.email.split("@")[0],
            hashed_password=hash_password(payload.password),
            is_demo=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    if user and settings.ENVIRONMENT == "local" and not verify_password(payload.password, user.hashed_password):
        user.hashed_password = hash_password(payload.password)
        db.commit()
        db.refresh(user)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return _auth_response(user)


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        email=payload.email.lower(),
        username=payload.email.split("@")[0].lower(),
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(current_user: User = Depends(get_current_user)):
    return _auth_response(current_user)


@router.get("/me", response_model=UserProfile)
async def me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        user_id=current_user.user_id,
        email=current_user.email,
        full_name=current_user.full_name,
    )


@router.post("/logout", status_code=204)
async def logout():
    return None
