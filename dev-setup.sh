#!/bin/bash

# AutoFlow Development Startup Script
echo "🚀 Iniciando AutoFlow em modo desenvolvimento..."

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
fi

# Verificar PostgreSQL
echo "🐘 Verificando PostgreSQL..."
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL não está rodando. Inicie o PostgreSQL antes de continuar."
    echo "   macOS: brew services start postgresql"
    echo "   Linux: sudo service postgresql start"
    exit 1
fi

# Verificar Redis (opcional)
echo "🔴 Verificando Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis não está rodando. Recomendado para filas de trabalho."
    echo "   macOS: brew services start redis"
    echo "   Linux: sudo service redis start"
fi

# Criar banco de dados se não existir
echo "🗄️  Configurando banco de dados..."
createdb autoflow 2>/dev/null || echo "   Banco autoflow já existe"

# Verificar arquivo .env
if [ ! -f "apps/backend/.env" ]; then
    echo "⚙️  Criando arquivo .env..."
    cp apps/backend/.env.example apps/backend/.env
    echo "   📝 Configure as variáveis em apps/backend/.env"
fi

# Executar migrações (quando implementadas)
echo "🔄 Executando migrações..."
# cd apps/backend && pnpm run db:migrate

echo "✅ Setup completo!"
echo ""
echo "🎯 Comandos disponíveis:"
echo "   pnpm dev          - Iniciar ambos servidores (backend + frontend)"
echo "   pnpm dev:backend  - Apenas backend (porta 3001)"
echo "   pnpm dev:frontend - Apenas frontend (porta 3000)"
echo "   pnpm build        - Build de produção"
echo "   pnpm test         - Executar testes"
echo ""
echo "📚 URLs importantes:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Docs: http://localhost:3001/docs"
echo ""
echo "🚀 Iniciando servidores..."