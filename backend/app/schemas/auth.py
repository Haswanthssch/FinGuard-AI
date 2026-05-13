from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2, max_length=255)


class AuthResponse(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    onboarding_complete: bool = True
    refresh_token: str | None = None


class UserProfile(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    onboarding_complete: bool = True

