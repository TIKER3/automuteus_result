import type { FastifyInstance } from 'fastify'
import { getLeaderboard } from '../repositories/userGameRepository.js'
import type { ApiResponse, LeaderboardEntry, LeaderboardSortBy } from '../../../shared/types/index.js'

export async function rankingRoutes(fastify: FastifyInstance) {
  // GET /api/ranking/leaderboard
  fastify.get<{
    Querystring: {
      minGames?: string
      sortBy?: LeaderboardSortBy
      limit?: string
      offset?: string
    }
    Reply: ApiResponse<LeaderboardEntry[]>
  }>('/leaderboard', async (request, reply) => {
    try {
      const { minGames = '10', sortBy = 'winRate', limit = '20', offset = '0' } = request.query

      const validSortBy: LeaderboardSortBy[] = [
        'winRate',
        'totalGames',
        'wins',
        'crewWinRate',
        'impostorWinRate',
      ]

      if (!validSortBy.includes(sortBy)) {
        return reply.status(400).send({
          success: false,
          error: `Invalid sortBy. Must be one of: ${validSortBy.join(', ')}`,
        })
      }

      const data = await getLeaderboard({
        minGames: parseInt(minGames, 10),
        sortBy,
        limit: Math.min(parseInt(limit, 10), 100),
        offset: parseInt(offset, 10),
      })

      return reply.send({
        success: true,
        data,
        meta: {
          total: data.length,
          page: Math.floor(parseInt(offset, 10) / parseInt(limit, 10)) + 1,
          limit: parseInt(limit, 10),
        },
      })
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch leaderboard',
      })
    }
  })
}
