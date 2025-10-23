'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MetricsDisplay from '@/components/MetricsDisplay'
import ChartSection from '@/components/ChartSection'
import InsightsPanel from '@/components/InsightsPanel'
import EngagementAnalysis from '@/components/EngagementAnalysis'
import PostingRhythm from '@/components/PostingRhythm'
import TimingInsights from '@/components/TimingInsights'
import PostDistributionHeatmap from '@/components/PostDistributionHeatmap'
import TopPosts from '@/components/TopPosts'
import PeerComparison from '@/components/PeerComparison'
import ValueProposition from '@/components/ValueProposition'
import LinkedinAnalyticsCard from '@/components/LinkedinAnalyticsCard'
import PostTypeMosaic from '@/components/PostTypeMosaic'
import PostTypeDistributionCard from '@/components/PostTypeDistributionCard'
import { supabase } from '@/lib/supabase-client'
import { CardNameProvider } from '@/lib/contexts/CardNameContext'

export default function StaticReport({ params }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true)
        
        // Find dataset by shareable_url
        const { data: dataset, error: fetchError } = await supabase
          .from('linkedin_datasets')
          .select('*')
          .eq('shareable_url', params.token)
          .single()

        if (fetchError) {
          throw new Error('Report not found')
        }

        if (!dataset) {
          throw new Error('Report not found')
        }

        // Check if static HTML content is available
        if (dataset.static_html_content) {
          // For static reports, we'll render the HTML content directly
          setData({
            ...dataset.analysis_data,
            staticHtmlContent: dataset.static_html_content,
            llmInsights: dataset.llm_insights,
            isStaticReport: true
          })
        } else {
          // Dynamic rendering with LLM insights included
          setData({
            ...dataset.analysis_data,
            llmInsights: dataset.llm_insights
          })
        }
      } catch (err) {
        console.error('Failed to load report:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.token) {
      loadReportData()
    }
  }, [params.token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h1>
          <p className="text-gray-600">This report contains no data.</p>
        </div>
      </div>
    )
  }

  // If this is a static report with HTML content, render it directly
  if (data?.isStaticReport && data?.staticHtmlContent) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: data.staticHtmlContent }}
        className="min-h-screen"
      />
    )
  }

  return (
    <CardNameProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data?.profile?.name || 'LinkedIn Analytics Report'}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Badge>
              <Badge variant="outline" className="text-xs">Last 12 months</Badge>
              <Badge variant="outline" className="text-xs">Dynamic Report</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Key Numbers Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Posts <span className="text-xs">(excl. reshares)</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {data?.summary?.posts_last_12m ?? '-'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Active months
                </div>
                <div className="text-2xl font-bold text-primary">
                  {data?.summary?.active_months ?? '-'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  Median engagement
                </div>
                <div className="text-2xl font-bold text-primary">
                  {data?.summary?.median_engagement ?? '-'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">
                  P90 engagement
                </div>
                <div className="text-2xl font-bold text-primary">
                  {data?.summary?.p90_engagement ?? '-'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* LinkedIn Analytics Card */}
            <div className="space-y-4">
              {data?.trends?.posts_per_month && (
                <LinkedinAnalyticsCard
                  monthlyCounts={Object.values(data.trends.posts_per_month)}
                  start={{ month: 9, year: 2024 }}
                  insight=""
                  posts={data.posts || []}
                  summaryData={data.summary}
                />
              )}
            </div>

            {/* Post Type Distribution Cards */}
            {data?.mix?.type_share && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Original PostTypeMosaic - Single Column Stack */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-600 text-center">Single Column Stack</h3>
                  <div className="flex justify-center">
                    <div className="w-[280px]">
                      <PostTypeMosaic
                        data={(() => {
                          const entries = Object.entries(data.mix.type_share);
                          return entries.map(([type, share]) => ({
                            type: type.charAt(0).toUpperCase() + type.slice(1),
                            value: Math.round((share || 0) * 100),
                            color: undefined
                          }));
                        })()}
                        options={{
                          columns: 1,
                          preferOneColumnForThree: false,
                          minH: 80,
                          maxH: 250,
                          unit: 2.5
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* New PostTypeDistributionCard - Two Column Weighted */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-600 text-center">Two Column Weighted</h3>
                  <div className="flex justify-center">
                    <div className="w-[280px] h-[400px]">
                      <PostTypeDistributionCard
                        data={(() => {
                          const entries = Object.entries(data.mix.type_share);
                          return entries.map(([type, share]) => ({
                            type: type.charAt(0).toUpperCase() + type.slice(1),
                            desc: type === 'text' ? 'Pure text updates' :
                                  type === 'image' ? 'Posts with static visuals' :
                                  type === 'video' ? 'Clips or video snippets' : `${type} content`,
                            value: Math.round((share || 0) * 100),
                            color: undefined
                          }));
                        })()}
                        options={{
                          columns: 2,
                          preferOneColumnForThree: false,
                          minH: 0,
                          maxH: 400,
                          unit: 4
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <ChartSection data={data} />

          {/* Engagement Analysis */}
          <EngagementAnalysis data={data} />

          {/* AI Insights */}
          <InsightsPanel data={data} />

          {/* Timing Insights */}
          <TimingInsights data={data} />

          {/* Post Distribution Heatmap */}
          <PostDistributionHeatmap data={data} />

          {/* Posting Rhythm & Top Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PostingRhythm data={data} />
            <TopPosts data={data} />
          </div>

          {/* Peer Comparison */}
          <PeerComparison data={data} />

          {/* Value Proposition Section */}
          <ValueProposition data={data} />
        </div>
      </div>
    </div>
    </CardNameProvider>
  )
}
