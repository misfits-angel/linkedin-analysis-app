'use client'

import { createContext, useContext, useState } from 'react'

const CardNameContext = createContext()

export function CardNameProvider({ children }) {
  const [showCardNames, setShowCardNames] = useState(false)

  const toggleCardNames = () => {
    setShowCardNames(prev => !prev)
  }

  return (
    <CardNameContext.Provider value={{ showCardNames, toggleCardNames }}>
      {children}
    </CardNameContext.Provider>
  )
}

export function useCardNames() {
  const context = useContext(CardNameContext)
  if (!context) {
    throw new Error('useCardNames must be used within a CardNameProvider')
  }
  return context
}
