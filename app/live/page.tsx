"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, VideoOff, Mic, MicOff, RotateCcw, Users, MessageCircle, Eye, Radio, Play } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/hooks/use-auth'

interface LiveStream {
  id: string
  title: string
  user_id: string
  display_name: string
  username: string
  avatar_url: string
  viewers: number
  duration: string
  thumbnail: string
  is_live: boolean
  tone: "rage" | "mystery" | "satire" | "truth"
  started_at: string
}

const supabase = createClientComponentClient()

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  type: "message" | "like" | "gift"
}

const toneColors = {
  rage: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
  mystery: { bg: "bg-teal-500/20", border: "border-teal-500/30", text: "text-teal-400" },
  satire: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400" },
  truth: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
}

function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const toneStyle = toneColors[stream.tone]

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
      <div className="relative">
        <img
          src={stream.thumbnail || "/placeholder.svg"}
          alt={stream.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />

        {/* Live Badge */}
        <Badge className="absolute top-2 left-2 bg-red-500 text-white animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          LIVE
        </Badge>

        {/* Viewer Count */}
        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
          <Eye className="w-3 h-3 mr-1" />
          {stream.viewers.toLocaleString()}
        </Badge>

        {/* Duration */}
        <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">{stream.duration}</Badge>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src={stream.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{stream.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{stream.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/70 text-sm">@{stream.username}</span>
            </div>
            <Badge className={`${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} border text-xs`}>
              {stream.tone.charAt(0).toUpperCase() + stream.tone.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BroadcastInterface() {
  const { user } = useAuth()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user")
  const [streamTitle, setStreamTitle] = useState("")
  const [selectedTone, setSelectedTone] = useState<"rage" | "mystery" | "satire" | "truth">("truth")
  const [viewers, setViewers] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    initializeCamera()
    // Simulate viewer count changes and update database
    const interval = setInterval(() => {
      if (isStreaming && currentStreamId) {
        const newViewerCount = Math.max(1, viewers + Math.floor(Math.random() * 10) - 4)
        setViewers(newViewerCount)
        
        // Update viewer count in database
        supabase
          .from('live_streams')
          .update({ viewers: newViewerCount })
          .eq('id', currentStreamId)
          .then(({ error }) => {
            if (error) console.error('Error updating viewer count:', error)
          })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isStreaming, currentStreamId, viewers])

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: true,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const startStream = async () => {
    if (!streamTitle.trim() || !user) return

    try {
      // Create live stream record in database
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          user_id: user.id,
          title: streamTitle,
          tone: selectedTone,
          is_live: true,
          viewers: Math.floor(Math.random() * 50) + 10
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating live stream:', error)
        return
      }

      setCurrentStreamId(data.id)
      setIsStreaming(true)
      setViewers(Math.floor(Math.random() * 50) + 10)
      
      // Simulate initial chat messages
      setChatMessages([
        {
          id: "1",
          username: "viewer1",
          message: "First! 🎉",
          timestamp: new Date(),
          type: "message",
        },
        {
          id: "2",
          username: "techfan",
          message: "Great stream topic!",
          timestamp: new Date(),
          type: "message",
        },
      ])
    } catch (err) {
      console.error('Error starting stream:', err)
    }
  }

  const stopStream = async () => {
    if (currentStreamId) {
      try {
        // Update live stream to mark as ended
        await supabase
          .from('live_streams')
          .update({
            is_live: false,
            ended_at: new Date().toISOString()
          })
          .eq('id', currentStreamId)
      } catch (err) {
        console.error('Error stopping stream:', err)
      }
    }

    setIsStreaming(false)
    setViewers(0)
    setChatMessages([])
    setCurrentStreamId(null)
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

  const switchCamera = async () => {
    const newFacing = cameraFacing === "user" ? "environment" : "user"
    setCameraFacing(newFacing)
    await initializeCamera()
  }

  const sendMessage = () => {
    if (newMessage.trim() && user) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: user.user_metadata?.display_name || user.email?.split('@')[0] || "You",
        message: newMessage,
        timestamp: new Date(),
        type: "message",
      }
      setChatMessages((prev) => [...prev, message])
      setNewMessage("")
    }
  }

  const toneStyle = toneColors[selectedTone]

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="text-center py-12">
        <Radio className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
        <p className="text-white/70 mb-6">You need to be signed in to start a live stream.</p>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Sign In to Go Live
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stream Preview */}
      <div className="lg:col-span-2">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white font-futuristic flex items-center gap-2">
              <Video className="w-5 h-5" />
              {isStreaming ? "Live Stream" : "Stream Preview"}
              {isStreaming && (
                <Badge className="bg-red-500 text-white animate-pulse ml-2">
                  <Radio className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

              {/* Stream Info Overlay */}
              {isStreaming && (
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="space-y-2">
                    <Badge className="bg-black/70 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      {viewers} viewers
                    </Badge>
                    <Badge className={`${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} border`}>
                      {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Video Off Overlay */}
              {!isVideoOn && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-16 h-16 text-white/50" />
                </div>
              )}
            </div>

            {/* Stream Setup */}
            {!isStreaming && (
              <div className="space-y-4">
                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 block">Stream Title</label>
                  <Input
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="What's your stream about?"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <label className="text-white/90 text-sm font-medium mb-2 block">Emotional Tone</label>
                  <div className="flex gap-2">
                    {Object.entries(toneColors).map(([tone, style]) => (
                      <Button
                        key={tone}
                        variant={selectedTone === tone ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTone(tone as any)}
                        className={
                          selectedTone === tone
                            ? `${style.bg} ${style.border} ${style.text} border`
                            : "border-white/20 text-white/70"
                        }
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stream Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVideo}
                className={`border-white/20 ${isVideoOn ? "text-white bg-transparent" : "text-red-400 bg-red-500/20"}`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleAudio}
                className={`border-white/20 ${isAudioOn ? "text-white bg-transparent" : "text-red-400 bg-red-500/20"}`}
              >
                {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={switchCamera}
                className="border-white/20 text-white bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              {!isStreaming ? (
                <Button
                  onClick={startStream}
                  disabled={!streamTitle.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </Button>
              ) : (
                <Button onClick={stopStream} variant="destructive" className="px-6">
                  End Stream
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}
      <div className="lg:col-span-1">
        <Card className="bg-black/20 backdrop-blur-md border border-white/10 h-full">
          <CardHeader>
            <CardTitle className="text-white font-futuristic flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
              {isStreaming && <Badge className="bg-green-500 text-white text-xs">Active</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-96">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {chatMessages.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-8">
                  {isStreaming ? "Chat will appear here..." : "Start streaming to see chat"}
                </p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <span className="text-purple-400 text-sm font-medium">{msg.username}:</span>
                    <span className="text-white/80 text-sm">{msg.message}</span>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            {isStreaming && (
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Say something..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button size="sm" onClick={sendMessage} className="bg-purple-600 hover:bg-purple-700">
                  Send
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LiveStreamsGrid() {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLiveStreams()
  }, [])

  const fetchLiveStreams = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('live_streams_with_details')
        .select('*')
        .eq('is_live', true)
        .order('started_at', { ascending: false })

      if (error) {
        console.error('Error fetching live streams:', error)
        setLiveStreams([])
        return
      }

      setLiveStreams(data || [])
    } catch (err) {
      console.error('Error fetching live streams:', err)
      setLiveStreams([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-futuristic">Live Now</h2>
          <Badge className="bg-red-500 text-white">
            <Radio className="w-3 h-3 mr-1" />
            Loading...
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-futuristic">Live Now</h2>
        <Badge className="bg-red-500 text-white">
          <Radio className="w-3 h-3 mr-1" />
          {liveStreams.length} Live
        </Badge>
      </div>

      {liveStreams.length === 0 ? (
        <div className="text-center py-12">
          <Radio className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Live Streams</h3>
          <p className="text-white/70">Be the first to go live! Switch to the "Go Live" tab to start streaming.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-futuristic">Live Streaming</h1>
            <p className="text-xl text-white/70">Broadcast your story in real-time</p>
          </div>

          <Tabs defaultValue="watch" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-white/10 mb-8">
              <TabsTrigger value="watch" className="data-[state=active]:bg-purple-600">
                <Eye className="w-4 h-4 mr-2" />
                Watch Live
              </TabsTrigger>
              <TabsTrigger value="broadcast" className="data-[state=active]:bg-purple-600">
                <Radio className="w-4 h-4 mr-2" />
                Go Live
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watch">
              <LiveStreamsGrid />
            </TabsContent>

            <TabsContent value="broadcast">
              <BroadcastInterface />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
