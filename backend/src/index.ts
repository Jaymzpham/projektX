import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import projectRoutes from './routes/projects'
import activityRoutes from './routes/activities'
import resourceRoutes from './routes/resources'
import raidRoutes from './routes/raid'
import shareRoutes from './routes/share'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Projekt X API',
      version: '1.0.0',
      description: 'REST API för projekthanteringsverktyget',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./src/routes/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/projects', projectRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/raid', raidRoutes)
app.use('/api/share', shareRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
  console.log(`Swagger docs: http://localhost:${PORT}/api/docs`)
})
