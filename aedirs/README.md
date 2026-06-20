# ⚡ AEDIRS — AI-Enabled Disaster Incident Response System
**MIT School of Computing · B.Tech CSE · Academic Project**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+

---

## Frontend (React)

```bash
cd frontend
npm install
npm start           # → http://localhost:3000
```

**Demo Login Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@demo.com | demo123 |
| Rescue Team | rescue@demo.com | demo123 |
| Authority | auth@demo.com | demo123 |

---

## Backend (FastAPI)

### 1. Setup PostgreSQL
```sql
CREATE DATABASE aedirs;
CREATE USER aedirs_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE aedirs TO aedirs_user;
```

### 2. Configure environment
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 3. Install & run
```bash
pip install -r requirements.txt
python seed.py       # seed demo data (run once)
uvicorn main:app --reload --port 8000
```

API Docs → http://localhost:8000/api/docs

---

## 🏗️ Project Structure

```
aedirs/
├── frontend/                  ← React + Tailwind CSS
│   └── src/
│       ├── pages/
│       │   ├── Home.js
│       │   ├── auth/Login.js
│       │   ├── citizen/CitizenDashboard.js
│       │   ├── rescue/RescueDashboard.js
│       │   └── authority/AuthorityDashboard.js
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── Sidebar.js
│       │   ├── Badge.js
│       │   ├── KpiCard.js
│       │   ├── TableCard.js
│       │   ├── Notification.js
│       │   ├── StatusFlow.js
│       │   └── EmergencyStrip.js
│       ├── context/AuthContext.js
│       └── utils/
│           ├── store.js       ← in-memory DB for offline demo
│           └── aiEngine.js    ← NLP classifier + dispatcher
│
└── backend/                   ← FastAPI + PostgreSQL
    ├── main.py
    ├── seed.py
    ├── requirements.txt
    ├── core/
    │   ├── config.py
    │   ├── database.py
    │   ├── security.py        ← JWT auth
    │   └── ai_engine.py       ← NLP + Haversine dispatch
    ├── models/
    │   ├── user.py
    │   └── incident.py        ← Incident + RescueTeam
    └── routers/
        ├── auth.py            ← POST /login, /register
        ├── incidents.py       ← CRUD + AI + dispatch
        ├── teams.py
        └── users.py
```

---

## 🤖 AI Engine

**Classification** — keyword NLP:
- Flood · Fire · Road Accident · Medical Emergency · Building Collapse

**Priority** — keyword scoring:
- P1 Critical · P2 High · P3 Medium · P4 Low

**Smart Dispatch** — Haversine distance:
- Finds nearest available team matching incident type
- Returns ETA in minutes

---

## 🗺️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router v7, Tailwind CSS |
| Maps | Leaflet.js + OpenStreetMap |
| Charts | Recharts |
| Backend | FastAPI + Python 3.12 |
| Database | PostgreSQL + SQLAlchemy |
| Auth | JWT (python-jose + bcrypt) |

---

## 📊 Demo Flow (Presentation)

1. **Home** → Show live stats and features
2. **Citizen Login** → citizen@demo.com / demo123
3. **Report Emergency** → Type "flood, 30 people stranded" → watch AI classify P1
4. **Authority Login** → auth@demo.com / demo123
5. **Dashboard** → See incident appear instantly
6. **Live Heatmap** → Red marker at reported location
7. **Dispatch** → Run smart dispatch engine
8. **Resolve** → Status → Resolved, marker turns green
