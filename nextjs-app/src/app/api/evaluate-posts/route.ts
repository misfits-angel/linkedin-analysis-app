import { NextRequest, NextResponse } from 'next/server'
import { evaluatePostsWithLLM } from '@/lib/llm-functions'

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

    console.log('🤖 Evaluating posts for', posts.length, 'posts')
    
    // Evaluate posts using LLM with scoring rubric
    const result = await evaluatePostsWithLLM(posts)
    
    console.log('✅ Post evaluation completed successfully')
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error evaluating posts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate posts' },
      { status: 500 }
    )
  }
}
