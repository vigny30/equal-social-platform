"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

export default function SplashDemo() {
  const [showSplash, setShowSplash] = useState(false)
  const [splashDuration, setSplashDuration] = useState(3000)

  const handleShowSplash = () => {
    setShowSplash(true)
  }

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 font-orbitron">
              Mobile Splash Screen Demo
            </h1>
            <p className="text-white/80 text-lg">
              Preview the animated splash screen for the Equal mobile app
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Controls */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Splash Screen Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Duration: {splashDuration}ms
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={splashDuration}
                    onChange={(e) => setSplashDuration(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <Button 
                  onClick={handleShowSplash}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  disabled={showSplash}
                >
                  {showSplash ? "Splash Screen Active" : "Show Splash Screen"}
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    Animated gradient background
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    3D logo with glow effects
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                    Floating particle animations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    Smooth fade transitions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    Loading animation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                    Customizable duration
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Usage Example */}
          <Card className="glass-card border-white/10 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Usage Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-black/30 p-4 rounded-lg text-green-400 text-sm overflow-x-auto">
{`import { SplashScreen } from "@/components/splash-screen"

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          duration={3000}
          showLogo={true}
        />
      )}
      {/* Your app content */}
    </>
  )
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Splash Screen Component */}
      {showSplash && (
        <SplashScreen
          onComplete={handleSplashComplete}
          duration={splashDuration}
          showLogo={true}
        />
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  )
}