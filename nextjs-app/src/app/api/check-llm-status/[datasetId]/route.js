import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

/**
 * Diagnostic endpoint to check LLM insights status for a dataset
 * Helps debug why insights are not showing
 * 
 * Usage: GET /api/check-llm-status/[datasetId]
 */
export async function GET(request, { params }) {
  try {
    const { datasetId } = params

    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 })
    }

    // Fetch dataset
    const { data: dataset, error: fetchError } = await supabase
      .from('linkedin_datasets')
      .select('id, author_name, shareable_url, llm_insights, total_posts, created_at, updated_at')
      .eq('id', datasetId)
      .single()

    if (fetchError) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: fetchError.message 
      }, { status: 500 })
    }

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Analyze LLM insights status
    const hasLlmInsights = !!dataset.llm_insights
    const hasCardSummaries = !!dataset.llm_insights?.cardSummaries
    const llmInsightsKeys = dataset.llm_insights ? Object.keys(dataset.llm_insights) : []
    const cardSummariesKeys = dataset.llm_insights?.cardSummaries ? Object.keys(dataset.llm_insights.cardSummaries) : []
    
    const expectedCardSummaries = [
      'snapshotsSummary',
      'postingActivitySummary', 
      'analyticsCardSummary',
      'cadenceChartSummary'
    ]
    
    const missingCardSummaries = expectedCardSummaries.filter(
      key => !dataset.llm_insights?.cardSummaries?.[key]
    )

    // Check environment
    const hasApiKey = !!process.env.GEMINI_API_KEY
    
    // Determine status
    let status = 'unknown'
    let message = ''
    let recommendations = []

    if (!hasLlmInsights) {
      status = 'missing'
      message = 'Dataset has no LLM insights stored in database'
      recommendations.push('Regenerate the report from the dashboard')
      recommendations.push('Ensure GEMINI_API_KEY is configured before regenerating')
    } else if (!hasCardSummaries) {
      status = 'incomplete'
      message = 'LLM insights exist but cardSummaries are missing'
      recommendations.push('This report may have been generated with an older version')
      recommendations.push('Regenerate the report to get card summaries')
    } else if (missingCardSummaries.length > 0) {
      status = 'partial'
      message = `Card summaries partially complete (${cardSummariesKeys.length}/${expectedCardSummaries.length})`
      recommendations.push(`Missing summaries: ${missingCardSummaries.join(', ')}`)
      recommendations.push('Regenerate the report to get all summaries')
    } else {
      status = 'complete'
      message = 'All LLM insights and card summaries are present'
      recommendations.push('✅ Everything looks good!')
    }

    if (!hasApiKey) {
      recommendations.push('⚠️ WARNING: GEMINI_API_KEY is not configured in environment')
    }

    return NextResponse.json({
      success: true,
      dataset: {
        id: dataset.id,
        author_name: dataset.author_name,
        shareable_url: dataset.shareable_url,
        total_posts: dataset.total_posts,
        created_at: dataset.created_at,
        updated_at: dataset.updated_at
      },
      llm_insights_status: {
        status,
        message,
        has_llm_insights: hasLlmInsights,
        has_card_summaries: hasCardSummaries,
        llm_insights_keys: llmInsightsKeys,
        card_summaries_keys: cardSummariesKeys,
        missing_card_summaries: missingCardSummaries,
        expected_card_summaries: expectedCardSummaries
      },
      environment: {
        has_gemini_api_key: hasApiKey,
        node_env: process.env.NODE_ENV
      },
      recommendations,
      debug_url: dataset.shareable_url ? `/${dataset.shareable_url}` : null
    })

  } catch (error) {
    console.error('Check LLM status error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

