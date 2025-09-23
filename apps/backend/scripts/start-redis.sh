#!/bin/bash

# Script para iniciar Redis localmente para desenvolvimento

echo "🚀 Starting Redis for AutoFlow development..."

# Verificar se Redis está instalado
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis first:"
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt-get install redis-server"
    echo "   Windows: Download from https://redis.io/download"
    exit 1
fi

# Verificar se Redis já está rodando
if pgrep -x "redis-server" > /dev/null; then
    echo "✅ Redis is already running"
    redis-cli ping
else
    echo "🔄 Starting Redis server..."
    
    # Iniciar Redis com configuração básica
    redis-server --daemonize yes --port 6379 --logfile /tmp/redis.log
    
    # Aguardar Redis iniciar
    sleep 2
    
    # Testar conexão
    if redis-cli ping | grep -q "PONG"; then
        echo "✅ Redis started successfully on port 6379"
        echo "📊 Redis info:"
        redis-cli info server | grep redis_version
    else
        echo "❌ Failed to start Redis"
        exit 1
    fi
fi

echo "🎉 Redis is ready for AutoFlow!"
echo "   Host: localhost"
echo "   Port: 6379"
echo "   Database: 0"
echo ""
echo "To stop Redis: redis-cli shutdown"
echo "To monitor Redis: redis-cli monitor"
