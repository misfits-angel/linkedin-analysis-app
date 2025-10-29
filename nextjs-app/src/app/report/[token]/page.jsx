'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { PROPOSAL_CONTENT } from '@/lib/proposal-content'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import LinkedInAnalyticsCard from '@/components/LinkedinAnalyticsCard'
import PostsPerMonthChart from '@/components/PostsPerMonthChart'

// New Proposal Content Component
function ProposalContent({ data }) {
  const [openFaqs, setOpenFaqs] = useState({})
  
  // Debug logging
  console.log('🎨 ProposalContent rendering with data:', {
    hasData: !!data,
    hasLlmInsights: !!data?.llmInsights,
    llmInsightsKeys: data?.llmInsights ? Object.keys(data.llmInsights) : [],
    cardSummaries: data?.llmInsights?.cardSummaries,
    postingActivitySummary: data?.llmInsights?.cardSummaries?.postingActivitySummary,
    analyticsCardSummary: data?.llmInsights?.cardSummaries?.analyticsCardSummary,
    cadenceChartSummary: data?.llmInsights?.cardSummaries?.cadenceChartSummary
  })
  
  // Helper to calculate stats from data
  const calculateStats = () => {
    if (!data?.posts) return { originalPosts: 0, reposts: 0, mostActiveMonth: 'N/A', longestInactive: 'N/A' }
    
    const posts = data.posts
    const originalPosts = posts.filter(p => p.type !== 'repost').length
    const reposts = posts.filter(p => p.type === 'repost').length
    
    // Find most active month
    const monthCounts = {}
    posts.forEach(post => {
      const date = new Date(post.date)
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })
    const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    
    // Calculate longest gap (simplified)
    const sortedDates = posts.map(p => new Date(p.date)).sort((a, b) => a - b)
    let maxGap = 0
    let gapStart = null, gapEnd = null
    for (let i = 1; i < sortedDates.length; i++) {
      const gap = Math.floor((sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24))
      if (gap > maxGap) {
        maxGap = gap
        gapStart = sortedDates[i-1]
        gapEnd = sortedDates[i]
      }
    }
    const longestInactive = gapStart && gapEnd 
      ? `${gapStart.toLocaleString('default', { month: 'short' })} ${gapStart.getFullYear()} - ${gapEnd.toLocaleString('default', { month: 'short' })} ${gapEnd.getFullYear()}`
      : 'N/A'
    
    return { originalPosts, reposts, mostActiveMonth, longestInactive }
  }
  
  const stats = calculateStats()
  const { proposition, coreOffering, audit, faqs } = PROPOSAL_CONTENT

  return (
    <div className="w-full">
      {/* SECTION 1: PROPOSITION */}
      <section className="mb-20 max-w-6xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#2f8f5b] text-center mb-8">
          {proposition.title}
        </h1>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Left Column */}
          <div className="flex-1 space-y-4 text-lg text-gray-700 leading-relaxed">
            <p className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: proposition.headline }} />
            {proposition.paragraphs.slice(0, 3).map((para, idx) => (
              <p key={idx} className={para.includes('So the founders') ? 'font-semibold text-gray-900' : ''} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
          {/* Right Column */}
          <div className="flex-1 space-y-4 text-lg text-gray-700 leading-relaxed">
            {proposition.paragraphs.slice(3).map((para, idx) => (
              <p key={idx + 3} className={para.includes('So the founders') ? 'font-semibold text-gray-900' : ''} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-20"></div>

      {/* SECTION 2: CORE OFFERING */}
      <section className="mb-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-4">
          {coreOffering.title}
        </h2>
        
        {coreOffering.intro && (
          <p className="text-center text-gray-700 text-lg mb-12" dangerouslySetInnerHTML={{ __html: coreOffering.intro }} />
        )}
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Left Column - Positioning, Voice, Drafts, Posts */}
          <div className="flex-1 space-y-8">
            {coreOffering.sections.filter((_, idx) => [0, 2, 4, 5].includes(idx)).map((section, originalIdx) => (
              <div key={`left-${originalIdx}`} className="space-y-4">
                <h3 className="text-xl font-bold text-[#2f8f5b]">{section.title}</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            ))}
          </div>
          
          {/* Right Column - Mind, Configured POV feed */}
          <div className="flex-1 space-y-8">
            {coreOffering.sections.filter((_, idx) => [1, 3].includes(idx)).map((section, originalIdx) => (
              <div key={`right-${originalIdx}`} className="space-y-4">
                <h3 className="text-xl font-bold text-[#2f8f5b]">{section.title}</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Callout */}
        <div className="mt-12 bg-[#d6e3dd] p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-[#2f8f5b] mb-4">{coreOffering.pricing.title}</h3>
          <p className="text-lg text-gray-900 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: coreOffering.pricing.content }} />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-20"></div>

      {/* SECTION 2.5: ADD-ONS */}
      <section className="mb-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-4">
          {PROPOSAL_CONTENT.addOns.title}
        </h2>
        <p className="text-center text-gray-700 text-lg mb-12">
          {PROPOSAL_CONTENT.addOns.intro}
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12 items-start">
          {/* Column 1 - Engagement */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.sections[0].title}</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {PROPOSAL_CONTENT.addOns.sections[0].content}
            </div>
          </div>
          
          {/* Column 2 - Outreach */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.sections[1].title}</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {PROPOSAL_CONTENT.addOns.sections[1].content}
            </div>
          </div>
          
          {/* Column 3 - Twitter/X */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.sections[2].title}</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {PROPOSAL_CONTENT.addOns.sections[2].content}
            </div>
          </div>
        </div>

        {/* Add-On Pricing Callout */}
        <div className="bg-[#d6e3dd] p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-[#2f8f5b] mb-4">{PROPOSAL_CONTENT.addOns.pricing.title}</h3>
          <p className="text-lg text-gray-900 whitespace-pre-line leading-relaxed">
            {PROPOSAL_CONTENT.addOns.pricing.content}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-20"></div>

      {/* SECTION 3: AUDIT (Your Posts) */}
      <section className="mb-20 py-16">
        <div className="w-full">
          <div className="px-6 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-4">
              {audit.title}
            </h2>
            <p className="text-center text-gray-700 text-lg mb-12">
              {audit.subtitle}
            </p>
          </div>

          {/* Flex Layout for Independent Columns */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Left Column - Independent flow */}
            <div className="flex-1 space-y-12">
              {/* Quick Stats Table */}
              <div>
                <div className="px-6">
                  <h3 className="text-lg font-semibold text-[#2f8f5b] mb-4">Snapshots</h3>
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Original posts</td>
                        <td className="py-3 text-gray-700">{stats.originalPosts}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Reposts</td>
                        <td className="py-3 text-gray-700">{stats.reposts}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Most active month</td>
                        <td className="py-3 text-gray-700">{stats.mostActiveMonth}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Longest inactive</td>
                        <td className="py-3 text-gray-700">{stats.longestInactive}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-6">
                    <p className="text-sm text-gray-700 bg-[#d6e3dd] p-3 rounded">
                      {data?.llmInsights?.cardSummaries?.postingActivitySummary || (
                        <span className="opacity-70">
                          {audit.placeholderSummary}
                          {!data?.llmInsights && " (Report may need to be regenerated with LLM insights enabled)"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: LinkedIn Analytics */}
              <div>
                <div className="px-6">
                  <LinkedInAnalyticsCard 
                    monthlyCounts={data?.trends?.posts_per_month ? Object.values(data.trends.posts_per_month) : []}
                    postsPerMonth={data?.trends?.posts_per_month || {}}
                    insight=""
                    posts={data?.posts || []}
                    summaryData={data?.summary}
                    isReportView={true} 
                  />
                </div>
                <div className="mt-4 px-6">
                  <div className="bg-[#d6e3dd] p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {data?.llmInsights?.cardSummaries?.analyticsCardSummary || (
                        <span className="opacity-70">
                          {audit.placeholderSummary}
                          {!data?.llmInsights && " (Report may need to be regenerated with LLM insights enabled)"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Independent flow */}
            <div className="flex-1 space-y-12">
              {/* Card: Posting Cadence (Posts Per Month Chart) */}
              <div>
                <div className="px-6">
                  <PostsPerMonthChart data={data} isReportView={true} />
                </div>
                <div className="mt-4 px-6">
                  <div className="bg-[#d6e3dd] p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {data?.llmInsights?.cardSummaries?.cadenceChartSummary || (
                        <span className="opacity-70">
                          {audit.placeholderSummary}
                          {!data?.llmInsights && " (Report may need to be regenerated with LLM insights enabled)"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-20"></div>

      {/* SECTION 5: NEXT STEPS */}
      <section className="mb-20 max-w-6xl mx-auto px-4">
        <div className="text-center py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-4">
            {PROPOSAL_CONTENT.nextSteps.title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            {PROPOSAL_CONTENT.nextSteps.content}
          </p>
          <a
            href={PROPOSAL_CONTENT.nextSteps.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#2f8f5b] hover:bg-[#1a5636] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            {PROPOSAL_CONTENT.nextSteps.ctaText}
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-20"></div>

      {/* SECTION 6: FAQs */}
      <section className="mb-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-12">
          {faqs.title}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Left Column - Odd FAQs (1st, 3rd, 5th...) */}
          <div className="flex-1 space-y-6">
            {faqs.questions.map((faq, idx) => idx % 2 === 0 && (
              <Collapsible 
                key={idx} 
                open={openFaqs[idx] || false}
                onOpenChange={(isOpen) => setOpenFaqs(prev => ({ ...prev, [idx]: isOpen }))}
                className="rounded-lg overflow-hidden border border-gray-200 w-full"
              >
                <CollapsibleTrigger data-faq-trigger className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors" style={{ backgroundColor: "#d6e3dd" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c4d5cb"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#d6e3dd"}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-[#2f8f5b] transition-transform flex-shrink-0 ${
                      openFaqs[idx] ? 'transform rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 py-4 bg-white">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: faq.answer || 'Answer not available' }} />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          
          {/* Right Column - Even FAQs (2nd, 4th, 6th...) */}
          <div className="flex-1 space-y-6">
            {faqs.questions.map((faq, idx) => idx % 2 === 1 && (
              <Collapsible 
                key={idx} 
                open={openFaqs[idx] || false}
                onOpenChange={(isOpen) => setOpenFaqs(prev => ({ ...prev, [idx]: isOpen }))}
                className="rounded-lg overflow-hidden border border-gray-200 w-full"
              >
                <CollapsibleTrigger data-faq-trigger className="w-full px-6 py-4 text-left flex items-center justify-between transition-colors" style={{ backgroundColor: "#d6e3dd" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c4d5cb"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#d6e3dd"}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-[#2f8f5b] transition-transform flex-shrink-0 ${
                      openFaqs[idx] ? 'transform rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 py-4 bg-white">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: faq.answer || 'Answer not available' }} />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

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

        // Load analysis data with LLM insights
        console.log('📊 Dataset loaded:', {
          hasAnalysisData: !!dataset.analysis_data,
          hasLlmInsights: !!dataset.llm_insights,
          llmInsightsKeys: dataset.llm_insights ? Object.keys(dataset.llm_insights) : [],
          cardSummaries: dataset.llm_insights?.cardSummaries
        })
        
        setData({
          ...dataset.analysis_data,
          llmInsights: dataset.llm_insights
        })
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
          <p className="text-gray-600 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Data Available</h1>
          <p className="text-gray-600 text-sm sm:text-base">This report contains no data.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Prepared for</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {data?.profile?.name || 'LinkedIn Profile'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12">
        <ProposalContent data={data} />
      </div>
    </div>
  )
}
