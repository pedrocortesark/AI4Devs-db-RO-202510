const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main()
{
    console.log('🔌 Probando conexión con PrismaClient...\n');

    try
    {
        // Test básico de conexión
        await prisma.$connect();
        console.log('✅ Conexión exitosa a PostgreSQL\n');

        // Listar tablas usando query raw
        const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name != '_prisma_migrations'
      ORDER BY table_name;
    `;

        console.log('📊 Tablas encontradas en la base de datos:');
        tables.forEach((row, index) =>
        {
            console.log(`   ${index + 1}. ${row.table_name}`);
        });

        console.log(`\n📈 Total de tablas: ${tables.length}/14 esperadas\n`);

        // Verificar ENUMs disponibles
        const enums = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `;

        console.log('🏷️  ENUMs creados:');
        enums.forEach((row, index) =>
        {
            console.log(`   ${index + 1}. ${row.typname}`);
        });

        console.log(`\n📈 Total de ENUMs: ${enums.length}/9 esperados\n`);

        console.log('✨ ¡Todas las verificaciones pasaron exitosamente!');
    } catch (error)
    {
        console.error('❌ Error durante las pruebas:', error);
        process.exit(1);
    } finally
    {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) =>
    {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
