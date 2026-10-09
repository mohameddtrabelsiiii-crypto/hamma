@echo off
setlocal
set "PY=%LOCALAPPDATA%\hermes\tools\python-3.14.7+20260901-win32-x64\python.exe"
if not exist "%PY%" exit /b 2
"%PY%" "%~dp0team_runner.py"
exit /b %ERRORLEVEL%
