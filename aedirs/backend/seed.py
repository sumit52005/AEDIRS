"""
Run once to seed the database with demo users and rescue teams.
python seed.py
"""
from core.database import SessionLocal, engine, Base
from models.user import User
from models.incident import Incident, RescueTeam
from core.security import hash_password

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        # Demo users
        users = [
            User(name="Priya Sharma",       email="citizen@demo.com",  password=hash_password("demo123"), role="citizen",     phone="9876543210"),
            User(name="Fire Team A",         email="rescue@demo.com",   password=hash_password("demo123"), role="rescue_team", phone="9876543211"),
            User(name="Supt. Rajesh Kumar",  email="auth@demo.com",     password=hash_password("demo123"), role="authority",   phone="9876543212"),
        ]
        for u in users: db.add(u)
        db.commit()

        # Rescue teams
        teams = [
            RescueTeam(name="Fire Team A",    type="Fire",    lat=18.5204, lng=73.8567, status="On Route",  members=6),
            RescueTeam(name="Ambulance A",     type="Medical", lat=18.5314, lng=73.8446, status="Busy",      members=3),
            RescueTeam(name="Flood Rescue A",  type="Flood",   lat=18.5089, lng=73.8729, status="On Route",  members=8),
            RescueTeam(name="NDRF Team A",     type="Multi",   lat=18.5400, lng=73.8700, status="Busy",      members=12),
            RescueTeam(name="Fire Team B",     type="Fire",    lat=18.5600, lng=73.8200, status="Available", members=6),
            RescueTeam(name="Ambulance B",     type="Medical", lat=18.5100, lng=73.8900, status="Available", members=3),
        ]
        for t in teams: db.add(t)
        db.commit()

        # Sample incidents
        citizen_id = db.query(User).filter(User.email == "citizen@demo.com").first().id
        incidents = [
            Incident(title="Flood near Pune Station",       description="30 people stranded, water level rising fast", category="Flood",             priority="P1", status="In Progress", lat=18.5204, lng=73.8567, location="Pune Station Area",      reported_by=citizen_id, assigned_team="Flood Rescue A", eta=8),
            Incident(title="Building collapse at MG Road",  description="3-storey building collapsed, people trapped",  category="Building Collapse", priority="P1", status="Assigned",    lat=18.5314, lng=73.8446, location="MG Road",               reported_by=citizen_id, assigned_team="NDRF Team A",   eta=12),
            Incident(title="Vehicle fire on expressway",    description="Truck burning, smoke spreading urgently",       category="Fire",             priority="P2", status="Verified",    lat=18.5089, lng=73.8729, location="Mumbai-Pune Expressway", reported_by=citizen_id, assigned_team="Fire Team A",   eta=6),
            Incident(title="Road accident at Hinjewadi",    description="Multiple vehicles, 2 unconscious",              category="Road Accident",    priority="P2", status="In Progress", lat=18.5890, lng=73.7370, location="Hinjewadi IT Park",      reported_by=citizen_id, assigned_team="Ambulance A",   eta=5),
            Incident(title="Medical emergency Baner",       description="Heart attack patient, unconscious",             category="Medical Emergency",priority="P1", status="Assigned",    lat=18.5590, lng=73.7890, location="Baner Road",             reported_by=citizen_id, assigned_team="Ambulance A",   eta=4),
            Incident(title="Waterlogging Kothrud",          description="Minor waterlogging, property damage only",      category="Flood",            priority="P4", status="Resolved",    lat=18.5074, lng=73.8077, location="Kothrud",                reported_by=citizen_id, assigned_team="Flood Rescue A", eta=0),
        ]
        for i in incidents: db.add(i)
        db.commit()

        print("✅ Database seeded successfully!")
        print("  citizen@demo.com / demo123")
        print("  rescue@demo.com  / demo123")
        print("  auth@demo.com    / demo123")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
