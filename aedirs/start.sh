#!/bin/bash
echo "⚡ Starting AEDIRS..."
echo ""
echo "Starting backend (FastAPI)..."
cd backend && uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID → http://localhost:8000/api/docs"
echo ""
echo "Starting frontend (React)..."
cd ../frontend && npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID → http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
wait
