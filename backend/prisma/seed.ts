import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Resurshierarki
  const domain = await prisma.domain.create({ data: { name: 'Digital' } })
  const tribe = await prisma.tribe.create({ data: { name: 'Platform', domainId: domain.id } })
  const teamFrontend = await prisma.team.create({ data: { name: 'Frontend', tribeId: tribe.id } })
  const teamBackend = await prisma.team.create({ data: { name: 'Backend', tribeId: tribe.id } })

  const alice = await prisma.resource.create({ data: { name: 'Alice Svensson', role: 'Frontend Dev', teamId: teamFrontend.id } })
  const bob = await prisma.resource.create({ data: { name: 'Bob Karlsson', role: 'Backend Dev', teamId: teamBackend.id } })
  const carol = await prisma.resource.create({ data: { name: 'Carol Nilsson', role: 'Tech Lead', teamId: teamBackend.id } })

  // Projekt 1
  const project1 = await prisma.project.create({
    data: {
      name: 'Kundportal v2',
      description: 'Ny kundportal med modern teknikstack och förbättrad UX.',
      status: 'GREEN',
      phase: 'Genomförande',
      budget: 500000,
      summary: 'Projektet löper enligt plan. Nästa milstolpe är beta-lansering i juli.',
    },
  })

  const a1 = await prisma.activity.create({
    data: {
      projectId: project1.id,
      name: 'Kravanalys',
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-31'),
      progress: 100,
      status: 'DONE',
      budget: 50000,
    },
  })

  const a2 = await prisma.activity.create({
    data: {
      projectId: project1.id,
      name: 'Design & Prototyp',
      startDate: new Date('2025-02-03'),
      endDate: new Date('2025-02-28'),
      progress: 100,
      status: 'DONE',
      budget: 80000,
    },
  })

  const a3 = await prisma.activity.create({
    data: {
      projectId: project1.id,
      name: 'Backend-utveckling',
      startDate: new Date('2025-03-03'),
      endDate: new Date('2025-05-30'),
      progress: 60,
      status: 'IN_PROGRESS',
      budget: 150000,
    },
  })

  const a4 = await prisma.activity.create({
    data: {
      projectId: project1.id,
      name: 'Frontend-utveckling',
      startDate: new Date('2025-03-17'),
      endDate: new Date('2025-06-13'),
      progress: 40,
      status: 'IN_PROGRESS',
      budget: 120000,
    },
  })

  const a5 = await prisma.activity.create({
    data: {
      projectId: project1.id,
      name: 'Beta-lansering',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-01'),
      progress: 0,
      status: 'NOT_STARTED',
      isMilestone: true,
    },
  })

  const a6 = await prisma.activity.create({
    data: {
      projectId: project1.id,
      name: 'Produktionssättning',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-09-01'),
      progress: 0,
      status: 'NOT_STARTED',
      isMilestone: true,
    },
  })

  // Beroenden
  await prisma.dependency.create({ data: { fromActivityId: a1.id, toActivityId: a2.id } })
  await prisma.dependency.create({ data: { fromActivityId: a2.id, toActivityId: a3.id } })
  await prisma.dependency.create({ data: { fromActivityId: a2.id, toActivityId: a4.id } })
  await prisma.dependency.create({ data: { fromActivityId: a3.id, toActivityId: a5.id } })
  await prisma.dependency.create({ data: { fromActivityId: a4.id, toActivityId: a5.id } })
  await prisma.dependency.create({ data: { fromActivityId: a5.id, toActivityId: a6.id } })

  // Resurstilldelning
  await prisma.activityResource.create({ data: { activityId: a3.id, resourceId: bob.id, hoursNeeded: 320 } })
  await prisma.activityResource.create({ data: { activityId: a3.id, resourceId: carol.id, hoursNeeded: 80 } })
  await prisma.activityResource.create({ data: { activityId: a4.id, resourceId: alice.id, hoursNeeded: 280 } })

  // Risker & Issues
  await prisma.risk.create({
    data: {
      projectId: project1.id,
      description: 'Integration mot legacy-system kan ta längre tid än planerat',
      impact: 'HIGH',
      probability: 'MEDIUM',
      status: 'OPEN',
      owner: 'Carol Nilsson',
    },
  })
  await prisma.risk.create({
    data: {
      projectId: project1.id,
      description: 'Resursbrist om ytterligare projekt startas parallellt',
      impact: 'MEDIUM',
      probability: 'LOW',
      status: 'OPEN',
      owner: 'Bob Karlsson',
    },
  })
  await prisma.issue.create({
    data: {
      projectId: project1.id,
      description: 'API-dokumentation från leverantör saknas',
      status: 'IN_PROGRESS',
      owner: 'Carol Nilsson',
    },
  })
  await prisma.decision.create({
    data: {
      projectId: project1.id,
      description: 'Valt React + TypeScript för frontend',
      owner: 'Alice Svensson',
      decidedAt: new Date('2025-01-20'),
    },
  })

  // Projekt 2
  const project2 = await prisma.project.create({
    data: {
      name: 'Datamigrering ERP',
      description: 'Migration av data från gammalt ERP-system till nytt.',
      status: 'YELLOW',
      phase: 'Planering',
      budget: 200000,
      summary: 'Försenad pga beroende på leverantör. Risk för försenat Q3-mål.',
    },
  })

  const b1 = await prisma.activity.create({
    data: {
      projectId: project2.id,
      name: 'Datakartläggning',
      startDate: new Date('2025-02-03'),
      endDate: new Date('2025-03-14'),
      progress: 100,
      status: 'DONE',
      budget: 40000,
    },
  })

  const b2 = await prisma.activity.create({
    data: {
      projectId: project2.id,
      name: 'Migreringsscript',
      startDate: new Date('2025-03-17'),
      endDate: new Date('2025-05-16'),
      progress: 30,
      status: 'BLOCKED',
      budget: 80000,
    },
  })

  const b3 = await prisma.activity.create({
    data: {
      projectId: project2.id,
      name: 'Testmigrering klar',
      startDate: new Date('2025-06-02'),
      endDate: new Date('2025-06-02'),
      progress: 0,
      status: 'NOT_STARTED',
      isMilestone: true,
    },
  })

  await prisma.dependency.create({ data: { fromActivityId: b1.id, toActivityId: b2.id } })
  await prisma.dependency.create({ data: { fromActivityId: b2.id, toActivityId: b3.id } })

  await prisma.activityResource.create({ data: { activityId: b2.id, resourceId: bob.id, hoursNeeded: 160 } })

  await prisma.risk.create({
    data: {
      projectId: project2.id,
      description: 'Leverantör levererar inte API i tid',
      impact: 'HIGH',
      probability: 'HIGH',
      status: 'OPEN',
      owner: 'Bob Karlsson',
    },
  })

  console.log('Seed klar!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
