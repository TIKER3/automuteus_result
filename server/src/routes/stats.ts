import type { FastifyInstance } from 'fastify'
import {
  getOverviewStats,
  getPlayerStats,
  getPlayerDetailStats,
  getAllPlayers,
} from '../repositories/userGameRepository.js'
import type { ApiResponse, OverviewStats, PlayerStats, PlayerDetailStats } from '../../../shared/types/index.js'

export async function statsRoutes(fastify: FastifyInstance) {
  // GET /api/stats/overview
  fastify.get<{
    Reply: ApiResponse<OverviewStats>
  }>('/overview', async (_request, reply) => {
    try {
      const stats = await getOverviewStats()
      return reply.send({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error fetching overview stats:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch overview statistics',
      })
    }
  })

  // GET /api/stats/players
  fastify.get<{
    Reply: ApiResponse<{ odoraiId: string; odoraiName: string }[]>
  }>('/players', async (_request, reply) => {
    try {
      const players = await getAllPlayers()
      return reply.send({
        success: true,
        data: players,
      })
    } catch (error) {
      console.error('Error fetching players:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch players',
      })
    }
  })

  // GET /api/stats/player/:userId
  fastify.get<{
    Params: { userId: string }
    Reply: ApiResponse<PlayerStats>
  }>('/player/:userId', async (request, reply) => {
    try {
      const { userId } = request.params
      const stats = await getPlayerStats(userId)

      if (!stats) {
        return reply.status(404).send({
          success: false,
          error: 'Player not found',
        })
      }

      return reply.send({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error fetching player stats:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch player statistics',
      })
    }
  })

  // GET /api/stats/player/:userId/detail
  fastify.get<{
    Params: { userId: string }
    Reply: ApiResponse<PlayerDetailStats>
  }>('/player/:userId/detail', async (request, reply) => {
    try {
      const { userId } = request.params
      const stats = await getPlayerDetailStats(userId)

      if (!stats) {
        return reply.status(404).send({
          success: false,
          error: 'Player not found',
        })
      }

      return reply.send({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Error fetching player detail stats:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch player detail statistics',
      })
    }
  })
}
