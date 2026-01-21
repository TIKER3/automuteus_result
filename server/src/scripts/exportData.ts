import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, testConnection, closePool } from '../config/database.js'
import {
  getOverviewStats,
  getAllPlayers,
  getPlayerDetailStats,
  getTrendData,
  getHeatmapData,
  getLeaderboard,
} from '../repositories/userGameRepository.js'
import type {
  OverviewStats,
  PlayerDetailStats,
  TrendData,
  HeatmapData,
  LeaderboardEntry,
} from '../../../shared/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OUTPUT_DIR = join(__dirname, '../../../client/public/data')

interface PlayerData {
  stats: PlayerDetailStats
  trends: {
    daily: TrendData[]
    weekly: TrendData[]
    monthly: TrendData[]
  }
  heatmap: HeatmapData[]
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await ensureDir(dirname(filePath))
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`  Created: ${filePath}`)
}

async function exportOverview(): Promise<void> {
  console.log('Exporting overview stats...')
  const overview = await getOverviewStats()
  await writeJson(join(OUTPUT_DIR, 'overview.json'), overview)
}

async function exportPlayers(): Promise<{ odoraiId: string; odoraiName: string }[]> {
  console.log('Exporting players list...')
  const players = await getAllPlayers()
  await writeJson(join(OUTPUT_DIR, 'players.json'), players)
  return players
}

async function exportLeaderboard(): Promise<void> {
  console.log('Exporting leaderboard...')
  const leaderboard = await getLeaderboard({
    minGames: 10,
    sortBy: 'winRate',
    limit: 50,
    offset: 0,
  })
  await writeJson(join(OUTPUT_DIR, 'leaderboard.json'), leaderboard)
}

async function exportGlobalTrends(): Promise<void> {
  console.log('Exporting global trends...')
  const trendsDir = join(OUTPUT_DIR, 'trends')

  const [daily, weekly, monthly] = await Promise.all([
    getTrendData(null, 'daily'),
    getTrendData(null, 'weekly'),
    getTrendData(null, 'monthly'),
  ])

  await Promise.all([
    writeJson(join(trendsDir, 'global-daily.json'), daily),
    writeJson(join(trendsDir, 'global-weekly.json'), weekly),
    writeJson(join(trendsDir, 'global-monthly.json'), monthly),
  ])
}

async function exportPlayerData(userId: string): Promise<void> {
  const playerDir = join(OUTPUT_DIR, 'players')

  const [stats, daily, weekly, monthly, heatmap] = await Promise.all([
    getPlayerDetailStats(userId),
    getTrendData(userId, 'daily'),
    getTrendData(userId, 'weekly'),
    getTrendData(userId, 'monthly'),
    getHeatmapData(userId),
  ])

  if (!stats) {
    console.log(`  Skipping player ${userId}: no stats found`)
    return
  }

  const playerData: PlayerData = {
    stats,
    trends: {
      daily,
      weekly,
      monthly,
    },
    heatmap,
  }

  await writeJson(join(playerDir, `${userId}.json`), playerData)
}

async function exportAllPlayerData(
  players: { odoraiId: string; odoraiName: string }[]
): Promise<void> {
  console.log(`Exporting data for ${players.length} players...`)

  const batchSize = 10
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize)
    await Promise.all(batch.map((p) => exportPlayerData(p.odoraiId)))
    console.log(`  Progress: ${Math.min(i + batchSize, players.length)}/${players.length}`)
  }
}

async function main(): Promise<void> {
  console.log('=== Among Us Stats Data Export ===')
  console.log(`Output directory: ${OUTPUT_DIR}\n`)

  const connected = await testConnection()
  if (!connected) {
    console.error('Failed to connect to database')
    process.exit(1)
  }
  console.log('Database connection successful\n')

  try {
    await ensureDir(OUTPUT_DIR)

    await exportOverview()
    const players = await exportPlayers()
    await exportLeaderboard()
    await exportGlobalTrends()
    await exportAllPlayerData(players)

    console.log('\n=== Export completed successfully! ===')
  } catch (error) {
    console.error('Export failed:', error)
    process.exit(1)
  } finally {
    await closePool()
  }
}

main()
