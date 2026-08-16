@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "PAGE=%~dp0index.html"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

for %%I in ("%PAGE%") do set "PAGE=%%~fI"
set "FILEURL=file:///%PAGE:\=/%"

if exist "%CHROME%" (
  start "" "%CHROME%" --app="%FILEURL%"
  exit /b 0
)
if exist "%CHROME86%" (
  start "" "%CHROME86%" --app="%FILEURL%"
  exit /b 0
)
if exist "%EDGE64%" (
  start "" "%EDGE64%" --app="%FILEURL%"
  exit /b 0
)
if exist "%EDGE%" (
  start "" "%EDGE%" --app="%FILEURL%"
  exit /b 0
)

start "" "%PAGE%"
