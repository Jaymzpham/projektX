import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

/**
 * @swagger
 * /api/share/{token}:
 *   get:
 *     summary: Hämta read-only projektdata via share-token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projektdata (read-only)
 *       404:
 *         description: Ogiltig eller utgången token
 */
router.get('/:token', async (req: Request, res: Response) => {
  const shareToken = await prisma.shareToken.findUnique({
    where: { token: req.params.token },
  })

  if (!shareToken) return res.status(404).json({ error: 'Ogiltig share-länk' })
  if (shareToken.expiresAt && shareToken.expiresAt < new Date())
    return res.status(404).json({ error: 'Share-länken har gått ut' })

  const project = await prisma.project.findUnique({
    where: { id: shareToken.projectId },
    include: {
      activities: {
        include: {
          dependsOn: { include: { fromActivity: true } },
          blockedBy: { include: { toActivity: true } },
          resources: { include: { resource: { include: { team: true } } } },
        },
        orderBy: { startDate: 'asc' },
      },
      risks: true,
      issues: true,
    },
  })

  res.json(project)
})

export default router
