from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from ..core.database import get_db
from ..core.security import hash_password, verify_password, create_access_token
from ..models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str = ""
    role: str = "citizen"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: str = ""
    class Config:
        from_attributes = True

@router.post("/register", response_model=dict)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=req.name, email=req.email,
        password=hash_password(req.password),
        phone=req.phone, role=req.role
    )
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": {
        "id": user.id, "name": user.name, "email": user.email, "role": user.role, "phone": user.phone
    }}

@router.post("/login", response_model=dict)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": {
        "id": user.id, "name": user.name, "email": user.email, "role": user.role, "phone": user.phone or ""
    }}

@router.get("/me", response_model=dict)
def me(db: Session = Depends(get_db)):
    return {"status": "ok"}
