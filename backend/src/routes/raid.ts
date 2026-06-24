import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

/**
 * @swagger
 * /api/raid/{projectId}/risks:
 *   get:
 *     summary: Lista risker för projekt
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista med risker
 */
router.get('/:projectId/risks', async (req: Request, res: Response) => {
  const risks = await prisma.risk.findMany({ where: { projectId: Number(req.params.projectId) } })
  res.json(risks)
})

router.post('/:projectId/risks', async (req: Request, res: Response) => {
  const { description, impact, probability, status, owner } = req.body
  const risk = await prisma.risk.create({
    data: { projectId: Number(req.params.projectId), description, impact, probability, status, owner },
  })
  res.status(201).json(risk)
})

router.put('/risks/:id', async (req: Request, res: Response) => {
  const { description, impact, probability, status, owner } = req.body
  const risk = await prisma.risk.update({ where: { id: Number(req.params.id) }, data: { description, impact, probability, status, owner } })
  res.json(risk)
})

router.delete('/risks/:id', async (req: Request, res: Response) => {
  await prisma.risk.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

/**
 * @swagger
 * /api/raid/{projectId}/issues:
 *   get:
 *     summary: Lista issues för projekt
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista med issues
 */
router.get('/:projectId/issues', async (req: Request, res: Response) => {
  const issues = await prisma.issue.findMany({ where: { projectId: Number(req.params.projectId) } })
  res.json(issues)
})

router.post('/:projectId/issues', async (req: Request, res: Response) => {
  const { description, status, owner } = req.body
  const issue = await prisma.issue.create({
    data: { projectId: Number(req.params.projectId), description, status, owner },
  })
  res.status(201).json(issue)
})

router.put('/issues/:id', async (req: Request, res: Response) => {
  const { description, status, owner } = req.body
  const issue = await prisma.issue.update({ where: { id: Number(req.params.id) }, data: { description, status, owner } })
  res.json(issue)
})

router.delete('/issues/:id', async (req: Request, res: Response) => {
  await prisma.issue.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

/**
 * @swagger
 * /api/raid/{projectId}/decisions:
 *   get:
 *     summary: Lista beslut för projekt
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Beslutslogg
 */
router.get('/:projectId/decisions', async (req: Request, res: Response) => {
  const decisions = await prisma.decision.findMany({ where: { projectId: Number(req.params.projectId) } })
  res.json(decisions)
})

router.post('/:projectId/decisions', async (req: Request, res: Response) => {
  const { description, owner, decidedAt } = req.body
  const decision = await prisma.decision.create({
    data: { projectId: Number(req.params.projectId), description, owner, decidedAt: decidedAt ? new Date(decidedAt) : undefined },
  })
  res.status(201).json(decision)
})

router.delete('/decisions/:id', async (req: Request, res: Response) => {
  await prisma.decision.delete({ where: { id: Number(req.params.id) } })
  res.status(204).send()
})

export default router
