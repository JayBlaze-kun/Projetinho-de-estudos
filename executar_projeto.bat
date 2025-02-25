@echo off
chcp 65001 > nul
title 🤖 Study Buddy 📚 - Iniciando Servidor

echo 🤖 Iniciando o Study Buddy 📚...
echo.

REM Verifica se o Python está instalado
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado! Por favor, instale o Python e tente novamente.
    echo.
    echo 📥 Você pode baixar o Python em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

REM Obtém o diretório atual
set "PROJETO_DIR=%~dp0"

REM Inicia o servidor Python
echo 🌐 Iniciando servidor local...
echo.
echo 📂 Diretório do projeto: %PROJETO_DIR%
echo 🔗 URL do projeto: http://localhost:8000
echo.
echo ℹ️ Pressione Ctrl+C para encerrar o servidor
echo.

REM Abre o navegador padrão
start http://localhost:8000

REM Inicia o servidor Python no diretório do projeto
cd /d "%PROJETO_DIR%"
python -m http.server 8000 