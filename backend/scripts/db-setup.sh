#!/bin/bash
# Database Setup Script
# Configura la base de datos desde cero

set -e

echo "🔧 ATS Database Setup"
echo "====================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Validate required variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run db:generate
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate
echo ""

# Seed database
echo "🌱 Seeding database..."
npm run db:seed
echo ""

# Verify setup
echo "🔍 Verifying database setup..."
npm run verify
echo ""

echo "✅ Database setup completed successfully!"
echo "💡 You can now run 'npm run db:studio' to inspect the data"
