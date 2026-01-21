import { useAllPlayers } from '../hooks/useStats'

interface PlayerSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  allowAll?: boolean
  label?: string
}

export function PlayerSelect({ value, onChange, allowAll = false, label = 'Player' }: PlayerSelectProps) {
  const { data: players, isLoading } = useAllPlayers()

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm text-gray-400">{label}</label>}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        disabled={isLoading}
        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {allowAll && <option value="">All Players</option>}
        {!allowAll && !value && <option value="">Select a player</option>}
        {players?.map((player) => (
          <option key={player.odoraiId} value={player.odoraiId}>
            {player.odoraiName}
          </option>
        ))}
      </select>
    </div>
  )
}
