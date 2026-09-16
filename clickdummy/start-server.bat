@echo off
REM Startet einen lokalen HTTP-Server auf Foundry-Data-Root-Ebene, damit der
REM Click-Dummy relative Pfade zum DSA5-Systemordner (../../../systems/dsa5) auflösen kann.
REM Wichtig: Click-Dummy NICHT per Doppelklick/file:// oeffnen, sonst fehlen Grafiken.
cd /d "%~dp0..\..\.."
start "DSA5 Clickdummy Server" cmd /k python -m http.server 8877
timeout /t 1 >nul
start "" http://localhost:8877/modules/dsa5-helpers/clickdummy/index.html
