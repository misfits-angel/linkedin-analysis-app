import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function DELETE(request, { params }) {
  console.log('🗑️ API Route: Starting delete-report request')
  console.log('📋 Params:', params)
  
  try {
    const { datasetId } = params
    console.log('🔍 Dataset ID:', datasetId)

    if (!datasetId) {
      console.error('❌ No dataset ID provided')
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 })
    }

    // Check if dataset exists
    console.log('🔍 Fetching dataset from database...')
    const { data: dataset, error: fetchError } = await supabase
      .from('linkedin_datasets')
      .select('id, author_name, shareable_url')
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
      has_shareable_url: !!dataset.shareable_url
    })

    // Clear only report-specific columns instead of deleting the entire row
    console.log('🗑️ Clearing report-specific data...')
    const { error: deleteError } = await supabase
      .from('linkedin_datasets')
      .update({
        shareable_url: null,
        llm_insights: null,
        card_visibility_settings: null,
        editable_content: null,
      })
      .eq('id', datasetId)

    if (deleteError) {
      console.error('❌ Clear report data error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to clear report data', 
        details: deleteError.message 
      }, { status: 500 })
    }

    console.log('✅ Report data cleared successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Report data cleared successfully',
      clearedDataset: {
        id: dataset.id,
        author_name: dataset.author_name,
        previous_shareable_url: dataset.shareable_url
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
