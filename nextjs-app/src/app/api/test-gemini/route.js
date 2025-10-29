import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Test endpoint to verify Gemini API setup
 * Usage: GET /api/test-gemini
 */
export async function GET() {
  try {
    // Check if API key exists
    const hasApiKey = !!process.env.GEMINI_API_KEY
    const apiKeyLength = process.env.GEMINI_API_KEY?.length || 0
    
    if (!hasApiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not configured',
        details: {
          hasApiKey: false,
          apiKeyLength: 0,
          message: 'Please add GEMINI_API_KEY to your .env.local file'
        }
      }, { status: 500 })
    }

    // Try to initialize Gemini
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Try a simple test
    const result = await model.generateContent('Say "Hello, API is working!" in exactly 5 words.')
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      message: 'Gemini API is configured and working!',
      details: {
        hasApiKey: true,
        apiKeyLength,
        model: 'gemini-2.5-flash',
        testResponse: text
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Gemini API test failed',
      details: {
        hasApiKey: !!process.env.GEMINI_API_KEY,
        apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        errorMessage: error.message,
        errorType: error.constructor.name
      }
    }, { status: 500 })
  }
}

