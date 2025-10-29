'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Component to show Gemini API status with a test button
 */
export default function GeminiStatusIndicator() {
  const [status, setStatus] = useState('checking')
  const [details, setDetails] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkStatus = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/test-gemini')
      const data = await response.json()
      
      if (data.success) {
        setStatus('working')
        setDetails(data.details)
      } else {
        setStatus('error')
        setDetails(data.details)
      }
    } catch (error) {
      setStatus('error')
      setDetails({ errorMessage: error.message })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary" className="ml-2">Checking...</Badge>
      case 'working':
        return <Badge className="ml-2 bg-green-600 hover:bg-green-700">✓ Working</Badge>
      case 'error':
        return <Badge variant="destructive" className="ml-2">✗ Error</Badge>
      default:
        return null
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700">Gemini API Status:</span>
          {getStatusBadge()}
        </div>
        {details && (
          <div className="mt-2 text-xs text-gray-600">
            {status === 'working' ? (
              <div className="space-y-1">
                <p>✓ API Key configured ({details.apiKeyLength} characters)</p>
                <p>✓ Model: {details.model}</p>
                <p className="text-green-700">Ready to generate insights!</p>
              </div>
            ) : (
              <div className="space-y-1 text-red-700">
                <p>✗ {details.errorMessage || details.message}</p>
                {!details.hasApiKey && (
                  <p className="mt-2 font-medium">
                    → Add GEMINI_API_KEY to .env.local and restart server
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={checkStatus}
        disabled={isRefreshing}
      >
        {isRefreshing ? 'Testing...' : 'Test'}
      </Button>
    </div>
  )
}

