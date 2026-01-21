import { useParams, Link } from 'react-router-dom'
import { usePlayerDetailStats, useHeatmapData } from '../hooks/useStats'
import { StatCard } from '../components/StatCard'
import { WinRateBar } from '../components/WinRateBar'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ActivityHeatmap } from '../components/ActivityHeatmap'

export function PlayerDetail() {
  const { userId } = useParams<{ userId: string }>()
  const { data: stats, isLoading, error, refetch } = usePlayerDetailStats(userId)
  const { data: heatmapData } = useHeatmapData(userId)

  if (isLoading) {
    return <Loading />
  }

  if (error || !stats) {
    return <ErrorMessage message="Failed to load player statistics" onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{stats.odoraiName}</h1>
          <p className="text-gray-400">Player Statistics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon="🎮"
        />
        <StatCard
          title="Overall Win Rate"
          value={`${stats.overallWinRate.toFixed(1)}%`}
          icon="🏆"
          colorClass="text-green-400"
        />
        <StatCard
          title="Current Streak"
          value={
            stats.streaks.currentWinStreak > 0
              ? `${stats.streaks.currentWinStreak}W`
              : `${stats.streaks.currentLossStreak}L`
          }
          icon={stats.streaks.currentWinStreak > 0 ? '🔥' : '❄️'}
          colorClass={stats.streaks.currentWinStreak > 0 ? 'text-orange-400' : 'text-blue-400'}
        />
        <StatCard
          title="Max Win Streak"
          value={stats.streaks.maxWinStreak}
          icon="⭐"
          colorClass="text-yellow-400"
        />
      </div>

      {/* Role Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">As Crew</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Games</p>
                <p className="text-2xl font-bold">{stats.crewGames}</p>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Wins</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.crewWins}</p>
              </div>
            </div>
            <WinRateBar
              label="Win Rate"
              winRate={stats.crewWinRate}
              colorClass="bg-cyan-500"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-red-400">As Impostor</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Games</p>
                <p className="text-2xl font-bold">{stats.impostorGames}</p>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Wins</p>
                <p className="text-2xl font-bold text-red-400">{stats.impostorWins}</p>
              </div>
            </div>
            <WinRateBar
              label="Win Rate"
              winRate={stats.impostorWinRate}
              colorClass="bg-red-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      {heatmapData && heatmapData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Activity (Last Year)</h2>
          <ActivityHeatmap data={heatmapData} />
        </div>
      )}

      {/* Recent Games */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Recent Games</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 px-2">Game</th>
                <th className="pb-2 px-2">Date</th>
                <th className="pb-2 px-2">Role</th>
                <th className="pb-2 px-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentGames.map((game) => (
                <tr key={game.gameId} className="border-b border-gray-700/50">
                  <td className="py-3 px-2">#{game.gameId}</td>
                  <td className="py-3 px-2 text-gray-400">
                    {game.endTime
                      ? new Date(game.endTime).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        game.role === 'crew'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {game.role === 'crew' ? 'Crew' : 'Impostor'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        game.won
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {game.won ? 'Win' : 'Loss'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
