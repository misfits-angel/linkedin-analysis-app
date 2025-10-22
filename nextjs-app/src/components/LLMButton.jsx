import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function LLMButton({
  onClick,
  isLoading,
  disabled = false,
  icon,
  text,
  loadingText,
  size = 'md',
  variant = 'default',
  className = ''
}) {
  // Map custom variants to shadcn/ui variants
  const getVariant = () => {
    switch (variant) {
      case 'primary':
        return 'default'
      case 'secondary':
        return 'secondary'
      case 'success':
        return 'default'
      case 'warning':
        return 'outline'
      case 'info':
        return 'outline'
      default:
        return 'default'
    }
  }

  // Map custom sizes to shadcn/ui sizes
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'sm'
      case 'lg':
        return 'lg'
      default:
        return 'default'
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={getVariant()}
      size={getSize()}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'Processing...'}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {text}
        </>
      )}
    </Button>
  )
}
