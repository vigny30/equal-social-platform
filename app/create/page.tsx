"use client"

import type React from "react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
  Upload,
  Mic,
  ImageIcon,
  Sparkles,
  Video,
  Camera,
  RotateCcw,
  Square,
  Download,
  Trash2,
  Type,
  Music,
  Zap,
  Clock,
  Volume2,
  Play,
  Pause,
  Filter,
  Wand2,
  Sun,
  Moon,
  Contrast,
  SatelliteIcon as Saturation,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { enhanceText, enhanceAudio, enhanceVideo, generateContent, transcribeAudio, speakText, stopSpeaking, getAvailableVoices, filterVoicesByGender, isSpeaking, applyVideoFilter, applyPhotoFilter, generateNarratorAudio, type TextEnhancementResult, type AudioEnhancementOptions, type VideoEnhancementOptions, type NarratorOptions, type NarratorVoice, type VideoFilterOptions, type PhotoFilterOptions, type NarratorAudioOptions } from "@/lib/ai-services"

const recordingDurations = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 180, label: "3m" },
]

const emotionalTones = [
  { value: "rage", label: "Rage", color: "text-red-400", bgColor: "bg-red-500/20", borderColor: "border-red-500/30" },
  {
    value: "mystery",
    label: "Mystery",
    color: "text-teal-400",
    bgColor: "bg-teal-500/20",
    borderColor: "border-teal-500/30",
  },
  {
    value: "satire",
    label: "Satire",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
  {
    value: "truth",
    label: "Truth",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
  },
]

const videoFilters = [
  { id: "none", name: "Original", filter: "none" },
  { id: "vintage", name: "Vintage", filter: "sepia(0.8) contrast(1.2)" },
  { id: "cool", name: "Cool", filter: "hue-rotate(180deg) saturate(1.3)" },
  { id: "warm", name: "Warm", filter: "hue-rotate(30deg) saturate(1.2)" },
  { id: "dramatic", name: "Dramatic", filter: "contrast(1.5) brightness(0.9)" },
  { id: "soft", name: "Soft", filter: "blur(0.5px) brightness(1.1)" },
  { id: "neon", name: "Neon", filter: "saturate(2) contrast(1.3) hue-rotate(270deg)" },
  { id: "ai-enhance", name: "AI Enhanced", filter: "contrast(1.1) saturate(1.1) brightness(1.05) blur(0.3px)" },
  { id: "cinematic", name: "Cinematic", filter: "contrast(1.3) brightness(0.95) saturate(0.9)" },
  { id: "vibrant", name: "Vibrant", filter: "saturate(1.4) contrast(1.2) brightness(1.1)" },
  { id: "edge-detection", name: "Edge Detection", filter: "ai-filter" },
  { id: "color-pop", name: "Color Pop", filter: "ai-filter" },
  { id: "cyberpunk", name: "Cyberpunk", filter: "ai-filter" },
  { id: "oil-painting", name: "Oil Painting", filter: "ai-filter" },
  { id: "face-blur", name: "Face Blur", filter: "ai-filter" },
  { id: "background-blur", name: "Background Blur", filter: "ai-filter" },
]

const photoFilters = [
  { id: "none", name: "Original", filter: "none" },
  { id: "vintage", name: "Vintage", filter: "sepia(0.8) contrast(1.2)" },
  { id: "bw", name: "B&W", filter: "grayscale(1)" },
  { id: "sepia", name: "Sepia", filter: "sepia(1)" },
  { id: "warm", name: "Warm", filter: "hue-rotate(30deg) saturate(1.2)" },
  { id: "cool", name: "Cool", filter: "hue-rotate(180deg) saturate(1.3)" },
  { id: "dramatic", name: "Dramatic", filter: "contrast(1.5) brightness(0.9)" },
  { id: "soft", name: "Soft", filter: "blur(0.5px) brightness(1.1)" },
  { id: "portrait-enhance", name: "Portrait AI", filter: "ai-filter" },
  { id: "landscape-enhance", name: "Landscape AI", filter: "ai-filter" },
  { id: "hdr-effect", name: "HDR Effect", filter: "ai-filter" },
  { id: "warm-tone", name: "Warm Tone AI", filter: "ai-filter" },
  { id: "cool-tone", name: "Cool Tone AI", filter: "ai-filter" },
  { id: "dramatic-ai", name: "Dramatic AI", filter: "ai-filter" },
  { id: "soft-focus", name: "Soft Focus AI", filter: "ai-filter" },
  { id: "sharpen", name: "AI Sharpen", filter: "ai-filter" },
  { id: "noise-reduction", name: "Noise Reduction", filter: "ai-filter" },
]

const textAnimations = [
  { id: "none", name: "Static" },
  { id: "fadeIn", name: "Fade In" },
  { id: "slideUp", name: "Slide Up" },
  { id: "bounce", name: "Bounce" },
  { id: "typewriter", name: "Typewriter" },
]

const musicTracks = [
  { id: "1", title: "Digital Dreams", artist: "SynthWave", duration: 180, genre: "Electronic" },
  { id: "2", title: "Neon Nights", artist: "CyberBeats", duration: 165, genre: "Synthwave" },
  { id: "3", title: "Future Bass", artist: "ElectroFlow", duration: 200, genre: "EDM" },
  { id: "4", title: "Chill Vibes", artist: "LoFi Master", duration: 220, genre: "Lo-Fi" },
]

interface TextOverlay {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  animation: string
  startTime: number
  duration: number
}

function VideoEditor({ videoUrl, onSave }: { videoUrl: string; onSave: (editedVideo: string) => void }) {
  const [selectedFilter, setSelectedFilter] = useState("none")
  const [brightness, setBrightness] = useState([100])
  const [contrast, setContrast] = useState([100])
  const [saturation, setSaturation] = useState([100])
  const [useAiVideoEnhancement, setUseAiVideoEnhancement] = useState(false)
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
  const [selectedMusic, setSelectedMusic] = useState("")
  const [musicVolume, setMusicVolume] = useState([50])
  const [videoVolume, setVideoVolume] = useState([100])
  const [playbackSpeed, setPlaybackSpeed] = useState([1])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEnhancingVideo, setIsEnhancingVideo] = useState(false)
  const [videoEnhancementApplied, setVideoEnhancementApplied] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      video.addEventListener("loadedmetadata", () => {
        setDuration(video.duration)
      })
      video.addEventListener("timeupdate", () => {
        setCurrentTime(video.currentTime)
      })
    }
  }, [])

  const applyFilters = async () => {
    const filter = videoFilters.find((f) => f.id === selectedFilter)
    const customFilters = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
    
    // Handle AI filters
    if (filter && filter.filter === 'ai-filter') {
      try {
        // For video AI filters
        if (recordedVideo) {
          const videoBlob = await fetch(recordedVideo).then(r => r.blob())
          const videoFile = new File([videoBlob], 'video.mp4', { type: 'video/mp4' })
          const filterOptions: VideoFilterOptions = {
            filterType: filter.id as any,
            intensity: 1.0,
            brightness: brightness[0] / 100,
            contrast: contrast[0] / 100,
            saturation: saturation[0] / 100
          }
          const result = await applyVideoFilter(videoFile, filterOptions)
          return result.filteredVideoUrl
        }
        
        // For photo AI filters
        if (capturedPhoto) {
          const photoBlob = await fetch(capturedPhoto).then(r => r.blob())
          const photoFile = new File([photoBlob], 'photo.jpg', { type: 'image/jpeg' })
          const filterOptions: PhotoFilterOptions = {
            filterType: filter.id as any,
            intensity: 1.0,
            brightness: brightness[0] / 100,
            contrast: contrast[0] / 100,
            saturation: saturation[0] / 100
          }
          const result = await applyPhotoFilter(photoFile, filterOptions)
          return result.filteredImageUrl
        }
      } catch (error) {
        console.error('AI filter error:', error)
        // Fallback to regular CSS filters
        return customFilters
      }
    }
    
    return filter ? `${filter.filter} ${customFilters}` : customFilters
  }

  const applyPhotoFilters = async () => {
    const filter = photoFilters.find((f) => f.id === selectedPhotoFilter)
    const customFilters = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
    
    // Handle AI filters
    if (filter && filter.filter === 'ai-filter') {
      try {
        if (capturedPhoto) {
          const photoBlob = await fetch(capturedPhoto).then(r => r.blob())
          const photoFile = new File([photoBlob], 'photo.jpg', { type: 'image/jpeg' })
          const filterOptions: PhotoFilterOptions = {
            filterType: filter.id as any,
            intensity: 1.0,
            brightness: brightness[0] / 100,
            contrast: contrast[0] / 100,
            saturation: saturation[0] / 100
          }
          const result = await applyPhotoFilter(photoFile, filterOptions)
          return result.filteredImageUrl
        }
      } catch (error) {
        console.error('Photo AI filter error:', error)
        // Fallback to regular CSS filters
        return customFilters
      }
    }
    
    return filter ? `${filter.filter} ${customFilters}` : customFilters
  }

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: "Add your text",
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#ffffff",
      animation: "none",
      startTime: currentTime,
      duration: 3,
    }
    setTextOverlays([...textOverlays, newOverlay])
  }

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((overlays) => overlays.map((overlay) => (overlay.id === id ? { ...overlay, ...updates } : overlay)))
  }

  const removeTextOverlay = (id: string) => {
    setTextOverlays((overlays) => overlays.filter((overlay) => overlay.id !== id))
  }

  const handleAIVideoEnhancement = async () => {
    if (!videoRef.current) return
    
    setIsEnhancingVideo(true)
    try {
      const videoFile = new File([await fetch(videoUrl).then(r => r.blob())], 'video.mp4', { type: 'video/mp4' })
      const enhancedVideo = await enhanceVideo(videoFile, {
        colorCorrection: true,
        sharpening: true,
        noiseReduction: true
      })
      
      // Apply AI enhancement by updating the filter to AI-enhanced
      setSelectedFilter('ai-enhance')
      setVideoEnhancementApplied(true)
      
      // Automatically adjust brightness, contrast, and saturation for optimal AI enhancement
      setBrightness([105])
      setContrast([110])
      setSaturation([110])
      
    } catch (error) {
      console.error('AI video enhancement failed:', error)
      alert('AI video enhancement failed. Please try again.')
    } finally {
      setIsEnhancingVideo(false)
    }
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const exportVideo = () => {
    // In a real implementation, this would process the video with all effects
    console.log("Exporting video with:", {
      filter: selectedFilter,
      brightness: brightness[0],
      contrast: contrast[0],
      saturation: saturation[0],
      textOverlays,
      music: selectedMusic,
      musicVolume: musicVolume[0],
      videoVolume: videoVolume[0],
      speed: playbackSpeed[0],
    })
    onSave(videoUrl) // For demo purposes
  }

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <Card className="bg-black/20 backdrop-blur-md border border-white/10">
        <CardContent className="p-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              style={{ filter: applyFilters() }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Text Overlays */}
            {textOverlays.map(
              (overlay) =>
                currentTime >= overlay.startTime &&
                currentTime <= overlay.startTime + overlay.duration && (
                  <div
                    key={overlay.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      animation: overlay.animation !== "none" ? `${overlay.animation} 0.5s ease-in-out` : undefined,
                    }}
                  >
                    {overlay.text}
                  </div>
                ),
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 bg-black/50 rounded-lg p-2">
                <Button variant="ghost" size="sm" onClick={togglePlayback} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <span className="text-white text-sm">{formatTime(currentTime)}</span>

                <div className="flex-1 mx-2">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={([value]) => seekTo(value)}
                    className="w-full"
                  />
                </div>

                <span className="text-white text-sm">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editing Tools */}
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/20 border border-white/10">
          <TabsTrigger value="filters" className="data-[state=active]:bg-purple-600">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="effects" className="data-[state=active]:bg-purple-600">
            <Wand2 className="w-4 h-4 mr-2" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-purple-600">
            <Type className="w-4 h-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="music" className="data-[state=active]:bg-purple-600">
            <Music className="w-4 h-4 mr-2" />
            Music
          </TabsTrigger>
          <TabsTrigger value="speed" className="data-[state=active]:bg-purple-600">
            <Clock className="w-4 h-4 mr-2" />
            Speed
          </TabsTrigger>
        </TabsList>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Video Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {videoFilters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.id)}
                    className={selectedFilter === filter.id ? "bg-purple-600" : "border-white/20 text-white"}
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>

              {/* AI Enhancement Button */}
              <div className="pt-2">
                <Button
                  onClick={handleAIVideoEnhancement}
                  disabled={isEnhancingVideo}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                >
                  {isEnhancingVideo ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Enhancing with AI...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      {videoEnhancementApplied ? 'AI Enhanced ✓' : 'Enhance with AI'}
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/90 flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4" />
                    Brightness: {brightness[0]}%
                  </Label>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-white/90 flex items-center gap-2 mb-2">
                    <Contrast className="w-4 h-4" />
                    Contrast: {contrast[0]}%
                  </Label>
                  <Slider value={contrast} onValueChange={setContrast} max={200} min={0} step={1} className="w-full" />
                </div>

                <div>
                  <Label className="text-white/90 flex items-center gap-2 mb-2">
                    <Saturation className="w-4 h-4" />
                    Saturation: {saturation[0]}%
                  </Label>
                  <Slider
                    value={saturation}
                    onValueChange={setSaturation}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Visual Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button variant="outline" className="border-white/20 text-white bg-transparent">
                  <Zap className="w-4 h-4 mr-2" />
                  Glitch
                </Button>
                <Button variant="outline" className="border-white/20 text-white bg-transparent">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Particles
                </Button>
                <Button variant="outline" className="border-white/20 text-white bg-transparent">
                  <Moon className="w-4 h-4 mr-2" />
                  Vignette
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text Tab */}
        <TabsContent value="text" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Text Overlays</CardTitle>
                <Button onClick={addTextOverlay} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {textOverlays.map((overlay) => (
                <div key={overlay.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      value={overlay.text}
                      onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTextOverlay(overlay.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/70 text-sm">Font Size</Label>
                      <Slider
                        value={[overlay.fontSize]}
                        onValueChange={([value]) => updateTextOverlay(overlay.id, { fontSize: value })}
                        max={72}
                        min={12}
                        step={1}
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Animation</Label>
                      <Select
                        value={overlay.animation}
                        onValueChange={(value) => updateTextOverlay(overlay.id, { animation: value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          {textAnimations.map((anim) => (
                            <SelectItem key={anim.id} value={anim.id} className="text-white">
                              {anim.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Background Music</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {musicTracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedMusic === track.id
                        ? "bg-purple-600/20 border-purple-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                    onClick={() => setSelectedMusic(track.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{track.title}</p>
                        <p className="text-white/60 text-sm">
                          {track.artist} • {track.genre}
                        </p>
                      </div>
                      <span className="text-white/60 text-sm">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedMusic && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <Label className="text-white/90 flex items-center gap-2 mb-2">
                      <Music className="w-4 h-4" />
                      Music Volume: {musicVolume[0]}%
                    </Label>
                    <Slider value={musicVolume} onValueChange={setMusicVolume} max={100} min={0} step={1} />
                  </div>

                  <div>
                    <Label className="text-white/90 flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4" />
                      Video Volume: {videoVolume[0]}%
                    </Label>
                    <Slider value={videoVolume} onValueChange={setVideoVolume} max={100} min={0} step={1} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Speed Tab */}
        <TabsContent value="speed" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Playback Speed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/90 mb-4 block">Speed: {playbackSpeed[0]}x</Label>
                <Slider
                  value={playbackSpeed}
                  onValueChange={(value) => {
                    setPlaybackSpeed(value)
                    if (videoRef.current) {
                      videoRef.current.playbackRate = value[0]
                    }
                  }}
                  max={3}
                  min={0.25}
                  step={0.25}
                />
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlaybackSpeed([0.5])}
                  className="border-white/20 text-white"
                >
                  0.5x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlaybackSpeed([1])}
                  className="border-white/20 text-white"
                >
                  1x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlaybackSpeed([1.5])}
                  className="border-white/20 text-white"
                >
                  1.5x
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlaybackSpeed([2])}
                  className="border-white/20 text-white"
                >
                  2x
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button
          onClick={exportVideo}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Video
        </Button>
      </div>
    </div>
  )
}

export default function CreatePage() {
  const [script, setScript] = useState("")
  const [selectedTone, setSelectedTone] = useState("")
  const [aiNarration, setAiNarration] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancementResults, setEnhancementResults] = useState<TextEnhancementResult | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user")
  const [recordingDuration, setRecordingDuration] = useState(30)
  const [currentTime, setCurrentTime] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  
  // Narrator states
  const [availableVoices, setAvailableVoices] = useState<NarratorVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [narratorGender, setNarratorGender] = useState<'male' | 'female' | 'neutral'>('neutral')
  const [narratorTone, setNarratorTone] = useState<'normal' | 'excited' | 'calm' | 'dramatic' | 'whisper'>('normal')
  const [narratorRate, setNarratorRate] = useState([1])
  const [narratorPitch, setNarratorPitch] = useState([1])
  const [narratorVolume, setNarratorVolume] = useState([1])
  const [isNarrating, setIsNarrating] = useState(false)
  const [showPrecut, setShowPrecut] = useState(false)
  const [selectedVideoFilter, setSelectedVideoFilter] = useState("none")
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState("none")
  const [videoNarratorText, setVideoNarratorText] = useState("")
  const [photoNarratorText, setPhotoNarratorText] = useState("")
  const [videoNarratorEnabled, setVideoNarratorEnabled] = useState(false)
  const [photoNarratorEnabled, setPhotoNarratorEnabled] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const { user } = useAuth()
  const selectedToneData = emotionalTones.find((tone) => tone.value === selectedTone)

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

  // Load available voices for narrator
  useEffect(() => {
    const loadVoices = () => {
      const voices = getAvailableVoices()
      setAvailableVoices(voices)
      
      // Auto-select first voice if none selected
      if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0].name)
      }
    }

    // Load voices immediately
    loadVoices()
    
    // Also load when voices change (some browsers load voices asynchronously)
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null
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

    // Start timer
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= recordingDuration) {
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

  const takePhoto = async () => {
    if (!videoRef.current) return

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    if (context) {
      context.drawImage(videoRef.current, 0, 0)
      
      // Store photo as data URL for preview
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
      setCapturedPhoto(dataUrl)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
            setUploadedFiles((prev) => [...prev, file])
          }
        },
        "image/jpeg",
        0.9,
      )
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('posts-media')
        .upload(fileName, file)
      
      if (error) {
        console.error('Error uploading file:', error)
        return null
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('posts-media')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    }
  }

  const handleTranscribeAudio = async (audioFile: File) => {
    setIsTranscribing(true)
    try {
      const transcription = await transcribeAudio(audioFile)
      setTranscriptionResult(transcription)
      
      // Add transcription to script if it's not empty
      if (transcription.trim()) {
        const newScript = script.trim() ? `${script}\n\n${transcription}` : transcription
        setScript(newScript)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleEnhanceContent = async () => {
    if (!aiNarration || !script.trim()) return
    
    setIsEnhancing(true)
    try {
      // Enhance text content
      const textResult = await enhanceText(script)
      setEnhancementResults(textResult)
      
      // Generate enhanced content based on tone
      if (selectedTone) {
        const enhancedContent = await generateContent(textResult.enhancedText, selectedTone)
        setScript(enhancedContent)
      } else {
        setScript(textResult.enhancedText)
      }
      
      // Enhance uploaded audio files
      const enhancedFiles = await Promise.all(
        uploadedFiles.map(async (file) => {
          if (file.type.startsWith('audio/')) {
            const enhancedAudio = await enhanceAudio(file, {
              noiseReduction: true,
              volumeNormalization: true,
              bassBoost: false
            })
            return new File([enhancedAudio], `enhanced-${file.name}`, { type: file.type })
          }
          return file
        })
      )
      
      setUploadedFiles(enhancedFiles)
    } catch (error) {
      console.error('Enhancement error:', error)
      alert('Failed to enhance content. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  // Narrator functions
  const handleNarrate = async () => {
    if (!script.trim()) {
      alert('Please enter some text to narrate')
      return
    }

    if (isNarrating) {
      stopSpeaking()
      setIsNarrating(false)
      return
    }

    setIsNarrating(true)
    try {
      const narratorOptions: NarratorOptions = {
        voice: selectedVoice,
        gender: narratorGender,
        tone: narratorTone,
        rate: narratorRate[0],
        pitch: narratorPitch[0],
        volume: narratorVolume[0]
      }

      await speakText(script, narratorOptions)
    } catch (error) {
      console.error('Narration error:', error)
      alert('Failed to narrate text. Please try again.')
    } finally {
      setIsNarrating(false)
    }
  }

  const handlePrecut = () => {
    setShowPrecut(!showPrecut)
  }

  const getFilteredVoices = () => {
    if (narratorGender === 'neutral') {
      return availableVoices
    }
    return filterVoicesByGender(availableVoices, narratorGender)
  }

  const handleGeneratePost = async () => {
    if (recordedVideo) {
      setShowEditor(true)
      return
    }

    if (!user) {
      console.error("User must be logged in to publish content")
      return
    }

    // Enhance content if AI enhancement is enabled
    if (aiNarration && script.trim()) {
      await handleEnhanceContent()
    }

    setIsPublishing(true)

    try {
      let mediaUrl = null
      let mediaType = null
      let narratorAudioUrl = null
      
      // Generate narrator audio if enabled for video or photo
      if ((videoNarratorEnabled && videoNarratorText.trim()) || (photoNarratorEnabled && photoNarratorText.trim())) {
        try {
          const narratorText = videoNarratorEnabled ? videoNarratorText : photoNarratorText
          const audioOptions: NarratorAudioOptions = {
            text: narratorText,
            voice: selectedVoice,
            rate: narratorRate,
            pitch: narratorPitch,
            volume: narratorVolume
          }
          
          const audioResult = await generateNarratorAudio(audioOptions)
          
          // Upload narrator audio to storage
          const audioFileName = `narrator-${Date.now()}.wav`
          const { data: audioData, error: audioError } = await supabase.storage
            .from("posts-media")
            .upload(audioFileName, audioResult.audioBlob)
          
          if (audioError) {
            console.warn('Failed to upload narrator audio:', audioError)
          } else {
            const { data: { publicUrl: audioPublicUrl } } = supabase.storage
              .from("posts-media")
              .getPublicUrl(audioFileName)
            narratorAudioUrl = audioPublicUrl
            console.log('Narrator audio uploaded successfully:', audioData)
          }
        } catch (error) {
          console.warn('Narrator audio generation failed:', error)
        }
      }
      
      // Upload the first file if any files are uploaded
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0]
        let fileToUpload = file
        
        // Enhance video files if AI enhancement is enabled
        if (aiNarration && file.type.startsWith('video/')) {
          try {
            const enhancedVideo = await enhanceVideo(file, {
              stabilization: false,
              colorCorrection: true,
              sharpening: true,
              noiseReduction: true
            })
            fileToUpload = new File([enhancedVideo], `enhanced-${file.name}`, { type: file.type })
          } catch (error) {
            console.warn('Video enhancement failed, using original file:', error)
          }
        }
        
        const fileName = `${Date.now()}-${fileToUpload.name}`
        const { data, error } = await supabase.storage.from("posts-media").upload(fileName, fileToUpload)

        if (error) {
          console.error('Storage upload error:', error)
          throw new Error(`Failed to upload file: ${error.message}`)
        }

        console.log('File uploaded successfully:', data)

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts-media").getPublicUrl(fileName)
        mediaUrl = publicUrl
        mediaType = fileToUpload.type.startsWith('image/') ? 'image' : 
                   fileToUpload.type.startsWith('video/') ? 'video' : 'other'
      }

      const postData = {
        user_id: user.id,
        content: script.trim(),
        tone: selectedTone,
        ai_narration: aiNarration,
        media_url: mediaUrl,
        media_type: mediaType,
        narrator_audio_url: narratorAudioUrl,
        video_narrator_enabled: videoNarratorEnabled,
        photo_narrator_enabled: photoNarratorEnabled,
      }

      const { data, error } = await supabase.from("posts").insert([postData]).select().single()

      if (error) {
        console.error('Database insertion error:', error)
        throw new Error(`Failed to create post: ${error.message}`)
      }

      console.log("Post published successfully:", data)
      setPublishSuccess(true)

      // Reset form after successful publish
      setTimeout(() => {
        setScript("")
        setSelectedTone("")
        setAiNarration(false)
        setUploadedFiles([])
        setEnhancementResults(null)
        setPublishSuccess(false)
        setVideoNarratorText("")
        setPhotoNarratorText("")
        setVideoNarratorEnabled(false)
        setPhotoNarratorEnabled(false)
      }, 2000)
    } catch (error) {
      console.error("Error publishing post:", error)
      // Show specific error message to user
      const errorMessage = error instanceof Error ? error.message : "Failed to publish post. Please try again."
      alert(errorMessage)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveEditedVideo = (editedVideo: string) => {
    setShowEditor(false)
    console.log("Saving edited video:", editedVideo)
    // TODO: Implement save logic
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (showEditor && recordedVideo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
        <Navigation />
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 font-futuristic">Video Editor</h1>
              <p className="text-xl text-white/70">Perfect your creation</p>
            </div>

            <VideoEditor videoUrl={recordedVideo} onSave={handleSaveEditedVideo} />

            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditor(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Create
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
      <Navigation />
      <div className="pt-14 md:pt-16 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto py-6 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-futuristic">Create</h1>
            <p className="text-lg md:text-xl text-white/70">Record, capture, and share your story</p>
          </div>

          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-white/10 h-12 md:h-auto">
              <TabsTrigger value="video" className="data-[state=active]:bg-purple-600 text-sm md:text-base">
                <Video className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger value="photo" className="data-[state=active]:bg-purple-600 text-sm md:text-base">
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden sm:inline">Photo</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="data-[state=active]:bg-purple-600 text-sm md:text-base">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
            </TabsList>

            {/* Video Recording Tab */}
            <TabsContent value="video" className="space-y-4 md:space-y-6">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-xl md:text-2xl text-white font-futuristic flex items-center gap-2">
                    <Video className="w-5 h-5 md:w-6 md:h-6" />
                    Record Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {/* Camera Preview */}
                  <div className="relative aspect-[9/16] max-w-xs md:max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                    {!isPreviewMode ? (
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    ) : recordedVideo ? (
                      <video src={recordedVideo} controls className="w-full h-full object-cover" />
                    ) : null}

                    {/* Recording Timer */}
                    {isRecording && (
                      <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {formatTime(currentTime)} / {formatTime(recordingDuration)}
                      </div>
                    )}

                    {/* Duration Progress */}
                    {isRecording && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                        <div
                          className="h-full bg-red-500 transition-all duration-1000"
                          style={{ width: `${(currentTime / recordingDuration) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Recording Duration Selector */}
                  <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
                    {recordingDurations.map((duration) => (
                      <Button
                        key={duration.value}
                        variant={recordingDuration === duration.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRecordingDuration(duration.value)}
                        disabled={isRecording}
                        className={`text-xs md:text-sm ${recordingDuration === duration.value ? "bg-purple-600" : ""}`}
                      >
                        {duration.label}
                      </Button>
                    ))}
                  </div>

                  {/* Camera Controls */}
                  <div className="flex justify-center items-center gap-4 md:gap-6">
                    {!hasPermission ? (
                      <Button onClick={initializeCamera} className="bg-purple-600 hover:bg-purple-700 h-12 md:h-auto">
                        <Camera className="w-4 h-4 mr-2" />
                        Enable Camera
                      </Button>
                    ) : !isPreviewMode ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={switchCamera}
                          disabled={isRecording}
                          className="border-white/20 hover:bg-white/10 bg-transparent w-12 h-12 md:w-10 md:h-10"
                        >
                          <RotateCcw className="w-5 h-5 md:w-4 md:h-4" />
                        </Button>

                        <Button
                          size="lg"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-16 h-16 md:w-16 md:h-16 rounded-full ${
                            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"
                          }`}
                        >
                          {isRecording ? <Square className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={takePhoto}
                          disabled={isRecording}
                          className="border-white/20 hover:bg-white/10 bg-transparent w-12 h-12 md:w-10 md:h-10"
                        >
                          <Camera className="w-5 h-5 md:w-4 md:h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex gap-3 md:gap-4">
                        <Button
                          variant="outline"
                          onClick={retakeVideo}
                          className="border-white/20 hover:bg-white/10 bg-transparent h-12 md:h-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                        <Button
                          onClick={() => {
                            if (recordedVideo) {
                              const a = document.createElement("a")
                              a.href = recordedVideo
                              a.download = `video-${Date.now()}.webm`
                              a.click()
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 h-12 md:h-auto"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Save Video
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Video Narrator Input */}
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-lg text-white/90 flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-blue-400" />
                        AI Video Narrator
                      </Label>
                      <p className="text-sm text-white/60">Add AI-generated narration to your video</p>
                    </div>
                    <Switch
                      checked={videoNarratorEnabled}
                      onCheckedChange={setVideoNarratorEnabled}
                    />
                  </div>
                  
                  {videoNarratorEnabled && (
                    <div className="space-y-3">
                      <Label htmlFor="video-narrator-text" className="text-sm text-white/90">
                        Narrator Text
                      </Label>
                      <Textarea
                        id="video-narrator-text"
                        value={videoNarratorText}
                        onChange={(e) => setVideoNarratorText(e.target.value)}
                        placeholder="Enter text for AI narrator to speak over your video..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[100px] resize-none"
                        rows={4}
                      />
                      <div className="text-xs text-white/50">
                        {videoNarratorText.length}/500 characters
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Video Precut Controls */}
              {recordedVideo && (
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-lg text-white/90 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          Video Precut
                        </Label>
                        <p className="text-sm text-white/60">AI-enhanced video preview with filters and effects</p>
                      </div>
                      <Button
                        onClick={handlePrecut}
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {showPrecut ? 'Hide Precut' : 'Show Precut'}
                      </Button>
                    </div>

                    {showPrecut && (
                      <div className="space-y-4">
                        {/* Video Filters */}
                        <div className="space-y-2">
                          <Label className="text-sm text-white/70">Video Filter</Label>
                          <Select value={selectedVideoFilter} onValueChange={setSelectedVideoFilter}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Select filter..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/20">
                              {videoFilters.map((filter) => (
                                <SelectItem key={filter.id} value={filter.id} className="text-white hover:bg-white/10">
                                  {filter.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Video Enhancement Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-white/70">Brightness: {brightness[0]}</Label>
                            <Slider
                              value={brightness}
                              onValueChange={setBrightness}
                              min={0}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/70">Contrast: {contrast[0]}</Label>
                            <Slider
                              value={contrast}
                              onValueChange={setContrast}
                              min={0}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/70">Saturation: {saturation[0]}</Label>
                            <Slider
                              value={saturation}
                              onValueChange={setSaturation}
                              min={0}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* AI Enhancement Toggle */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="space-y-1">
                            <Label className="text-sm text-white/90">AI Video Enhancement</Label>
                            <p className="text-xs text-white/60">Apply AI-powered stabilization and quality improvements</p>
                          </div>
                          <Switch
                            checked={useAiVideoEnhancement}
                            onCheckedChange={setUseAiVideoEnhancement}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Photo Capture Tab */}
            <TabsContent value="photo" className="space-y-4 md:space-y-6">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-xl md:text-2xl text-white font-futuristic flex items-center gap-2">
                    <Camera className="w-5 h-5 md:w-6 md:h-6" />
                    Take Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {/* Camera Preview */}
                  <div className="relative aspect-square max-w-xs md:max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>

                  {/* Photo Controls */}
                  <div className="flex justify-center items-center gap-4 md:gap-6">
                    {!hasPermission ? (
                      <Button onClick={initializeCamera} className="bg-purple-600 hover:bg-purple-700 h-12 md:h-auto">
                        <Camera className="w-4 h-4 mr-2" />
                        Enable Camera
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={switchCamera}
                          className="border-white/20 hover:bg-white/10 bg-transparent w-12 h-12 md:w-10 md:h-10"
                        >
                          <RotateCcw className="w-5 h-5 md:w-4 md:h-4" />
                        </Button>

                        <Button
                          size="lg"
                          onClick={takePhoto}
                          className="w-16 h-16 md:w-16 md:h-16 rounded-full bg-purple-600 hover:bg-purple-700"
                        >
                          <Camera className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Photo Narrator Input */}
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-lg text-white/90 flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-blue-400" />
                        AI Photo Narrator
                      </Label>
                      <p className="text-sm text-white/60">Add AI-generated narration to your photo</p>
                    </div>
                    <Switch
                      checked={photoNarratorEnabled}
                      onCheckedChange={setPhotoNarratorEnabled}
                    />
                  </div>
                  
                  {photoNarratorEnabled && (
                    <div className="space-y-3">
                      <Label htmlFor="photo-narrator-text" className="text-sm text-white/90">
                        Narrator Text
                      </Label>
                      <Textarea
                        id="photo-narrator-text"
                        value={photoNarratorText}
                        onChange={(e) => setPhotoNarratorText(e.target.value)}
                        placeholder="Enter text for AI narrator to describe your photo..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[100px] resize-none"
                        rows={4}
                      />
                      <div className="text-xs text-white/50">
                        {photoNarratorText.length}/500 characters
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Photo Precut Controls */}
              {capturedPhoto && (
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-lg text-white/90 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          Photo Precut
                        </Label>
                        <p className="text-sm text-white/60">AI-enhanced photo preview with filters and effects</p>
                      </div>
                      <Button
                        onClick={handlePrecut}
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {showPrecut ? 'Hide Precut' : 'Show Precut'}
                      </Button>
                    </div>

                    {showPrecut && (
                      <div className="space-y-4">
                        {/* Photo Preview with Filters */}
                        <div className="relative aspect-square max-w-xs mx-auto bg-black rounded-lg overflow-hidden">
                          <img 
                            src={capturedPhoto} 
                            alt="Captured photo" 
                            className="w-full h-full object-cover"
                            style={{
                              filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
                            }}
                          />
                        </div>

                        {/* Photo Enhancement Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-white/70">Brightness: {brightness[0]}</Label>
                            <Slider
                              value={brightness}
                              onValueChange={setBrightness}
                              min={0}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/70">Contrast: {contrast[0]}</Label>
                            <Slider
                              value={contrast}
                              onValueChange={setContrast}
                              min={0}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/70">Saturation: {saturation[0]}</Label>
                            <Slider
                              value={saturation}
                              onValueChange={setSaturation}
                              min={0}
                              max={200}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Photo Filter Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm text-white/70">Photo Filter</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {photoFilters.map((filter) => (
                              <Button
                                key={filter.id}
                                variant={selectedPhotoFilter === filter.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedPhotoFilter(filter.id)}
                                className="text-xs"
                              >
                                {filter.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* AI Enhancement Toggle */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="space-y-1">
                            <Label className="text-sm text-white/90">AI Photo Enhancement</Label>
                            <p className="text-xs text-white/60">Apply AI-powered noise reduction and sharpening</p>
                          </div>
                          <Switch
                            checked={useAiVideoEnhancement}
                            onCheckedChange={setUseAiVideoEnhancement}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Text/Upload Tab */}
            <TabsContent value="text" className="space-y-4 md:space-y-6">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white font-futuristic">Create Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Script Input */}
                  <div className="space-y-3">
                    <Label htmlFor="script" className="text-lg text-white/90">
                      Script or Idea
                    </Label>
                    <Textarea
                      id="script"
                      placeholder="Share your thoughts, story, or idea..."
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="min-h-32 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 resize-none"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <Label className="text-lg text-white/90">Upload Media</Label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/70 mb-2">Upload images, videos, or audio files</p>
                        <p className="text-sm text-white/50">Drag and drop or click to browse</p>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Common Settings */}
          <Card className="bg-black/20 backdrop-blur-md border border-white/10 mt-6">
            <CardContent className="space-y-6 pt-6">
              {/* Emotional Tone Selector */}
              <div className="space-y-3">
                <Label className="text-lg text-white/90">Emotional Tone</Label>
                <Select value={selectedTone} onValueChange={setSelectedTone}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Choose your tone..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {emotionalTones.map((tone) => (
                      <SelectItem
                        key={tone.value}
                        value={tone.value}
                        className={`${tone.color} hover:bg-white/10 focus:bg-white/10`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${tone.bgColor} ${tone.borderColor} border`} />
                          {tone.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedToneData && (
                  <div className={`p-3 rounded-lg ${selectedToneData.bgColor} ${selectedToneData.borderColor} border`}>
                    <p className={`text-sm ${selectedToneData.color}`}>
                      Selected tone: <span className="font-semibold">{selectedToneData.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* AI Enhancement Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="space-y-1">
                    <Label htmlFor="ai-narration" className="text-lg text-white/90 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI Enhancement
                    </Label>
                    <p className="text-sm text-white/60">Let AI enhance your content with grammar correction, audio improvement, and video effects</p>
                  </div>
                  <Switch
                    id="ai-narration"
                    checked={aiNarration}
                    onCheckedChange={setAiNarration}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                
                {/* AI Enhancement Preview Button */}
                {aiNarration && script.trim() && (
                  <Button
                    onClick={handleEnhanceContent}
                    disabled={isEnhancing}
                    variant="outline"
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    {isEnhancing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Enhancing Content...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Preview AI Enhancements
                      </>
                    )}
                  </Button>
                )}
                
                {/* Enhancement Results */}
                {enhancementResults && enhancementResults.corrections.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-300 font-medium mb-2">
                      ✨ AI Enhanced your content with {enhancementResults.corrections.length} improvements:
                    </p>
                    <ul className="text-xs text-green-200 space-y-1">
                      {enhancementResults.corrections.slice(0, 3).map((correction, index) => (
                        <li key={index}>• {correction.shortMessage || correction.message}</li>
                      ))}
                      {enhancementResults.corrections.length > 3 && (
                        <li>• And {enhancementResults.corrections.length - 3} more improvements...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI Narrator Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="space-y-1">
                    <Label className="text-lg text-white/90 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-blue-400" />
                      AI Narrator
                    </Label>
                    <p className="text-sm text-white/60">Let AI narrate your content with customizable voice options</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePrecut}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Precut
                    </Button>
                    <Button
                      onClick={handleNarrate}
                      disabled={!script.trim() || isNarrating}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                    >
                      {isNarrating ? (
                        <>
                          <Square className="w-4 h-4 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Narrate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Narrator Settings */}
                {showPrecut && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
                    <h4 className="text-white/90 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Precut Settings
                    </h4>
                    
                    {/* Voice Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">Voice</Label>
                        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select voice..." />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            {getFilteredVoices().map((voice) => (
                              <SelectItem key={voice.voiceURI} value={voice.name} className="text-white hover:bg-white/10">
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">Gender</Label>
                        <Select value={narratorGender} onValueChange={(value: 'male' | 'female' | 'neutral') => setNarratorGender(value)}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            <SelectItem value="neutral" className="text-white hover:bg-white/10">Neutral</SelectItem>
                            <SelectItem value="male" className="text-white hover:bg-white/10">Male</SelectItem>
                            <SelectItem value="female" className="text-white hover:bg-white/10">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-white/70">Tone</Label>
                      <Select value={narratorTone} onValueChange={(value: 'normal' | 'excited' | 'calm' | 'dramatic' | 'whisper') => setNarratorTone(value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20">
                          <SelectItem value="normal" className="text-white hover:bg-white/10">Normal</SelectItem>
                          <SelectItem value="excited" className="text-white hover:bg-white/10">Excited</SelectItem>
                          <SelectItem value="calm" className="text-white hover:bg-white/10">Calm</SelectItem>
                          <SelectItem value="dramatic" className="text-white hover:bg-white/10">Dramatic</SelectItem>
                          <SelectItem value="whisper" className="text-white hover:bg-white/10">Whisper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Voice Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">Speed: {narratorRate[0].toFixed(1)}x</Label>
                        <Slider
                          value={narratorRate}
                          onValueChange={setNarratorRate}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">Pitch: {narratorPitch[0].toFixed(1)}</Label>
                        <Slider
                          value={narratorPitch}
                          onValueChange={setNarratorPitch}
                          min={0.5}
                          max={2}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-white/70">Volume: {Math.round(narratorVolume[0] * 100)}%</Label>
                        <Slider
                          value={narratorVolume}
                          onValueChange={setNarratorVolume}
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-white/70">Media Files:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                          ) : file.type.startsWith("video/") ? (
                            <Video className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Mic className="w-5 h-5 text-green-400" />
                          )}
                          <div className="flex-1">
                            <span className="text-white/80 text-sm block">{file.name}</span>
                            <span className="text-white/50 text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                            {file.type.startsWith("audio/") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTranscribeAudio(file)}
                                disabled={isTranscribing}
                                className="mt-2 h-6 px-2 text-xs bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                              >
                                {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
                              </Button>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcription Results */}
              {transcriptionResult && (
                <div className="space-y-3">
                  <Label className="text-sm text-white/70">Audio Transcription:</Label>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-200 text-sm leading-relaxed">{transcriptionResult}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTranscriptionResult('')}
                      className="mt-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      Clear Transcription
                    </Button>
                  </div>
                </div>
              )}

              {/* Publish Button */}
              <div className="pt-6">
                {publishSuccess && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-center">
                    Content published successfully! 🎉
                  </div>
                )}
                <Button
                  onClick={handleGeneratePost}
                  disabled={
                    !selectedTone ||
                    (!script.trim() && uploadedFiles.length === 0 && !recordedVideo) ||
                    isPublishing ||
                    isEnhancing ||
                    !user
                  }
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-base md:text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12 md:h-auto"
                >
                  {isPublishing || isEnhancing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEnhancing ? "Enhancing with AI..." : "Publishing..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {recordedVideo ? "Edit Video" : aiNarration ? "Publish with AI Enhancement" : "Publish Content"}
                    </>
                  )}
                </Button>
                {!user && <p className="text-sm text-white/60 text-center mt-2">Please sign in to publish content</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
