@echo off
echo Starting TruthLens AI...

start cmd /k "cd backend && call venv\Scripts\activate && python main.py"
start cmd /k "cd frontend && npm run dev"

echo Backend running on http://localhost:8000
echo Frontend starting...
