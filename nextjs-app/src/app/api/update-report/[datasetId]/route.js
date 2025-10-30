import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { 
  generateNarrativeInsights, 
  analyzeTopicsWithLLM, 
  evaluatePostsWithLLM, 
  analyzePositioningWithLLM 
} from '@/lib/llm-functions'

export async function PUT(request, { params }) {
  console.log('🔄 API Route: Starting update-report request')
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
    let regenerateInsights = false
    
    try {
      const requestBody = await request.json()
      cardVisibilitySettings = requestBody.cardVisibility || {}
      editableContent = requestBody.editableContent || {}
      regenerateInsights = requestBody.regenerateInsights || false
      console.log('🎛️ Card visibility settings received:', cardVisibilitySettings)
      console.log('✏️ Editable content received:', Object.keys(editableContent))
      console.log('🤖 Regenerate insights:', regenerateInsights)
    } catch (error) {
      console.warn('⚠️ Could not parse request body for settings:', error.message)
    }

    // Check if dataset exists and has a shareable URL
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

    if (!dataset.shareable_url) {
      console.error('❌ Dataset does not have a shareable URL')
      return NextResponse.json({ 
        error: 'No report exists for this dataset. Please generate a report first.' 
      }, { status: 400 })
    }
    
    console.log('✅ Dataset found:', {
      id: dataset.id,
      author_name: dataset.author_name,
      shareable_url: dataset.shareable_url,
      has_llm_insights: !!dataset.llm_insights
    })

    // Prepare the update data
    const updateData = {
      card_visibility_settings: cardVisibilitySettings,
      editable_content: editableContent,
      updated_at: new Date().toISOString()
    }

    // Regenerate LLM insights if requested
    if (regenerateInsights) {
      console.log('🤖 Regenerating LLM insights...')
      const llmInsights = {}
      const analysisData = dataset.analysis_data

      try {
        // Step 1: Generate narrative insights
        console.log('🔄 Step 1/4: Generating narrative insights...')
        try {
          const narrativeInsights = await generateNarrativeInsights(analysisData)
          llmInsights.narrativeInsights = narrativeInsights
          console.log('✅ Step 1/4: Narrative insights generated successfully')
        } catch (error) {
          console.warn('⚠️ Step 1/4: Narrative insights generation failed:', error.message)
        }

        // Step 2: Analyze topics
        console.log('🔄 Step 2/4: Analyzing topics...')
        try {
          const topicAnalysis = await analyzeTopicsWithLLM(analysisData.posts || [])
          llmInsights.topicAnalysis = topicAnalysis
          console.log('✅ Step 2/4: Topic analysis completed successfully')
        } catch (error) {
          console.warn('⚠️ Step 2/4: Topic analysis failed:', error.message)
        }

        // Step 3: Evaluate posts
        console.log('🔄 Step 3/4: Evaluating posts...')
        try {
          const postEvaluation = await evaluatePostsWithLLM(analysisData.posts || [])
          llmInsights.postEvaluation = postEvaluation
          console.log('✅ Step 3/4: Post evaluation completed successfully')
        } catch (error) {
          console.warn('⚠️ Step 3/4: Post evaluation failed:', error.message)
        }

        // Step 4: Analyze positioning
        console.log('🔄 Step 4/4: Analyzing positioning...')
        try {
          const positioningAnalysis = await analyzePositioningWithLLM(analysisData.posts || [])
          llmInsights.positioningAnalysis = positioningAnalysis
          console.log('✅ Step 4/4: Positioning analysis completed successfully')
        } catch (error) {
          console.warn('⚠️ Step 4/4: Positioning analysis failed:', error.message)
        }

        console.log('🎉 All LLM analysis steps completed!')
        updateData.llm_insights = llmInsights
      } catch (error) {
        console.error('❌ LLM analysis error:', error)
        // Continue with update even if LLM analysis fails
      }
    }

    console.log('💾 Updating dataset with data:', JSON.stringify(updateData, null, 2))

    // Update the dataset
    console.log('🔄 Executing database update...')
    const { error: updateError } = await supabase
      .from('linkedin_datasets')
      .update(updateData)
      .eq('id', datasetId)

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update report', 
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('✅ Report updated successfully')
    
    // Get base URL for the report link - prioritize custom domain
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://users.theunstoppable.ai'
    const shareableUrl = `${baseUrl}/report/${dataset.shareable_url}`
    
    return NextResponse.json({ 
      success: true,
      message: 'Report updated successfully',
      url: shareableUrl,
      updatedFields: {
        cardVisibility: !!cardVisibilitySettings,
        editableContent: !!editableContent,
        llmInsights: regenerateInsights
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

