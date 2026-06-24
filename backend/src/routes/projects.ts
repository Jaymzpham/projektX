import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import ical from 'ical-generator'

const router = Router()

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Lista alla projekt
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista med projekt
 */
router.get('/', async (req: Request, res: Response) => {
  const { search, status } = req.query
  const projects = await prisma.project.findMany({
    where: {
      ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
      ...(status ? { status: String(status) } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      activities: { where: { isMilestone: true }, orderBy: { startDate: 'asc' }, take: 1 },
      _count: { select: { activities: true, risks: true, issues: true } },
    },
  })
  res.json(projects)
})

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Hämta ett projekt med alla detaljer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projektdetaljer
 *       404:
 *         description: Projekt hittades inte
 */
router.get('/:id', async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      activities: {
        include: {
          resources: { include: { resource: { include: { team: { include: { tribe: { include: { domain: true } } } } } } } },
          dependsOn: { include: { fromActivity: true } },
          blockedBy: { include: { toActivity: true } },
        },
        orderBy: { startDate: 'asc' },
      },
      risks: true,
      issues: true,
      decisions: true,
    },
  })
  if (!project) return res.status(404).json({ error: 'Projekt hittades inte' })
  res.json(project)
})

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Skapa nytt projekt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               phase:
 *                 type: string
 *               budget:
 *                 type: number
 *               summary:
 *                 type: string
 *     responses:
 *       201:
 *         description: Projekt skapat
 */
router.post('/', async (req: Request, res: Response) => {
  const { name, description, status, phase, budget, summary } = req.body
  if (!name) return res.status(400).json({ error: 'name krävs' })
  const project = await prisma.project.create({
    data: { name, description, status: status || 'GREEN', phase, budget, summary },
  })
  res.status(201).json(project)
})

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Uppdatera projekt
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projekt uppdaterat
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { name, description, status, phase, budget, summary } = req.body
  const project = await prisma.project.update({
    where: { id: Number(req.params.id) },
    data: { name, description, status, phase, budget, summary },
  })
  res.json(project)
})

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Ta bort projekt
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Projekt borttaget
 */
router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.project.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

/**
 * @swagger
 * /api/projects/{id}/share:
 *   post:
 *     summary: Generera share-token för read-only delning
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Share-token skapad
 */
router.post('/:id/share', async (req: Request, res: Response) => {
  const token = uuidv4()
  const shareToken = await prisma.shareToken.create({
    data: { projectId: Number(req.params.id), token },
  })
  res.status(201).json({ token: shareToken.token, url: `/share/${shareToken.token}` })
})

/**
 * @swagger
 * /api/projects/{id}/export/ics:
 *   get:
 *     summary: Exportera milstolpar som .ics-fil
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ICS-fil med milstolpar
 */
router.get('/:id/export/ics', async (req: Request, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: Number(req.params.id) },
    include: { activities: { where: { isMilestone: true } } },
  })
  if (!project) return res.status(404).json({ error: 'Projekt hittades inte' })

  const calendar = ical({ name: project.name })
  for (const milestone of project.activities) {
    calendar.createEvent({
      start: milestone.startDate,
      end: milestone.endDate,
      summary: milestone.name,
      description: milestone.notes || '',
    })
  }

  res.setHeader('Content-Type', 'text/calendar')
  res.setHeader('Content-Disposition', `attachment; filename="${project.name}-milestones.ics"`)
  res.send(calendar.toString())
})

export default router
