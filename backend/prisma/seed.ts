import { PrismaClient, EmployeeRole, PositionStatus, EmploymentType, ApplicationStatus, InterviewResult, FileType, CompanySize, ApplicationSource, EducationLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ============================================================================
  // 1. INDUSTRIES (10 industrias - idempotente)
  // ============================================================================
  console.log('📊 Seeding Industries...');
  const industries = [
    { name: 'Technology' },
    { name: 'Finance' },
    { name: 'Healthcare' },
    { name: 'Education' },
    { name: 'Retail' },
    { name: 'Manufacturing' },
    { name: 'Consulting' },
    { name: 'Media' },
    { name: 'Energy' },
    { name: 'Transportation' }
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { name: industry.name },
      update: {},
      create: industry
    });
  }
  console.log(`   ✅ ${industries.length} industrias creadas/actualizadas\n`);

  // ============================================================================
  // 2. INTERVIEW TYPES (5 tipos - idempotente)
  // ============================================================================
  console.log('🎯 Seeding Interview Types...');
  const interviewTypes = [
    { name: 'Technical', description: 'Technical skills assessment' },
    { name: 'HR', description: 'Human Resources interview' },
    { name: 'Cultural Fit', description: 'Company culture alignment' },
    { name: 'Behavioral', description: 'Behavioral competencies evaluation' },
    { name: 'Panel', description: 'Panel interview with multiple interviewers' }
  ];

  for (const type of interviewTypes) {
    await prisma.interviewType.upsert({
      where: { name: type.name },
      update: { description: type.description },
      create: type
    });
  }
  console.log(`   ✅ ${interviewTypes.length} tipos de entrevista creados/actualizados\n`);

  // ============================================================================
  // 3. LOCATIONS (5 ubicaciones - idempotente)
  // ============================================================================
  console.log('📍 Seeding Locations...');
  const locations = [
    { city: 'Madrid', state: 'Madrid', country: 'Spain', isRemote: false },
    { city: 'Barcelona', state: 'Catalonia', country: 'Spain', isRemote: false },
    { city: 'Remote', state: 'N/A', country: 'Global', isRemote: true },
    { city: 'Valencia', state: 'Valencia', country: 'Spain', isRemote: false },
    { city: 'Sevilla', state: 'Andalusia', country: 'Spain', isRemote: false }
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: {
        city_state_country_isRemote: {
          city: location.city,
          state: location.state,
          country: location.country,
          isRemote: location.isRemote
        }
      },
      update: {},
      create: location
    });
  }
  console.log(`   ✅ ${locations.length} ubicaciones creadas/actualizadas\n`);

  // ============================================================================
  // 4. COMPANIES (3 empresas con relaciones a Industry)
  // ============================================================================
  console.log('🏢 Seeding Companies...');
  
  const techIndustry = await prisma.industry.findUnique({ where: { name: 'Technology' } });
  const financeIndustry = await prisma.industry.findUnique({ where: { name: 'Finance' } });
  const healthIndustry = await prisma.industry.findUnique({ where: { name: 'Healthcare' } });

  const companies = [
    {
      name: 'TechCorp Solutions',
      description: 'Leading software development company specializing in AI and cloud solutions',
      website: 'https://techcorp.example.com',
      industryId: techIndustry!.id,
      size: CompanySize.LARGE,
      logoUrl: 'https://example.com/logos/techcorp.png'
    },
    {
      name: 'FinanceHub Global',
      description: 'International financial services and investment firm',
      website: 'https://financehub.example.com',
      industryId: financeIndustry!.id,
      size: CompanySize.ENTERPRISE,
      logoUrl: 'https://example.com/logos/financehub.png'
    },
    {
      name: 'HealthPlus Medical',
      description: 'Healthcare technology and telemedicine platform',
      website: 'https://healthplus.example.com',
      industryId: healthIndustry!.id,
      size: CompanySize.MEDIUM,
      logoUrl: 'https://example.com/logos/healthplus.png'
    }
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: {
        description: company.description,
        website: company.website,
        industryId: company.industryId,
        size: company.size,
        logoUrl: company.logoUrl
      },
      create: company
    });
  }
  console.log(`   ✅ ${companies.length} empresas creadas/actualizadas\n`);

  // ============================================================================
  // 5. EMPLOYEES (5 empleados por empresa = 15 total)
  // ============================================================================
  console.log('👤 Seeding Employees...');
  
  const techCorp = await prisma.company.findUnique({ where: { name: 'TechCorp Solutions' } });
  const financeHub = await prisma.company.findUnique({ where: { name: 'FinanceHub Global' } });
  const healthPlus = await prisma.company.findUnique({ where: { name: 'HealthPlus Medical' } });

  const employees = [
    // TechCorp
    { companyId: techCorp!.id, name: 'Ana García', email: 'ana.garcia@techcorp.com', phone: '+34 600 111 111', jobTitle: 'CTO', department: 'Engineering', role: EmployeeRole.ADMIN, isActive: true },
    { companyId: techCorp!.id, name: 'Carlos Ruiz', email: 'carlos.ruiz@techcorp.com', phone: '+34 600 222 222', jobTitle: 'HR Manager', department: 'Human Resources', role: EmployeeRole.RECRUITER, isActive: true },
    { companyId: techCorp!.id, name: 'Laura Martínez', email: 'laura.martinez@techcorp.com', phone: '+34 600 333 333', jobTitle: 'Senior Developer', department: 'Engineering', role: EmployeeRole.INTERVIEWER, isActive: true },
    { companyId: techCorp!.id, name: 'Pedro Sánchez', email: 'pedro.sanchez@techcorp.com', phone: '+34 600 444 444', jobTitle: 'Engineering Manager', department: 'Engineering', role: EmployeeRole.MANAGER, isActive: true },
    { companyId: techCorp!.id, name: 'María López', email: 'maria.lopez@techcorp.com', phone: '+34 600 555 555', jobTitle: 'Tech Lead', department: 'Engineering', role: EmployeeRole.INTERVIEWER, isActive: true },
    
    // FinanceHub
    { companyId: financeHub!.id, name: 'David Torres', email: 'david.torres@financehub.com', phone: '+34 600 666 666', jobTitle: 'CFO', department: 'Finance', role: EmployeeRole.ADMIN, isActive: true },
    { companyId: financeHub!.id, name: 'Elena Fernández', email: 'elena.fernandez@financehub.com', phone: '+34 600 777 777', jobTitle: 'Talent Acquisition', department: 'HR', role: EmployeeRole.RECRUITER, isActive: true },
    { companyId: financeHub!.id, name: 'Jorge Moreno', email: 'jorge.moreno@financehub.com', phone: '+34 600 888 888', jobTitle: 'Senior Analyst', department: 'Analysis', role: EmployeeRole.INTERVIEWER, isActive: true },
    { companyId: financeHub!.id, name: 'Isabel Romero', email: 'isabel.romero@financehub.com', phone: '+34 600 999 999', jobTitle: 'Department Manager', department: 'Operations', role: EmployeeRole.MANAGER, isActive: true },
    { companyId: financeHub!.id, name: 'Roberto Díaz', email: 'roberto.diaz@financehub.com', phone: '+34 600 101 010', jobTitle: 'Risk Manager', department: 'Risk', role: EmployeeRole.INTERVIEWER, isActive: true },
    
    // HealthPlus
    { companyId: healthPlus!.id, name: 'Carmen Jiménez', email: 'carmen.jimenez@healthplus.com', phone: '+34 600 111 222', jobTitle: 'CEO', department: 'Executive', role: EmployeeRole.ADMIN, isActive: true },
    { companyId: healthPlus!.id, name: 'Francisco Núñez', email: 'francisco.nunez@healthplus.com', phone: '+34 600 222 333', jobTitle: 'HR Lead', department: 'HR', role: EmployeeRole.RECRUITER, isActive: true },
    { companyId: healthPlus!.id, name: 'Sofía Herrera', email: 'sofia.herrera@healthplus.com', phone: '+34 600 333 444', jobTitle: 'Product Manager', department: 'Product', role: EmployeeRole.INTERVIEWER, isActive: true },
    { companyId: healthPlus!.id, name: 'Miguel Ángel Vargas', email: 'miguel.vargas@healthplus.com', phone: '+34 600 444 555', jobTitle: 'Tech Director', department: 'Technology', role: EmployeeRole.MANAGER, isActive: true },
    { companyId: healthPlus!.id, name: 'Patricia Castro', email: 'patricia.castro@healthplus.com', phone: '+34 600 555 666', jobTitle: 'UX Lead', department: 'Design', role: EmployeeRole.INTERVIEWER, isActive: true }
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {
        name: employee.name,
        phone: employee.phone,
        jobTitle: employee.jobTitle,
        department: employee.department,
        role: employee.role,
        isActive: employee.isActive
      },
      create: employee
    });
  }
  console.log(`   ✅ ${employees.length} empleados creados/actualizados\n`);

  // ============================================================================
  // 6. INTERVIEW FLOWS (3 flujos: 1 template + 2 personalizados)
  // ============================================================================
  console.log('🔄 Seeding Interview Flows...');
  
  const flows = [
    { companyId: null, description: 'Standard 3-Stage Interview Process (Template)', isTemplate: true },
    { companyId: techCorp!.id, description: 'TechCorp Software Engineering Interview', isTemplate: false },
    { companyId: financeHub!.id, description: 'FinanceHub Analyst Interview Process', isTemplate: false }
  ];

  const createdFlows = [];
  for (const flow of flows) {
    const created = await prisma.interviewFlow.upsert({
      where: {
        id: createdFlows.length + 1 // Usamos ID secuencial para upsert
      },
      update: {},
      create: flow
    });
    createdFlows.push(created);
  }
  console.log(`   ✅ ${createdFlows.length} flujos de entrevista creados/actualizados\n`);

  // ============================================================================
  // 7. INTERVIEW STEPS (pasos por cada flujo)
  // ============================================================================
  console.log('📋 Seeding Interview Steps...');
  
  const technicalType = await prisma.interviewType.findUnique({ where: { name: 'Technical' } });
  const hrType = await prisma.interviewType.findUnique({ where: { name: 'HR' } });
  const culturalType = await prisma.interviewType.findUnique({ where: { name: 'Cultural Fit' } });
  const behavioralType = await prisma.interviewType.findUnique({ where: { name: 'Behavioral' } });

  const steps = [
    // Template Flow Steps
    { interviewFlowId: createdFlows[0].id, interviewTypeId: hrType!.id, name: 'Initial HR Screening', orderIndex: 1 },
    { interviewFlowId: createdFlows[0].id, interviewTypeId: technicalType!.id, name: 'Technical Assessment', orderIndex: 2 },
    { interviewFlowId: createdFlows[0].id, interviewTypeId: culturalType!.id, name: 'Culture Fit Interview', orderIndex: 3 },
    
    // TechCorp Flow Steps
    { interviewFlowId: createdFlows[1].id, interviewTypeId: hrType!.id, name: 'HR Pre-screening', orderIndex: 1 },
    { interviewFlowId: createdFlows[1].id, interviewTypeId: technicalType!.id, name: 'Coding Challenge', orderIndex: 2 },
    { interviewFlowId: createdFlows[1].id, interviewTypeId: technicalType!.id, name: 'System Design Interview', orderIndex: 3 },
    { interviewFlowId: createdFlows[1].id, interviewTypeId: behavioralType!.id, name: 'Team Fit Interview', orderIndex: 4 },
    
    // FinanceHub Flow Steps
    { interviewFlowId: createdFlows[2].id, interviewTypeId: hrType!.id, name: 'Initial Contact', orderIndex: 1 },
    { interviewFlowId: createdFlows[2].id, interviewTypeId: technicalType!.id, name: 'Case Study Analysis', orderIndex: 2 },
    { interviewFlowId: createdFlows[2].id, interviewTypeId: culturalType!.id, name: 'Values Alignment', orderIndex: 3 }
  ];

  for (const step of steps) {
    await prisma.interviewStep.upsert({
      where: {
        interviewFlowId_orderIndex: {
          interviewFlowId: step.interviewFlowId,
          orderIndex: step.orderIndex
        }
      },
      update: {
        name: step.name,
        interviewTypeId: step.interviewTypeId
      },
      create: step
    });
  }
  console.log(`   ✅ ${steps.length} pasos de entrevista creados/actualizados\n`);

  // ============================================================================
  // 8. POSITIONS (5 posiciones abiertas)
  // ============================================================================
  console.log('💼 Seeding Positions...');
  
  const madridLocation = await prisma.location.findFirst({ where: { city: 'Madrid' } });
  const remoteLocation = await prisma.location.findFirst({ where: { city: 'Remote' } });
  const barcelonaLocation = await prisma.location.findFirst({ where: { city: 'Barcelona' } });

  const positions = [
    {
      companyId: techCorp!.id,
      title: 'Senior Full Stack Developer',
      locationId: madridLocation!.id,
      interviewFlowId: createdFlows[1].id,
      jobDescription: 'We are looking for an experienced Full Stack Developer to join our team...',
      status: PositionStatus.OPEN,
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 50000,
      salaryMax: 70000,
      vacancies: 2,
      filled: 0,
      isVisible: true,
      applicationDeadline: new Date('2025-03-31')
    },
    {
      companyId: techCorp!.id,
      title: 'DevOps Engineer',
      locationId: remoteLocation!.id,
      interviewFlowId: createdFlows[1].id,
      jobDescription: 'Join our infrastructure team to build scalable cloud solutions...',
      status: PositionStatus.OPEN,
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 55000,
      salaryMax: 75000,
      vacancies: 1,
      filled: 0,
      isVisible: true,
      applicationDeadline: new Date('2025-04-15')
    },
    {
      companyId: financeHub!.id,
      title: 'Data Analyst',
      locationId: barcelonaLocation!.id,
      interviewFlowId: createdFlows[2].id,
      jobDescription: 'Analyze financial data and provide insights to drive business decisions...',
      status: PositionStatus.OPEN,
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 40000,
      salaryMax: 55000,
      vacancies: 1,
      filled: 0,
      isVisible: true,
      applicationDeadline: new Date('2025-03-20')
    },
    {
      companyId: financeHub!.id,
      title: 'Junior Financial Consultant',
      locationId: madridLocation!.id,
      interviewFlowId: createdFlows[2].id,
      jobDescription: 'Entry-level position for recent graduates in finance...',
      status: PositionStatus.OPEN,
      employmentType: EmploymentType.CONTRACT,
      salaryMin: 30000,
      salaryMax: 40000,
      vacancies: 3,
      filled: 1,
      isVisible: true,
      applicationDeadline: new Date('2025-02-28')
    },
    {
      companyId: healthPlus!.id,
      title: 'Product Manager - Healthcare Tech',
      locationId: remoteLocation!.id,
      interviewFlowId: createdFlows[0].id,
      jobDescription: 'Lead product development for our telemedicine platform...',
      status: PositionStatus.OPEN,
      employmentType: EmploymentType.FULL_TIME,
      salaryMin: 60000,
      salaryMax: 80000,
      vacancies: 1,
      filled: 0,
      isVisible: true,
      applicationDeadline: new Date('2025-05-01')
    }
  ];

  const createdPositions = [];
  for (const position of positions) {
    // Buscamos por título y empresa para upsert
    const existing = await prisma.position.findFirst({
      where: {
        title: position.title,
        companyId: position.companyId
      }
    });

    if (existing) {
      const updated = await prisma.position.update({
        where: { id: existing.id },
        data: position
      });
      createdPositions.push(updated);
    } else {
      const created = await prisma.position.create({ data: position });
      createdPositions.push(created);
    }
  }
  console.log(`   ✅ ${createdPositions.length} posiciones creadas/actualizadas\n`);

  // ============================================================================
  // 9. CANDIDATES (10 candidatos)
  // ============================================================================
  console.log('👥 Seeding Candidates...');
  
  const candidates = [
    { firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@example.com', phone: '+34 611 111 111', linkedinUrl: 'https://linkedin.com/in/juanperez', portfolioUrl: 'https://juanperez.dev', currentJobTitle: 'Software Developer', yearsOfExperience: 5 },
    { firstName: 'María', lastName: 'González', email: 'maria.gonzalez@example.com', phone: '+34 622 222 222', linkedinUrl: 'https://linkedin.com/in/mariagonzalez', portfolioUrl: null, currentJobTitle: 'Full Stack Developer', yearsOfExperience: 4 },
    { firstName: 'Luis', lastName: 'Rodríguez', email: 'luis.rodriguez@example.com', phone: '+34 633 333 333', linkedinUrl: 'https://linkedin.com/in/luisrodriguez', portfolioUrl: 'https://github.com/luisrodriguez', currentJobTitle: 'DevOps Engineer', yearsOfExperience: 6 },
    { firstName: 'Ana', lastName: 'Martín', email: 'ana.martin@example.com', phone: '+34 644 444 444', linkedinUrl: 'https://linkedin.com/in/anamartin', portfolioUrl: null, currentJobTitle: 'Data Analyst', yearsOfExperience: 3 },
    { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@example.com', phone: '+34 655 555 555', linkedinUrl: 'https://linkedin.com/in/carloslopez', portfolioUrl: 'https://carloslopez.com', currentJobTitle: 'Senior Developer', yearsOfExperience: 8 },
    { firstName: 'Elena', lastName: 'Sánchez', email: 'elena.sanchez@example.com', phone: '+34 666 666 666', linkedinUrl: 'https://linkedin.com/in/elenasanchez', portfolioUrl: null, currentJobTitle: 'Product Manager', yearsOfExperience: 5 },
    { firstName: 'David', lastName: 'Ramírez', email: 'david.ramirez@example.com', phone: '+34 677 777 777', linkedinUrl: 'https://linkedin.com/in/davidramirez', portfolioUrl: 'https://github.com/davidramirez', currentJobTitle: 'Junior Developer', yearsOfExperience: 1 },
    { firstName: 'Laura', lastName: 'Torres', email: 'laura.torres@example.com', phone: '+34 688 888 888', linkedinUrl: 'https://linkedin.com/in/lauratorres', portfolioUrl: null, currentJobTitle: 'Financial Analyst', yearsOfExperience: 2 },
    { firstName: 'Miguel', lastName: 'Flores', email: 'miguel.flores@example.com', phone: '+34 699 999 999', linkedinUrl: 'https://linkedin.com/in/miguelflores', portfolioUrl: 'https://miguelflores.dev', currentJobTitle: 'Backend Developer', yearsOfExperience: 4 },
    { firstName: 'Sara', lastName: 'Ruiz', email: 'sara.ruiz@example.com', phone: '+34 600 000 000', linkedinUrl: 'https://linkedin.com/in/sararuiz', portfolioUrl: null, currentJobTitle: 'UX Designer', yearsOfExperience: 3 }
  ];

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { email: candidate.email },
      update: candidate,
      create: candidate
    });
  }
  console.log(`   ✅ ${candidates.length} candidatos creados/actualizados\n`);

  // ============================================================================
  // 10. EDUCATION (1-2 registros por candidato = 15 total)
  // ============================================================================
  console.log('🎓 Seeding Education...');
  
  const allCandidates = await prisma.candidate.findMany();
  
  const educationRecords = [
    { candidateId: allCandidates[0].id, level: EducationLevel.BACHELOR, degree: 'Computer Science', institution: 'Universidad Complutense', startDate: new Date('2015-09-01'), endDate: new Date('2019-06-30') },
    { candidateId: allCandidates[0].id, level: EducationLevel.MASTER, degree: 'Software Engineering', institution: 'Universidad Politécnica', startDate: new Date('2019-09-01'), endDate: new Date('2021-06-30') },
    
    { candidateId: allCandidates[1].id, level: EducationLevel.BACHELOR, degree: 'Information Technology', institution: 'Universidad de Barcelona', startDate: new Date('2016-09-01'), endDate: new Date('2020-06-30') },
    
    { candidateId: allCandidates[2].id, level: EducationLevel.BACHELOR, degree: 'Computer Engineering', institution: 'Universidad Politécnica de Madrid', startDate: new Date('2013-09-01'), endDate: new Date('2017-06-30') },
    { candidateId: allCandidates[2].id, level: EducationLevel.MASTER, degree: 'Cloud Computing', institution: 'IE University', startDate: new Date('2018-09-01'), endDate: new Date('2019-12-31') },
    
    { candidateId: allCandidates[3].id, level: EducationLevel.BACHELOR, degree: 'Business Analytics', institution: 'ESADE', startDate: new Date('2017-09-01'), endDate: new Date('2021-06-30') },
    
    { candidateId: allCandidates[4].id, level: EducationLevel.BACHELOR, degree: 'Computer Science', institution: 'Universidad de Valencia', startDate: new Date('2011-09-01'), endDate: new Date('2015-06-30') },
    { candidateId: allCandidates[4].id, level: EducationLevel.MASTER, degree: 'Software Architecture', institution: 'Universidad Carlos III', startDate: new Date('2015-09-01'), endDate: new Date('2017-06-30') },
    
    { candidateId: allCandidates[5].id, level: EducationLevel.BACHELOR, degree: 'Business Administration', institution: 'Universidad Autónoma', startDate: new Date('2014-09-01'), endDate: new Date('2018-06-30') },
    { candidateId: allCandidates[5].id, level: EducationLevel.MASTER, degree: 'Product Management', institution: 'IESE', startDate: new Date('2019-09-01'), endDate: new Date('2020-12-31') },
    
    { candidateId: allCandidates[6].id, level: EducationLevel.BOOTCAMP, degree: 'Full Stack Web Development', institution: 'Ironhack', startDate: new Date('2023-01-01'), endDate: new Date('2023-04-30') },
    
    { candidateId: allCandidates[7].id, level: EducationLevel.BACHELOR, degree: 'Economics', institution: 'Universidad Pompeu Fabra', startDate: new Date('2019-09-01'), endDate: new Date('2023-06-30') },
    
    { candidateId: allCandidates[8].id, level: EducationLevel.BACHELOR, degree: 'Software Engineering', institution: 'Universidad de Sevilla', startDate: new Date('2016-09-01'), endDate: new Date('2020-06-30') },
    
    { candidateId: allCandidates[9].id, level: EducationLevel.BACHELOR, degree: 'Graphic Design', institution: 'Elisava', startDate: new Date('2018-09-01'), endDate: new Date('2022-06-30') },
    { candidateId: allCandidates[9].id, level: EducationLevel.MASTER, degree: 'UX/UI Design', institution: 'IED Madrid', startDate: new Date('2022-09-01'), endDate: new Date('2023-12-31') }
  ];

  let educationCount = 0;
  for (const edu of educationRecords) {
    const existing = await prisma.education.findFirst({
      where: {
        candidateId: edu.candidateId,
        degree: edu.degree,
        institution: edu.institution
      }
    });

    if (!existing) {
      await prisma.education.create({ data: edu });
      educationCount++;
    }
  }
  console.log(`   ✅ ${educationCount} registros educativos creados (total esperado: ${educationRecords.length})\n`);

  // ============================================================================
  // 11. WORK EXPERIENCE (2-3 registros por candidato = 20 total)
  // ============================================================================
  console.log('💼 Seeding Work Experience...');
  
  const workExperiences = [
    { candidateId: allCandidates[0].id, company: 'Startup Tech SL', position: 'Junior Developer', startDate: new Date('2019-07-01'), endDate: new Date('2021-12-31'), description: 'Full stack development' },
    { candidateId: allCandidates[0].id, company: 'Digital Solutions', position: 'Software Developer', startDate: new Date('2022-01-01'), endDate: null, description: 'Backend development with Node.js' },
    
    { candidateId: allCandidates[1].id, company: 'WebAgency', position: 'Frontend Developer', startDate: new Date('2020-07-01'), endDate: new Date('2023-06-30'), description: 'React and Vue.js development' },
    { candidateId: allCandidates[1].id, company: 'TechCompany', position: 'Full Stack Developer', startDate: new Date('2023-07-01'), endDate: null, description: 'MERN stack development' },
    
    { candidateId: allCandidates[2].id, company: 'CloudServices SA', position: 'Junior DevOps', startDate: new Date('2017-07-01'), endDate: new Date('2019-12-31'), description: 'AWS infrastructure' },
    { candidateId: allCandidates[2].id, company: 'Infrastructure Corp', position: 'DevOps Engineer', startDate: new Date('2020-01-01'), endDate: new Date('2023-06-30'), description: 'Kubernetes and Docker' },
    { candidateId: allCandidates[2].id, company: 'TechGiant', position: 'Senior DevOps', startDate: new Date('2023-07-01'), endDate: null, description: 'Cloud architecture and CI/CD' },
    
    { candidateId: allCandidates[3].id, company: 'Analytics Firm', position: 'Junior Analyst', startDate: new Date('2021-07-01'), endDate: new Date('2023-12-31'), description: 'Data analysis with Python' },
    { candidateId: allCandidates[3].id, company: 'DataCo', position: 'Data Analyst', startDate: new Date('2024-01-01'), endDate: null, description: 'Business intelligence and reporting' },
    
    { candidateId: allCandidates[4].id, company: 'Software House', position: 'Developer', startDate: new Date('2015-07-01'), endDate: new Date('2018-12-31'), description: 'Java development' },
    { candidateId: allCandidates[4].id, company: 'Enterprise Solutions', position: 'Senior Developer', startDate: new Date('2019-01-01'), endDate: new Date('2022-06-30'), description: 'Microservices architecture' },
    { candidateId: allCandidates[4].id, company: 'Tech Leader', position: 'Tech Lead', startDate: new Date('2022-07-01'), endDate: null, description: 'Team leadership and architecture' },
    
    { candidateId: allCandidates[5].id, company: 'ProductCo', position: 'Product Owner', startDate: new Date('2018-07-01'), endDate: new Date('2021-12-31'), description: 'Agile product management' },
    { candidateId: allCandidates[5].id, company: 'Innovation Labs', position: 'Product Manager', startDate: new Date('2022-01-01'), endDate: null, description: 'Product strategy and roadmap' },
    
    { candidateId: allCandidates[6].id, company: 'FreelanceWork', position: 'Web Developer', startDate: new Date('2023-05-01'), endDate: null, description: 'Freelance web development projects' },
    
    { candidateId: allCandidates[7].id, company: 'Bank SA', position: 'Financial Intern', startDate: new Date('2022-06-01'), endDate: new Date('2023-06-30'), description: 'Financial analysis internship' },
    { candidateId: allCandidates[7].id, company: 'Investment Firm', position: 'Junior Analyst', startDate: new Date('2023-07-01'), endDate: null, description: 'Investment portfolio analysis' },
    
    { candidateId: allCandidates[8].id, company: 'SoftwareDev Inc', position: 'Backend Developer', startDate: new Date('2020-07-01'), endDate: new Date('2023-12-31'), description: 'Python and Django development' },
    { candidateId: allCandidates[8].id, company: 'API Solutions', position: 'Backend Engineer', startDate: new Date('2024-01-01'), endDate: null, description: 'RESTful API development' },
    
    { candidateId: allCandidates[9].id, company: 'DesignStudio', position: 'UX Designer', startDate: new Date('2022-07-01'), endDate: null, description: 'User experience design for web and mobile' }
  ];

  let workExpCount = 0;
  for (const work of workExperiences) {
    const existing = await prisma.workExperience.findFirst({
      where: {
        candidateId: work.candidateId,
        company: work.company,
        position: work.position
      }
    });

    if (!existing) {
      await prisma.workExperience.create({ data: work });
      workExpCount++;
    }
  }
  console.log(`   ✅ ${workExpCount} experiencias laborales creadas (total esperado: ${workExperiences.length})\n`);

  // ============================================================================
  // 12. RESUMES (1 CV por candidato = 10 total)
  // ============================================================================
  console.log('📄 Seeding Resumes...');
  
  const resumes = allCandidates.map(candidate => ({
    candidateId: candidate.id,
    filePath: `/uploads/resumes/${candidate.email.split('@')[0]}_cv.pdf`,
    fileType: FileType.PDF,
    uploadDate: new Date('2024-12-01')
  }));

  let resumeCount = 0;
  for (const resume of resumes) {
    const existing = await prisma.resume.findFirst({
      where: {
        candidateId: resume.candidateId,
        filePath: resume.filePath
      }
    });

    if (!existing) {
      await prisma.resume.create({ data: resume });
      resumeCount++;
    }
  }
  console.log(`   ✅ ${resumeCount} CVs creados (total esperado: ${resumes.length})\n`);

  // ============================================================================
  // 13. APPLICATIONS (15 aplicaciones con status variados)
  // ============================================================================
  console.log('📝 Seeding Applications...');
  
  const applications = [
    { positionId: createdPositions[0].id, candidateId: allCandidates[0].id, status: ApplicationStatus.INTERVIEWING, source: ApplicationSource.LINKEDIN, applicationDate: new Date('2025-01-10') },
    { positionId: createdPositions[0].id, candidateId: allCandidates[1].id, status: ApplicationStatus.REVIEWING, source: ApplicationSource.WEBSITE, applicationDate: new Date('2025-01-12') },
    { positionId: createdPositions[0].id, candidateId: allCandidates[4].id, status: ApplicationStatus.ACCEPTED, source: ApplicationSource.REFERRAL, applicationDate: new Date('2025-01-05') },
    
    { positionId: createdPositions[1].id, candidateId: allCandidates[2].id, status: ApplicationStatus.INTERVIEWING, source: ApplicationSource.INDEED, applicationDate: new Date('2025-01-08') },
    { positionId: createdPositions[1].id, candidateId: allCandidates[8].id, status: ApplicationStatus.PENDING, source: ApplicationSource.WEBSITE, applicationDate: new Date('2025-01-15') },
    
    { positionId: createdPositions[2].id, candidateId: allCandidates[3].id, status: ApplicationStatus.INTERVIEWING, source: ApplicationSource.LINKEDIN, applicationDate: new Date('2025-01-06') },
    { positionId: createdPositions[2].id, candidateId: allCandidates[7].id, status: ApplicationStatus.REVIEWING, source: ApplicationSource.GLASSDOOR, applicationDate: new Date('2025-01-11') },
    
    { positionId: createdPositions[3].id, candidateId: allCandidates[7].id, status: ApplicationStatus.ACCEPTED, source: ApplicationSource.RECRUITER, applicationDate: new Date('2024-12-20') },
    { positionId: createdPositions[3].id, candidateId: allCandidates[6].id, status: ApplicationStatus.REJECTED, source: ApplicationSource.WEBSITE, applicationDate: new Date('2025-01-03') },
    { positionId: createdPositions[3].id, candidateId: allCandidates[3].id, status: ApplicationStatus.PENDING, source: ApplicationSource.CAREER_FAIR, applicationDate: new Date('2025-01-14') },
    
    { positionId: createdPositions[4].id, candidateId: allCandidates[5].id, status: ApplicationStatus.INTERVIEWING, source: ApplicationSource.LINKEDIN, applicationDate: new Date('2025-01-09') },
    { positionId: createdPositions[4].id, candidateId: allCandidates[9].id, status: ApplicationStatus.REVIEWING, source: ApplicationSource.WEBSITE, applicationDate: new Date('2025-01-13') },
    
    // Adicionales para diversidad
    { positionId: createdPositions[1].id, candidateId: allCandidates[4].id, status: ApplicationStatus.WITHDRAWN, source: ApplicationSource.LINKEDIN, applicationDate: new Date('2025-01-07') },
    { positionId: createdPositions[2].id, candidateId: allCandidates[0].id, status: ApplicationStatus.REJECTED, source: ApplicationSource.WEBSITE, applicationDate: new Date('2025-01-04') },
    { positionId: createdPositions[4].id, candidateId: allCandidates[2].id, status: ApplicationStatus.PENDING, source: ApplicationSource.OTHER, applicationDate: new Date('2025-01-16') }
  ];

  const createdApplications = [];
  for (const app of applications) {
    const existing = await prisma.application.findFirst({
      where: {
        positionId: app.positionId,
        candidateId: app.candidateId
      }
    });

    if (existing) {
      createdApplications.push(existing);
    } else {
      const created = await prisma.application.create({ data: app });
      createdApplications.push(created);
    }
  }
  console.log(`   ✅ ${createdApplications.length} aplicaciones creadas (total esperado: ${applications.length})\n`);

  // ============================================================================
  // 14. INTERVIEWS (10 entrevistas con resultados variados)
  // ============================================================================
  console.log('🗣️  Seeding Interviews...');
  
  // Obtener los pasos de entrevista
  const allSteps = await prisma.interviewStep.findMany({
    include: { interviewFlow: true }
  });

  // Filtrar empleados que son INTERVIEWER o MANAGER
  const interviewers = await prisma.employee.findMany({
    where: {
      OR: [
        { role: EmployeeRole.INTERVIEWER },
        { role: EmployeeRole.MANAGER }
      ]
    }
  });

  // Helper function to safely find step
  const findStep = (flowId: number, orderIndex: number) => {
    const step = allSteps.find(s => s.interviewFlowId === flowId && s.orderIndex === orderIndex);
    if (!step) {
      console.log(`      ⚠️  No se encontró step para flowId=${flowId}, orderIndex=${orderIndex}`);
      return null;
    }
    return step;
  };

  const interviews = [
    // Entrevistas para posición 0 (TechCorp Senior Full Stack)
    { applicationId: createdApplications[0].id, interviewStepId: findStep(createdFlows[1].id, 1)?.id, employeeId: interviewers[0]?.id, interviewDate: new Date('2025-01-15 10:00'), durationMinutes: 45, location: 'Online', meetingUrl: 'https://meet.google.com/abc-defg-hij', result: InterviewResult.PASSED, score: 85, notes: 'Strong communication skills and good technical background' },
    { applicationId: createdApplications[0].id, interviewStepId: findStep(createdFlows[1].id, 2)?.id, employeeId: interviewers[1]?.id, interviewDate: new Date('2025-01-18 14:00'), durationMinutes: 90, location: 'Online', meetingUrl: 'https://meet.google.com/xyz-uvwx-rst', result: InterviewResult.PENDING, score: null, notes: null },
    
    // Entrevista aceptada
    { applicationId: createdApplications[2].id, interviewStepId: findStep(createdFlows[1].id, 1)?.id, employeeId: interviewers[0]?.id, interviewDate: new Date('2025-01-08 11:00'), durationMinutes: 40, location: 'Office', meetingUrl: null, result: InterviewResult.PASSED, score: 95, notes: 'Excellent candidate, perfect fit for the team' },
    
    // Entrevistas para posición 1 (TechCorp DevOps)
    { applicationId: createdApplications[3].id, interviewStepId: findStep(createdFlows[1].id, 1)?.id, employeeId: interviewers[0]?.id, interviewDate: new Date('2025-01-12 09:00'), durationMinutes: 45, location: 'Online', meetingUrl: 'https://zoom.us/j/123456789', result: InterviewResult.PASSED, score: 80, notes: 'Good DevOps knowledge' },
    { applicationId: createdApplications[3].id, interviewStepId: findStep(createdFlows[1].id, 2)?.id, employeeId: interviewers[1]?.id, interviewDate: new Date('2025-01-16 15:00'), durationMinutes: 60, location: 'Online', meetingUrl: 'https://zoom.us/j/987654321', result: InterviewResult.PENDING, score: null, notes: null },
    
    // Entrevistas para posición 2 (FinanceHub Data Analyst)
    { applicationId: createdApplications[5].id, interviewStepId: findStep(createdFlows[2].id, 1)?.id, employeeId: interviewers[5]?.id, interviewDate: new Date('2025-01-10 10:00'), durationMinutes: 30, location: 'Phone', meetingUrl: null, result: InterviewResult.PASSED, score: 75, notes: 'Good initial impression' },
    { applicationId: createdApplications[5].id, interviewStepId: findStep(createdFlows[2].id, 2)?.id, employeeId: interviewers[6]?.id, interviewDate: new Date('2025-01-14 16:00'), durationMinutes: 90, location: 'Office', meetingUrl: null, result: InterviewResult.PENDING, score: null, notes: null },
    
    // Entrevista aceptada para posición 3
    { applicationId: createdApplications[7].id, interviewStepId: findStep(createdFlows[2].id, 1)?.id, employeeId: interviewers[5]?.id, interviewDate: new Date('2024-12-28 11:00'), durationMinutes: 45, location: 'Office', meetingUrl: null, result: InterviewResult.PASSED, score: 88, notes: 'Strong analytical skills, hired' },
    
    // Entrevista rechazada
    { applicationId: createdApplications[8].id, interviewStepId: findStep(createdFlows[2].id, 1)?.id, employeeId: interviewers[5]?.id, interviewDate: new Date('2025-01-05 14:00'), durationMinutes: 30, location: 'Phone', meetingUrl: null, result: InterviewResult.FAILED, score: 45, notes: 'Insufficient experience for the role' },
    
    // Entrevista para posición 4 (HealthPlus Product Manager)
    { applicationId: createdApplications[10].id, interviewStepId: findStep(createdFlows[0].id, 1)?.id, employeeId: interviewers[10]?.id, interviewDate: new Date('2025-01-13 10:00'), durationMinutes: 45, location: 'Online', meetingUrl: 'https://teams.microsoft.com/l/meetup-join/123', result: InterviewResult.PASSED, score: 82, notes: 'Good product sense and healthcare domain knowledge' }
  ];

  let interviewCount = 0;
  for (const interview of interviews) {
    // Skip if missing required IDs
    if (!interview.interviewStepId || !interview.employeeId) {
      console.log(`      ⚠️  Saltando entrevista por falta de datos (stepId: ${interview.interviewStepId}, employeeId: ${interview.employeeId})`);
      continue;
    }

    const existing = await prisma.interview.findFirst({
      where: {
        applicationId: interview.applicationId,
        interviewStepId: interview.interviewStepId
      }
    });

    if (!existing) {
      await prisma.interview.create({ data: interview as any });
      interviewCount++;
    }
  }
  console.log(`   ✅ ${interviewCount} entrevistas creadas (total esperado: ${interviews.length})\n`);

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('═══════════════════════════════════════════════════');
  console.log('✨ Seed completado exitosamente!');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('📊 Resumen de registros creados:');
  console.log(`   - Industries: ${await prisma.industry.count()}`);
  console.log(`   - Interview Types: ${await prisma.interviewType.count()}`);
  console.log(`   - Locations: ${await prisma.location.count()}`);
  console.log(`   - Companies: ${await prisma.company.count()}`);
  console.log(`   - Employees: ${await prisma.employee.count()}`);
  console.log(`   - Interview Flows: ${await prisma.interviewFlow.count()}`);
  console.log(`   - Interview Steps: ${await prisma.interviewStep.count()}`);
  console.log(`   - Positions: ${await prisma.position.count()}`);
  console.log(`   - Candidates: ${await prisma.candidate.count()}`);
  console.log(`   - Education Records: ${await prisma.education.count()}`);
  console.log(`   - Work Experiences: ${await prisma.workExperience.count()}`);
  console.log(`   - Resumes: ${await prisma.resume.count()}`);
  console.log(`   - Applications: ${await prisma.application.count()}`);
  console.log(`   - Interviews: ${await prisma.interview.count()}`);
  
  const totalRecords = await prisma.industry.count() +
                        await prisma.interviewType.count() +
                        await prisma.location.count() +
                        await prisma.company.count() +
                        await prisma.employee.count() +
                        await prisma.interviewFlow.count() +
                        await prisma.interviewStep.count() +
                        await prisma.position.count() +
                        await prisma.candidate.count() +
                        await prisma.education.count() +
                        await prisma.workExperience.count() +
                        await prisma.resume.count() +
                        await prisma.application.count() +
                        await prisma.interview.count();
  
  console.log(`\n📈 Total de registros: ${totalRecords}`);
  console.log('\n✅ La base de datos está lista para usar!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
