#!/bin/bash

echo "🚀 BaeU Learning - Verificação Pré-Apresentação"
echo "================================================"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "📝 1. Verificando Backend..."

# Verificar se node_modules existe
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Backend node_modules encontrado${NC}"
else
    echo -e "${RED}❌ Backend node_modules não encontrado${NC}"
    echo "   Execute: npm install"
fi

# Verificar .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
else
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    echo "   Execute: cp .env.example .env"
fi

echo ""
echo "📱 2. Verificando Frontend..."

# Verificar se frontend/node_modules existe
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend node_modules encontrado${NC}"
else
    echo -e "${RED}❌ Frontend node_modules não encontrado${NC}"
    echo "   Execute: cd frontend && npm install"
fi

echo ""
echo "🗄️ 3. Verificando Banco de Dados..."
node scripts/verify-db.js

echo ""
echo "👥 4. Verificando Usuários de Teste..."
node scripts/verify-users.js

echo ""
echo "🔧 COMANDOS PARA EXECUTAR:"
echo "========================="
echo ""
echo "🔴 Se algo falhou acima, execute:"
echo "   npm install"
echo "   cd frontend && npm install && cd .."
echo "   node scripts/reset-db.js"
echo ""
echo "🟢 Para iniciar a aplicação:"
echo "   Terminal 1: npm run dev (Backend - porta 3000)"
echo "   Terminal 2: cd frontend && npm run dev (Frontend - porta 5173)"
echo ""
echo "🧪 Usuários de teste:"
echo "   Admin: admin / admin"
echo "   User:  test / test123"
echo ""
echo "📱 URLs importantes:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   API:      http://localhost:3000/api"
echo ""
echo "🎯 Pronto para apresentação!"
