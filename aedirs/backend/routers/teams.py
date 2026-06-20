from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.incident import RescueTeam
from ..models.user import User

router = APIRouter(prefix="/api/teams", tags=["teams"])

class TeamStatusUpdate(BaseModel):
    status: str

@router.get("/", response_model=List[dict])
def list_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teams = db.query(RescueTeam).all()
    return [{"id": t.id, "name": t.name, "type": t.type, "lat": t.lat,
             "lng": t.lng, "status": t.status, "members": t.members} for t in teams]

@router.patch("/{team_id}/status", response_model=dict)
def update_team_status(
    team_id: int, req: TeamStatusUpdate,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    team = db.query(RescueTeam).filter(RescueTeam.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Team not found")
    team.status = req.status
    db.commit()
    return {"id": team.id, "name": team.name, "status": team.status}
