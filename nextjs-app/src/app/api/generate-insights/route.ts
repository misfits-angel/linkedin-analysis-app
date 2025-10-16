import { NextRequest, NextResponse } from 'next/server'
import { generateNarrativeInsights } from '@/lib/llm-functions'

// Configure for Vercel - extend timeout to 60 seconds
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { posts } = await request.json()
    
    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Posts data is required' },
        { status: 400 }
      )
    }

    console.log('🤖 Generating narrative insights for', posts.length, 'posts')
    
    // Generate insights using LLM
    const result = await generateNarrativeInsights(posts)
    
    console.log('✅ Narrative insights generated successfully')
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error generating insights:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
