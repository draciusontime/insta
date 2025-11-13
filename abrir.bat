@echo off
REM BotInsta Dashboard - Abrir Arquivo Local
REM Este arquivo abre o index.html diretamente no navegador

setlocal enabledelayedexpansion

REM Obtém o diretório do script
set "SCRIPT_DIR=%~dp0"

REM Caminho completo do arquivo
set "FILE=%SCRIPT_DIR%public\index.html"

REM Verifica se o arquivo existe
if not exist "!FILE!" (
    echo Erro: index.html nao encontrado em !FILE!
    pause
    exit /b 1
)

echo [BotInsta] Abrindo Dashboard...

REM Abre o arquivo HTML no navegador padrão
start "" "!FILE!"

echo [BotInsta] Dashboard aberto com sucesso!
echo [BotInsta] Para buscar produtos, voce precisara do servidor rodando.
echo.
echo Deseja iniciar o servidor? (S/N)
set /p CHOICE="Resposta: "

if /i "%CHOICE%"=="S" (
    echo.
    echo Iniciando servidor...
    set "SERPAPI_KEY=bc254ec4fcb8adb93066f1df7a9536a2cc70a1ca52cdab243e626518cdbbec5d"
    call npm start
) else (
    echo OK, fechando...
    exit /b 0
)
