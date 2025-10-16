'use client'

interface MetricsDisplayProps {
  data: any
}

export default function MetricsDisplay({ data }: MetricsDisplayProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card p-4">
        <div className="label">
          Posts <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>(excl. reshares)</span>
        </div>
        <div className="metric" role="status" aria-live="polite">
          {data?.summary?.posts_last_12m || '-'}
        </div>
      </div>
      
      <div className="card p-4">
        <div className="label">Active months</div>
        <div className="metric" role="status" aria-live="polite">
          {data?.summary?.active_months || '-'}
        </div>
      </div>
      
      <div className="card p-4">
        <div className="label">Median engagement</div>
        <div className="metric" role="status" aria-live="polite">
          {data?.summary?.median_engagement || '-'}
        </div>
      </div>
      
      <div className="card p-4">
        <div className="label">P90 engagement</div>
        <div className="metric" role="status" aria-live="polite">
          {data?.summary?.p90_engagement || '-'}
        </div>
      </div>
    </section>
  )
}
