interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  colorClass?: string
}

export function StatCard({ title, value, subtitle, icon, colorClass = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-4xl">{icon}</span>}
      </div>
    </div>
  )
}
