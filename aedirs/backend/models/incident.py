from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Incident(Base):
    __tablename__ = "incidents"
    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String(200), nullable=False)
    description   = Column(Text)
    category      = Column(String(50))
    priority      = Column(String(5))
    status        = Column(String(30), default="Reported")
    lat           = Column(Float)
    lng           = Column(Float)
    location      = Column(String(200))
    reported_by   = Column(Integer, ForeignKey("users.id"))
    assigned_team = Column(String(100))
    eta           = Column(Integer, default=0)
    image_url     = Column(String(500))
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reporter      = relationship("User", back_populates="incidents", foreign_keys=[reported_by])

class RescueTeam(Base):
    __tablename__ = "rescue_teams"
    id      = Column(Integer, primary_key=True, index=True)
    name    = Column(String(100), nullable=False)
    type    = Column(String(50))  # Fire | Medical | Flood | Multi
    lat     = Column(Float)
    lng     = Column(Float)
    status  = Column(String(30), default="Available")  # Available | Busy | On Route | Emergency Mode
    members = Column(Integer, default=6)
