from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(100), unique=True, index=True, nullable=False)
    password   = Column(String(200), nullable=False)
    role       = Column(String(20), default="citizen")  # citizen | rescue_team | authority
    phone      = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    incidents  = relationship("Incident", back_populates="reporter", foreign_keys="Incident.reported_by")
