import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOverviewStats, usePlayerStats } from '../hooks/useStats'
import { StatCard } from '../components/StatCard'
import { WinRateBar } from '../components/WinRateBar'
import { PlayerSelect } from '../components/PlayerSelect'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'

export function Dashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>()
  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useOverviewStats()
  const { data: playerStats, isLoading: playerLoading } = usePlayerStats(selectedPlayer)

  if (overviewLoading) {
    return <Loading />
  }

  if (overviewError) {
    return <ErrorMessage message="Failed to load statistics" onRetry={() => refetchOverview()} />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of Among Us game statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Games"
          value={overview?.totalGames || 0}
          icon="🎮"
        />
        <StatCard
          title="Total Players"
          value={overview?.totalPlayers || 0}
          icon="👥"
        />
        <StatCard
          title="Crew Win Rate"
          value={`${(overview?.crewWinRate || 0).toFixed(1)}%`}
          icon="👷"
          colorClass="text-cyan-400"
        />
        <StatCard
          title="Impostor Win Rate"
          value={`${(overview?.impostorWinRate || 0).toFixed(1)}%`}
          icon="🔪"
          colorClass="text-red-400"
        />
      </div>

      {/* Win Rate Comparison */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Win Rate Comparison</h2>
        <div className="space-y-4">
          <WinRateBar
            label="Crew"
            winRate={overview?.crewWinRate || 0}
            colorClass="bg-cyan-500"
          />
          <WinRateBar
            label="Impostor"
            winRate={overview?.impostorWinRate || 0}
            colorClass="bg-red-500"
          />
        </div>
      </div>

      {/* Player Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Player Statistics</h2>
        <div className="mb-4 max-w-xs">
          <PlayerSelect
            value={selectedPlayer}
            onChange={setSelectedPlayer}
            label="Select Player"
          />
        </div>

        {selectedPlayer && playerLoading && <Loading />}

        {playerStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Total Games</p>
                <p className="text-2xl font-bold">{playerStats.totalGames}</p>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Overall Win Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {playerStats.overallWinRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">Last Played</p>
                <p className="text-lg font-medium">
                  {playerStats.lastPlayed
                    ? new Date(playerStats.lastPlayed).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium text-cyan-400">As Crew</h3>
                <WinRateBar
                  label={`${playerStats.crewWins} wins / ${playerStats.crewGames} games`}
                  winRate={playerStats.crewWinRate}
                  colorClass="bg-cyan-500"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-red-400">As Impostor</h3>
                <WinRateBar
                  label={`${playerStats.impostorWins} wins / ${playerStats.impostorGames} games`}
                  winRate={playerStats.impostorWinRate}
                  colorClass="bg-red-500"
                />
              </div>
            </div>

            <div className="text-center">
              <Link
                to={`/player/${selectedPlayer}`}
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                View Detailed Stats
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent Games */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Recent Games</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 px-2">Game ID</th>
                <th className="pb-2 px-2">End Time</th>
                <th className="pb-2 px-2">Winner</th>
                <th className="pb-2 px-2">Players</th>
              </tr>
            </thead>
            <tbody>
              {overview?.recentGames.map((game) => (
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
                        game.winner === 'crew'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {game.winner === 'crew' ? 'Crew' : 'Impostor'}
                    </span>
                  </td>
                  <td className="py-3 px-2">{game.playerCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
