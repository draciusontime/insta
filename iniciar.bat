@echo off
REM BotInsta Dashboard - Abrir com Express Server
REM Este arquivo inicia o servidor Express e abre o navegador

setlocal enabledelayedexpansion

REM Obtém o diretório do script
set "SCRIPT_DIR=%~dp0"

REM Define a porta
set PORT=3000

REM Verifica se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js nao esta instalado ou nao esta no PATH
    pause
    exit /b 1
)

REM Define a chave da SerpAPI
set "SERPAPI_KEY=bc254ec4fcb8adb93066f1df7a9536a2cc70a1ca52cdab243e626518cdbbec5d"

REM Mata qualquer processo anterior na porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Aguarda um pouco
timeout /t 1 /nobreak >nul

echo [BotInsta] Iniciando servidor...
echo [BotInsta] Abrindo navegador em http://localhost:3000

REM Inicia o servidor em background
start "BotInsta Dashboard" node "%SCRIPT_DIR%server.js"

REM Aguarda o servidor iniciar
timeout /t 2 /nobreak >nul

REM Abre o navegador
start http://localhost:3000

echo [BotInsta] Servidor rodando em http://localhost:3000
echo [BotInsta] Feche esta janela para parar o servidor
pause
