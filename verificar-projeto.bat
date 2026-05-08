@echo off
title BaeU Learning - Verificacao Pre-Apresentacao

echo.
echo 🚀 BaeU Learning - Verificacao Pre-Apresentacao
echo ================================================
echo.

echo 📝 1. Verificando Backend...

rem Verificar se node_modules existe
if exist "node_modules" (
    echo ✅ Backend node_modules encontrado
) else (
    echo ❌ Backend node_modules nao encontrado
    echo    Execute: npm install
)

rem Verificar .env
if exist ".env" (
    echo ✅ Arquivo .env encontrado
) else (
    echo ❌ Arquivo .env nao encontrado
    echo    Execute: copy .env.example .env
)

echo.
echo 📱 2. Verificando Frontend...

rem Verificar se frontend/node_modules existe
if exist "frontend\node_modules" (
    echo ✅ Frontend node_modules encontrado
) else (
    echo ❌ Frontend node_modules nao encontrado
    echo    Execute: cd frontend ^&^& npm install
)

echo.
echo 🗄️ 3. Verificando Banco de Dados...
node scripts/verify-db.js

echo.
echo 👥 4. Verificando Usuarios de Teste...
node scripts/verify-users.js

echo.
echo 🔧 COMANDOS PARA EXECUTAR:
echo =========================
echo.
echo 🔴 Se algo falhou acima, execute:
echo    npm install
echo    cd frontend ^&^& npm install ^&^& cd ..
echo    node scripts/reset-db.js
echo.
echo 🟢 Para iniciar a aplicacao:
echo    Terminal 1: npm run dev (Backend - porta 3000)
echo    Terminal 2: cd frontend ^&^& npm run dev (Frontend - porta 5173)
echo.
echo 🧪 Usuarios de teste:
echo    Admin: admin / admin
echo    User:  test / test123
echo.
echo 📱 URLs importantes:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3000
echo    API:      http://localhost:3000/api
echo.
echo 🎯 Pronto para apresentacao!
echo.
pause
