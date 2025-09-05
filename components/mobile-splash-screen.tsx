"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MobileSplashScreenProps {
  onComplete?: () => void
  duration?: number
  autoHide?: boolean
  tapToSkip?: boolean
}

export function MobileSplashScreen({ 
  onComplete, 
  duration = 2500, 
  autoHide = true,
  tapToSkip = true
}: MobileSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    let progressTimer: NodeJS.Timeout
    let completeTimer: NodeJS.Timeout

    if (autoHide) {
      // Progress animation
      progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (duration / 50))
          return newProgress >= 100 ? 100 : newProgress
        })
      }, 50)

      // Allow skipping after 1 second
      setTimeout(() => setCanSkip(true), 1000)

      // Auto complete
      completeTimer = setTimeout(() => {
        handleComplete()
      }, duration)
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer)
      if (completeTimer) clearTimeout(completeTimer)
    }
  }, [duration, autoHide])

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete?.()
    }, 300)
  }

  const handleTap = () => {
    if (tapToSkip && canSkip) {
      handleComplete()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden touch-none select-none"
          style={{
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
          }}
          onClick={handleTap}
        >
          {/* Mobile-optimized background */}
          <div className="absolute inset-0">
            {/* Subtle animated gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-40"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center px-8">
            {/* Logo container with mobile-optimized sizing */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2
              }}
              className="relative mb-8"
            >
              {/* Glow effects optimized for mobile */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Logo background */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/8 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                {/* Simplified Equal logo for mobile */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-white font-bold text-2xl sm:text-3xl font-orbitron tracking-wider"
                >
                  E
                </motion.div>
              </div>
            </motion.div>

            {/* App name with mobile typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 font-orbitron tracking-wider">
                EQUAL
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="text-white/70 text-sm sm:text-base font-light tracking-wide"
              >
                Create • Remix • Explore
              </motion.p>
            </motion.div>

            {/* Mobile-optimized loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.4 }}
              className="w-full max-w-xs"
            >
              {/* Progress bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                />
              </div>

              {/* Loading dots */}
              <div className="flex justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-white/60 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tap to skip indicator */}
          {tapToSkip && canSkip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              className="absolute bottom-8 left-0 right-0 text-center"
            >
              <p className="text-white/60 text-xs sm:text-sm font-light">
                Tap to skip
              </p>
            </motion.div>
          )}

          {/* Mobile-safe bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for mobile splash screen integration
export function useMobileSplash() {
  const [showSplash, setShowSplash] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    // Check if this is the first load
    const hasSeenSplash = sessionStorage.getItem('equal-splash-seen')
    if (hasSeenSplash) {
      setShowSplash(false)
      setIsFirstLoad(false)
    }
  }, [])

  const hideSplash = () => {
    setShowSplash(false)
    sessionStorage.setItem('equal-splash-seen', 'true')
  }

  return {
    showSplash: showSplash && isFirstLoad,
    hideSplash
  }
}