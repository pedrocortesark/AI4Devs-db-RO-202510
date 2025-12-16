# Database Setup Script for Windows PowerShell
# Configura la base de datos desde cero

$ErrorActionPreference = "Stop"

Write-Host "🔧 ATS Database Setup" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2] -replace '^"|"$', ''
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✅ Environment variables loaded" -ForegroundColor Green
}
else {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Validate DATABASE_URL
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL not set" -ForegroundColor Red
    exit 1
}

try {
    # Generate Prisma Client
    Write-Host "📦 Generating Prisma Client..." -ForegroundColor Yellow
    npm run db:generate
    Write-Host ""

    # Run migrations
    Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
    npm run db:migrate
    Write-Host ""

    # Seed database
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npm run db:seed
    Write-Host ""

    # Verify setup
    Write-Host "🔍 Verifying database setup..." -ForegroundColor Yellow
    npm run verify
    Write-Host ""

    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "💡 You can now run 'npm run db:studio' to inspect the data" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error during database setup: $_" -ForegroundColor Red
    exit 1
}
