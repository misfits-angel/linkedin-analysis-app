"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const SidebarActionsContext = createContext(null)

export function SidebarActionsProvider({ children }) {
  const [actionHandlers, setActionHandlers] = useState({})

  useEffect(() => {
    console.log('[SidebarActionsProvider] Mounted - Initial')
  }, [])

  const registerActionHandler = useCallback((action, handler) => {
    console.log('[SidebarActionsProvider] Registering handler:', action)
    setActionHandlers(prev => ({
      ...prev,
      [action]: handler
    }))
  }, [])

  const handleAction = useCallback((action) => {
    console.log('[SidebarActionsProvider] Action triggered:', action)
    setActionHandlers(currentHandlers => {
      if (currentHandlers[action]) {
        console.log('[SidebarActionsProvider] Executing handler for:', action)
        currentHandlers[action]()
      } else {
        console.warn('[SidebarActionsProvider] No handler found for:', action)
      }
      return currentHandlers
    })
  }, [])

  const handleNavigation = useCallback((sectionId) => {
    console.log('[SidebarActionsProvider] Navigation to:', sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      console.log('[SidebarActionsProvider] Element found, scrolling')
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      console.warn('[SidebarActionsProvider] Element not found:', sectionId)
    }
  }, [])

  const contextValue = useMemo(() => ({
    registerActionHandler,
    handleAction,
    handleNavigation
  }), [registerActionHandler, handleAction, handleNavigation])

  return (
    <SidebarActionsContext.Provider value={contextValue}>
      {children}
    </SidebarActionsContext.Provider>
  )
}

export function useSidebarActions() {
  const context = useContext(SidebarActionsContext)
  if (!context) {
    throw new Error('useSidebarActions must be used within a SidebarActionsProvider')
  }
  return context
}

