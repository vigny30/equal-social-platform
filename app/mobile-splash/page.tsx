"use client"

import { useState } from "react"
import { MobileSplashScreen } from "@/components/mobile-splash-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Tablet, Monitor, Zap, Clock, Hand } from "lucide-react"

export default function MobileSplashPage() {
  const [showSplash, setShowSplash] = useState(false)
  const [duration, setDuration] = useState(2500)
  const [tapToSkip, setTapToSkip] = useState(true)

  const handleShowSplash = () => {
    setShowSplash(true)
  }

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const presets = [
    { name: "Quick", duration: 1500, icon: Zap },
    { name: "Standard", duration: 2500, icon: Clock },
    { name: "Extended", duration: 4000, icon: Hand }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-orbitron">
            Mobile Splash Screen
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            A beautiful, performant splash screen optimized for mobile devices with smooth animations and touch interactions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Duration Presets */}
                <div>
                  <label className="text-white/80 text-sm mb-3 block">Duration Presets</label>
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset) => {
                      const Icon = preset.icon
                      return (
                        <Button
                          key={preset.name}
                          variant={duration === preset.duration ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDuration(preset.duration)}
                          className={`flex flex-col items-center gap-1 h-auto py-2 ${
                            duration === preset.duration 
                              ? "bg-purple-600 hover:bg-purple-700" 
                              : "border-white/20 text-white/80 hover:bg-white/10"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{preset.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Duration */}
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Custom Duration: {duration}ms
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="250"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Tap to Skip</label>
                  <button
                    onClick={() => setTapToSkip(!tapToSkip)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tapToSkip ? "bg-purple-600" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tapToSkip ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Launch Button */}
                <Button 
                  onClick={handleShowSplash}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  disabled={showSplash}
                >
                  {showSplash ? "Splash Active" : "Launch Splash Screen"}
                </Button>
              </CardContent>
            </Card>

            {/* Device Preview */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Device Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <Smartphone className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-white/60 text-xs">Mobile</p>
                  </div>
                  <div className="text-center">
                    <Tablet className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-white/60 text-xs">Tablet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features & Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Performance</h4>
                    <ul className="space-y-2 text-white/80 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        Optimized for mobile devices
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        Smooth 60fps animations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        Minimal battery impact
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        Touch-optimized interactions
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Visual Effects</h4>
                    <ul className="space-y-2 text-white/80 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Gradient background animation
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Logo with glow effects
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Progress indicator
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        Smooth fade transitions
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline" className="border-purple-400 text-purple-400 mb-2">
                      React Component
                    </Badge>
                    <p className="text-white/80 text-sm">
                      Drop-in component with customizable props for duration, auto-hide, and tap-to-skip functionality.
                    </p>
                  </div>
                  
                  <div>
                    <Badge variant="outline" className="border-blue-400 text-blue-400 mb-2">
                      Mobile Detection
                    </Badge>
                    <p className="text-white/80 text-sm">
                      Automatically detects mobile devices and screen sizes to show splash screen only when appropriate.
                    </p>
                  </div>

                  <div>
                    <Badge variant="outline" className="border-green-400 text-green-400 mb-2">
                      Session Management
                    </Badge>
                    <p className="text-white/80 text-sm">
                      Uses session storage to show splash screen only on first load, improving user experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Splash Screen Component */}
      {showSplash && (
        <MobileSplashScreen
          onComplete={handleSplashComplete}
          duration={duration}
          autoHide={true}
          tapToSkip={tapToSkip}
        />
      )}
    </div>
  )
}