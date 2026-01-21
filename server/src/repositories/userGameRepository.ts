import { pool } from '../config/database.js'
import type {
  OverviewStats,
  RecentGame,
  PlayerStats,
  PlayerDetailStats,
  PlayerGameHistory,
  TrendData,
  TrendPeriod,
  HeatmapData,
  LeaderboardEntry,
  LeaderboardFilters,
} from '../../../shared/types/index.js'

export async function getOverviewStats(): Promise<OverviewStats> {
  const client = await pool.connect()

  try {
    // Total games
    const gamesResult = await client.query(`
      SELECT COUNT(DISTINCT game_id) as total_games
      FROM users_games
    `)
    const totalGames = parseInt(gamesResult.rows[0]?.total_games || '0', 10)

    // Total unique players
    const playersResult = await client.query(`
      SELECT COUNT(DISTINCT user_id) as total_players
      FROM users_games
    `)
    const totalPlayers = parseInt(playersResult.rows[0]?.total_players || '0', 10)

    // Win rates by role
    const winRatesResult = await client.query(`
      SELECT
        player_role,
        COUNT(*) as total,
        SUM(CASE WHEN player_won THEN 1 ELSE 0 END) as wins
      FROM users_games
      GROUP BY player_role
    `)

    let crewWins = 0
    let crewTotal = 0
    let impostorWins = 0
    let impostorTotal = 0

    for (const row of winRatesResult.rows) {
      if (row.player_role === 0) {
        crewWins = parseInt(row.wins, 10)
        crewTotal = parseInt(row.total, 10)
      } else if (row.player_role === 1) {
        impostorWins = parseInt(row.wins, 10)
        impostorTotal = parseInt(row.total, 10)
      }
    }

    // Recent games
    const recentGamesResult = await client.query(`
      SELECT DISTINCT ON (g.game_id)
        g.game_id,
        to_timestamp(g.end_time) as end_time,
        CASE WHEN ug.player_role = 0 AND ug.player_won THEN 'crew'
             WHEN ug.player_role = 1 AND ug.player_won THEN 'impostor'
             WHEN ug.player_role = 0 AND NOT ug.player_won THEN 'impostor'
             ELSE 'crew' END as winner,
        (SELECT COUNT(*) FROM users_games WHERE game_id = g.game_id) as player_count
      FROM games g
      JOIN users_games ug ON g.game_id = ug.game_id
      WHERE g.end_time IS NOT NULL
      ORDER BY g.game_id DESC, g.end_time DESC
      LIMIT 10
    `)

    const recentGames: RecentGame[] = recentGamesResult.rows.map((row) => ({
      gameId: row.game_id,
      endTime: row.end_time?.toISOString() || null,
      winner: row.winner,
      playerCount: parseInt(row.player_count, 10),
    }))

    return {
      totalGames,
      totalPlayers,
      crewWins,
      impostorWins,
      crewWinRate: crewTotal > 0 ? (crewWins / crewTotal) * 100 : 0,
      impostorWinRate: impostorTotal > 0 ? (impostorWins / impostorTotal) * 100 : 0,
      recentGames,
    }
  } finally {
    client.release()
  }
}

export async function getPlayerStats(userId: string): Promise<PlayerStats | null> {
  const client = await pool.connect()

  try {
    const result = await client.query(
      `
      SELECT
        ug.user_id::text as user_id,
        (SELECT player_name FROM users_games WHERE user_id = ug.user_id ORDER BY game_id DESC LIMIT 1) as player_name,
        COUNT(*) as total_games,
        SUM(CASE WHEN ug.player_role = 0 THEN 1 ELSE 0 END) as crew_games,
        SUM(CASE WHEN ug.player_role = 1 THEN 1 ELSE 0 END) as impostor_games,
        SUM(CASE WHEN ug.player_role = 0 AND ug.player_won THEN 1 ELSE 0 END) as crew_wins,
        SUM(CASE WHEN ug.player_role = 1 AND ug.player_won THEN 1 ELSE 0 END) as impostor_wins,
        MAX(g.end_time) as last_played
      FROM users_games ug
      JOIN games g ON ug.game_id = g.game_id
      WHERE ug.user_id = $1::numeric
      GROUP BY ug.user_id
    `,
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    const totalGames = parseInt(row.total_games, 10)
    const crewGames = parseInt(row.crew_games, 10)
    const impostorGames = parseInt(row.impostor_games, 10)
    const crewWins = parseInt(row.crew_wins, 10)
    const impostorWins = parseInt(row.impostor_wins, 10)

    return {
      odoraiId: row.user_id,
      odoraiName: row.player_name || row.user_id,
      totalGames,
      crewGames,
      impostorGames,
      crewWins,
      impostorWins,
      crewWinRate: crewGames > 0 ? (crewWins / crewGames) * 100 : 0,
      impostorWinRate: impostorGames > 0 ? (impostorWins / impostorGames) * 100 : 0,
      overallWinRate: totalGames > 0 ? ((crewWins + impostorWins) / totalGames) * 100 : 0,
      lastPlayed: row.last_played ? new Date(row.last_played * 1000).toISOString() : null,
    }
  } finally {
    client.release()
  }
}

export async function getPlayerDetailStats(userId: string): Promise<PlayerDetailStats | null> {
  const basicStats = await getPlayerStats(userId)
  if (!basicStats) return null

  const client = await pool.connect()

  try {
    // Get recent games
    const recentGamesResult = await client.query(
      `
      SELECT
        ug.game_id,
        to_timestamp(g.end_time) as end_time,
        ug.player_role,
        ug.player_won
      FROM users_games ug
      JOIN games g ON ug.game_id = g.game_id
      WHERE ug.user_id = $1::numeric
      ORDER BY g.end_time DESC
      LIMIT 50
    `,
      [userId]
    )

    const recentGames: PlayerGameHistory[] = recentGamesResult.rows.map((row) => ({
      gameId: row.game_id,
      endTime: row.end_time?.toISOString() || null,
      role: row.player_role === 0 ? 'crew' : 'impostor',
      won: row.player_won,
    }))

    // Calculate streaks
    let currentWinStreak = 0
    let maxWinStreak = 0
    let currentLossStreak = 0
    let tempWinStreak = 0

    for (const game of recentGames) {
      if (game.won) {
        tempWinStreak++
        maxWinStreak = Math.max(maxWinStreak, tempWinStreak)
        if (currentLossStreak === 0) {
          currentWinStreak = tempWinStreak
        }
      } else {
        tempWinStreak = 0
        if (currentWinStreak > 0) break
        currentLossStreak++
      }
    }

    return {
      ...basicStats,
      recentGames,
      streaks: {
        currentWinStreak,
        maxWinStreak,
        currentLossStreak,
      },
    }
  } finally {
    client.release()
  }
}

export async function getTrendData(
  userId: string | null,
  period: TrendPeriod
): Promise<TrendData[]> {
  const client = await pool.connect()

  try {
    let dateFormat: string
    let interval: string

    switch (period) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD'
        interval = '30 days'
        break
      case 'weekly':
        dateFormat = 'IYYY-IW'
        interval = '12 weeks'
        break
      case 'monthly':
        dateFormat = 'YYYY-MM'
        interval = '12 months'
        break
    }

    const whereClause = userId ? 'AND ug.user_id = $1::numeric' : ''
    const params = userId ? [userId] : []

    const result = await client.query(
      `
      SELECT
        TO_CHAR(to_timestamp(g.end_time), '${dateFormat}') as period,
        COUNT(*) as total_games,
        SUM(CASE WHEN ug.player_won THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN ug.player_role = 0 THEN 1 ELSE 0 END) as crew_games,
        SUM(CASE WHEN ug.player_role = 0 AND ug.player_won THEN 1 ELSE 0 END) as crew_wins,
        SUM(CASE WHEN ug.player_role = 1 THEN 1 ELSE 0 END) as impostor_games,
        SUM(CASE WHEN ug.player_role = 1 AND ug.player_won THEN 1 ELSE 0 END) as impostor_wins
      FROM users_games ug
      JOIN games g ON ug.game_id = g.game_id
      WHERE to_timestamp(g.end_time) >= NOW() - INTERVAL '${interval}'
        AND g.end_time IS NOT NULL
        ${whereClause}
      GROUP BY TO_CHAR(to_timestamp(g.end_time), '${dateFormat}')
      ORDER BY period ASC
    `,
      params
    )

    return result.rows.map((row) => {
      const totalGames = parseInt(row.total_games, 10)
      const wins = parseInt(row.wins, 10)
      return {
        period: row.period,
        totalGames,
        wins,
        winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
        crewGames: parseInt(row.crew_games, 10),
        crewWins: parseInt(row.crew_wins, 10),
        impostorGames: parseInt(row.impostor_games, 10),
        impostorWins: parseInt(row.impostor_wins, 10),
      }
    })
  } finally {
    client.release()
  }
}

export async function getHeatmapData(userId: string): Promise<HeatmapData[]> {
  const client = await pool.connect()

  try {
    const result = await client.query(
      `
      SELECT
        DATE(to_timestamp(g.end_time)) as date,
        COUNT(*) as count,
        SUM(CASE WHEN ug.player_won THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN NOT ug.player_won THEN 1 ELSE 0 END) as losses
      FROM users_games ug
      JOIN games g ON ug.game_id = g.game_id
      WHERE ug.user_id = $1::numeric
        AND to_timestamp(g.end_time) >= NOW() - INTERVAL '1 year'
        AND g.end_time IS NOT NULL
      GROUP BY DATE(to_timestamp(g.end_time))
      ORDER BY date ASC
    `,
      [userId]
    )

    return result.rows.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      count: parseInt(row.count, 10),
      wins: parseInt(row.wins, 10),
      losses: parseInt(row.losses, 10),
    }))
  } finally {
    client.release()
  }
}

export async function getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
  const client = await pool.connect()

  try {
    const orderBy = {
      winRate: 'win_rate DESC',
      totalGames: 'total_games DESC',
      wins: 'wins DESC',
      crewWinRate: 'crew_win_rate DESC',
      impostorWinRate: 'impostor_win_rate DESC',
    }[filters.sortBy]

    const result = await client.query(
      `
      WITH player_stats AS (
        SELECT
          ug.user_id::text as user_id,
          (SELECT player_name FROM users_games WHERE user_id = ug.user_id ORDER BY game_id DESC LIMIT 1) as player_name,
          COUNT(*) as total_games,
          SUM(CASE WHEN ug.player_won THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN ug.player_role = 0 THEN 1 ELSE 0 END) as crew_games,
          SUM(CASE WHEN ug.player_role = 0 AND ug.player_won THEN 1 ELSE 0 END) as crew_wins,
          SUM(CASE WHEN ug.player_role = 1 THEN 1 ELSE 0 END) as impostor_games,
          SUM(CASE WHEN ug.player_role = 1 AND ug.player_won THEN 1 ELSE 0 END) as impostor_wins
        FROM users_games ug
        GROUP BY ug.user_id
        HAVING COUNT(*) >= $1
      )
      SELECT
        user_id,
        player_name,
        total_games,
        wins,
        ROUND((wins::decimal / total_games) * 100, 2) as win_rate,
        CASE WHEN crew_games > 0
          THEN ROUND((crew_wins::decimal / crew_games) * 100, 2)
          ELSE 0 END as crew_win_rate,
        CASE WHEN impostor_games > 0
          THEN ROUND((impostor_wins::decimal / impostor_games) * 100, 2)
          ELSE 0 END as impostor_win_rate
      FROM player_stats
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `,
      [filters.minGames, filters.limit, filters.offset]
    )

    return result.rows.map((row, index) => ({
      rank: filters.offset + index + 1,
      odoraiId: row.user_id,
      odoraiName: row.player_name || row.user_id,
      totalGames: parseInt(row.total_games, 10),
      wins: parseInt(row.wins, 10),
      winRate: parseFloat(row.win_rate),
      crewWinRate: parseFloat(row.crew_win_rate),
      impostorWinRate: parseFloat(row.impostor_win_rate),
    }))
  } finally {
    client.release()
  }
}

export async function getAllPlayers(): Promise<{ odoraiId: string; odoraiName: string }[]> {
  const client = await pool.connect()

  try {
    const result = await client.query(`
      SELECT DISTINCT ON (user_id)
        user_id::text as user_id,
        player_name
      FROM users_games
      ORDER BY user_id, game_id DESC
    `)

    return result.rows.map((row) => ({
      odoraiId: row.user_id,
      odoraiName: row.player_name || row.user_id,
    }))
  } finally {
    client.release()
  }
}
