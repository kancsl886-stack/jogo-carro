@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\instalar-atalho.ps1" -Root "%~dp0"
if errorlevel 1 (
  echo Nao deu para criar o atalho.
  pause
  exit /b 1
)
echo.
echo Pronto! O jogo "Nitro Surf" esta na Area de Trabalho.
echo Clique duas vezes nele para jogar.
pause
