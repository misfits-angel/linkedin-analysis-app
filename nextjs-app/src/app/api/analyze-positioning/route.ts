import { NextRequest, NextResponse } from 'next/server'
import { analyzePositioningWithLLM } from '@/lib/llm-functions'

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

    console.log('🤖 Analyzing positioning for', posts.length, 'posts')
    
    // Analyze positioning using LLM
    const result = await analyzePositioningWithLLM(posts)
    
    console.log('✅ Positioning analysis completed successfully')
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error analyzing positioning:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze positioning' },
      { status: 500 }
    )
  }
}
