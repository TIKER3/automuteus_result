import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useTrendData } from '../hooks/useStats'
import { PlayerSelect } from '../components/PlayerSelect'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import type { TrendPeriod } from '../../../shared/types'

export function Analysis() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>()
  const [period, setPeriod] = useState<TrendPeriod>('daily')
  const { data: trendData, isLoading, error, refetch } = useTrendData(selectedPlayer, period)

  const periods: { value: TrendPeriod; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analysis</h1>
        <p className="text-gray-400">Detailed game performance analysis</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <PlayerSelect
            value={selectedPlayer}
            onChange={setSelectedPlayer}
            allowAll
            label="Player"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-gray-400">Period</label>
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  period === p.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && <Loading />}

      {error && <ErrorMessage message="Failed to load trend data" onRetry={() => refetch()} />}

      {trendData && trendData.length > 0 && (
        <>
          {/* Win Rate Trend */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Win Rate Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
                  <YAxis
                    stroke="#9CA3AF"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Win Rate']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="winRate"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                    name="Win Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Games by Role */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Games by Role</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="crewGames" fill="#22D3EE" name="Crew Games" />
                  <Bar dataKey="impostorGames" fill="#EF4444" name="Impostor Games" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wins Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Wins Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="crewWins" stackId="a" fill="#22D3EE" name="Crew Wins" />
                  <Bar dataKey="impostorWins" stackId="a" fill="#EF4444" name="Impostor Wins" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {trendData && trendData.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
          <p className="text-gray-400">No data available for the selected period</p>
        </div>
      )}
    </div>
  )
}
