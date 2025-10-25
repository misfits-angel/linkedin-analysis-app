'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Default content for Unstoppable cards
const DEFAULT_UNSTOPPABLE_CONTENT = {
  'why-us': {
    title: 'Why Us?',
    emoji: '🚀',
    subtitle: 'Proven Track Record',
    description: "We've helped 100+ startups scale their LinkedIn presence and build meaningful connections in the startup ecosystem.",
    features: [
      {
        title: 'Expert Network',
        description: 'Access to 500+ VCs, founders, and industry experts'
      },
      {
        title: 'Data-Driven Approach',
        description: 'AI-powered analytics to optimize your content strategy'
      },
      {
        title: 'Proven Results',
        description: 'Average 300% increase in engagement rates'
      }
    ]
  },
  'how-we-work': {
    title: 'How We Work',
    emoji: '⚡',
    subtitle: 'Simple 3-Step Process',
    description: 'Our streamlined approach gets you results quickly and efficiently.',
    steps: [
      {
        number: 1,
        title: 'Analysis & Strategy',
        description: 'We analyze your current LinkedIn presence and create a customized strategy'
      },
      {
        number: 2,
        title: 'Content Creation',
        description: 'Our team creates high-quality, engaging content tailored to your audience'
      },
      {
        number: 3,
        title: 'Optimization & Growth',
        description: 'Continuous monitoring and optimization to maximize your reach and engagement'
      }
    ]
  },
  'what-you-get': {
    title: 'What Will You Get?',
    emoji: '🎁',
    subtitle: 'Complete Package',
    description: 'Everything you need to build a powerful LinkedIn presence.',
    features: [
      'Weekly content calendar (4-5 posts)',
      'AI-powered analytics dashboard',
      'Direct access to our expert network',
      'Monthly strategy calls',
      '24/7 support and monitoring',
      'Performance reports and insights'
    ]
  },
  'investment-terms': {
    title: 'Investment Terms',
    emoji: '💰',
    subtitle: 'Flexible Pricing',
    description: 'Choose the plan that works best for your startup\'s needs and budget.',
    plans: [
      {
        name: 'Starter Plan',
        price: '$2,500',
        description: 'Perfect for early-stage startups',
        features: ['2 posts per week', 'Basic analytics', 'Email support'],
        highlighted: false
      },
      {
        name: 'Growth Plan',
        price: '$5,000',
        description: 'Most popular for growing companies',
        features: ['4 posts per week', 'Advanced analytics', 'Priority support', 'Monthly strategy calls'],
        highlighted: true
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        description: 'Tailored for established companies',
        features: ['Unlimited posts', 'Full analytics suite', 'Dedicated account manager', 'Custom integrations'],
        highlighted: false
      }
    ],
    guarantee: 'All plans include 30-day money-back guarantee'
  },
  'next-steps': {
    title: 'Next Steps',
    emoji: '🎯',
    subtitle: 'Ready to Get Started?',
    description: 'Take the next step towards building your LinkedIn presence and growing your startup.',
    steps: [
      {
        number: 1,
        title: 'Schedule a Free Consultation',
        description: 'Book a 30-minute call to discuss your LinkedIn goals and strategy'
      },
      {
        number: 2,
        title: 'Choose Your Plan',
        description: 'Select the package that best fits your startup\'s needs and budget'
      },
      {
        number: 3,
        title: 'Start Growing',
        description: 'Begin your journey to LinkedIn success with our expert team'
      }
    ],
    buttonText: 'Schedule Free Consultation',
    contactEmail: 'hello@misfits.capital'
  }
}

const EditableContentContext = createContext()

export function EditableContentProvider({ children, initialEditableContent = null }) {
  const [editableContent, setEditableContent] = useState(DEFAULT_UNSTOPPABLE_CONTENT)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Initialize content from localStorage or initial content
  useEffect(() => {
    const initializeContent = () => {
      // If we have initial content (from shared report), use that
      if (initialEditableContent && Object.keys(initialEditableContent).length > 0) {
        console.log('✏️ Using initial editable content from shared report:', Object.keys(initialEditableContent))
        setEditableContent({ ...DEFAULT_UNSTOPPABLE_CONTENT, ...initialEditableContent })
        setIsInitialized(true)
        return
      }

      // Otherwise, try to load from localStorage
      const savedContent = localStorage.getItem('unstoppableContent')
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent)
          setEditableContent({ ...DEFAULT_UNSTOPPABLE_CONTENT, ...parsed })
        } catch (error) {
          console.error('Failed to parse saved unstoppable content:', error)
          setEditableContent(DEFAULT_UNSTOPPABLE_CONTENT)
        }
      }
      setIsInitialized(true)
    }

    initializeContent()
  }, [initialEditableContent])

  // Persist content to localStorage (only if not in shared report mode)
  useEffect(() => {
    if (isInitialized && !initialEditableContent) {
      setIsSaving(true)
      try {
        localStorage.setItem('unstoppableContent', JSON.stringify(editableContent))
        setLastSaved(new Date())
      } catch (error) {
        console.error('Failed to save content:', error)
      } finally {
        // Add a small delay to show the saving indicator
        setTimeout(() => setIsSaving(false), 500)
      }
    }
  }, [editableContent, isInitialized, initialEditableContent])

  // Update content for a specific card
  const updateCardContent = useCallback((cardId, newContent) => {
    setEditableContent(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], ...newContent }
    }))
  }, [])

  // Update a specific field within a card
  const updateCardField = useCallback((cardId, field, value) => {
    setEditableContent(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [field]: value
      }
    }))
  }, [])

  // Add a new feature/item to a card
  const addCardItem = useCallback((cardId, itemType, item) => {
    setEditableContent(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [itemType]: [...(prev[cardId][itemType] || []), item]
      }
    }))
  }, [])

  // Update a specific item within a card's array
  const updateCardItem = useCallback((cardId, itemType, index, updatedItem) => {
    setEditableContent(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [itemType]: prev[cardId][itemType].map((item, i) => 
          i === index ? { ...item, ...updatedItem } : item
        )
      }
    }))
  }, [])

  // Remove an item from a card's array
  const removeCardItem = useCallback((cardId, itemType, index) => {
    setEditableContent(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [itemType]: prev[cardId][itemType].filter((_, i) => i !== index)
      }
    }))
  }, [])

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
  }, [])

  // Reset content to defaults
  const resetToDefaults = useCallback(() => {
    setEditableContent(DEFAULT_UNSTOPPABLE_CONTENT)
  }, [])

  // Get content for a specific card
  const getCardContent = useCallback((cardId) => {
    return editableContent[cardId] || DEFAULT_UNSTOPPABLE_CONTENT[cardId]
  }, [editableContent])

  // Manual save function
  const saveContent = useCallback(() => {
    setIsSaving(true)
    try {
      localStorage.setItem('unstoppableContent', JSON.stringify(editableContent))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setTimeout(() => setIsSaving(false), 500)
    }
  }, [editableContent])

  const value = {
    editableContent,
    isEditMode,
    isInitialized,
    isSaving,
    lastSaved,
    updateCardContent,
    updateCardField,
    addCardItem,
    updateCardItem,
    removeCardItem,
    toggleEditMode,
    resetToDefaults,
    getCardContent,
    saveContent
  }

  return (
    <EditableContentContext.Provider value={value}>
      {children}
    </EditableContentContext.Provider>
  )
}

export function useEditableContent() {
  const context = useContext(EditableContentContext)
  if (context === undefined) {
    throw new Error('useEditableContent must be used within EditableContentProvider')
  }
  return context
}
