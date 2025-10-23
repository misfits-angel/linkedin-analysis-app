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

    // Skip static HTML generation for now - focus on LLM insights
    console.log('📄 Skipping static HTML generation - using dynamic rendering')
    let staticHtml = null

    // Update dataset with shareable URL and LLM insights
    const updateData = { 
      shareable_url: token,
      llm_insights: llmInsights,
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

/**
 * Generate static HTML content with embedded data and insights
 */
function generateStaticHtml(analysisData, llmInsights, baseUrl) {
  const profileName = analysisData?.profile?.name || 'LinkedIn Analytics Report'
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Escape JSON for embedding in HTML
  const escapedData = JSON.stringify(analysisData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
  const escapedInsights = JSON.stringify(llmInsights).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profileName} - LinkedIn Analytics Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">${profileName}</h1>
                <div class="flex items-center justify-center gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ${currentDate}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Last 12 months
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Static Report
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div id="report-content" class="space-y-8">
            <!-- Content will be rendered by JavaScript -->
        </div>
    </div>

    <!-- Embedded Data -->
    <script>
        window.REPORT_DATA = ${escapedData};
        window.LLM_INSIGHTS = ${escapedInsights};
    </script>

    <!-- Report Rendering Script -->
    <script>
        // Simple report rendering without external dependencies
        function renderReport() {
            const data = window.REPORT_DATA;
            const insights = window.LLM_INSIGHTS;
            const container = document.getElementById('report-content');
            
            if (!data) {
                container.innerHTML = '<div class="text-center text-gray-500">No data available</div>';
                return;
            }

            let html = '';

            // Key Metrics Section
            html += \`
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="text-sm text-gray-600 mb-1">Posts (excl. reshares)</div>
                        <div class="text-2xl font-bold text-blue-600">\${data.summary?.posts_last_12m ?? '-'}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="text-sm text-gray-600 mb-1">Active months</div>
                        <div class="text-2xl font-bold text-blue-600">\${data.summary?.active_months ?? '-'}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="text-sm text-gray-600 mb-1">Median engagement</div>
                        <div class="text-2xl font-bold text-blue-600">\${data.summary?.median_engagement ?? '-'}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <div class="text-sm text-gray-600 mb-1">P90 engagement</div>
                        <div class="text-2xl font-bold text-blue-600">\${data.summary?.p90_engagement ?? '-'}</div>
                    </div>
                </div>
            \`;

            // LLM Insights Section
            if (insights && Object.keys(insights).length > 0) {
                html += '<div class="bg-white p-6 rounded-lg shadow mb-8">';
                html += '<h2 class="text-xl font-bold mb-4">AI-Powered Insights</h2>';
                
                if (insights.narrativeInsights?.insights) {
                    html += '<div class="mb-6">';
                    html += '<h3 class="text-lg font-semibold mb-3">Narrative Insights</h3>';
                    html += '<ul class="space-y-2">';
                    insights.narrativeInsights.insights.forEach(insight => {
                        html += \`<li class="flex items-start"><span class="text-blue-500 mr-2">•</span><span>\${insight}</span></li>\`;
                    });
                    html += '</ul>';
                    html += '</div>';
                }

                if (insights.topicAnalysis?.topics) {
                    html += '<div class="mb-6">';
                    html += '<h3 class="text-lg font-semibold mb-3">Content Topics</h3>';
                    html += '<div class="flex flex-wrap gap-2">';
                    insights.topicAnalysis.topics.forEach(topic => {
                        html += \`<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">\${topic}</span>\`;
                    });
                    html += '</div>';
                    html += '</div>';
                }

                if (insights.postEvaluation?.one_line_summary) {
                    html += '<div class="mb-6">';
                    html += '<h3 class="text-lg font-semibold mb-3">Content Quality Assessment</h3>';
                    html += \`<p class="text-gray-700">\${insights.postEvaluation.one_line_summary}</p>\`;
                    if (insights.postEvaluation.score_100) {
                        html += \`<div class="mt-2 text-sm text-gray-600">Overall Score: \${insights.postEvaluation.score_100}/100</div>\`;
                    }
                    html += '</div>';
                }

                if (insights.positioningAnalysis?.current_branding?.positioning_summary) {
                    html += '<div class="mb-6">';
                    html += '<h3 class="text-lg font-semibold mb-3">Personal Branding Analysis</h3>';
                    html += \`<p class="text-gray-700">\${insights.positioningAnalysis.current_branding.positioning_summary}</p>\`;
                    html += '</div>';
                }

                html += '</div>';
            }

            // Posts Timeline (Simple)
            if (data.posts && data.posts.length > 0) {
                html += '<div class="bg-white p-6 rounded-lg shadow">';
                html += '<h2 class="text-xl font-bold mb-4">Recent Posts</h2>';
                html += '<div class="space-y-4 max-h-96 overflow-y-auto">';
                
                // Show last 10 posts
                data.posts.slice(-10).reverse().forEach(post => {
                    const postDate = post.date ? new Date(post.date).toLocaleDateString() : 'Unknown date';
                    const content = post.content ? post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') : 'No content';
                    
                    html += \`
                        <div class="border-l-4 border-blue-500 pl-4 py-2">
                            <div class="text-sm text-gray-600 mb-1">\${postDate} • \${post.type} • \${post.eng} engagement</div>
                            <div class="text-gray-800">\${content}</div>
                        </div>
                    \`;
                });
                
                html += '</div>';
                html += '</div>';
            }

            container.innerHTML = html;
        }

        // Render when page loads
        document.addEventListener('DOMContentLoaded', renderReport);
    </script>
</body>
</html>`;
}
