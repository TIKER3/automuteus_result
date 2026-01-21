import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { testConnection, closePool } from './config/database.js'
import { statsRoutes } from './routes/stats.js'
import { analysisRoutes } from './routes/analysis.js'
import { rankingRoutes } from './routes/ranking.js'

const fastify = Fastify({
  logger: true,
})

async function main() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })

    // Test database connection
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.')
      process.exit(1)
    }
    console.log('Database connection successful')

    // Register routes
    await fastify.register(statsRoutes, { prefix: '/api/stats' })
    await fastify.register(analysisRoutes, { prefix: '/api/analysis' })
    await fastify.register(rankingRoutes, { prefix: '/api/ranking' })

    // Health check endpoint
    fastify.get('/api/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    // Start server
    const port = parseInt(process.env.PORT || '3001', 10)
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    console.log(`Server listening on http://${host}:${port}`)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...')
  await fastify.close()
  await closePool()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

main()
