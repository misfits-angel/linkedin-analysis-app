'use client'

import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    // Redirect to main website after a brief moment to show the logo
    const timer = setTimeout(() => {
      window.location.href = 'https://theunstoppable.ai/'
    }, 2000) // 2 second delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-md px-4">
        <img
          src="https://storage.googleapis.com/misfits-production.appspot.com/image_assets/Unstoppable%20logos%20(1080%20x%201080%20px)%20(59).png"
          alt="Unstoppable Logo"
          className="h-48 w-[52rem] max-w-full mx-auto mb-8 animate-pulse object-contain"
          style={{ aspectRatio: '1920/450' }}
        />
        <p className="text-gray-600 text-lg">Redirecting to Unstoppable...</p>
      </div>
    </div>
  )
}
