import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

/**
 * @swagger
 * /api/activities/{projectId}:
 *   get:
 *     summary: Lista aktiviteter för ett projekt
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista med aktiviteter
 */
router.get('/', async (_req: Request, res: Response) => {
  const activities = await prisma.activity.findMany({
    include: { project: { select: { id: true, name: true, status: true } } },
    orderBy: { startDate: 'asc' },
  })
  res.json(activities)
})

router.get('/:projectId', async (req: Request, res: Response) => {
  const activities = await prisma.activity.findMany({
    where: { projectId: Number(req.params.projectId) },
    include: {
      resources: { include: { resource: { include: { team: { include: { tribe: { include: { domain: true } } } } } } } },
      dependsOn: { include: { fromActivity: true } },
      blockedBy: { include: { toActivity: true } },
    },
    orderBy: { startDate: 'asc' },
  })
  res.json(activities)
})

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Skapa ny aktivitet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, name, startDate, endDate]
 *             properties:
 *               projectId:
 *                 type: integer
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               progress:
 *                 type: integer
 *               status:
 *                 type: string
 *               isMilestone:
 *                 type: boolean
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Aktivitet skapad
 */
router.post('/', async (req: Request, res: Response) => {
  const { projectId, name, startDate, endDate, progress, status, isMilestone, budget, notes } = req.body
  if (!projectId || !name || !startDate || !endDate)
    return res.status(400).json({ error: 'projectId, name, startDate och endDate krävs' })

  const activity = await prisma.activity.create({
    data: {
      projectId: Number(projectId),
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      progress: progress || 0,
      status: status || 'NOT_STARTED',
      isMilestone: isMilestone || false,
      budget,
      notes,
    },
  })
  res.status(201).json(activity)
})

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Uppdatera aktivitet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Aktivitet uppdaterad
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { name, startDate, endDate, progress, status, isMilestone, budget, notes } = req.body
  const activity = await prisma.activity.update({
    where: { id: Number(req.params.id) },
    data: {
      name,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      progress,
      status,
      isMilestone,
      budget,
      notes,
    },
  })
  res.json(activity)
})

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Ta bort aktivitet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Aktivitet borttagen
 */
router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.activity.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

/**
 * @swagger
 * /api/activities/{id}/dependencies:
 *   post:
 *     summary: Lägg till beroende (blocked by)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blockedByActivityId]
 *             properties:
 *               blockedByActivityId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Beroende skapat
 */
router.post('/:id/dependencies', async (req: Request, res: Response) => {
  const { blockedByActivityId } = req.body
  const dep = await prisma.dependency.create({
    data: {
      fromActivityId: Number(blockedByActivityId),
      toActivityId: Number(req.params.id),
    },
  })
  res.status(201).json(dep)
})

router.delete('/:id/dependencies/:depId', async (req: Request, res: Response) => {
  await prisma.dependency.delete({ where: { id: Number(req.params.depId) } })
  res.status(204).send()
})

/**
 * @swagger
 * /api/activities/{id}/resources:
 *   post:
 *     summary: Tilldela resurs till aktivitet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resourceId]
 *             properties:
 *               resourceId:
 *                 type: integer
 *               hoursNeeded:
 *                 type: number
 *     responses:
 *       201:
 *         description: Resurs tilldelad
 */
router.post('/:id/resources', async (req: Request, res: Response) => {
  const { resourceId, hoursNeeded } = req.body
  const ar = await prisma.activityResource.upsert({
    where: { activityId_resourceId: { activityId: Number(req.params.id), resourceId: Number(resourceId) } },
    update: { hoursNeeded },
    create: { activityId: Number(req.params.id), resourceId: Number(resourceId), hoursNeeded },
  })
  res.status(201).json(ar)
})

export default router
