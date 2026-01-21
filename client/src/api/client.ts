import type {
  ApiResponse,
  OverviewStats,
  PlayerStats,
  PlayerDetailStats,
  TrendData,
  TrendPeriod,
  HeatmapData,
  LeaderboardEntry,
  LeaderboardSortBy,
} from '../../../shared/types'

const API_BASE = '/api'

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`)
  const data: ApiResponse<T> = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }

  return data.data as T
}

export async function getOverviewStats(): Promise<OverviewStats> {
  return fetchApi<OverviewStats>('/stats/overview')
}

export async function getAllPlayers(): Promise<{ odoraiId: string; odoraiName: string }[]> {
  return fetchApi<{ odoraiId: string; odoraiName: string }[]>('/stats/players')
}

export async function getPlayerStats(userId: string): Promise<PlayerStats> {
  return fetchApi<PlayerStats>(`/stats/player/${encodeURIComponent(userId)}`)
}

export async function getPlayerDetailStats(userId: string): Promise<PlayerDetailStats> {
  return fetchApi<PlayerDetailStats>(`/stats/player/${encodeURIComponent(userId)}/detail`)
}

export async function getTrendData(
  userId?: string,
  period: TrendPeriod = 'daily'
): Promise<TrendData[]> {
  const params = new URLSearchParams({ period })
  if (userId) {
    params.set('userId', userId)
  }
  return fetchApi<TrendData[]>(`/analysis/trend?${params}`)
}

export async function getHeatmapData(userId: string): Promise<HeatmapData[]> {
  return fetchApi<HeatmapData[]>(`/analysis/heatmap/${encodeURIComponent(userId)}`)
}

export interface LeaderboardParams {
  minGames?: number
  sortBy?: LeaderboardSortBy
  limit?: number
  offset?: number
}

export async function getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
  const searchParams = new URLSearchParams()
  if (params.minGames !== undefined) searchParams.set('minGames', String(params.minGames))
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset))

  return fetchApi<LeaderboardEntry[]>(`/ranking/leaderboard?${searchParams}`)
}
