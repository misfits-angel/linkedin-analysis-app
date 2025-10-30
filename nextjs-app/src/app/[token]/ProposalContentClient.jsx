'use client'

import React, { useState, useEffect } from 'react'
import { PROPOSAL_CONTENT } from '@/lib/proposal-content'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import LinkedInAnalyticsCard from '@/components/LinkedinAnalyticsCard'
import PostsPerMonthChart from '@/components/PostsPerMonthChart'

export default function ProposalContentClient({ data }) {
  const [openFaqs, setOpenFaqs] = useState({})
  
  // Override body background for report page
  useEffect(() => {
    document.body.style.background = '#ffffff'
    return () => {
      document.body.style.background = ''
    }
  }, [])
  
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
    if (!data?.posts) return { originalPostsInYear: 0, repostsInYear: 0, mostActiveMonth: 'N/A', longestInactivePeriod: 'N/A' }

    const posts = data.posts
    const now = new Date()
    const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000))

    // Filter posts from the last year
    const recentPosts = posts.filter(p => new Date(p.date) >= oneYearAgo)
    const originalPostsInYear = recentPosts.filter(p => p.type !== 'repost').length
    const repostsInYear = recentPosts.filter(p => p.type === 'repost').length

    // Find most active month
    const monthCounts = {}
    posts.forEach(post => {
      const date = new Date(post.date)
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
    })
    const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Calculate longest inactive period (gap between posts)
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
    const longestInactivePeriod = gapStart && gapEnd
      ? `${gapStart.toLocaleString('default', { month: 'short' })} ${gapStart.getFullYear()} - ${gapEnd.toLocaleString('default', { month: 'short' })} ${gapEnd.getFullYear()}`
      : 'N/A'

    return { originalPostsInYear, repostsInYear, mostActiveMonth, longestInactivePeriod }
  }
  
  const stats = calculateStats()
  const { proposition, coreOffering, audit, faqs } = PROPOSAL_CONTENT

  return (
    <div className="w-full">
      {/* SECTION 1: PROPOSITION */}
      <section className="mb-20 max-w-6xl mx-auto px-8 sm:px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#2f8f5b] text-center mb-8">
          {proposition.title}
        </h1>
        <div className="flex flex-col md:flex-row gap-0 md:gap-20 items-start">
          {/* Left Column */}
          <div className="flex-1 space-y-4 text-lg text-gray-700 leading-relaxed w-full mb-0 md:mb-0">
            <p className="text-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: proposition.headline }} />
            {proposition.paragraphs.slice(0, 3).map((para, idx) => (
              <p key={idx} className={para.includes('So the founders') ? 'font-semibold text-gray-900' : ''} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
          {/* Right Column */}
          <div className="flex-1 space-y-4 text-lg text-gray-700 leading-relaxed w-full">
            {proposition.paragraphs.slice(3).map((para, idx) => (
              <p key={idx + 3} className={para.includes('So the founders') ? 'font-semibold text-gray-900' : ''} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-black mb-20"></div>

      {/* SECTION 2: CORE OFFERING */}
      <section className="mb-20 max-w-6xl mx-auto px-8 sm:px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-4">
          {coreOffering.title}
        </h2>

        <div className="flex flex-col md:flex-row gap-0 md:gap-20 items-start">
          {/* Left Column - Intro, Positioning, Voice, Drafts, Posts */}
          <div className="flex-1 space-y-8 w-full mb-0 md:mb-0">
            {coreOffering.intro && (
              <p className="text-gray-700 text-lg mb-8" dangerouslySetInnerHTML={{ __html: coreOffering.intro }} />
            )}
            {coreOffering.sections.filter((_, idx) => [0, 2, 4, 5].includes(idx)).map((section, originalIdx, array) => (
              <div key={`left-${originalIdx}`}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#2f8f5b]">{section.title}</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
                {originalIdx < array.length - 1 && (
                  <div className="my-8">
                    <div className="w-1/2 border-t border-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column - Mind, Configured POV feed, Pricing */}
          <div className="flex-1 w-full mb-0 md:mb-0">
            {/* Separator before Mind (mobile: top margin + separator, desktop: just separator) */}
            <div className="mt-8 md:mt-0 mb-8">
              <div className="w-1/2 border-t border-gray-300"></div>
            </div>
            
            <div className="space-y-8">
            {coreOffering.sections.filter((_, idx) => [1, 3].includes(idx)).map((section, originalIdx, array) => (
              <div key={`right-${originalIdx}`}>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#2f8f5b]">{section.title}</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
                {originalIdx < array.length - 1 && (
                  <div className="my-8">
                    <div className="w-1/2 border-t border-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
            {/* Divider before Pricing */}
            <div className="my-8">
              <div className="w-1/2 border-t border-gray-300"></div>
            </div>
            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#2f8f5b]">{coreOffering.pricing.title}</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: coreOffering.pricing.content }} />
            </div>
            </div>
          </div>
        </div>

      </section>

      {/* Divider */}
      <div className="border-t border-black mb-20"></div>

      {/* SECTION 2.5: ADD-ONS */}
      <section className="mb-20 max-w-6xl mx-auto px-8 sm:px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-4">
          {PROPOSAL_CONTENT.addOns.title}
        </h2>

        <div className="flex flex-col md:flex-row gap-0 md:gap-20 mb-12 items-start">
          {/* Column 1 - Intro + Engagement + Outreach */}
          <div className="flex-1 w-full mb-0 md:mb-0">
            <div className="space-y-8">
              <p className="text-gray-700 text-lg">
                {PROPOSAL_CONTENT.addOns.intro}
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.sections[0].title}</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {PROPOSAL_CONTENT.addOns.sections[0].content}
                </div>
              </div>
              
              {/* Separator before Outreach */}
              <div className="my-8">
                <div className="w-1/2 border-t border-gray-300"></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.sections[1].title}</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {PROPOSAL_CONTENT.addOns.sections[1].content}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 - Twitter/X + Pricing */}
          <div className="flex-1 w-full mb-0 md:mb-0">
            {/* Separator before Twitter/X (mobile: top margin + separator, desktop: just separator) */}
            <div className="mt-8 md:mt-0 mb-8">
              <div className="w-1/2 border-t border-gray-300"></div>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.sections[2].title}</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {PROPOSAL_CONTENT.addOns.sections[2].content}
                </div>
              </div>
              
              {/* Separator before Pricing */}
              <div className="my-8">
                <div className="w-1/2 border-t border-gray-300"></div>
              </div>
              
              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#2f8f5b]">{PROPOSAL_CONTENT.addOns.pricing.title}</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {PROPOSAL_CONTENT.addOns.pricing.content}
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Divider */}
      <div className="border-t border-black mb-20"></div>

      {/* SECTION 3: AUDIT (Your Posts) */}
      <section className="mb-20 max-w-6xl mx-auto px-8 sm:px-4">
        <div className="py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-12">
            {audit.title}
          </h2>

          {/* Flex Layout for Independent Columns */}
          <div className="flex flex-col md:flex-row gap-0 md:gap-20 items-start">
            {/* Left Column - Independent flow */}
            <div className="flex-1 w-full mb-0 md:mb-0">
              <div className="space-y-12">
                {/* Quick Stats Table */}
                <div>
                  <p className="text-gray-700 text-lg mb-6">
                    {audit.subtitle}
                  </p>
                  <h3 className="text-lg font-semibold text-[#2f8f5b] mb-4">Snapshots</h3>
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Original posts in a year</td>
                        <td className="py-3 text-gray-700">{stats.originalPostsInYear}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Reposts in a year</td>
                        <td className="py-3 text-gray-700">{stats.repostsInYear}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Most active month</td>
                        <td className="py-3 text-gray-700">{stats.mostActiveMonth}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-gray-900">Longest inactive period</td>
                        <td className="py-3 text-gray-700">{stats.longestInactivePeriod}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-6">
                    <p className="text-sm text-gray-700">
                      {data?.llmInsights?.cardSummaries?.postingActivitySummary || (
                        <span className="opacity-70">
                          {audit.placeholderSummary}
                          {!data?.llmInsights && " (Report may need to be regenerated with LLM insights enabled)"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Separator after Snapshots */}
                <div className="my-8">
                  <div className="w-1/2 border-t border-gray-300"></div>
                </div>

                {/* Card 2: LinkedIn Analytics */}
                <div>
                  <LinkedInAnalyticsCard
                    monthlyCounts={data?.trends?.posts_per_month ? Object.values(data.trends.posts_per_month) : []}
                    postsPerMonth={data?.trends?.posts_per_month || {}}
                    insight=""
                    posts={data?.posts || []}
                    summaryData={data?.summary}
                    isReportView={true}
                  />
                  <div className="mt-4">
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
            <div className="flex-1 w-full mb-0 md:mb-0">
              {/* Separator before Posting Cadence (mobile: top margin + separator, desktop: just separator) */}
              <div className="mt-12 md:mt-0 mb-12">
                <div className="w-1/2 border-t border-gray-300"></div>
              </div>
              
              <div className="space-y-12">
                {/* Card: Posting Cadence (Posts Per Month Chart) */}
                <div>
                  <PostsPerMonthChart data={data} isReportView={true} />
                  <div className="mt-4">
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
      <div className="border-t border-black mb-20"></div>

      {/* SECTION 5: NEXT STEPS */}
      <section className="mb-20 max-w-6xl mx-auto px-8 sm:px-4">
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
            className="inline-block bg-[#307254] hover:bg-[#245a42] text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            {PROPOSAL_CONTENT.nextSteps.ctaText}
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-black mb-20"></div>

      {/* SECTION 6: FAQs */}
      <section className="mb-20 max-w-6xl mx-auto px-8 sm:px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2f8f5b] text-center mb-12">
          {faqs.title}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-0 md:gap-20">
          {/* Left Column - Odd FAQs (1st, 3rd, 5th...) */}
          <div className="w-full md:flex-1 space-y-6 mb-0 md:mb-0">
            {faqs.questions.map((faq, idx) => idx % 2 === 0 && (
              <Collapsible
                key={idx}
                open={openFaqs[idx] || false}
                onOpenChange={(isOpen) => setOpenFaqs(prev => ({ ...prev, [idx]: isOpen }))}
                className="rounded-lg overflow-hidden border border-gray-200 w-full"
              >
                <CollapsibleTrigger data-faq-trigger className="w-full px-4 md:px-6 py-4 text-left flex items-center justify-between transition-colors" style={{ backgroundColor: "#d6e3dd" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c4d5cb"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#d6e3dd"}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#2f8f5b] transition-transform flex-shrink-0 ${
                      openFaqs[idx] ? 'transform rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 md:px-6 py-4 bg-white">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: faq.answer || 'Answer not available' }} />
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          
          {/* Right Column - Even FAQs (2nd, 4th, 6th...) */}
          <div className="w-full md:flex-1 space-y-6 mt-6 md:mt-0">
            {faqs.questions.map((faq, idx) => idx % 2 === 1 && (
              <Collapsible
                key={idx}
                open={openFaqs[idx] || false}
                onOpenChange={(isOpen) => setOpenFaqs(prev => ({ ...prev, [idx]: isOpen }))}
                className="rounded-lg overflow-hidden border border-gray-200 w-full"
              >
                <CollapsibleTrigger data-faq-trigger className="w-full px-4 md:px-6 py-4 text-left flex items-center justify-between transition-colors" style={{ backgroundColor: "#d6e3dd" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c4d5cb"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#d6e3dd"}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#2f8f5b] transition-transform flex-shrink-0 ${
                      openFaqs[idx] ? 'transform rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 md:px-6 py-4 bg-white">
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

