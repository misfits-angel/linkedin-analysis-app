'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode)

  const handleSuccess = () => {
    onClose()
  }

  const switchMode = (newMode) => {
    setMode(newMode)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === 'login' 
              ? 'Sign in to access your LinkedIn Analytics dashboard'
              : 'Sign up to start analyzing your LinkedIn data'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {mode === 'login' ? (
            <LoginForm 
              onSwitchToSignup={() => switchMode('signup')}
              onSuccess={handleSuccess}
            />
          ) : (
            <SignupForm 
              onSwitchToLogin={() => switchMode('login')}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
