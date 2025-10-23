'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Domain validation for Google OAuth
        if (session?.user?.email && !session.user.email.endsWith('@misfits.capital')) {
          console.warn('Non-misfits.capital email detected, signing out')
          await supabase.auth.signOut()
          return
        }
        
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    // Domain validation
    if (!email.endsWith('@misfits.capital')) {
      throw new Error('Only @misfits.capital email addresses are allowed')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    // Domain validation
    if (!email.endsWith('@misfits.capital')) {
      throw new Error('Only @misfits.capital email addresses are allowed')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email) => {
    if (!email.endsWith('@misfits.capital')) {
      throw new Error('Only @misfits.capital email addresses are allowed')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
  }

  const signInWithGoogle = async () => {
    // Use environment-specific redirect URL or fallback to current origin
    const redirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/callback'
        : `${window.location.origin}/auth/callback`)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })

    if (error) throw error
    return data
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
