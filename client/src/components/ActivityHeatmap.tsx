import type { HeatmapData } from '../../../shared/types'

interface ActivityHeatmapProps {
  data: HeatmapData[]
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Create a map for quick lookup
  const dataMap = new Map(data.map((d) => [d.date, d]))

  // Generate dates for the last year (52 weeks)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364) // Go back ~1 year

  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const weeks: { date: Date; data: HeatmapData | undefined }[][] = []
  let currentWeek: { date: Date; data: HeatmapData | undefined }[] = []

  const currentDate = new Date(startDate)
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]
    currentWeek.push({
      date: new Date(currentDate),
      data: dataMap.get(dateStr),
    })

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const getColorClass = (count: number | undefined): string => {
    if (!count || count === 0) return 'bg-gray-700'
    if (count <= 2) return 'bg-green-900'
    if (count <= 5) return 'bg-green-700'
    if (count <= 10) return 'bg-green-500'
    return 'bg-green-400'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {weeks.map((week, weekIndex) => {
            const firstDay = week[0]?.date
            if (firstDay && firstDay.getDate() <= 7) {
              return (
                <div key={weekIndex} className="w-3 text-xs text-gray-400">
                  {months[firstDay.getMonth()]}
                </div>
              )
            }
            return <div key={weekIndex} className="w-3" />
          })}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2">
            {days.map((day, i) => (
              <div
                key={day}
                className="h-3 text-xs text-gray-400 leading-3"
                style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColorClass(day.data?.count)} cursor-pointer transition-colors hover:ring-1 hover:ring-white`}
                    title={`${day.date.toLocaleDateString()}: ${day.data?.count || 0} games (${day.data?.wins || 0}W/${day.data?.losses || 0}L)`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
