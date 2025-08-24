@echo off
setlocal
cd /d %~dp0\..
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%CD%\scripts\start-dev.ps1" %*
endlocal

