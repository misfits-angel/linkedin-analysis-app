'use client'

import { useEffect } from 'react'
import Link from 'next/link'

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
          className="h-32 w-auto mx-auto mb-8 animate-pulse"
        />
        <p className="text-gray-600 text-lg mb-6">Redirecting to Unstoppable...</p>
        <div className="space-y-3">
          <a
            href="https://theunstoppable.ai/"
            className="inline-block text-[#2f8f5b] hover:text-[#245a42] font-medium underline"
          >
            Visit theunstoppable.ai
          </a>
          <div className="text-gray-400 text-sm">or</div>
          <Link
            href="/login"
            className="inline-block text-[#2f8f5b] hover:text-[#245a42] font-medium underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
