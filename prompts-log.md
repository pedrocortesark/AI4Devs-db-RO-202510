# REGISTRO DE PROMPTS UTILIZADOS
**Autor**: Pedro Cortes
**Proyecto**: AI4Devs-db-RO-202510 - Sistema de Reclutamiento (ATS)
**Descripción**: Bitácora de prompts para trazabilidad del proyecto.
---

## 001 - Modelado de Base de Datos desde ERD Mermaid a Prisma
**Fecha:** 2025-12-15 10:30
**Prompt Original:**
> Actúa como un Senior Backend Developer y Arquitecto de Base de Datos.
> 
> Tengo una tarea de modelado de datos. Antes de ejecutar cualquier código, es **OBLIGATORIO** que sigas el protocolo definido en el archivo `agents.md` de la raíz del proyecto.
> 
> **Instrucciones de Ejecución:**
> 
> 1.  **Lectura de Reglas:** Lee el archivo `agents.md`.
> 2.  **Logging (Traza):** Gestiona el archivo `prompts-log.md` según las reglas:
>     * Si no existe, créalo con la cabecera estándar.
>     * Si existe, obtén el último ID incremental.
>     * Registra este prompt COMPLETO (incluyendo el código Mermaid de abajo) en una nueva entrada.
> 3.  **Análisis y Planning:** Analiza el código Mermaid proporcionado. Elabora un **Plan de Acción** detallado listando:
>     * Las entidades que vas a crear en Prisma.
>     * Qué mejoras de normalización aplicarás (ej. convertir strings repetitivos en ENUMS, añadir índices a las Foreign Keys, timestamps).
>     * Cómo verificarás la integridad de los datos.
> 4.  **Stop:** Espera mi confirmación ("Sí, procede") antes de escribir el código SQL o el Schema de Prisma.
> 
> **Tarea Principal:**
> Convertir el siguiente diagrama ERD (formato Mermaid) a un esquema de producción robusto usando **Prisma ORM** y generar su equivalente en **SQL**.
> 
> **Código Mermaid a procesar:**
> 
> ```mermaid
> erDiagram
>      COMPANY {
>          int id PK
>          string name
>      }
>      EMPLOYEE {
>          int id PK
>          int company_id FK
>          string name
>          string email
>          string role
>          boolean is_active
>      }
>      POSITION {
>          int id PK
>          int company_id FK
>          int interview_flow_id FK
>          string title
>          text description
>          string status
>          boolean is_visible
>          string location
>          text job_description
>          text requirements
>          text responsibilities
>          numeric salary_min
>          numeric salary_max
>          string employment_type
>          text benefits
>          text company_description
>          date application_deadline
>          string contact_info
>      }
>      INTERVIEW_FLOW {
>          int id PK
>          string description
>      }
>      INTERVIEW_STEP {
>          int id PK
>          int interview_flow_id FK
>          int interview_type_id FK
>          string name
>          int order_index
>      }
>      INTERVIEW_TYPE {
>          int id PK
>          string name
>          text description
>      }
>      CANDIDATE {
>          int id PK
>          string firstName
>          string lastName
>          string email
>          string phone
>          string address
>      }
>      APPLICATION {
>          int id PK
>          int position_id FK
>          int candidate_id FK
>          date application_date
>          string status
>          text notes
>      }
>      INTERVIEW {
>          int id PK
>          int application_id FK
>          int interview_step_id FK
>          int employee_id FK
>          date interview_date
>          string result
>          int score
>          text notes
>      }
> 
>      COMPANY ||--o{ EMPLOYEE : employs
>      COMPANY ||--o{ POSITION : offers
>      POSITION ||--|| INTERVIEW_FLOW : assigns
>      INTERVIEW_FLOW ||--o{ INTERVIEW_STEP : contains
>      INTERVIEW_STEP ||--|| INTERVIEW_TYPE : uses
>      POSITION ||--o{ APPLICATION : receives
>      CANDIDATE ||--o{ APPLICATION : submits
>      APPLICATION ||--o{ INTERVIEW : has
>      INTERVIEW ||--|| INTERVIEW_STEP : consists_of
>      EMPLOYEE ||--o{ INTERVIEW : conducts
> ```
> 
> **Requisitos Técnicos Adicionales:**
> * Asegura el uso de `map()` en Prisma para que las tablas y columnas usen *snake_case* en la base de datos (ej. `firstName` en código -> `first_name` en DB), pero *camelCase* en el cliente JS.
> * Añade índices (`@@index`) para optimizar búsquedas por claves foráneas.
> 
> Inicia el protocolo `agents.md` ahora.

**Resumen de la Respuesta/Acción:**
Análisis completo del ERD, creación de esquema Prisma con normalización (ENUMs, timestamps, índices, constraints) y generación de SQL equivalente con snake_case mapping.
---

## 002 - Auditoría y Mejoras Críticas del Schema
**Fecha:** 2025-12-15 11:45
**Prompt Original:**
> Aún sin pasar a la fase 2, quiero que realices una revisión del esquema que acabas de crear y realizar mejoras como:
> - Identificar entidades o atributos redundantes y sugerir formas de eliminarlos.
> - Recomendar la normalización de entidades a 3FN o Boyce-Codd que no cumplen con las formas normales.
> - Sugerir la creación de índices en columnas frecuentemente utilizadas en queries para mejorar el rendimiento.
> - Identificar relaciones faltantes o incorrectas entre entidades.

**Resumen de la Respuesta/Acción:**
Auditoría exhaustiva identificando: 3 redundancias (Position.description, companyDescription, location como string), violaciones de 3FN (location, fileType, industry), 8 índices faltantes, constraint único faltante en Application, y relación faltante InterviewFlow-Company. Propuesta de 13 mejoras críticas aplicadas.
---

## 003 - Aplicación de Mejoras Prioritarias y Creación de Planning
**Fecha:** 2025-12-15 12:15
**Prompt Original:**
> Quiero que realices todos los cambios críticos e importantes que has mencionado. También quiero que ejecutes de nuevo el análisis para detectar otros elementos susceptibles de ser mejorados.

**Seguimiento:**
> Quiero que ejecutes las mejoras de prioridad alta, efectivamente. De momento no realizaremos el resto.
> 
> Quiero, por otra parte, que generes un documento planning.md donde almacenes la división por fases que realizaste al inicio del ejercicio y las tareas que pertenecen a cada fase. De esta forma, podré referirme a ellas con mayor facilidad. Descompón las tareas como sea necesario para que el planning sea granular y controlable.

**Resumen de la Respuesta/Acción:**
Aplicadas 33 mejoras de prioridad alta: normalización completa (Industry, Location), 3 ENUMs adicionales (ApplicationSource, EducationLevel, FileType), expansión de 5 modelos (Company, Employee, Candidate, Position, Interview), 15 índices de optimización, constraints únicos y campos críticos (vacancies/filled). Creado planning.md con 5 fases detalladas, 150+ tareas granulares y métricas del proyecto. Schema alcanzó 3FN completa.
---

## 004 - Generación de SQL DDL Completo y Documentación ERD
**Fecha:** 2025-12-16 09:00
**Prompt Original:**
> Actúa como un Senior Database Architect especializado en PostgreSQL.
> 
> Vamos a proceder con la **FASE 2** del proyecto. Antes de generar cualquier código, es **OBLIGATORIO** que sigas el protocolo definido en `agents.md`.
> 
> **Instrucciones de Ejecución:**
> 
> 1.  **Logging:**
>     * Lee el archivo `agents.md`.
>     * Registra este prompt en `prompts-log.md` con el siguiente ID incremental.
> 
> 2.  **Generación de SQL (PostgreSQL):**
>     * Basándote en el diseño del ERD acordado, genera el script SQL DDL completo (`init.sql`).
>     * **Buenas prácticas obligatorias:**
>         * Usa `snake_case` para tablas y columnas.
>         * Define `PRIMARY KEY` y `FOREIGN KEY` explícitamente.
>         * Crea índices (`CREATE INDEX`) para todas las claves foráneas y campos de búsqueda frecuente (ej. emails).
>         * Usa `ENUM` nativos de Postgres o restricciones `CHECK` para los campos de estado (Status, Role, etc.).
>         * Incluye columnas `created_at` y `updated_at` (con triggers o defaults automáticos si es posible) en todas las tablas.
> 
> 3.  **Documentación Persistente (ERD-LTI):**
>     * Crea (o sobrescribe) un archivo en la ruta `backend/prisma/ERD-LTI.md`.
>     * Este archivo debe contener:
>         * El código **Mermaid** definitivo y actualizado del ERD.
>         * Una breve descripción técnica de las relaciones y decisiones tomadas (ej. por qué se normalizó cierta tabla).
>     * *Objetivo:* Que este archivo sea la fuente de la verdad para futuras consultas sobre la estructura visual de la base de datos.
> 
> 4.  **Actualización del Planning:**
>     * Edita el archivo `planning.md`.
>     * Marca las tareas de la Fase 1 y Fase 2 como "Completadas".
>     * Añade un resumen de los resultados de esta fase (ej. "Script SQL generado y ERD documentado en prisma/").
> 
> 5.  **Confirmación:**
>     * Al finalizar, muéstrame el script SQL generado para una última revisión antes de considerarlo definitivo.
> 
> Inicia el protocolo ahora.

**Resumen de la Respuesta/Acción:**
Generación completa del script SQL DDL (init.sql) con 9 ENUMs, 14 tablas, 30 índices, triggers para updated_at, constraints CHECK, y documentación exhaustiva. Creación de ERD-LTI.md con diagrama Mermaid actualizado y decisiones de diseño. Actualización de planning.md marcando Fase 2 como completada.
---

## 005 - Aplicación de Migraciones Prisma (FASE 3)
**Fecha:** 2025-12-16 10:30
**Prompt Original:**
> Actúa como un Senior Backend Developer experto en Prisma ORM y DevOps.
> 
> Vamos a proceder con la **FASE 3** del proyecto. Antes de ejecutar comandos o generar código, es **OBLIGATORIO** que sigas el protocolo definido en `agents.md`.
> 
> **Instrucciones de Ejecución:**
> 
> 1.  **Logging:**
>     * Lee el archivo `agents.md`.
>     * Registra este prompt en `prompts-log.md` obteniendo el ID incremental correspondiente.
> 
> 2.  **Gestión del Planning:**
>     * Edita el archivo `planning.md`.
>     * Asegúrate de que las tareas de la Fase 2 estén marcadas como completadas.
>     * Actualiza (o sobrescribe) la sección de la FASE 3 con el checklist detallado que te proporciono abajo.
> 
> 3.  **Ejecución de la Fase 3 (Migraciones):**
>     * Analiza el estado actual del proyecto (archivos `schema.prisma` y `.env`).
>     * Guíame paso a paso para completar las tareas del bloque 1 y 2.
>     * **Importante:** No asumas que la conexión funciona. Proporcióname los comandos necesarios para validar la conexión y generar la migración (`prisma migrate dev`).
>     * Si tienes capacidad de ejecución (modo agente), verifica la existencia de la carpeta `prisma/migrations` tras el proceso.
> 
> 4.  **Verificación:**
>     * Una vez aplicadas las migraciones, explícame cómo verificar (mediante script o CLI) que las tablas en la base de datos coinciden con el schema.
>     * Indícame cómo regenerar el `PrismaClient` si hubo cambios.

**Resumen de la Respuesta/Acción:**
Guía paso a paso para ejecutar migraciones Prisma: verificación de .env y DATABASE_URL, validación de conexión PostgreSQL, generación y aplicación de migración inicial, comparación con init.sql manual, y regeneración de PrismaClient con tipos TypeScript actualizados.
---

## 006 - Seeding de Base de Datos y Verificación (FASE 4)
**Fecha:** 2025-12-16 12:00
**Prompt Original:**
> Actúa como un Senior Backend Developer especializado en Testing y Automatización de Datos.
> 
> Vamos a proceder con la **FASE 4** del proyecto. Antes de generar código, es **OBLIGATORIO** que sigas el protocolo definido en `agents.md`.
> 
> **Instrucciones de Ejecución:**
> 
> 1.  **Logging:**
>     * Lee el archivo `agents.md`.
>     * Registra este prompt en `prompts-log.md` con el ID incremental correspondiente.
> 
> 2.  **Actualización del Planning:**
>     * Edita el archivo `planning.md`.
>     * Marca todas las tareas de la FASE 3 como "Completadas".
>     * Añade (o sobrescribe) la sección de la FASE 4 con el checklist detallado que te proporciono abajo.
> 
> 3.  **Ejecución de la Fase 4 (Seeding):**
>     * Genera el archivo `prisma/seed.ts` con datos de prueba robustos.
>     * **Requisito Clave:** El script de seed debe ser **idempotente** (usa `upsert` o verifica si el dato existe antes de crearlo) para poder ejecutarlo múltiples veces sin errores de duplicados.
>     * Asegúrate de incluir datos para todo el flujo: Empresa -> Empleados -> Flujos de Entrevista -> Vacantes -> Candidatos -> Aplicaciones -> Entrevistas.
> 
> 4.  **Verificación y Validaciones:**
>     * Explícame cómo configurar el `package.json` para que el comando `npx prisma db seed` funcione.
>     * Proporciona un pequeño script de verificación en TypeScript (`verify-setup.ts`) que realice una consulta compleja (ej. "Traer todas las entrevistas de un candidato con el nombre del entrevistador") para asegurar que las relaciones funcionan.
> 
> Inicia el protocolo `agents.md` ahora y confirma cuando hayas actualizado el `planning.md` para comenzar con el desarrollo del script `seed.ts`.

**Resumen de la Respuesta/Acción:**
Creación de script seed.ts idempotente con datos completos (industrias, empresas, empleados, flujos de entrevista, posiciones, candidatos, aplicaciones, entrevistas), configuración de package.json para prisma db seed, y desarrollo de script verify-setup.ts con consultas complejas que prueban relaciones entre entidades.
---

## 007 - Ejecución y Corrección de Seed (FASE 4 - Finalización)
**Fecha:** 2025-12-16 14:30
**Prompt Original:**
> [Conversación continua tras errores de ejecución del seed]
> 
> El seed presentaba múltiples errores:
> 1. Error de credenciales: DATABASE_URL usaba ats_user/ats_password cuando los correctos eran LTIdbUser/D1ymf8wyQEGthFR1E9xhCq con base de datos LTIdb
> 2. Error de tipos: Usaba campo `feedback` en Interview cuando el schema define `notes`
> 3. Error de lógica: allSteps.find() retornaba undefined por referencias incorrectas a createdFlows
> 
> Objetivo: Corregir seed.ts para completar exitosamente el seeding de todas las 14 entidades, ejecutar verify-setup.ts para validar integridad, y abrir Prisma Studio para inspección visual.

**Resumen de la Respuesta/Acción:**
Correcciones aplicadas: 1) Actualización de DATABASE_URL con credenciales correctas (LTIdbUser/LTIdb), 2) Reemplazo de campo `feedback` por `notes` en Interview, 3) Implementación de función helper findStep() con validación de undefined y lógica de skip segura. Seeding completado exitosamente con 135 registros: 10 industries, 5 interview types, 5 locations, 3 companies, 15 employees, 3 interview flows, 10 interview steps, 5 positions, 10 candidates, 15 education records, 20 work experiences, 10 resumes, 15 applications, 9 interviews (1 saltada por falta de datos). Verificación ejecutada: 5 queries complejas pasadas, 6 validaciones de integridad confirmadas, Prisma Studio iniciado en http://localhost:5555.
---

## 008 - Verificación Final y Organización de Documentación (FASE 5)
**Fecha:** 2025-12-16 15:00
**Prompt Original:**
> Actúa como un Senior QA Engineer y Documentalist experto.
> 
> Hemos llegado a la **FASE 5** (Finalización). Antes de empezar, es **OBLIGATORIO** seguir el protocolo de `agents.md`.
> 
> **Instrucciones de Ejecución:**
> 
> 1.  **Logging:**
>     * Lee `agents.md`.
>     * Registra este prompt en `prompts-log.md` con su ID incremental.
> 
> 2.  **Organización de Documentación (Housekeeping):**
>     * Sigue las mejores prácticas de estructura de proyectos.
>     * Crea una carpeta `docs/` en la **raíz del proyecto** (si no existe).
>     * Mueve/Organiza los archivos generados anteriormente:
>         * Mueve `planning.md` a `docs/planning.md`.
>         * Mueve `prisma/ERD-LTI.md` a `docs/database/ERD.md` (crea la subcarpeta si es necesario).
>         * *Nota:* Mantén `agents.md` y `prompts-log.md` en la raíz, ya que son archivos de configuración del asistente.
> 
> 3.  **Generación de Consultas de Prueba (Queries):**
>     * Necesito verificar que el modelo ATS soporta operaciones complejas del mundo real.
>     * Genera un set de consultas tanto en **SQL Puro** como en **Prisma Client (TypeScript)** para los siguientes casos:
>         * **Caso A:** "Obtener el historial completo de un candidato (Aplicaciones + Pasos de Entrevista + Resultados + Comentarios del entrevistador)".
>         * **Caso B:** "Estadísticas: Contar cuántos candidatos hay en cada estado ('PENDING', 'HIRED') por cada Posición activa".
>         * **Caso C:** "Buscar candidatos que hayan reprobado una entrevista técnica (score < 5) en el último mes".
> 
> 4.  **Creación del Reporte:**
>     * Crea un nuevo archivo llamado `docs/verification-report.md`.
>     * Este archivo debe contener:
>         * Los snippets de código de las consultas (SQL y Prisma) generadas en el paso 3.
>         * Una breve explicación de qué valida cada consulta.
>         * Un espacio (checklist) para marcar si la prueba fue exitosa.
> 
> 5.  **Actualización del Planning:**
>     * Actualiza `docs/planning.md` (recuerda que acabas de moverlo) con el checklist de la Fase 5.
> 
> Inicia el protocolo `agents.md` ahora. Primero organiza los archivos y confirma cuando la carpeta `docs` esté lista antes de generar las queries.

**Resumen de la Respuesta/Acción:**
Reorganización completa de documentación: creación de estructura docs/ y docs/database/, migración de planning.md y ERD-LTI.md, generación de 3 consultas complejas (SQL + Prisma) para validación del modelo (historial de candidato, estadísticas por posición, búsqueda con filtros), creación de verification-report.md con casos de prueba ejecutables, y actualización de planning.md con checklist de FASE 5.
---
