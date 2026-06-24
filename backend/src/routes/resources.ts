import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

/**
 * @swagger
 * /api/resources/hierarchy:
 *   get:
 *     summary: Hämta hela resurshierarkin (Domain → Tribe → Team → Resurs)
 *     responses:
 *       200:
 *         description: Resurshierarki
 */
router.get('/hierarchy', async (_req: Request, res: Response) => {
  const domains = await prisma.domain.findMany({
    include: {
      tribes: {
        include: {
          teams: {
            include: { resources: true },
          },
        },
      },
    },
  })
  res.json(domains)
})

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Lista alla resurser
 *     responses:
 *       200:
 *         description: Lista med resurser
 */
router.get('/', async (_req: Request, res: Response) => {
  const resources = await prisma.resource.findMany({
    include: { team: { include: { tribe: { include: { domain: true } } } } },
  })
  res.json(resources)
})

/**
 * @swagger
 * /api/resources/team-summary:
 *   get:
 *     summary: Resursbehov summerat per team
 *     responses:
 *       200:
 *         description: Resursbehov per team
 */
router.get('/team-summary', async (_req: Request, res: Response) => {
  const data = await prisma.activityResource.findMany({
    include: {
      resource: { include: { team: { include: { tribe: { include: { domain: true } } } } } },
      activity: { select: { name: true, startDate: true, endDate: true, projectId: true } },
    },
  })
  res.json(data)
})

/**
 * @swagger
 * /api/resources/domains:
 *   post:
 *     summary: Skapa domain
 *     responses:
 *       201:
 *         description: Domain skapad
 */
router.post('/domains', async (req: Request, res: Response) => {
  const { name } = req.body
  const domain = await prisma.domain.create({ data: { name } })
  res.status(201).json(domain)
})

router.post('/tribes', async (req: Request, res: Response) => {
  const { name, domainId } = req.body
  const tribe = await prisma.tribe.create({ data: { name, domainId: Number(domainId) } })
  res.status(201).json(tribe)
})

router.post('/teams', async (req: Request, res: Response) => {
  const { name, tribeId } = req.body
  const team = await prisma.team.create({ data: { name, tribeId: Number(tribeId) } })
  res.status(201).json(team)
})

/**
 * @swagger
 * /api/resources/people:
 *   post:
 *     summary: Skapa person/resurs
 *     responses:
 *       201:
 *         description: Resurs skapad
 */
router.post('/people', async (req: Request, res: Response) => {
  const { name, role, teamId } = req.body
  const resource = await prisma.resource.create({ data: { name, role, teamId: Number(teamId) } })
  res.status(201).json(resource)
})

export default router
