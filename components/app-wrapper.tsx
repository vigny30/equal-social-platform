"use client"

import { MobileSplashScreen, useMobileSplash } from "@/components/mobile-splash-screen"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { useEffect, useState } from "react"

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { showSplash, hideSplash } = useMobileSplash()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      {/* Service Worker Registration */}
      <ServiceWorkerRegistration />
      
      {/* Show splash screen only on mobile devices and first load */}
      {showSplash && isMobile && (
        <MobileSplashScreen
          onComplete={hideSplash}
          duration={2500}
          autoHide={true}
          tapToSkip={true}
        />
      )}
      
      {/* Main app content */}
      <div className={showSplash && isMobile ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
        {children}
      </div>
    </>
  )
}