from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from core.database import engine, Base
from models import user, incident        # ensure tables are registered
from routers import auth, incidents, teams, users

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AEDIRS API",
    description="AI-Enabled Disaster Incident Response System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(teams.router)
app.include_router(users.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "AEDIRS API v1.0"}

# Serve built React frontend in production
frontend_build = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(frontend_build):
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="static")
