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
    <div className="flex items-center justify-center">
      <div className="text-[12rem] font-bold text-black font-futuristic animate-glow hover-lift transition-all duration-700 select-none" style={{
        textShadow: `
          0 0 20px rgba(139, 92, 246, 0.8),
          0 0 40px rgba(139, 92, 246, 0.6),
          0 0 60px rgba(139, 92, 246, 0.4),
          0 0 80px rgba(139, 92, 246, 0.2),
          0 0 100px rgba(139, 92, 246, 0.1),
          0 10px 20px rgba(0, 0, 0, 0.5),
          0 20px 40px rgba(0, 0, 0, 0.3),
          0 30px 60px rgba(0, 0, 0, 0.2)
        `
      }}>
        E
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
            <h1 className="text-4xl font-bold text-white/80 tracking-wider font-futuristic animate-glow">EQUAL</h1>
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
