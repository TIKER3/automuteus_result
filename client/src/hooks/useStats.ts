import { useQuery } from '@tanstack/react-query'
import {
  getOverviewStats,
  getAllPlayers,
  getPlayerDetailStats,
  getTrendData,
  getHeatmapData,
  getLeaderboard,
  type LeaderboardParams,
} from '../api/staticClient'
import type { TrendPeriod } from '../../../shared/types'

export function useOverviewStats() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: getOverviewStats,
    staleTime: Infinity,
  })
}

export function useAllPlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: getAllPlayers,
    staleTime: Infinity,
  })
}

export function usePlayerStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['playerDetail', userId],
    queryFn: () => getPlayerDetailStats(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function usePlayerDetailStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['playerDetail', userId],
    queryFn: () => getPlayerDetailStats(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function useTrendData(userId?: string, period: TrendPeriod = 'daily') {
  return useQuery({
    queryKey: ['trend', userId, period],
    queryFn: () => getTrendData(userId, period),
    staleTime: Infinity,
  })
}

export function useHeatmapData(userId: string | undefined) {
  return useQuery({
    queryKey: ['heatmap', userId],
    queryFn: () => getHeatmapData(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

export function useLeaderboard(params: LeaderboardParams = {}) {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: () => getLeaderboard(params),
    staleTime: Infinity,
  })
}
