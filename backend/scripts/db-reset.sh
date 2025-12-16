#!/bin/bash
# Database Reset Script
# Limpia y recrea la base de datos

set -e

echo "⚠️  ATS Database Reset"
echo "====================="
echo ""
echo "This will DELETE all data and recreate the database."
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🗑️  Resetting database..."
npm run db:reset
echo ""

echo "🌱 Seeding fresh data..."
npm run db:seed
echo ""

echo "✅ Database reset completed!"
echo "💡 Run 'npm run verify' to check the setup"
