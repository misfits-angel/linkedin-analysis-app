import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { v4 as uuidv4 } from 'uuid'
import { 
  generateNarrativeInsights, 
  analyzeTopicsWithLLM, 
  evaluatePostsWithLLM, 
  analyzePositioningWithLLM 
} from '@/lib/llm-functions'

export async function POST(request, { params }) {
  console.log('🚀 API Route: Starting generate-report request')
  console.log('📋 Params:', params)
  
  try {
    const { datasetId } = params
    console.log('🔍 Dataset ID:', datasetId)

    if (!datasetId) {
      console.error('❌ No dataset ID provided')
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 })
    }

    // Get card visibility settings and editable content from request body
    let cardVisibilitySettings = {}
    let editableContent = {}
    try {
      const requestBody = await request.json()
      cardVisibilitySettings = requestBody.cardVisibility || {}
      editableContent = requestBody.editableContent || {}
      console.log('🎛️ Card visibility settings received:', cardVisibilitySettings)
      console.log('✏️ Editable content received:', Object.keys(editableContent))
    } catch (error) {
      console.warn('⚠️ Could not parse request body for settings:', error.message)
    }

    // Get the origin from the request headers (works for both local and Vercel)
    const origin = request.headers.get('origin') || request.headers.get('host')
    let baseUrl
    
    if (origin) {
      // If origin already includes protocol, use it as is, otherwise add https://
      baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
    } else {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
    
    console.log('🌐 Base URL:', baseUrl)

    // Check if dataset exists
    console.log('🔍 Fetching dataset from database...')
    const { data: dataset, error: fetchError } = await supabase
      .from('linkedin_datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (fetchError) {
      console.error('❌ Database fetch error:', fetchError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: fetchError.message 
      }, { status: 500 })
    }

    if (!dataset) {
      console.error('❌ Dataset not found')
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }
    
    console.log('✅ Dataset found:', {
      id: dataset.id,
      author_name: dataset.author_name,
      has_analysis_data: !!dataset.analysis_data,
      has_posts: !!dataset.analysis_data?.posts,
      posts_count: dataset.analysis_data?.posts?.length || 0
    })

    // Check if shareable URL already exists
    if (dataset.shareable_url) {
      console.log('ℹ️ Shareable URL already exists:', dataset.shareable_url)
      return NextResponse.json({ 
        success: true, 
        url: `${baseUrl}/report/${dataset.shareable_url}`,
        message: 'Report already exists'
      })
    }

    // Generate unique token
    console.log('🎫 Generating unique token...')
    const token = uuidv4()
    console.log('🎫 Generated token:', token)

    // Try LLM analysis with better error handling
    console.log('🤖 Starting LLM analysis for dataset:', datasetId)
    
    let llmInsights = {}
    const analysisData = dataset.analysis_data
    
    console.log('📊 Analysis data posts count:', analysisData?.posts?.length || 0)
    console.log('🔑 GEMINI_API_KEY configured:', !!process.env.GEMINI_API_KEY)
    console.log('🔑 GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0)
    console.log('📋 Analysis data structure:', JSON.stringify(analysisData, null, 2).substring(0, 500))

    try {
      // Check if we have posts data and API key before running LLM analysis
      if (!analysisData?.posts || analysisData.posts.length === 0) {
        console.warn('⚠️ No posts data available for LLM analysis')
      } else if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not configured, skipping LLM analysis')
      } else {
        console.log('🚀 Running LLM analysis...')
        console.log('📝 Posts sample for LLM:', JSON.stringify(analysisData.posts.slice(0, 2), null, 2))
        
        // Run LLM analyses sequentially for better transparency and debugging
        console.log('🔄 Step 1/4: Generating narrative insights...')
        try {
          const narrativeInsights = await generateNarrativeInsights(analysisData.posts || [])
          llmInsights.narrativeInsights = narrativeInsights
          console.log('✅ Step 1/4: Narrative insights generated successfully')
        } catch (error) {
          console.warn('⚠️ Step 1/4: Narrative insights failed:', error.message)
        }

        console.log('🔄 Step 2/4: Analyzing topics...')
        try {
          const topicAnalysis = await analyzeTopicsWithLLM(analysisData.posts || [])
          llmInsights.topicAnalysis = topicAnalysis
          console.log('✅ Step 2/4: Topic analysis completed successfully')
        } catch (error) {
          console.warn('⚠️ Step 2/4: Topic analysis failed:', error.message)
        }

        console.log('🔄 Step 3/4: Evaluating posts...')
        try {
          const postEvaluation = await evaluatePostsWithLLM(analysisData.posts || [])
          llmInsights.postEvaluation = postEvaluation
          console.log('✅ Step 3/4: Post evaluation completed successfully')
        } catch (error) {
          console.warn('⚠️ Step 3/4: Post evaluation failed:', error.message)
        }

        console.log('🔄 Step 4/4: Analyzing positioning...')
        try {
          const positioningAnalysis = await analyzePositioningWithLLM(analysisData.posts || [])
          llmInsights.positioningAnalysis = positioningAnalysis
          console.log('✅ Step 4/4: Positioning analysis completed successfully')
        } catch (error) {
          console.warn('⚠️ Step 4/4: Positioning analysis failed:', error.message)
        }

        console.log('🎉 All LLM analysis steps completed!')
        console.log('📊 Final LLM insights summary:', {
          narrativeInsights: !!llmInsights.narrativeInsights,
          topicAnalysis: !!llmInsights.topicAnalysis,
          postEvaluation: !!llmInsights.postEvaluation,
          positioningAnalysis: !!llmInsights.positioningAnalysis
        })
      }

    } catch (error) {
      console.error('❌ LLM analysis error:', error)
      // Continue with report generation even if LLM analysis fails
    }

    // Using dynamic rendering for all reports
    console.log('📄 Using dynamic rendering for consistent user experience')

    // Update dataset with shareable URL, LLM insights, card visibility settings, and editable content
    const updateData = { 
      shareable_url: token,
      llm_insights: llmInsights,
      card_visibility_settings: cardVisibilitySettings,
      editable_content: editableContent,
      updated_at: new Date().toISOString()
    }

    console.log('💾 Updating dataset with data:', JSON.stringify(updateData, null, 2))
    console.log('🤖 LLM Insights being stored:', JSON.stringify(llmInsights, null, 2))

    console.log('🔄 Executing database update...')
    const { error: updateError } = await supabase
      .from('linkedin_datasets')
      .update(updateData)
      .eq('id', datasetId)

    if (updateError) {
      console.error('❌ Failed to update dataset:', updateError)
      console.error('❌ Update error details:', JSON.stringify(updateError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to generate report', 
        details: updateError.message 
      }, { status: 500 })
    }
    
    console.log('✅ Database update successful')

    console.log('✅ Report generated successfully with LLM insights')
    const reportUrl = `${baseUrl}/report/${token}`
    
    const response = { 
      success: true, 
      url: reportUrl,
      token: token,
      llmInsights: Object.keys(llmInsights).length > 0 ? llmInsights : null
    }
    
    console.log('📤 Returning response:', JSON.stringify(response, null, 2))
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Generate report error:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error message:', error.message)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

