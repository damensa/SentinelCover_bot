@echo off
REM Script to start Chrome with remote debugging for NotebookLM MCP

REM Try common Chrome installation paths
set CHROME_PATH=""

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if %CHROME_PATH%=="" (
    echo ERROR: No s'ha trobat Chrome instal·lat
    echo Busca manualment chrome.exe i executa:
    echo "RUTA_A_CHROME\chrome.exe" --remote-debugging-port=9223
    pause
    exit /b 1
)

echo Obrint Chrome amb remote debugging al port 9223...
echo Ruta: %CHROME_PATH%
echo.
echo IMPORTANT: Deixa aquesta finestra oberta mentre utilitzes el bot
echo.

start "" %CHROME_PATH% --remote-debugging-port=9223 --user-data-dir="%TEMP%\chrome-debug-profile"

echo Chrome obert! Ara pots enviar consultes des de WhatsApp.
echo.
pause
