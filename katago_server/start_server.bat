@echo off
title KataGo Human-SL LAN Server
echo ===================================================
echo Starting KataGo Human-SL High-Performance Sparring Server...
echo LAN Address: http://192.168.10.135:8765
echo Localhost:   http://localhost:8765
echo ===================================================
cd /d "%~dp0"
python server.py
pause
