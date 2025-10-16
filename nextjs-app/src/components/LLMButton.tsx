import React from 'react'

interface LLMButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
  icon: string
  text: string
  loadingText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  className?: string
}

export default function LLMButton({
  onClick,
  isLoading,
  disabled = false,
  icon,
  text,
  loadingText,
  size = 'md',
  variant = 'primary',
  className = ''
}: LLMButtonProps) {
  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs w-40',
    md: 'px-4 py-2 text-sm w-48',
    lg: 'px-6 py-3 text-base w-56'
  }

  // Variant configurations
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700',
    secondary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
  }

  const baseClasses = 'text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
  
  const finalClassName = `${sizeClasses[size]} ${variantClasses[variant]} ${baseClasses} ${className}`

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={finalClassName}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          {loadingText || 'Processing...'}
        </>
      ) : (
        <>
          {icon} {text}
        </>
      )}
    </button>
  )
}
