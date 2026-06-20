from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.security import get_current_user, require_role
from ..models.user import User

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=List[dict])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("authority"))
):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email,
             "role": u.role, "phone": u.phone or ""} for u in users]

@router.get("/me", response_model=dict)
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name,
            "email": current_user.email, "role": current_user.role,
            "phone": current_user.phone or ""}
