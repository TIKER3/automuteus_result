import type { FastifyInstance } from 'fastify'
import { getTrendData, getHeatmapData } from '../repositories/userGameRepository.js'
import type { ApiResponse, TrendData, TrendPeriod, HeatmapData } from '../../../shared/types/index.js'

export async function analysisRoutes(fastify: FastifyInstance) {
  // GET /api/analysis/trend
  fastify.get<{
    Querystring: {
      userId?: string
      period?: TrendPeriod
    }
    Reply: ApiResponse<TrendData[]>
  }>('/trend', async (request, reply) => {
    try {
      const { userId, period = 'daily' } = request.query
      const validPeriods: TrendPeriod[] = ['daily', 'weekly', 'monthly']

      if (!validPeriods.includes(period)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid period. Must be one of: daily, weekly, monthly',
        })
      }

      const data = await getTrendData(userId || null, period)
      return reply.send({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error fetching trend data:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch trend data',
      })
    }
  })

  // GET /api/analysis/heatmap/:userId
  fastify.get<{
    Params: { userId: string }
    Reply: ApiResponse<HeatmapData[]>
  }>('/heatmap/:userId', async (request, reply) => {
    try {
      const { userId } = request.params
      const data = await getHeatmapData(userId)

      return reply.send({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Error fetching heatmap data:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch heatmap data',
      })
    }
  })
}
