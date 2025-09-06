'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Add a small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        registerServiceWorker()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const setupServiceWorkerListeners = (registration: ServiceWorkerRegistration) => {
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('New service worker available')
            
            // Optionally show update notification to user
            if (confirm('A new version is available. Reload to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            }
          }
        })
      }
    })

    // Listen for controlling service worker changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed')
      window.location.reload()
    })

    // Check for updates periodically
    setInterval(() => {
      registration.update()
    }, 60000) // Check every minute
  }

  const registerServiceWorker = async () => {
    try {
      // Check if already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration('/')
      if (existingRegistration) {
        console.log('Service Worker already registered:', existingRegistration)
        setupServiceWorkerListeners(existingRegistration)
        return
      }

      // Check if service worker file exists first with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      try {
        const response = await fetch('/sw.js', { 
          method: 'HEAD',
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          console.warn('Service Worker file not found, skipping registration')
          return
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          console.warn('Service Worker file check timed out, skipping registration')
          return
        }
        throw fetchError
      }

      // Register with timeout protection
      const registrationPromise = navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      const registration = await Promise.race([
        registrationPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Registration timeout')), 10000)
        )
      ]) as ServiceWorkerRegistration

      console.log('Service Worker registered successfully:', registration)
      setupServiceWorkerListeners(registration)

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Service Worker registration was aborted, this is normal during development')
      } else {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission)
      })
    }
  }, [])

  return null
}

// Utility function to check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
}

// Utility function to prompt PWA installation
export function usePWAInstall() {
  useEffect(() => {
    let deferredPrompt: any

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      console.log('PWA install prompt available')
    }

    const handleAppInstalled = () => {
      console.log('PWA was installed')
      deferredPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    const deferredPrompt = (window as any).deferredPrompt
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      // Clear the deferredPrompt variable
      ;(window as any).deferredPrompt = null
    }
  }

  return { promptInstall, isPWA: isPWA() }
}