interface WinRateBarProps {
  winRate: number
  label: string
  colorClass?: string
}

export function WinRateBar({ winRate, label, colorClass = 'bg-blue-500' }: WinRateBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium">{winRate.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(winRate, 100)}%` }}
        />
      </div>
    </div>
  )
}
