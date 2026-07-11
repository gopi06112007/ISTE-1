@echo off
echo Starting ISTE GMRIT Backend Server...
start "ISTE Backend" cmd /k "cd server && npm run dev"

echo Starting ISTE GMRIT Frontend Server...
start "ISTE Frontend" cmd /k "cd client && npm run dev -- --host"

echo Both servers are starting up!
