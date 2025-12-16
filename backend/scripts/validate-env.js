#!/usr/bin/env node
/**
 * Environment Validation Script
 * Verifica que todas las variables requeridas estén configuradas
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const REQUIRED_VARS = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DATABASE_URL'
];

console.log('🔍 Validating Environment Variables\n');

let hasErrors = false;

REQUIRED_VARS.forEach(varName =>
{
    const value = process.env[varName];

    if (!value || value.trim() === '')
    {
        console.log(`❌ ${varName}: NOT SET`);
        hasErrors = true;
    } else
    {
        // Mask sensitive values
        const displayValue = ['DB_PASSWORD', 'DATABASE_URL'].includes(varName)
            ? '***REDACTED***'
            : value;
        console.log(`✅ ${varName}: ${displayValue}`);
    }
});

console.log('');

if (hasErrors)
{
    console.log('❌ Environment validation FAILED');
    console.log('💡 Please check your .env file and ensure all required variables are set.\n');
    process.exit(1);
} else
{
    console.log('✅ Environment validation PASSED');
    console.log('💡 All required variables are configured correctly.\n');

    // Additional validation for DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.startsWith('postgresql://'))
    {
        console.log('⚠️  Warning: DATABASE_URL should start with "postgresql://"');
    }
}
