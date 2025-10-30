import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'
import { 
  generateCardSummaries
} from '@/lib/llm-functions'

export async function POST(request, { params }) {
  console.log('🚀 Generate Report API called')
  
  try {
    const { datasetId } = params
    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 })
    }

    // Get card visibility settings and editable content from request body
    let cardVisibilitySettings = {}
    let editableContent = {}
    try {
      const requestBody = await request.json()
      cardVisibilitySettings = requestBody.cardVisibility || {}
      editableContent = requestBody.editableContent || {}
    } catch (error) {
      console.warn('⚠️ Could not parse request body:', error.message)
    }

    // Get base URL for the report link - prioritize custom domain
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://users.theunstoppable.ai'

    // Fetch dataset
    const { data: dataset, error: fetchError } = await supabase
      .from('linkedin_datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (fetchError || !dataset) {
      return NextResponse.json({ 
        error: 'Dataset not found', 
        details: fetchError?.message 
      }, { status: 404 })
    }

    // Check if shareable URL already exists
    if (dataset.shareable_url) {
      return NextResponse.json({ 
        success: true, 
        url: `${baseUrl}/report/${dataset.shareable_url}`,
        message: 'Report already exists'
      })
    }

    // Generate unique token for the report
    const token = uuidv4()
    const analysisData = dataset.analysis_data
    let llmInsights = {}

    // Generate AI insights (card summaries)
    try {
      if (!analysisData?.posts || analysisData.posts.length === 0) {
        console.error('❌ No posts data - skipping AI insights')
      } else if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY not configured - skipping AI insights')
      } else {
        console.log('🤖 Generating AI insights...')
        
        const posts = analysisData.posts
        
        // Calculate stats
        const originalPosts = posts.filter(p => p.type !== 'repost').length
        const reposts = posts.filter(p => p.type === 'repost').length
        
        const monthCounts = {}
        posts.forEach(post => {
          const date = new Date(post.postTimestamp || post.date)
          const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
        })
        const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        
        const sortedDates = posts.map(p => new Date(p.postTimestamp || p.date)).sort((a, b) => a - b)
        let maxGap = 0, gapStart = null, gapEnd = null
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
        
        const stats = { originalPosts, reposts, mostActiveMonth, longestInactive }
        
        // Generate card summaries
        const cardSummaries = await generateCardSummaries(posts, stats)
        llmInsights.cardSummaries = cardSummaries
        
        console.log('✅ AI insights generated:', Object.keys(cardSummaries || {}).length, 'summaries')
      }
    } catch (error) {
      console.error('❌ AI insights generation failed:', error.message)
    }

    // Update database with report data
    const { error: updateError } = await supabase
      .from('linkedin_datasets')
      .update({ 
        shareable_url: token,
        llm_insights: llmInsights,
        card_visibility_settings: cardVisibilitySettings,
        editable_content: editableContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', datasetId)

    if (updateError) {
      console.error('❌ Database update failed:', updateError.message)
      return NextResponse.json({ 
        error: 'Failed to generate report', 
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('✅ Report generated successfully')
    return NextResponse.json({ 
      success: true, 
      url: `${baseUrl}/report/${token}`,
      token
    })

  } catch (error) {
    console.error('❌ Generate report error:', error.message)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

