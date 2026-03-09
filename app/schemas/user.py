from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    monthly_savings: float

    class Config:
        from_attributes = True


class MonthlySavingsUpdate(BaseModel):
    monthly_savings: float


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
