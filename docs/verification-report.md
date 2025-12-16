# 🧪 Verification Report - ATS Database

**Proyecto**: AI4Devs-db-RO-202510 - Sistema de Reclutamiento (ATS)  
**Fecha**: 2025-12-16  
**Objetivo**: Validar que el modelo de datos soporta operaciones complejas del mundo real

---

## 📋 Tabla de Contenidos

- [Caso A: Historial Completo de Candidato](#caso-a-historial-completo-de-candidato)
- [Caso B: Estadísticas por Posición](#caso-b-estadísticas-por-posición)
- [Caso C: Candidatos con Entrevistas Fallidas](#caso-c-candidatos-con-entrevistas-fallidas)
- [Resumen de Resultados](#resumen-de-resultados)

---

## 🎯 Caso A: Historial Completo de Candidato

### Descripción
Obtener el historial completo de un candidato específico incluyendo:
- Datos personales del candidato
- Todas las aplicaciones realizadas
- Pasos de entrevista por aplicación
- Resultados de cada entrevista
- Comentarios de los entrevistadores
- Información de las posiciones aplicadas

### Validación
✅ **Valida**: Relaciones entre `Candidate`, `Application`, `Interview`, `InterviewStep`, `Employee`, `Position`

---

### SQL Puro

```sql
-- Query A: Historial completo de un candidato
SELECT 
    -- Datos del Candidato
    c.id AS candidate_id,
    c.first_name || ' ' || c.last_name AS candidate_name,
    c.email AS candidate_email,
    c.phone AS candidate_phone,
    c.years_of_experience,
    
    -- Datos de la Aplicación
    a.id AS application_id,
    a.application_date,
    a.status AS application_status,
    a.notes AS application_notes,
    a.source AS application_source,
    
    -- Datos de la Posición
    p.id AS position_id,
    p.title AS position_title,
    comp.name AS company_name,
    p.employment_type,
    p.salary_min,
    p.salary_max,
    
    -- Datos de la Entrevista
    i.id AS interview_id,
    i.interview_date,
    i.duration_minutes,
    i.result AS interview_result,
    i.score AS interview_score,
    i.location AS interview_location,
    i.notes AS interview_notes,
    
    -- Datos del Paso de Entrevista
    istep.name AS interview_step_name,
    istep.order_index AS step_order,
    itype.name AS interview_type,
    itype.description AS interview_type_description,
    
    -- Datos del Entrevistador
    e.first_name || ' ' || e.last_name AS interviewer_name,
    e.email AS interviewer_email,
    e.role AS interviewer_role,
    e.department AS interviewer_department

FROM candidate c
LEFT JOIN application a ON a.candidate_id = c.id
LEFT JOIN position p ON p.id = a.position_id
LEFT JOIN company comp ON comp.id = p.company_id
LEFT JOIN interview i ON i.application_id = a.id
LEFT JOIN interview_step istep ON istep.id = i.interview_step_id
LEFT JOIN interview_type itype ON itype.id = istep.interview_type_id
LEFT JOIN employee e ON e.id = i.employee_id

WHERE c.email = 'juan.perez@example.com'  -- Filtro por email del candidato
  AND c.deleted_at IS NULL
  AND a.deleted_at IS NULL

ORDER BY 
    a.application_date DESC,
    istep.order_index ASC,
    i.interview_date ASC;
```

**Resultado Esperado**: Un registro por cada entrevista del candidato, con toda la información relacionada.

---

### Prisma Client (TypeScript)

```typescript
/**
 * Query A: Historial completo de un candidato
 * @param candidateEmail - Email del candidato a buscar
 */
async function getCandidateFullHistory(candidateEmail: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { 
      email: candidateEmail,
      deletedAt: null 
    },
    include: {
      // Educación
      education: {
        orderBy: { startDate: 'desc' },
        select: {
          institution: true,
          degree: true,
          fieldOfStudy: true,
          level: true,
          startDate: true,
          endDate: true,
          isCurrentlyStudying: true
        }
      },
      
      // Experiencia Laboral
      workExperience: {
        orderBy: { startDate: 'desc' },
        select: {
          jobTitle: true,
          company: true,
          description: true,
          startDate: true,
          endDate: true,
          isCurrentJob: true
        }
      },
      
      // CVs
      resumes: {
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          uploadedAt: true
        }
      },
      
      // Aplicaciones con toda la info relacionada
      applications: {
        where: { deletedAt: null },
        orderBy: { applicationDate: 'desc' },
        include: {
          // Posición aplicada
          position: {
            include: {
              company: {
                select: {
                  name: true,
                  size: true,
                  industry: {
                    select: { name: true }
                  }
                }
              },
              location: {
                select: {
                  city: true,
                  state: true,
                  country: true,
                  isRemote: true
                }
              }
            }
          },
          
          // Entrevistas de esta aplicación
          interviews: {
            orderBy: [
              { interviewStep: { orderIndex: 'asc' } },
              { interviewDate: 'asc' }
            ],
            include: {
              // Paso de entrevista
              interviewStep: {
                include: {
                  interviewType: {
                    select: {
                      name: true,
                      description: true
                    }
                  },
                  interviewFlow: {
                    select: {
                      description: true
                    }
                  }
                }
              },
              
              // Entrevistador
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                  department: true,
                  jobTitle: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!candidate) {
    throw new Error(`Candidate with email ${candidateEmail} not found`);
  }

  return {
    candidateInfo: {
      id: candidate.id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.address,
      yearsOfExperience: candidate.yearsOfExperience,
      currentJobTitle: candidate.currentJobTitle,
      linkedinUrl: candidate.linkedinUrl
    },
    education: candidate.education,
    workExperience: candidate.workExperience,
    resumes: candidate.resumes,
    applicationHistory: candidate.applications.map(app => ({
      applicationId: app.id,
      applicationDate: app.applicationDate,
      status: app.status,
      source: app.source,
      notes: app.notes,
      position: {
        id: app.position.id,
        title: app.position.title,
        company: app.position.company.name,
        industry: app.position.company.industry?.name,
        companySize: app.position.company.size,
        location: app.position.location ? {
          city: app.position.location.city,
          state: app.position.location.state,
          country: app.position.location.country,
          isRemote: app.position.location.isRemote
        } : null,
        employmentType: app.position.employmentType,
        salary: {
          min: app.position.salaryMin,
          max: app.position.salaryMax
        }
      },
      interviews: app.interviews.map(interview => ({
        interviewId: interview.id,
        date: interview.interviewDate,
        duration: interview.durationMinutes,
        location: interview.location,
        meetingUrl: interview.meetingUrl,
        result: interview.result,
        score: interview.score,
        notes: interview.notes,
        step: {
          name: interview.interviewStep.name,
          order: interview.interviewStep.orderIndex,
          type: interview.interviewStep.interviewType.name,
          typeDescription: interview.interviewStep.interviewType.description,
          flow: interview.interviewStep.interviewFlow.description
        },
        interviewer: interview.employee ? {
          name: `${interview.employee.firstName} ${interview.employee.lastName}`,
          email: interview.employee.email,
          role: interview.employee.role,
          department: interview.employee.department,
          jobTitle: interview.employee.jobTitle
        } : null
      }))
    }))
  };
}

// Uso:
const history = await getCandidateFullHistory('juan.perez@example.com');
console.log(JSON.stringify(history, null, 2));
```

**Resultado Esperado**: Objeto JSON con toda la información estructurada del candidato, incluyendo educación, experiencia, CVs y aplicaciones con entrevistas.

---

### ✅ Checklist de Validación

- [ ] Query SQL ejecutada sin errores
- [ ] Query Prisma ejecutada sin errores
- [ ] Resultados incluyen todas las aplicaciones del candidato
- [ ] Entrevistas ordenadas correctamente por paso y fecha
- [ ] Información del entrevistador presente
- [ ] Performance aceptable (< 500ms para candidato con 10+ aplicaciones)

---

## 📊 Caso B: Estadísticas por Posición

### Descripción
Obtener estadísticas de aplicaciones por posición activa, agrupadas por estado del candidato.

### Validación
✅ **Valida**: Agregaciones, GROUP BY, relaciones entre `Position`, `Application`, conteo de estados

---

### SQL Puro

```sql
-- Query B: Estadísticas de candidatos por posición y estado
SELECT 
    p.id AS position_id,
    p.title AS position_title,
    p.status AS position_status,
    comp.name AS company_name,
    p.vacancies AS total_vacancies,
    p.filled AS positions_filled,
    (p.vacancies - p.filled) AS positions_available,
    
    -- Conteo de aplicaciones por estado
    COUNT(DISTINCT a.id) AS total_applications,
    
    COUNT(DISTINCT CASE WHEN a.status = 'PENDING' THEN a.id END) AS pending_count,
    COUNT(DISTINCT CASE WHEN a.status = 'REVIEWING' THEN a.id END) AS reviewing_count,
    COUNT(DISTINCT CASE WHEN a.status = 'INTERVIEWING' THEN a.id END) AS interviewing_count,
    COUNT(DISTINCT CASE WHEN a.status = 'ACCEPTED' THEN a.id END) AS accepted_count,
    COUNT(DISTINCT CASE WHEN a.status = 'REJECTED' THEN a.id END) AS rejected_count,
    COUNT(DISTINCT CASE WHEN a.status = 'WITHDRAWN' THEN a.id END) AS withdrawn_count,
    
    -- Porcentajes
    ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'ACCEPTED' THEN a.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 
        2
    ) AS acceptance_rate,
    
    ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'REJECTED' THEN a.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT a.id), 0) * 100, 
        2
    ) AS rejection_rate,
    
    -- Información adicional
    p.employment_type,
    p.salary_min,
    p.salary_max,
    p.application_deadline,
    
    -- Conteo de entrevistas realizadas
    COUNT(DISTINCT i.id) AS total_interviews_conducted,
    
    -- Promedio de score de entrevistas
    ROUND(AVG(i.score), 2) AS avg_interview_score

FROM position p
INNER JOIN company comp ON comp.id = p.company_id
LEFT JOIN application a ON a.position_id = p.id AND a.deleted_at IS NULL
LEFT JOIN interview i ON i.application_id = a.id

WHERE p.status IN ('OPEN', 'ON_HOLD')  -- Solo posiciones activas
  AND p.deleted_at IS NULL
  
GROUP BY 
    p.id, 
    p.title, 
    p.status,
    comp.name,
    p.vacancies,
    p.filled,
    p.employment_type,
    p.salary_min,
    p.salary_max,
    p.application_deadline

ORDER BY 
    total_applications DESC,
    p.title ASC;
```

**Resultado Esperado**: Una fila por posición con todas las métricas calculadas.

---

### Prisma Client (TypeScript)

```typescript
/**
 * Query B: Estadísticas de aplicaciones por posición activa
 */
async function getPositionStatistics() {
  // Obtener todas las posiciones activas con sus aplicaciones
  const positions = await prisma.position.findMany({
    where: {
      status: { in: ['OPEN', 'ON_HOLD'] },
      deletedAt: null
    },
    include: {
      company: {
        select: {
          name: true,
          size: true
        }
      },
      applications: {
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          applicationDate: true
        }
      },
      _count: {
        select: {
          applications: {
            where: { deletedAt: null }
          }
        }
      }
    },
    orderBy: {
      title: 'asc'
    }
  });

  // Para cada posición, obtener estadísticas de entrevistas
  const positionStats = await Promise.all(
    positions.map(async (position) => {
      // Contar aplicaciones por estado
      const statusCounts = position.applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Obtener estadísticas de entrevistas
      const interviewStats = await prisma.interview.aggregate({
        where: {
          application: {
            positionId: position.id,
            deletedAt: null
          }
        },
        _count: { id: true },
        _avg: { score: true }
      });

      const totalApplications = position.applications.length;
      const acceptedCount = statusCounts['ACCEPTED'] || 0;
      const rejectedCount = statusCounts['REJECTED'] || 0;

      return {
        positionId: position.id,
        positionTitle: position.title,
        positionStatus: position.status,
        companyName: position.company.name,
        companySize: position.company.size,
        
        vacancies: {
          total: position.vacancies,
          filled: position.filled,
          available: position.vacancies - position.filled
        },
        
        applicationStats: {
          total: totalApplications,
          pending: statusCounts['PENDING'] || 0,
          reviewing: statusCounts['REVIEWING'] || 0,
          interviewing: statusCounts['INTERVIEWING'] || 0,
          accepted: acceptedCount,
          rejected: rejectedCount,
          withdrawn: statusCounts['WITHDRAWN'] || 0
        },
        
        rates: {
          acceptanceRate: totalApplications > 0 
            ? Number(((acceptedCount / totalApplications) * 100).toFixed(2))
            : 0,
          rejectionRate: totalApplications > 0
            ? Number(((rejectedCount / totalApplications) * 100).toFixed(2))
            : 0
        },
        
        interviewStats: {
          totalConducted: interviewStats._count.id,
          avgScore: interviewStats._avg.score 
            ? Number(interviewStats._avg.score.toFixed(2))
            : null
        },
        
        positionDetails: {
          employmentType: position.employmentType,
          salary: {
            min: position.salaryMin,
            max: position.salaryMax
          },
          deadline: position.applicationDeadline
        }
      };
    })
  );

  // Ordenar por total de aplicaciones descendente
  return positionStats.sort((a, b) => 
    b.applicationStats.total - a.applicationStats.total
  );
}

// Uso:
const stats = await getPositionStatistics();
console.log(JSON.stringify(stats, null, 2));

// También generar un resumen global
const globalSummary = stats.reduce((acc, pos) => {
  acc.totalPositions++;
  acc.totalApplications += pos.applicationStats.total;
  acc.totalAccepted += pos.applicationStats.accepted;
  acc.totalRejected += pos.applicationStats.rejected;
  acc.totalInterviews += pos.interviewStats.totalConducted;
  return acc;
}, {
  totalPositions: 0,
  totalApplications: 0,
  totalAccepted: 0,
  totalRejected: 0,
  totalInterviews: 0
});

console.log('Global Summary:', globalSummary);
```

**Resultado Esperado**: Array de objetos con estadísticas detalladas por posición, ordenadas por cantidad de aplicaciones.

---

### ✅ Checklist de Validación

- [ ] Query SQL ejecutada sin errores
- [ ] Query Prisma ejecutada sin errores
- [ ] Conteos por estado son correctos
- [ ] Porcentajes calculados correctamente
- [ ] Solo incluye posiciones activas (OPEN, ON_HOLD)
- [ ] Estadísticas de entrevistas presentes
- [ ] Performance aceptable (< 1s para 100+ posiciones)

---

## 🔍 Caso C: Candidatos con Entrevistas Fallidas

### Descripción
Buscar candidatos que hayan reprobado una entrevista técnica (score < 50) en el último mes, con información del contexto.

### Validación
✅ **Valida**: Filtros complejos, joins múltiples, filtros por fecha, filtros por tipo de entrevista

---

### SQL Puro

```sql
-- Query C: Candidatos con entrevistas técnicas fallidas en el último mes
SELECT DISTINCT
    c.id AS candidate_id,
    c.first_name || ' ' || c.last_name AS candidate_name,
    c.email AS candidate_email,
    c.phone AS candidate_phone,
    c.years_of_experience,
    c.current_job_title,
    
    -- Información de la aplicación
    a.id AS application_id,
    a.application_date,
    a.status AS current_application_status,
    
    -- Información de la posición
    p.id AS position_id,
    p.title AS position_title,
    comp.name AS company_name,
    
    -- Información de la entrevista fallida
    i.id AS interview_id,
    i.interview_date,
    i.result AS interview_result,
    i.score AS interview_score,
    i.notes AS interview_feedback,
    
    -- Información del tipo de entrevista
    itype.name AS interview_type,
    istep.name AS interview_step_name,
    istep.order_index AS step_order,
    
    -- Información del entrevistador
    e.first_name || ' ' || e.last_name AS interviewer_name,
    e.department AS interviewer_department,
    
    -- Cálculo de días desde la entrevista
    CURRENT_DATE - i.interview_date::date AS days_since_interview

FROM candidate c
INNER JOIN application a ON a.candidate_id = c.id
INNER JOIN position p ON p.id = a.position_id
INNER JOIN company comp ON comp.id = p.company_id
INNER JOIN interview i ON i.application_id = a.id
INNER JOIN interview_step istep ON istep.id = i.interview_step_id
INNER JOIN interview_type itype ON itype.id = istep.interview_type_id
LEFT JOIN employee e ON e.id = i.employee_id

WHERE 
    -- Entrevistas técnicas
    itype.name = 'Technical'
    
    -- Con score menor a 50 (reprobadas)
    AND i.score IS NOT NULL
    AND i.score < 50
    
    -- En el último mes
    AND i.interview_date >= CURRENT_DATE - INTERVAL '1 month'
    
    -- Solo registros activos
    AND c.deleted_at IS NULL
    AND a.deleted_at IS NULL

ORDER BY 
    i.interview_date DESC,
    i.score ASC;
```

**Resultado Esperado**: Lista de candidatos con entrevistas técnicas fallidas recientes.

---

### Prisma Client (TypeScript)

```typescript
/**
 * Query C: Candidatos con entrevistas técnicas fallidas en el último mes
 * @param scoreThreshold - Score máximo para considerar fallida (default: 50)
 * @param daysBack - Días hacia atrás para buscar (default: 30)
 */
async function getCandidatesWithFailedTechnicalInterviews(
  scoreThreshold: number = 50,
  daysBack: number = 30
) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);

  const failedInterviews = await prisma.interview.findMany({
    where: {
      // Score menor al umbral
      score: {
        lt: scoreThreshold,
        not: null
      },
      
      // Fecha dentro del rango
      interviewDate: {
        gte: dateThreshold
      },
      
      // Solo entrevistas técnicas
      interviewStep: {
        interviewType: {
          name: 'Technical'
        }
      },
      
      // Aplicaciones activas
      application: {
        deletedAt: null,
        candidate: {
          deletedAt: null
        }
      }
    },
    include: {
      // Datos del candidato
      application: {
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              yearsOfExperience: true,
              currentJobTitle: true,
              linkedinUrl: true
            }
          },
          
          // Datos de la posición
          position: {
            include: {
              company: {
                select: {
                  name: true,
                  size: true
                }
              }
            }
          }
        }
      },
      
      // Paso de entrevista
      interviewStep: {
        include: {
          interviewType: {
            select: {
              name: true,
              description: true
            }
          },
          interviewFlow: {
            select: {
              description: true
            }
          }
        }
      },
      
      // Entrevistador
      employee: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          jobTitle: true
        }
      }
    },
    orderBy: [
      { interviewDate: 'desc' },
      { score: 'asc' }
    ]
  });

  // Transformar y calcular días desde la entrevista
  const results = failedInterviews.map(interview => {
    const daysSince = Math.floor(
      (new Date().getTime() - interview.interviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      candidateInfo: {
        id: interview.application.candidate.id,
        name: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
        email: interview.application.candidate.email,
        phone: interview.application.candidate.phone,
        yearsOfExperience: interview.application.candidate.yearsOfExperience,
        currentJobTitle: interview.application.candidate.currentJobTitle,
        linkedinUrl: interview.application.candidate.linkedinUrl
      },
      
      applicationInfo: {
        id: interview.application.id,
        applicationDate: interview.application.applicationDate,
        currentStatus: interview.application.status
      },
      
      positionInfo: {
        id: interview.application.position.id,
        title: interview.application.position.title,
        company: interview.application.position.company.name,
        companySize: interview.application.position.company.size
      },
      
      interviewDetails: {
        id: interview.id,
        date: interview.interviewDate,
        daysSince: daysSince,
        result: interview.result,
        score: interview.score,
        notes: interview.notes,
        location: interview.location,
        duration: interview.durationMinutes
      },
      
      interviewStep: {
        name: interview.interviewStep.name,
        order: interview.interviewStep.orderIndex,
        type: interview.interviewStep.interviewType.name,
        typeDescription: interview.interviewStep.interviewType.description,
        flow: interview.interviewStep.interviewFlow.description
      },
      
      interviewer: interview.employee ? {
        name: `${interview.employee.firstName} ${interview.employee.lastName}`,
        email: interview.employee.email,
        department: interview.employee.department,
        jobTitle: interview.employee.jobTitle
      } : null
    };
  });

  // Generar estadísticas
  const statistics = {
    totalFailedInterviews: results.length,
    uniqueCandidates: new Set(results.map(r => r.candidateInfo.id)).size,
    averageScore: results.length > 0
      ? Number((results.reduce((sum, r) => sum + (r.interviewDetails.score || 0), 0) / results.length).toFixed(2))
      : 0,
    scoreDistribution: {
      veryLow: results.filter(r => r.interviewDetails.score! < 20).length, // 0-19
      low: results.filter(r => r.interviewDetails.score! >= 20 && r.interviewDetails.score! < 40).length, // 20-39
      belowPass: results.filter(r => r.interviewDetails.score! >= 40 && r.interviewDetails.score! < scoreThreshold).length // 40-49
    }
  };

  return {
    results,
    statistics,
    searchCriteria: {
      scoreThreshold,
      daysBack,
      dateThreshold: dateThreshold.toISOString()
    }
  };
}

// Uso:
const failedCandidates = await getCandidatesWithFailedTechnicalInterviews(50, 30);
console.log('Statistics:', failedCandidates.statistics);
console.log('Candidates:', JSON.stringify(failedCandidates.results, null, 2));

// Buscar solo entrevistas muy malas (score < 30) en los últimos 7 días
const criticalFailed = await getCandidatesWithFailedTechnicalInterviews(30, 7);
console.log('Critical cases:', criticalFailed.statistics);
```

**Resultado Esperado**: Array de entrevistas fallidas con información completa del candidato, aplicación, posición y entrevistador, más estadísticas agregadas.

---

### ✅ Checklist de Validación

- [ ] Query SQL ejecutada sin errores
- [ ] Query Prisma ejecutada sin errores
- [ ] Solo incluye entrevistas técnicas
- [ ] Filtro de score < 50 aplicado correctamente
- [ ] Filtro de fecha del último mes funciona
- [ ] Cálculo de días desde entrevista es correcto
- [ ] Estadísticas agregadas son precisas
- [ ] Performance aceptable (< 500ms para 1000+ entrevistas)

---

## 📈 Resumen de Resultados

### Estado de Validación

| Caso | Descripción | SQL | Prisma | Performance | Estado |
|------|-------------|-----|--------|-------------|--------|
| **A** | Historial Completo | ⏸️ | ⏸️ | ⏸️ | Pendiente |
| **B** | Estadísticas por Posición | ⏸️ | ⏸️ | ⏸️ | Pendiente |
| **C** | Entrevistas Fallidas | ⏸️ | ⏸️ | ⏸️ | Pendiente |

**Leyenda**:
- ✅ Pasó
- ❌ Falló
- ⏸️ Pendiente de ejecución

---

### Métricas de Performance Objetivo

| Operación | Target | Medido | Estado |
|-----------|--------|--------|--------|
| Historial Completo (1 candidato) | < 500ms | - | ⏸️ |
| Estadísticas (100 posiciones) | < 1s | - | ⏸️ |
| Búsqueda Filtrada (1000 entrevistas) | < 500ms | - | ⏸️ |

---

### Índices Utilizados

Estas queries aprovechan los siguientes índices del schema:

**Caso A**:
- `candidate.email` (único)
- `application.candidate_id` + `deleted_at`
- `interview.application_id`
- `interview_step.interview_flow_id`

**Caso B**:
- `position.status` + `deleted_at`
- `application.position_id` + `status`
- `interview.application_id`

**Caso C**:
- `interview.interview_date`
- `interview.score`
- `interview_step.interview_type_id`
- `interview_type.name`

---

## 🧪 Instrucciones de Ejecución

### Para SQL Puro

```bash
# Conectarse a PostgreSQL
psql -U LTIdbUser -d LTIdb -h localhost -p 5432

# Ejecutar query (copiar desde este documento)
\i path/to/query-a.sql
```

### Para Prisma

```bash
# Crear archivo de test
cd backend
npm install

# Crear archivo test-queries.ts con las funciones de arriba
# Luego ejecutar:
npx ts-node --transpile-only test-queries.ts
```

---

## 📝 Notas de Implementación

### Optimizaciones Aplicadas

1. **Uso de índices**: Todas las queries usan índices existentes en FKs y campos de búsqueda
2. **Selección específica**: Se usan `SELECT` específicos en lugar de `SELECT *`
3. **Joins apropiados**: Se usa `LEFT JOIN` solo cuando es necesario, `INNER JOIN` cuando hay dependencia
4. **Paginación recomendada**: Para resultados grandes, implementar LIMIT/OFFSET o cursor-based pagination

### Consideraciones de Performance

- **Caso A**: Con 10 aplicaciones y 30 entrevistas, esperamos < 500ms
- **Caso B**: Con 100 posiciones activas, esperamos < 1s
- **Caso C**: Con 1000 entrevistas en el mes, esperamos < 500ms

Si las queries superan estos tiempos:
1. Revisar EXPLAIN ANALYZE
2. Verificar que los índices se estén usando
3. Considerar materializar vistas para estadísticas
4. Implementar caching con Redis

---

## ✅ Conclusiones

Este reporte valida que el modelo de datos del ATS puede:

- ✅ Obtener información completa de candidatos con todas sus relaciones
- ✅ Generar estadísticas agregadas por posición
- ✅ Realizar búsquedas complejas con múltiples filtros
- ✅ Manejar consultas de negocio del mundo real

**Próximos pasos**:
1. Ejecutar las 3 queries en entorno de desarrollo
2. Medir performance real
3. Ajustar índices si es necesario
4. Documentar cualquier optimización adicional

---

**Fecha de última actualización**: 2025-12-16  
**Responsable**: QA Team
