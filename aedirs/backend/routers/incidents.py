from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..core.database import get_db
from ..core.security import get_current_user
from ..core.ai_engine import classify_incident, assign_priority, find_nearest_team
from ..models.incident import Incident, RescueTeam
from ..models.user import User

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

class IncidentCreate(BaseModel):
    title: str
    description: str
    location: str = ""
    lat: float = 18.5204
    lng: float = 73.8567
    category: Optional[str] = None
    image_url: Optional[str] = None

class IncidentOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    lat: float
    lng: float
    location: str
    reported_by: Optional[int]
    assigned_team: Optional[str]
    eta: int
    created_at: datetime
    updated_at: Optional[datetime]
    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

@router.post("/", response_model=dict)
def create_incident(
    req: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    combined = req.title + " " + req.description
    category = req.category or classify_incident(combined)
    priority = assign_priority(combined)

    # smart dispatch
    teams = db.query(RescueTeam).all()
    teams_list = [{"id": t.id, "name": t.name, "type": t.type,
                   "lat": t.lat, "lng": t.lng, "status": t.status} for t in teams]
    nearest = find_nearest_team(category, req.lat, req.lng, teams_list)

    incident = Incident(
        title=req.title, description=req.description, category=category,
        priority=priority, status="Reported",
        lat=req.lat, lng=req.lng, location=req.location,
        reported_by=current_user.id,
        assigned_team=nearest["name"] if nearest else None,
        eta=nearest.get("eta", 0) if nearest else 0,
        image_url=req.image_url
    )
    db.add(incident); db.commit(); db.refresh(incident)

    # mark team as On Route
    if nearest:
        team = db.query(RescueTeam).filter(RescueTeam.id == nearest["id"]).first()
        if team: team.status = "On Route"; db.commit()

    return {
        "incident": {
            "id": incident.id, "title": incident.title,
            "category": category, "priority": priority,
            "status": incident.status,
            "assigned_team": incident.assigned_team, "eta": incident.eta
        },
        "ai": {"category": category, "priority": priority},
        "dispatch": {"team": nearest["name"] if nearest else None, "eta": nearest.get("eta") if nearest else None}
    }

@router.get("/", response_model=List[dict])
def list_incidents(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    my: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Incident)
    if my: q = q.filter(Incident.reported_by == current_user.id)
    if status: q = q.filter(Incident.status == status)
    if priority: q = q.filter(Incident.priority == priority)
    if category: q = q.filter(Incident.category == category)
    incidents = q.order_by(Incident.created_at.desc()).all()
    return [{
        "id": i.id, "title": i.title, "description": i.description,
        "category": i.category, "priority": i.priority, "status": i.status,
        "lat": i.lat, "lng": i.lng, "location": i.location,
        "reported_by": i.reported_by, "assigned_team": i.assigned_team, "eta": i.eta,
        "created_at": str(i.created_at)[:16], "updated_at": str(i.updated_at)[:16] if i.updated_at else None
    } for i in incidents]

@router.get("/{incident_id}", response_model=dict)
def get_incident(incident_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    i = db.query(Incident).filter(Incident.id == incident_id).first()
    if not i: raise HTTPException(status_code=404, detail="Incident not found")
    return {
        "id": i.id, "title": i.title, "description": i.description,
        "category": i.category, "priority": i.priority, "status": i.status,
        "lat": i.lat, "lng": i.lng, "location": i.location,
        "reported_by": i.reported_by, "assigned_team": i.assigned_team, "eta": i.eta,
        "created_at": str(i.created_at)[:16], "updated_at": str(i.updated_at)[:16] if i.updated_at else None
    }

@router.patch("/{incident_id}/status", response_model=dict)
def update_status(
    incident_id: int,
    req: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid = ["Reported","Verified","Assigned","In Progress","Resolved"]
    if req.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    i = db.query(Incident).filter(Incident.id == incident_id).first()
    if not i: raise HTTPException(status_code=404, detail="Incident not found")
    i.status = req.status
    i.updated_at = datetime.utcnow()
    if req.status == "Resolved":
        team = db.query(RescueTeam).filter(RescueTeam.name == i.assigned_team).first()
        if team: team.status = "Available"
    db.commit()
    return {"id": i.id, "status": i.status}

@router.get("/stats/summary", response_model=dict)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total    = db.query(Incident).count()
    active   = db.query(Incident).filter(Incident.status != "Resolved").count()
    resolved = db.query(Incident).filter(Incident.status == "Resolved").count()
    critical = db.query(Incident).filter(Incident.priority == "P1", Incident.status != "Resolved").count()
    available_teams = db.query(RescueTeam).filter(RescueTeam.status == "Available").count()
    return {"total": total, "active": active, "resolved": resolved, "critical": critical, "available_teams": available_teams}
