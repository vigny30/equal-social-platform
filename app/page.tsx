"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Text3D, Center } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/page-transition"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { supabase } from "@/lib/supabase"

function Logo3D() {
  return (
    <Center>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={8}
        height={2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.3}
        bevelSize={0.1}
        bevelOffset={0}
        bevelSegments={8}
      >
        E
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} envMapIntensity={1.5} />
      </Text3D>
    </Center>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-6xl font-bold text-white/20 animate-pulse">E</div>
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

        {/* 3D Logo Section */}
        <div className="h-screen flex flex-col items-center justify-center relative">
          <div className="w-full h-2/3 relative animate-fade-in-scale">
            <Canvas camera={{ position: [0, 0, 20], fov: 50 }} className="w-full h-full">
              <Suspense fallback={null}>
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} />
                <Logo3D />
                <Environment preset="studio" />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
              </Suspense>
            </Canvas>
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
