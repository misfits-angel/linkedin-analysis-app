import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize state from window size if available, otherwise default to false (desktop)
  const [isMobile, setIsMobile] = React.useState(() => {
    // Only run on client during hydration
    if (typeof window === 'undefined') {
      return false
    }
    return window.innerWidth < MOBILE_BREAKPOINT
  })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setMounted(true)
    
    // Check immediately on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    checkMobile()
    
    // Listen for resize events
    const timer = setTimeout(() => {
      window.addEventListener("resize", checkMobile)
    }, 0)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // During SSR or before hydration completes, return false (desktop mode)
  // This ensures consistent render between server and client
  if (!mounted) {
    return false
  }
  
  return isMobile
}
