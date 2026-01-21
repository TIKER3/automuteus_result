import type {
  OverviewStats,
  PlayerDetailStats,
  TrendData,
  TrendPeriod,
  HeatmapData,
  LeaderboardEntry,
} from '../../../shared/types'

const BASE_URL = import.meta.env.BASE_URL || '/'
const DATA_PATH = `${BASE_URL}data`

interface PlayerData {
  stats: PlayerDetailStats
  trends: {
    daily: TrendData[]
    weekly: TrendData[]
    monthly: TrendData[]
  }
  heatmap: HeatmapData[]
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${DATA_PATH}${path}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`)
  }
  return response.json()
}

export async function getOverviewStats(): Promise<OverviewStats> {
  return fetchJson<OverviewStats>('/overview.json')
}

export async function getAllPlayers(): Promise<{ odoraiId: string; odoraiName: string }[]> {
  return fetchJson<{ odoraiId: string; odoraiName: string }[]>('/players.json')
}

export async function getPlayerDetailStats(userId: string): Promise<PlayerDetailStats> {
  const playerData = await fetchJson<PlayerData>(`/players/${userId}.json`)
  return playerData.stats
}

export async function getTrendData(
  userId?: string,
  period: TrendPeriod = 'daily'
): Promise<TrendData[]> {
  if (userId) {
    const playerData = await fetchJson<PlayerData>(`/players/${userId}.json`)
    return playerData.trends[period]
  }
  return fetchJson<TrendData[]>(`/trends/global-${period}.json`)
}

export async function getHeatmapData(userId: string): Promise<HeatmapData[]> {
  const playerData = await fetchJson<PlayerData>(`/players/${userId}.json`)
  return playerData.heatmap
}

export interface LeaderboardParams {
  minGames?: number
  sortBy?: string
  limit?: number
  offset?: number
}

export async function getLeaderboard(_params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
  return fetchJson<LeaderboardEntry[]>('/leaderboard.json')
}
