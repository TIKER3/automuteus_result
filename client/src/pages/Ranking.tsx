import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLeaderboard } from '../hooks/useStats'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import type { LeaderboardSortBy } from '../../../shared/types'

export function Ranking() {
  const [minGames, setMinGames] = useState(10)
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('winRate')

  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard({
    minGames,
    sortBy,
    limit: 50,
  })

  const sortOptions: { value: LeaderboardSortBy; label: string }[] = [
    { value: 'winRate', label: 'Win Rate' },
    { value: 'totalGames', label: 'Total Games' },
    { value: 'wins', label: 'Total Wins' },
    { value: 'crewWinRate', label: 'Crew Win Rate' },
    { value: 'impostorWinRate', label: 'Impostor Win Rate' },
  ]

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ranking</h1>
        <p className="text-gray-400">Leaderboard of all players</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label className="block text-sm text-gray-400">Minimum Games</label>
          <input
            type="number"
            value={minGames}
            onChange={(e) => setMinGames(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white w-24 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-gray-400">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as LeaderboardSortBy)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <Loading />}

      {error && <ErrorMessage message="Failed to load leaderboard" onRetry={() => refetch()} />}

      {leaderboard && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700/50 text-left text-gray-400">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-center">Games</th>
                  <th className="py-3 px-4 text-center">Wins</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                  <th className="py-3 px-4 text-center">Crew WR</th>
                  <th className="py-3 px-4 text-center">Impostor WR</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.odoraiId}
                    className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          entry.rank <= 3 ? 'text-2xl' : 'text-gray-400'
                        }`}
                      >
                        {getRankBadge(entry.rank)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/player/${entry.odoraiId}`}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        {entry.odoraiName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center">{entry.totalGames}</td>
                    <td className="py-3 px-4 text-center text-green-400">{entry.wins}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded ${
                          entry.winRate >= 50
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {entry.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-cyan-400">
                      {entry.crewWinRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center text-red-400">
                      {entry.impostorWinRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              No players found with {minGames}+ games
            </div>
          )}
        </div>
      )}
    </div>
  )
}
