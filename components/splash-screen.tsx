"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
  showLogo?: boolean
}

export function SplashScreen({ 
  onComplete, 
  duration = 3000, 
  showLogo = true 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [logoLoaded, setLogoLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete?.()
      }, 500) // Wait for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  useEffect(() => {
    // Simulate logo loading
    const logoTimer = setTimeout(() => {
      setLogoLoaded(true)
    }, 300)

    return () => clearTimeout(logoTimer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)'
          }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.03) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/5"
                style={{
                  width: `${60 + i * 20}px`,
                  height: `${60 + i * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Container */}
            {showLogo && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: logoLoaded ? 1 : 0, 
                  rotate: logoLoaded ? 0 : -180 
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut",
                  delay: 0.2
                }}
                className="relative mb-8"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl scale-150" />
                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl scale-200" />
                
                {/* Logo Background */}
                <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  {/* Equal Logo SVG */}
                  <motion.svg
                    width="64"
                    height="32"
                    viewBox="0 0 40 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: logoLoaded ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <motion.path
                      fill="#ffffff"
                      fillRule="evenodd"
                      d="m7.839 15.783 16.03-12.054L20 2 0 15.783h7.839Zm8.214 0H40L27.99 8.894l-4.02 3.032 3.976 2.914H20.02l-3.967 2.943Z"
                      clipRule="evenodd"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: logoLoaded ? 1 : 0 }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </motion.svg>
                </div>
              </motion.div>
            )}

            {/* App Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: logoLoaded ? 1 : 0, y: logoLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-orbitron tracking-wider">
                EQUAL
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: logoLoaded ? 0.8 : 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="text-white/80 text-sm md:text-base font-light tracking-wide"
              >
                Create • Remix • Explore
              </motion.p>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: logoLoaded ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 1.4 }}
              className="mt-12 flex items-center gap-2"
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/60 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}