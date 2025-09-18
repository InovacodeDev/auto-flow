#!/bin/bash

# AutoFlow Database Setup Script
# This script sets up the PostgreSQL database for AutoFlow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="autoflow"
DB_USER="autoflow"
DB_PASSWORD="autoflow123"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}🚀 AutoFlow Database Setup${NC}"
echo "=================================="

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
    echo "Please start PostgreSQL and try again."
    echo ""
    echo "macOS (Homebrew): brew services start postgresql"
    echo "Ubuntu: sudo service postgresql start"
    echo "Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Create database and user
echo -e "${YELLOW}📄 Creating database and user...${NC}"

# Check if running as postgres user or need to specify user
if [ "$USER" = "postgres" ]; then
    PSQL_CMD="psql"
else
    # Try to connect as current user first, then try postgres
    if psql -h $DB_HOST -p $DB_PORT -d postgres -c '\q' 2>/dev/null; then
        PSQL_CMD="psql -h $DB_HOST -p $DB_PORT"
    elif psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c '\q' 2>/dev/null; then
        PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U postgres"
    else
        echo -e "${RED}❌ Cannot connect to PostgreSQL${NC}"
        echo "Please ensure you have proper PostgreSQL access rights."
        exit 1
    fi
fi

# Create database and user if they don't exist
$PSQL_CMD -d postgres -c "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'User $DB_USER created';
    ELSE
        RAISE NOTICE 'User $DB_USER already exists';
    END IF;
END
\$\$;
" 2>/dev/null || {
    echo -e "${RED}❌ Failed to create user${NC}"
    exit 1
}

$PSQL_CMD -d postgres -c "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
        CREATE DATABASE $DB_NAME OWNER $DB_USER;
        RAISE NOTICE 'Database $DB_NAME created';
    ELSE
        RAISE NOTICE 'Database $DB_NAME already exists';
    END IF;
END
\$\$;
" 2>/dev/null || {
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
}

# Grant privileges
$PSQL_CMD -d postgres -c "
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
" 2>/dev/null

echo -e "${GREEN}✅ Database and user created successfully${NC}"

# Run migrations
echo -e "${YELLOW}📊 Running database migrations...${NC}"

export PGPASSWORD=$DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/migrations/0001_initial_schema.sql" || {
    echo -e "${RED}❌ Failed to run migrations${NC}"
    exit 1
}

echo -e "${GREEN}✅ Migrations completed successfully${NC}"

# Ask about seed data
echo ""
read -p "$(echo -e ${YELLOW}❓ Do you want to load development seed data? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🌱 Loading development seed data...${NC}"
    
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/migrations/seed-dev.sql" || {
        echo -e "${RED}❌ Failed to load seed data${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Seed data loaded successfully${NC}"
    echo ""
    echo -e "${BLUE}📋 Test Users Created:${NC}"
    echo "• admin@techstart.com (Admin - TechStart Ltda)"
    echo "• maria@techstart.com (Manager - TechStart Ltda)"
    echo "• owner@comerciodigital.com (Admin - Comércio Digital ME)"
    echo "• ceo@servicospro.com (Admin - Serviços Pro)"
    echo ""
    echo -e "${BLUE}🔑 Default Password:${NC} AutoFlow123!"
fi

# Create .env file
echo ""
echo -e "${YELLOW}⚙️  Creating .env file...${NC}"

ENV_FILE="$(dirname "$0")/.env"
if [ ! -f "$ENV_FILE" ]; then
    cat > "$ENV_FILE" << EOF
# AutoFlow Environment Configuration

# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Application
NODE_ENV=development
PORT=3001
API_VERSION=v1

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
LOG_FORMAT=pretty

# Features
ENABLE_SWAGGER=true
ENABLE_METRICS=true
ENABLE_AUDIT_LOGS=true
EOF

    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping creation${NC}"
fi

# Display connection info
echo ""
echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Connection Details:${NC}"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo -e "${BLUE}🔗 Connection URL:${NC}"
echo "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. cd apps/backend"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"