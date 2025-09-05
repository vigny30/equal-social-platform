import type React from "react"
import type { Metadata, Viewport } from "next"
import { Orbitron, Inter } from "next/font/google"
import { AppWrapper } from "@/components/app-wrapper"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Equal - Create, Remix, Explore",
  description: "A futuristic social platform for creative expression with AI-powered content creation",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Equal",
  },
  icons: {
    icon: "/app-icon.svg",
    apple: "/placeholder-logo.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8b5cf6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable} dark`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Equal" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
      </head>
      <body className="font-sans antialiased">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
