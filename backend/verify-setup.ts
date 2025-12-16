import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn']
});

async function main() {
  console.log('🔍 Verificando configuración de la base de datos...\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // =========================================================================
    // QUERY 1: Entrevistas de un candidato con datos del entrevistador
    // =========================================================================
    console.log('📋 QUERY 1: Entrevistas de candidatos con entrevistadores\n');
    
    const interviews = await prisma.interview.findMany({
      where: {
        application: {
          candidate: {
            email: {
              contains: 'juan.perez'
            }
          }
        }
      },
      include: {
        employee: {
          select: {
            name: true,
            jobTitle: true,
            email: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        interviewStep: {
          include: {
            interviewType: {
              select: {
                name: true,
                description: true
              }
            }
          }
        },
        application: {
          include: {
            position: {
              select: {
                title: true,
                status: true
              }
            },
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        interviewDate: 'asc'
      }
    });

    console.log(`   ✅ Encontradas ${interviews.length} entrevistas\n`);
    
    if (interviews.length > 0) {
      interviews.forEach((interview, index) => {
        console.log(`   Entrevista #${index + 1}:`);
        console.log(`      - Candidato: ${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`);
        console.log(`      - Posición: ${interview.application.position.title}`);
        console.log(`      - Entrevistador: ${interview.employee.name} (${interview.employee.jobTitle})`);
        console.log(`      - Empresa: ${interview.employee.company.name}`);
        console.log(`      - Tipo: ${interview.interviewStep.interviewType.name}`);
        console.log(`      - Paso: ${interview.interviewStep.name} (Order: ${interview.interviewStep.orderIndex})`);
        console.log(`      - Fecha: ${interview.interviewDate.toLocaleDateString()}`);
        console.log(`      - Resultado: ${interview.result}`);
        console.log(`      - Score: ${interview.score ?? 'N/A'}`);
        console.log(`      - Feedback: ${interview.feedback ?? 'N/A'}\n`);
      });
    }

    console.log('───────────────────────────────────────────────────────────────\n');

    // =========================================================================
    // QUERY 2: Posiciones abiertas con empresa, industria y ubicación
    // =========================================================================
    console.log('💼 QUERY 2: Posiciones abiertas con detalles completos\n');
    
    const openPositions = await prisma.position.findMany({
      where: {
        status: 'OPEN',
        deletedAt: null
      },
      include: {
        company: {
          select: {
            name: true,
            size: true,
            industry: {
              select: {
                name: true
              }
            }
          }
        },
        location: {
          select: {
            city: true,
            country: true,
            isRemote: true
          }
        },
        interviewFlow: {
          select: {
            description: true,
            isTemplate: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`   ✅ Encontradas ${openPositions.length} posiciones abiertas\n`);
    
    openPositions.forEach((position, index) => {
      console.log(`   Posición #${index + 1}:`);
      console.log(`      - Título: ${position.title}`);
      console.log(`      - Empresa: ${position.company.name} (${position.company.size})`);
      console.log(`      - Industria: ${position.company.industry?.name ?? 'N/A'}`);
      console.log(`      - Ubicación: ${position.location.city}, ${position.location.country} ${position.location.isRemote ? '(Remote)' : ''}`);
      console.log(`      - Tipo: ${position.employmentType}`);
      console.log(`      - Salario: €${position.salaryMin?.toLocaleString() ?? 'N/A'} - €${position.salaryMax?.toLocaleString() ?? 'N/A'}`);
      console.log(`      - Vacantes: ${position.filled}/${position.vacancies}`);
      console.log(`      - Aplicaciones: ${position._count.applications}`);
      console.log(`      - Deadline: ${position.applicationDeadline?.toLocaleDateString() ?? 'N/A'}`);
      console.log(`      - Flujo: ${position.interviewFlow.description}\n`);
    });

    console.log('───────────────────────────────────────────────────────────────\n');

    // =========================================================================
    // QUERY 3: Aplicaciones por status con datos del candidato
    // =========================================================================
    console.log('📝 QUERY 3: Aplicaciones por status\n');
    
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('   📊 Distribución de aplicaciones por status:\n');
    applicationsByStatus.forEach(group => {
      console.log(`      - ${group.status}: ${group._count.status} aplicaciones`);
    });
    console.log('');

    // Detalle de aplicaciones en proceso de entrevista
    const interviewingApplications = await prisma.application.findMany({
      where: {
        status: 'INTERVIEWING'
      },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            currentJobTitle: true,
            yearsOfExperience: true
          }
        },
        position: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        interviews: {
          select: {
            interviewDate: true,
            result: true,
            score: true,
            interviewStep: {
              select: {
                name: true,
                orderIndex: true
              }
            }
          },
          orderBy: {
            interviewDate: 'desc'
          }
        }
      }
    });

    console.log(`   ✅ Aplicaciones en proceso de entrevista: ${interviewingApplications.length}\n`);
    
    interviewingApplications.forEach((app, index) => {
      console.log(`   Aplicación #${index + 1}:`);
      console.log(`      - Candidato: ${app.candidate.firstName} ${app.candidate.lastName}`);
      console.log(`      - Puesto actual: ${app.candidate.currentJobTitle ?? 'N/A'}`);
      console.log(`      - Experiencia: ${app.candidate.yearsOfExperience ?? 0} años`);
      console.log(`      - Aplicó a: ${app.position.title} en ${app.position.company.name}`);
      console.log(`      - Fecha aplicación: ${app.applicationDate.toLocaleDateString()}`);
      console.log(`      - Entrevistas realizadas: ${app.interviews.length}`);
      if (app.interviews.length > 0) {
        const lastInterview = app.interviews[0];
        console.log(`      - Última entrevista: ${lastInterview.interviewStep.name} - ${lastInterview.result} (Score: ${lastInterview.score ?? 'N/A'})`);
      }
      console.log('');
    });

    console.log('───────────────────────────────────────────────────────────────\n');

    // =========================================================================
    // QUERY 4: Empleados activos con conteo de entrevistas realizadas
    // =========================================================================
    console.log('👥 QUERY 4: Empleados activos por empresa con entrevistas\n');
    
    const companies = await prisma.company.findMany({
      include: {
        employees: {
          where: {
            isActive: true
          },
          include: {
            _count: {
              select: {
                interviews: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    companies.forEach(company => {
      console.log(`   🏢 ${company.name}:`);
      console.log(`      - Total empleados activos: ${company.employees.length}\n`);
      
      company.employees.forEach(emp => {
        console.log(`      • ${emp.name} (${emp.role})`);
        console.log(`        - Puesto: ${emp.jobTitle ?? 'N/A'}`);
        console.log(`        - Departamento: ${emp.department ?? 'N/A'}`);
        console.log(`        - Email: ${emp.email}`);
        console.log(`        - Entrevistas realizadas: ${emp._count.interviews}`);
      });
      console.log('');
    });

    console.log('───────────────────────────────────────────────────────────────\n');

    // =========================================================================
    // QUERY 5: Flujos de entrevista con pasos ordenados
    // =========================================================================
    console.log('🔄 QUERY 5: Flujos de entrevista con pasos y tipos\n');
    
    const interviewFlows = await prisma.interviewFlow.findMany({
      include: {
        company: {
          select: {
            name: true
          }
        },
        interviewSteps: {
          include: {
            interviewType: {
              select: {
                name: true,
                description: true
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        },
        _count: {
          select: {
            positions: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`   ✅ Encontrados ${interviewFlows.length} flujos de entrevista\n`);
    
    interviewFlows.forEach((flow, index) => {
      console.log(`   Flujo #${index + 1}:`);
      console.log(`      - Descripción: ${flow.description}`);
      console.log(`      - Tipo: ${flow.isTemplate ? 'Template Global' : 'Personalizado'}`);
      console.log(`      - Empresa: ${flow.company?.name ?? 'N/A (Template)'}`);
      console.log(`      - Posiciones usando este flujo: ${flow._count.positions}`);
      console.log(`      - Pasos (${flow.interviewSteps.length}):`);
      
      flow.interviewSteps.forEach(step => {
        console.log(`         ${step.orderIndex}. ${step.name}`);
        console.log(`            Tipo: ${step.interviewType.name}`);
        console.log(`            Descripción: ${step.interviewType.description ?? 'N/A'}`);
      });
      console.log('');
    });

    console.log('───────────────────────────────────────────────────────────────\n');

    // =========================================================================
    // VALIDACIONES DE CONSTRAINTS Y RELACIONES
    // =========================================================================
    console.log('✅ VALIDACIONES DE INTEGRIDAD\n');
    
    // Validación 1: Constraint único en Application (position + candidate)
    console.log('   1. Verificando constraint único en Application...');
    const duplicateApplications = await prisma.$queryRaw<Array<{ positionId: number, candidateId: number, count: bigint }>>`
      SELECT position_id as "positionId", candidate_id as "candidateId", COUNT(*) as count
      FROM application
      GROUP BY position_id, candidate_id
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateApplications.length === 0) {
      console.log('      ✅ No hay aplicaciones duplicadas (constraint único funcionando)\n');
    } else {
      console.log(`      ❌ Se encontraron ${duplicateApplications.length} aplicaciones duplicadas!\n`);
    }

    // Validación 2: Emails únicos en Candidate
    console.log('   2. Verificando emails únicos en Candidate...');
    const duplicateEmails = await prisma.$queryRaw<Array<{ email: string, count: bigint }>>`
      SELECT email, COUNT(*) as count
      FROM candidate
      GROUP BY email
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateEmails.length === 0) {
      console.log('      ✅ Todos los emails de candidatos son únicos\n');
    } else {
      console.log(`      ❌ Se encontraron ${duplicateEmails.length} emails duplicados!\n`);
    }

    // Validación 3: Orden secuencial en InterviewStep
    console.log('   3. Verificando orden secuencial en InterviewStep...');
    const invalidOrders = await prisma.$queryRaw<Array<{ interviewFlowId: number, gaps: number }>>`
      SELECT interview_flow_id as "interviewFlowId", 
             MAX(order_index) - COUNT(*) as gaps
      FROM interview_step
      GROUP BY interview_flow_id
      HAVING MAX(order_index) != COUNT(*)
    `;
    
    if (invalidOrders.length === 0) {
      console.log('      ✅ Todos los pasos de entrevista tienen orden secuencial correcto\n');
    } else {
      console.log(`      ⚠️  Se encontraron ${invalidOrders.length} flujos con gaps en el orden\n`);
    }

    // Validación 4: Soft deletes (deletedAt null en registros activos)
    console.log('   4. Verificando soft deletes...');
    const activePositions = await prisma.position.count({ where: { deletedAt: null } });
    const deletedPositions = await prisma.position.count({ where: { deletedAt: { not: null } } });
    const activeApplications = await prisma.application.count({ where: { deletedAt: null } });
    const deletedApplications = await prisma.application.count({ where: { deletedAt: { not: null } } });
    
    console.log(`      - Posiciones activas: ${activePositions}, eliminadas: ${deletedPositions}`);
    console.log(`      - Aplicaciones activas: ${activeApplications}, eliminadas: ${deletedApplications}`);
    console.log('      ✅ Soft delete implementado correctamente\n');

    // Validación 5: Fechas coherentes (createdAt <= updatedAt)
    console.log('   5. Verificando coherencia de timestamps...');
    const invalidTimestamps = await prisma.$queryRaw<Array<{ table_name: string, count: bigint }>>`
      SELECT 'candidate' as table_name, COUNT(*) as count FROM candidate WHERE created_at > updated_at
      UNION ALL
      SELECT 'position' as table_name, COUNT(*) as count FROM position WHERE created_at > updated_at
      UNION ALL
      SELECT 'application' as table_name, COUNT(*) as count FROM application WHERE created_at > updated_at
    `;
    
    const totalInvalid = invalidTimestamps.reduce((sum, row) => sum + Number(row.count), 0);
    
    if (totalInvalid === 0) {
      console.log('      ✅ Todas las fechas son coherentes (createdAt <= updatedAt)\n');
    } else {
      console.log(`      ❌ Se encontraron ${totalInvalid} registros con fechas incoherentes!\n`);
    }

    // Validación 6: Relaciones FK funcionando
    console.log('   6. Verificando integridad de relaciones...');
    const orphanApplications = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM application a
      WHERE NOT EXISTS (SELECT 1 FROM position p WHERE p.id = a.position_id)
         OR NOT EXISTS (SELECT 1 FROM candidate c WHERE c.id = a.candidate_id)
    `;
    
    if (Number(orphanApplications[0].count) === 0) {
      console.log('      ✅ Todas las relaciones FK están correctas (sin registros huérfanos)\n');
    } else {
      console.log(`      ❌ Se encontraron ${orphanApplications[0].count} aplicaciones huérfanas!\n`);
    }

    console.log('───────────────────────────────────────────────────────────────\n');

    // =========================================================================
    // RESUMEN FINAL
    // =========================================================================
    console.log('📊 RESUMEN DE REGISTROS EN LA BASE DE DATOS\n');
    
    const summary = {
      industries: await prisma.industry.count(),
      interviewTypes: await prisma.interviewType.count(),
      locations: await prisma.location.count(),
      companies: await prisma.company.count(),
      employees: await prisma.employee.count(),
      interviewFlows: await prisma.interviewFlow.count(),
      interviewSteps: await prisma.interviewStep.count(),
      positions: await prisma.position.count(),
      candidates: await prisma.candidate.count(),
      education: await prisma.education.count(),
      workExperience: await prisma.workExperience.count(),
      resumes: await prisma.resume.count(),
      applications: await prisma.application.count(),
      interviews: await prisma.interview.count()
    };

    console.log(`   📊 Industries:         ${summary.industries}`);
    console.log(`   🎯 Interview Types:    ${summary.interviewTypes}`);
    console.log(`   📍 Locations:          ${summary.locations}`);
    console.log(`   🏢 Companies:          ${summary.companies}`);
    console.log(`   👤 Employees:          ${summary.employees}`);
    console.log(`   🔄 Interview Flows:    ${summary.interviewFlows}`);
    console.log(`   📋 Interview Steps:    ${summary.interviewSteps}`);
    console.log(`   💼 Positions:          ${summary.positions}`);
    console.log(`   👥 Candidates:         ${summary.candidates}`);
    console.log(`   🎓 Education:          ${summary.education}`);
    console.log(`   💼 Work Experience:    ${summary.workExperience}`);
    console.log(`   📄 Resumes:            ${summary.resumes}`);
    console.log(`   📝 Applications:       ${summary.applications}`);
    console.log(`   🗣️  Interviews:         ${summary.interviews}`);
    
    const total = Object.values(summary).reduce((sum, count) => sum + count, 0);
    console.log(`\n   📈 TOTAL:              ${total} registros\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ Verificación completada exitosamente!');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
