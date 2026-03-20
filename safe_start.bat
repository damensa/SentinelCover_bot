@echo off
setlocal enabledelayedexpansion

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🛡️  SENTINEL COVER - ARRENCADA SEGURA
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo [1/4] Aturant processos anteriors...
:: Aturem qualsevol node o chrome que pugui estar bloquejant la sessió
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM chrome.exe /T 2>nul

echo [2/4] Esperant que el sistema alliberi els fitxers...
timeout /t 2 /nobreak >nul

echo [3/4] Netejant bloquejos de sessió (SingletonLock)...
:: Netegem només els fitxers de bloqueig per no perdre el login (QR)
set SESSION_DIR=.wwebjs_auth\session
if exist "%SESSION_DIR%\SingletonLock" (
    del /f /q "%SESSION_DIR%\SingletonLock"
    echo    - SingletonLock eliminat.
)
if exist "%SESSION_DIR%\DevToolsActivePort" (
    del /f /q "%SESSION_DIR%\DevToolsActivePort"
    echo    - DevToolsActivePort eliminat.
)

:: Busquem altres possibles locks en subcarpetes
for /r ".wwebjs_auth" %%f in (lockfile) do (
    if exist "%%f" (
        del /f /q "%%f"
        echo    - %%f eliminat.
    )
)

echo.
echo [4/4] Iniciant el bot Sentinel...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
npm run bot
