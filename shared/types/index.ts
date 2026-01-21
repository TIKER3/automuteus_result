// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// Player role types
export type PlayerRole = 'crew' | 'impostor'
export type GameOutcome = 'win' | 'loss'

// Overview statistics
export interface OverviewStats {
  totalGames: number
  totalPlayers: number
  crewWins: number
  impostorWins: number
  crewWinRate: number
  impostorWinRate: number
  recentGames: RecentGame[]
}

export interface RecentGame {
  gameId: number
  endTime: string
  winner: 'crew' | 'impostor'
  playerCount: number
}

// Player statistics
export interface PlayerStats {
  odoraiId: string
  odoraiName: string
  totalGames: number
  crewGames: number
  impostorGames: number
  crewWins: number
  impostorWins: number
  crewWinRate: number
  impostorWinRate: number
  overallWinRate: number
  lastPlayed: string
}

// Detailed player statistics
export interface PlayerDetailStats extends PlayerStats {
  recentGames: PlayerGameHistory[]
  streaks: {
    currentWinStreak: number
    maxWinStreak: number
    currentLossStreak: number
  }
}

export interface PlayerGameHistory {
  gameId: number
  endTime: string
  role: PlayerRole
  won: boolean
}

// Trend analysis
export interface TrendData {
  period: string
  totalGames: number
  wins: number
  winRate: number
  crewGames: number
  crewWins: number
  impostorGames: number
  impostorWins: number
}

export type TrendPeriod = 'daily' | 'weekly' | 'monthly'

// Heatmap data (GitHub style activity)
export interface HeatmapData {
  date: string
  count: number
  wins: number
  losses: number
}

// Ranking/Leaderboard
export interface LeaderboardEntry {
  rank: number
  odoraiId: string
  odoraiName: string
  totalGames: number
  wins: number
  winRate: number
  crewWinRate: number
  impostorWinRate: number
}

export type LeaderboardSortBy = 'winRate' | 'totalGames' | 'wins' | 'crewWinRate' | 'impostorWinRate'

export interface LeaderboardFilters {
  minGames: number
  sortBy: LeaderboardSortBy
  limit: number
  offset: number
}

// Player comparison
export interface PlayerComparison {
  players: PlayerStats[]
  comparison: {
    metric: string
    values: { odoraiId: string; value: number }[]
  }[]
}

// Database row types (matching AutoMuteUs schema)
export interface DbUserGame {
  user_id: string
  guild_id: string
  game_id: number
  player_name: string
  player_color: number
  player_role: number // 0 = crew, 1 = impostor
  player_won: boolean
}

export interface DbGame {
  game_id: number
  guild_id: string
  connect_code: string
  start_time: string | null
  end_time: string | null
}

export interface DbUser {
  user_id: string
  opt: boolean
}

export interface DbUserSetting {
  user_id: string
  odorai_id: string | null
  odorai_name: string | null
}
