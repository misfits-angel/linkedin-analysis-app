'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import AuthModal from '@/components/auth/AuthModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LinkedIn Analytics
            </h1>
            <p className="text-gray-600">
              Sign in with your @misfits.capital email to access your dashboard
            </p>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => setShowAuthModal(true)}
              size="lg"
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Sign In / Sign Up
            </Button>
          </div>

          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultMode="login"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header with user info and logout */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">
                  @misfits.capital
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-sm">
        {children}
      </div>
    </div>
  )
}
