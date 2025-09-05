"use client"

import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/page-transition"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

function Logo3D() {
  return (
    <div className="flex items-center justify-center relative">
       {/* Atmospheric backdrop */}
       <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl scale-150 animate-pulse"></div>
       
       {/* Floating particles */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
         <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/60 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
         <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
         <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-400/60 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
       </div>
       
       {/* Main 3D Logo */}
       <div 
         className="text-[12rem] font-black animate-rotate-sideways hover-lift select-none metallic-3d relative z-10" 
         data-text="E"
         style={{
           fontFamily: 'Arial Black, sans-serif',
           letterSpacing: '-0.05em'
         }}
       >
         E
       </div>
       
       {/* Reflection effect */}
       <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-20 scale-y-[-1] blur-sm">
         <div 
           className="text-[12rem] font-black select-none metallic-3d" 
           data-text="E"
           style={{
             fontFamily: 'Arial Black, sans-serif',
             letterSpacing: '-0.05em',
             background: 'linear-gradient(to bottom, rgba(42, 42, 42, 0.3) 0%, transparent 70%)',
             WebkitBackgroundClip: 'text',
             backgroundClip: 'text',
             WebkitTextFillColor: 'transparent'
           }}
         >
           E
         </div>
       </div>
     </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  console.log('DEBUG: Home page - User:', user?.id, user?.email, 'Loading:', loading)

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if there's an access token in the URL hash
      if (window.location.hash.includes("access_token")) {
        try {
          // Let Supabase handle the session from the URL
          const { data, error } = await supabase.auth.getSession()
          if (error) {
            console.error("Auth callback error:", error)
          } else if (data.session) {
            // Clean up the URL by removing the hash
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        } catch (error) {
          console.error("Error processing auth callback:", error)
        }
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark animate-gradient">
        <div className="absolute top-6 right-6 z-10">
          {loading ? (
            <div className="w-10 h-10 rounded-full glass-card animate-pulse" />
          ) : user ? (
            <UserMenu />
          ) : (
            <AuthModal>
              <Button className="glass-card hover-lift hover-glow btn-primary">Sign In</Button>
            </AuthModal>
          )}
        </div>

        {/* Logo Section */}
        <div className="h-screen flex flex-col items-center justify-center relative">
          <div className="w-full h-2/3 relative animate-fade-in-scale flex items-center justify-center">
            <Logo3D />
          </div>

          {/* App Title */}
          <div className="mt-8 animate-fade-in-up stagger-1">
            <h1 className="text-4xl font-bold text-white/80 tracking-wider font-futuristic animate-glow equal-text-3d">EQUAL</h1>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mt-8 px-6">
            <Button
              size="lg"
              className="glass-card hover-lift hover-glow btn-primary animate-fade-in-up stagger-1 px-8 py-4 text-lg font-semibold focus-ring"
              onClick={() => router.push("/create")}
            >
              Create
            </Button>
            <Button
              size="lg"
              className="glass-card hover-lift hover-glow btn-primary animate-fade-in-up stagger-2 px-8 py-4 text-lg font-semibold focus-ring"
              onClick={() => router.push("/remix")}
            >
              Remix
            </Button>
            <Button
              size="lg"
              className="glass-card hover-lift hover-glow btn-primary animate-fade-in-up stagger-3 px-8 py-4 text-lg font-semibold focus-ring"
              onClick={() => router.push("/explore")}
            >
              Explore
            </Button>
          </div>


        </div>
      </div>
    </PageTransition>
  )
}
