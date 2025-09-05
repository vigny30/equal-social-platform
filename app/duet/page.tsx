"use client"

import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  RotateCcw,
  Square,
  Download,
  Trash2,
  Play,
  Pause,
  Volume2,
  Users,
  Layers,
  PictureInPicture,
  ArrowLeftRight,
  ArrowUpDown,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"

interface OriginalPost {
  id: string
  type: "video" | "photo"
  content: string
  mediaUrl: string
  user: {
    id: string
    username: string
    avatar: string
    isVerified?: boolean
  }
  tone: "rage" | "mystery" | "satire" | "truth"
  duration?: number
}

const duetLayouts = [
  { id: "side-by-side", name: "Side by Side", icon: ArrowLeftRight, description: "Original left, you right" },
  { id: "top-bottom", name: "Top & Bottom", icon: ArrowUpDown, description: "Original top, you bottom" },
  { id: "pip-original", name: "PiP Original", icon: PictureInPicture, description: "Original small, you main" },
  { id: "pip-you", name: "PiP You", icon: Layers, description: "You small, original main" },
]

const toneColors = {
  rage: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
  mystery: { bg: "bg-teal-500/20", border: "border-teal-500/30", text: "text-teal-400" },
  satire: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400" },
  truth: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
}

function DuetPageContent() {
  const searchParams = useSearchParams()
  const originalPostId = searchParams.get("post")

  // Mock original post data - in real app, this would be fetched based on originalPostId
  const originalPost: OriginalPost = {
    id: originalPostId || "1",
    type: "video",
    content: "The future of AI is here and it's changing everything we know about creativity 🚀",
    mediaUrl: "/futuristic-ai-video.png",
    user: {
      id: "user1",
      username: "techvisionary",
      avatar: "/tech-person-avatar.png",
      isVerified: true,
    },
    tone: "truth",
    duration: 45,
  }

  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user")
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(originalPost.duration || 30)

  // Duet-specific states
  const [selectedLayout, setSelectedLayout] = useState("side-by-side")
  const [originalVolume, setOriginalVolume] = useState([80])
  const [yourVolume, setYourVolume] = useState([100])
  const [isOriginalPlaying, setIsOriginalPlaying] = useState(false)
  const [isSynced, setIsSynced] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const originalVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const initializeCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setHasPermission(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasPermission(false)
    }
  }

  const startRecording = async () => {
    if (!streamRef.current) {
      await initializeCamera()
    }

    if (!streamRef.current) return

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(streamRef.current)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" })
      const url = URL.createObjectURL(blob)
      setRecordedVideo(url)
      setIsPreviewMode(true)
    }

    mediaRecorder.start()
    setIsRecording(true)
    setCurrentTime(0)

    // Start original video if synced
    if (isSynced && originalVideoRef.current) {
      originalVideoRef.current.currentTime = 0
      originalVideoRef.current.play()
      setIsOriginalPlaying(true)
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          stopRecording()
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Stop original video
      if (originalVideoRef.current) {
        originalVideoRef.current.pause()
        setIsOriginalPlaying(false)
      }
    }
  }

  const switchCamera = async () => {
    const newFacing = cameraFacing === "user" ? "environment" : "user"
    setCameraFacing(newFacing)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    await initializeCamera()
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
      }
    }
  }

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn)
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn
      }
    }
  }

  const retakeVideo = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo)
      setRecordedVideo(null)
    }
    setIsPreviewMode(false)
    setCurrentTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getLayoutStyles = () => {
    switch (selectedLayout) {
      case "side-by-side":
        return {
          container: "flex flex-row",
          original: "w-1/2 h-full",
          yours: "w-1/2 h-full",
        }
      case "top-bottom":
        return {
          container: "flex flex-col",
          original: "w-full h-1/2",
          yours: "w-full h-1/2",
        }
      case "pip-original":
        return {
          container: "relative",
          original: "absolute top-4 right-4 w-32 h-48 z-10 rounded-lg overflow-hidden border-2 border-white",
          yours: "w-full h-full",
        }
      case "pip-you":
        return {
          container: "relative",
          original: "w-full h-full",
          yours: "absolute top-4 right-4 w-32 h-48 z-10 rounded-lg overflow-hidden border-2 border-white",
        }
      default:
        return {
          container: "flex flex-row",
          original: "w-1/2 h-full",
          yours: "w-1/2 h-full",
        }
    }
  }

  const layoutStyles = getLayoutStyles()
  const selectedLayoutData = duetLayouts.find((layout) => layout.id === selectedLayout)
  const toneStyle = toneColors[originalPost.tone]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 font-futuristic">Create Duet</h1>
            <p className="text-xl text-white/70">Collaborate with this amazing content</p>
          </div>

          {/* Original Post Info */}
          <Card className="bg-black/20 backdrop-blur-md border border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage src={originalPost.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{originalPost.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">@{originalPost.user.username}</span>
                  {originalPost.user.isVerified && (
                    <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-2 py-0">
                      ✓
                    </Badge>
                  )}
                </div>
                <Badge className={`${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} border`}>
                  {originalPost.tone.charAt(0).toUpperCase() + originalPost.tone.slice(1)}
                </Badge>
              </div>
              <p className="text-white/80 text-sm">{originalPost.content}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Duet Preview */}
            <div className="lg:col-span-2">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white font-futuristic flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Duet Preview
                    {isRecording && (
                      <Badge className="bg-red-500 text-white animate-pulse ml-2">
                        <div className="w-2 h-2 bg-white rounded-full mr-1" />
                        REC {formatTime(currentTime)}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Duet Preview Container */}
                  <div className="relative aspect-[9/16] max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                    <div className={layoutStyles.container + " h-full"}>
                      {/* Original Video */}
                      <div className={layoutStyles.original}>
                        <video
                          ref={originalVideoRef}
                          src={originalPost.mediaUrl}
                          loop
                          muted={false}
                          playsInline
                          className="w-full h-full object-cover"
                          style={{ volume: originalVolume[0] / 100 }}
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          @{originalPost.user.username}
                        </div>
                      </div>

                      {/* Your Video */}
                      <div className={layoutStyles.yours}>
                        {!isPreviewMode ? (
                          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                        ) : recordedVideo ? (
                          <video src={recordedVideo} controls className="w-full h-full object-cover" />
                        ) : null}

                        {!isVideoOn && !isPreviewMode && (
                          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <VideoOff className="w-8 h-8 text-white/50" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          You
                        </div>
                      </div>
                    </div>

                    {/* Recording Progress */}
                    {isRecording && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                        <div
                          className="h-full bg-red-500 transition-all duration-1000"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Layout Selector */}
                  <div className="space-y-3">
                    <Label className="text-white/90">Duet Layout</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {duetLayouts.map((layout) => {
                        const Icon = layout.icon
                        return (
                          <Button
                            key={layout.id}
                            variant={selectedLayout === layout.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedLayout(layout.id)}
                            className={`${
                              selectedLayout === layout.id
                                ? "bg-purple-600"
                                : "border-white/20 text-white hover:bg-white/10"
                            } flex flex-col gap-1 h-auto py-3`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-xs">{layout.name}</span>
                          </Button>
                        )
                      })}
                    </div>
                    {selectedLayoutData && <p className="text-white/60 text-sm">{selectedLayoutData.description}</p>}
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center items-center gap-4">
                    {!hasPermission ? (
                      <Button onClick={initializeCamera} className="bg-purple-600 hover:bg-purple-700">
                        <Video className="w-4 h-4 mr-2" />
                        Enable Camera
                      </Button>
                    ) : !isPreviewMode ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleVideo}
                          className={`border-white/20 ${
                            isVideoOn ? "text-white bg-transparent" : "text-red-400 bg-red-500/20"
                          }`}
                        >
                          {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleAudio}
                          className={`border-white/20 ${
                            isAudioOn ? "text-white bg-transparent" : "text-red-400 bg-red-500/20"
                          }`}
                        >
                          {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={switchCamera}
                          disabled={isRecording}
                          className="border-white/20 text-white bg-transparent"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>

                        <Button
                          size="lg"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-16 h-16 rounded-full ${
                            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"
                          }`}
                        >
                          {isRecording ? <Square className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          onClick={retakeVideo}
                          className="border-white/20 hover:bg-white/10 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Download className="w-4 h-4 mr-2" />
                          Save Duet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audio & Sync Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Audio Mixing */}
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio Mix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white/90 mb-2 block">Original Audio: {originalVolume[0]}%</Label>
                    <Slider
                      value={originalVolume}
                      onValueChange={(value) => {
                        setOriginalVolume(value)
                        if (originalVideoRef.current) {
                          originalVideoRef.current.volume = value[0] / 100
                        }
                      }}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-white/90 mb-2 block">Your Audio: {yourVolume[0]}%</Label>
                    <Slider
                      value={yourVolume}
                      onValueChange={setYourVolume}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <Label className="text-white/90 text-sm">Sync with Original</Label>
                      <p className="text-white/60 text-xs">Start recording when original plays</p>
                    </div>
                    <Button
                      variant={isSynced ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsSynced(!isSynced)}
                      className={isSynced ? "bg-purple-600" : "border-white/20 text-white"}
                    >
                      {isSynced ? "Synced" : "Manual"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Original Video Controls */}
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Original Video</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (originalVideoRef.current) {
                          if (isOriginalPlaying) {
                            originalVideoRef.current.pause()
                          } else {
                            originalVideoRef.current.play()
                          }
                          setIsOriginalPlaying(!isOriginalPlaying)
                        }
                      }}
                      disabled={isRecording}
                      className="border-white/20 text-white bg-transparent"
                    >
                      {isOriginalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (originalVideoRef.current) {
                          originalVideoRef.current.muted = !originalVideoRef.current.muted
                        }
                      }}
                      className="border-white/20 text-white bg-transparent"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-white/60 text-sm">Duration: {formatTime(originalPost.duration || 30)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Duet Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-white/70 text-sm space-y-2">
                    <li>• Watch the original first to plan your response</li>
                    <li>• Use sync mode for perfect timing</li>
                    <li>• Adjust audio levels for best mix</li>
                    <li>• Try different layouts for creative effects</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DuetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading duet...</p>
        </div>
      </div>
    }>
      <DuetPageContent />
    </Suspense>
  )
}
