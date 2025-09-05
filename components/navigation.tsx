"use client"

import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { Home, Plus, Shuffle, User, Trophy, Radio, Music, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/explore", label: "For You", icon: Shuffle },
    { path: "/create", label: "Create", icon: Plus },
    { path: "/live", label: "Live", icon: Radio },
    { path: "/music", label: "Music", icon: Music },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/challenge", label: "Challenge", icon: Trophy },
  ]

  const bottomNavItems = navItems.slice(0, 5) // Home, For You, Create, Live, Music
  const moreItems = navItems.slice(5) // Profile, Challenge

  return (
    <>
      {/* Desktop Navigation - Top Bar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold text-white font-futuristic tracking-wider hover:text-purple-300 transition-all duration-300 hover-scale focus-ring"
            >
              EQUAL
            </button>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(item.path)}
                    className={`text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 hover-lift focus-ring ${
                      isActive ? "bg-white/20 text-white animate-glow" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-white/10">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center h-12 w-12 p-1 transition-all duration-300 ${
                  isActive ? "text-purple-400" : "text-white/70"
                } hover:text-white`}
              >
                <Icon className={`w-5 h-5 mb-1 ${item.path === "/create" ? "w-6 h-6" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            )
          })}

          {/* More Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center justify-center h-12 w-12 p-1 text-white/70 hover:text-white transition-all duration-300"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </Button>
        </div>
      </nav>

      {/* Mobile More Menu Overlay */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/20 rounded-t-3xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-futuristic">More Options</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => {
                        router.push(item.path)
                        setShowMobileMenu(false)
                      }}
                      className={`w-full justify-start h-12 text-left ${
                        isActive ? "bg-purple-600/20 text-purple-400" : "text-white/80"
                      } hover:bg-white/10 hover:text-white`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar - Logo Only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass-nav">
        <div className="flex items-center justify-center h-14">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-bold text-white font-futuristic tracking-wider"
          >
            EQUAL
          </button>
        </div>
      </div>
    </>
  )
}
