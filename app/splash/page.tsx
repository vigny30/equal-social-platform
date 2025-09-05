"use client"

import { MobileSplashScreen } from "@/components/mobile-splash-screen"

export default function SplashPage() {
  return (
    <MobileSplashScreen
      duration={4000}
      autoHide={true}
      tapToSkip={true}
    />
  )
}