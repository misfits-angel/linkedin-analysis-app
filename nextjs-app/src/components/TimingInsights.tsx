'use client'

interface TimingInsightsProps {
  data: any
}

export default function TimingInsights({ data }: TimingInsightsProps) {
  const timing = data?.timingInsights || {}
  
  if (!timing.day_of_week || Object.keys(timing.day_of_week).length === 0) {
    return (
      <div className="card p-4">
        <div className="section-title-spaced">Timing Insights</div>
        <div className="text-sm text-gray-600">Timing data not available.</div>
      </div>
    )
  }

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const dayAbbr = { 
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', 
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' 
  }

  return (
    <div className="card p-4">
      <div className="section-title-spaced">Timing Insights</div>
      
      {/* Day of Week Performance */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">📅 Performance by Day of Week</div>
        <div className="text-xs text-gray-500 mb-2">Shows: Posts count • Median engagement</div>
        
        <div className="grid grid-cols-7 gap-2 text-center">
          {dayOrder.map(day => {
            const stats = timing.day_of_week[day]
            const isActive = stats && stats.count > 0
            const isBest = timing.best_day === day
            
            return (
              <div
                key={day}
                className={`p-2 rounded-lg text-xs ${
                  isBest 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : isActive 
                    ? 'bg-gray-100 border border-gray-300' 
                    : 'bg-gray-50 border border-gray-200 opacity-50'
                }`}
              >
                {isActive ? (
                  <>
                    <div className="font-semibold text-gray-800">{dayAbbr[day as keyof typeof dayAbbr]}</div>
                    <div className="text-xs text-gray-600">
                      {stats.count} {stats.count === 1 ? 'post' : 'posts'}
                    </div>
                    <div className="font-bold text-blue-700">{stats.avg_engagement}</div>
                    {isBest && <div className="text-xs mt-1">⭐</div>}
                  </>
                ) : (
                  <>
                    <div className="font-semibold text-gray-400">{dayAbbr[day as keyof typeof dayAbbr]}</div>
                    <div className="text-xs text-gray-400">-</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Best Day Insight */}
      {timing.best_day && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-semibold text-blue-800 mb-1">🎯 Best Day to Post</div>
          <div className="text-sm text-blue-700">
            {timing.best_day}s show your highest median engagement ({timing.day_of_week[timing.best_day].avg_engagement} from {timing.day_of_week[timing.best_day].count} {timing.day_of_week[timing.best_day].count === 1 ? 'post' : 'posts'})
          </div>
        </div>
      )}
    </div>
  )
}
