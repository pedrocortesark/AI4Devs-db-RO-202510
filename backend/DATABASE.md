# 🗄️ Database Setup & Management Guide

Guía completa para configurar y gestionar la base de datos del ATS (Applicant Tracking System).

---

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración Inicial](#configuración-inicial)
- [Comandos Simplificados](#comandos-simplificados)
- [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Node.js** v18+ instalado
- **npm** v9+ instalado

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

El archivo `.env` en la raíz del proyecto ya está configurado con variables interpoladas:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb

# Prisma Connection URL (usa las variables de arriba)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
```

✅ **Ventajas**:
- No hay valores hardcodeados
- Fácil cambio de credenciales
- Misma configuración para dev y producción (solo cambias las variables)

### 2. Validar Configuración

```bash
npm run validate:env
```

Este comando verifica que todas las variables requeridas estén configuradas correctamente.

### 3. Iniciar PostgreSQL

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto iniciará PostgreSQL con:
- **Healthcheck** automático
- **Volume persistente** (los datos se mantienen entre reinicios)
- **Network aislado** (ats-network)
- **Container name**: ats-postgres

Verificar estado:
```bash
docker-compose ps
docker logs ats-postgres
```

### 4. Setup Completo de Base de Datos

```bash
cd backend
npm run db:setup
```

Este comando ejecuta automáticamente:
1. ✅ `prisma generate` - Genera el cliente TypeScript
2. ✅ `prisma migrate dev` - Aplica migraciones
3. ✅ `prisma db seed` - Puebla con datos de prueba

---

## 🎯 Comandos Simplificados

### Operaciones de Base de Datos

| Comando | Descripción |
|---------|-------------|
| `npm run db:generate` | Genera el cliente Prisma TypeScript |
| `npm run db:migrate` | Crea y aplica una nueva migración |
| `npm run db:migrate:deploy` | Aplica migraciones pendientes (producción) |
| `npm run db:seed` | Puebla la BD con datos de prueba (idempotente) |
| `npm run db:reset` | **⚠️ DESTRUYE** todos los datos y recrea la BD |
| `npm run db:studio` | Abre Prisma Studio en http://localhost:5555 |
| `npm run db:push` | Sincroniza schema sin crear migración |
| `npm run db:validate` | Valida el schema de Prisma |
| `npm run db:format` | Formatea el archivo schema.prisma |
| `npm run db:setup` | **Setup completo**: generate + migrate + seed |

### Operaciones de Verificación

| Comando | Descripción |
|---------|-------------|
| `npm run verify` | Ejecuta queries de verificación + validaciones |
| `npm run validate:env` | Valida variables de entorno |

### Scripts de Utilidad

#### Windows (PowerShell)
```powershell
# Setup completo con validación
.\scripts\db-setup.ps1

# Reset con confirmación
.\scripts\db-reset.sh  # Git Bash requerido
```

#### Linux/Mac (Bash)
```bash
# Setup completo con validación
./scripts/db-setup.sh

# Reset con confirmación
./scripts/db-reset.sh
```

---

## 🔄 Flujos de Trabajo Comunes

### 🆕 Primera Configuración (Fresh Install)

```bash
# 1. Iniciar PostgreSQL
docker-compose up -d

# 2. Instalar dependencias
cd backend
npm install

# 3. Validar entorno
npm run validate:env

# 4. Setup completo
npm run db:setup

# 5. Verificar datos
npm run verify

# 6. Abrir Prisma Studio (opcional)
npm run db:studio
```

**Resultado**: Base de datos con 135 registros de prueba lista para desarrollo.

---

### 🔨 Modificar el Schema de Prisma

```bash
# 1. Editar backend/prisma/schema.prisma
# ... hacer cambios ...

# 2. Validar sintaxis
npm run db:validate

# 3. Formatear
npm run db:format

# 4. Crear migración
npm run db:migrate
# Ingresa un nombre descriptivo: "add_user_avatar_field"

# 5. Regenerar cliente
npm run db:generate

# 6. Verificar cambios
npm run verify
```

---

### 🌱 Re-Seed (Sin Perder Datos)

El seed es **idempotente**, puedes ejecutarlo múltiples veces:

```bash
npm run db:seed
```

✅ **No duplica datos** gracias a:
- `upsert` con constraints únicos
- Validación de existencia antes de crear

---

### 🗑️ Reset Completo (Destruir y Recrear)

```bash
# Opción 1: Con script interactivo
./scripts/db-reset.sh  # Pide confirmación

# Opción 2: Directo
npm run db:reset
npm run db:seed
```

⚠️ **Advertencia**: Esto **elimina TODOS los datos**.

---

### 📊 Inspección Visual de Datos

```bash
npm run db:studio
```

Abre Prisma Studio en http://localhost:5555

**Features**:
- ✅ Navegación visual entre tablas
- ✅ Edición de registros
- ✅ Filtrado y búsqueda
- ✅ Exploración de relaciones

---

### 🚀 Deploy a Producción

```bash
# 1. Asegurarse que DATABASE_URL apunta a prod
# Editar .env con credenciales de producción

# 2. Aplicar migraciones (NO ejecuta seed automáticamente)
npm run db:migrate:deploy

# 3. Generar cliente optimizado
npm run db:generate

# 4. Si necesitas datos de prueba en staging:
npm run db:seed
```

---

## 🐛 Troubleshooting

### ❌ Error: "DATABASE_URL not set"

**Causa**: Variables de entorno no cargadas.

**Solución**:
```bash
# Validar configuración
npm run validate:env

# Verificar que .env existe
cat .env

# Si falta, copiar desde ejemplo
cp .env.example .env
```

---

### ❌ Error: "Can't reach database server"

**Causa**: PostgreSQL no está corriendo o no es accesible.

**Solución**:
```bash
# Verificar estado
docker-compose ps

# Ver logs
docker logs ats-postgres

# Reiniciar contenedor
docker-compose restart db

# O recrear desde cero
docker-compose down
docker-compose up -d
```

---

### ❌ Error: "Unique constraint failed"

**Causa**: Intentando insertar datos duplicados.

**Solución**:
```bash
# El seed es idempotente, pero si hay conflictos:
npm run db:reset
npm run db:seed
```

---

### ❌ Error: "Migration failed"

**Causa**: Schema tiene cambios incompatibles.

**Solución**:
```bash
# Opción 1: Resolver conflicto manualmente
npm run db:migrate

# Opción 2: Reset en desarrollo
npm run db:reset

# Opción 3: Usar db push (solo dev, no crea migración)
npm run db:push
```

---

### ❌ Puerto 5432 ya en uso

**Causa**: Otra instancia de PostgreSQL corriendo.

**Solución**:
```bash
# Encontrar proceso
# Windows
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :5432

# Cambiar puerto en .env
DB_PORT=5433

# Actualizar docker-compose y reiniciar
docker-compose down
docker-compose up -d
```

---

### 🔍 Verificar Integridad de Datos

```bash
# Ejecutar script de verificación
npm run verify
```

Este script valida:
- ✅ Relaciones entre tablas
- ✅ Constraints únicos
- ✅ Soft deletes
- ✅ Timestamps coherentes
- ✅ Foreign Keys válidas

---

## 📚 Recursos Adicionales

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [ERD Diagram](../docs/database/ERD.md)
- [Planning Document](../docs/planning.md)

---

## 🔐 Seguridad en Producción

⚠️ **NO USES** las credenciales del `.env` de ejemplo en producción.

**Recomendaciones**:
1. Genera credenciales fuertes para producción
2. Usa variables de entorno del sistema (no .env)
3. Considera usar servicios como AWS RDS, Azure Database, etc.
4. Habilita SSL en la conexión (`sslmode=require`)
5. Restringe acceso de red a la base de datos

**DATABASE_URL para producción con SSL**:
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/dbname?schema=public&sslmode=require"
```

---

**Última actualización**: 2025-12-16  
**Mantenedor**: Backend Team
