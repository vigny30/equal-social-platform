"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Music,
  Play,
  Pause,
  Heart,
  Search,
  TrendingUp,
  Headphones,
  Share,
  Volume2,
  SkipBack,
  SkipForward,
  Plus,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface MusicTrack {
  id: string
  title: string
  artist: string
  duration: number
  genre: string
  mood: string
  bpm: number
  isPopular: boolean
  isTrending: boolean
  usageCount: number
  previewUrl: string
  coverArt: string
  tags: string[]
  isLiked?: boolean
  isSaved?: boolean
}

interface Playlist {
  id: string
  name: string
  description: string
  trackCount: number
  coverArt: string
  isOfficial: boolean
}

const musicGenres = [
  { id: "trending", name: "Trending", icon: TrendingUp, color: "text-red-400" },
  { id: "electronic", name: "Electronic", icon: Music, color: "text-blue-400" },
  { id: "hip-hop", name: "Hip Hop", icon: Headphones, color: "text-purple-400" },
  { id: "pop", name: "Pop", icon: Music, color: "text-pink-400" },
  { id: "rock", name: "Rock", icon: Music, color: "text-orange-400" },
  { id: "ambient", name: "Ambient", icon: Music, color: "text-teal-400" },
  { id: "classical", name: "Classical", icon: Music, color: "text-yellow-400" },
  { id: "jazz", name: "Jazz", icon: Music, color: "text-green-400" },
]

const mockPlaylists: Playlist[] = [
  {
    id: "viral-hits",
    name: "Viral Hits 2024",
    description: "The most used sounds this month",
    trackCount: 50,
    coverArt: "/playlist-viral.png",
    isOfficial: true,
  },
  {
    id: "chill-vibes",
    name: "Chill Vibes",
    description: "Perfect for relaxed content",
    trackCount: 35,
    coverArt: "/playlist-chill.png",
    isOfficial: true,
  },
  {
    id: "energy-boost",
    name: "Energy Boost",
    description: "High-energy tracks for dynamic videos",
    trackCount: 42,
    coverArt: "/playlist-energy.png",
    isOfficial: true,
  },
]

const mockTracks: MusicTrack[] = [
  {
    id: "track1",
    title: "Digital Dreams",
    artist: "SynthWave",
    duration: 180,
    genre: "electronic",
    mood: "energetic",
    bpm: 128,
    isPopular: true,
    isTrending: true,
    usageCount: 125000,
    previewUrl: "/audio/digital-dreams.mp3",
    coverArt: "/music-cover-1.png",
    tags: ["futuristic", "upbeat", "tech"],
    isLiked: false,
    isSaved: false,
  },
  {
    id: "track2",
    title: "Neon Nights",
    artist: "CyberBeats",
    duration: 165,
    genre: "electronic",
    mood: "mysterious",
    bpm: 120,
    isPopular: true,
    isTrending: true,
    usageCount: 98000,
    previewUrl: "/audio/neon-nights.mp3",
    coverArt: "/music-cover-2.png",
    tags: ["dark", "atmospheric", "synth"],
    isLiked: true,
    isSaved: true,
  },
  {
    id: "track3",
    title: "Urban Flow",
    artist: "BeatMaster",
    duration: 200,
    genre: "hip-hop",
    mood: "confident",
    bpm: 95,
    isPopular: true,
    isTrending: false,
    usageCount: 87000,
    previewUrl: "/audio/urban-flow.mp3",
    coverArt: "/music-cover-3.png",
    tags: ["street", "bass", "rhythm"],
    isLiked: false,
    isSaved: true,
  },
  {
    id: "track4",
    title: "Chill Waves",
    artist: "LoFi Master",
    duration: 220,
    genre: "ambient",
    mood: "relaxed",
    bpm: 85,
    isPopular: false,
    isTrending: false,
    usageCount: 45000,
    previewUrl: "/audio/chill-waves.mp3",
    coverArt: "/music-cover-4.png",
    tags: ["calm", "peaceful", "study"],
    isLiked: true,
    isSaved: false,
  },
  {
    id: "track5",
    title: "Pop Sensation",
    artist: "StarLight",
    duration: 195,
    genre: "pop",
    mood: "happy",
    bpm: 110,
    isPopular: true,
    isTrending: true,
    usageCount: 156000,
    previewUrl: "/audio/pop-sensation.mp3",
    coverArt: "/music-cover-5.png",
    tags: ["catchy", "uplifting", "mainstream"],
    isLiked: false,
    isSaved: false,
  },
]

function MusicPlayer({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime,
  onSeek,
}: {
  currentTrack: MusicTrack | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  currentTime: number
  onSeek: (time: number) => void
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-4 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={currentTrack.coverArt || "/placeholder.svg"}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium text-sm truncate">{currentTrack.title}</h4>
              <p className="text-white/60 text-xs truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onPrevious} className="text-white hover:bg-white/10">
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={onNext} className="text-white hover:bg-white/10">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-white/60 text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={currentTrack.duration}
              step={1}
              onValueChange={([value]) => onSeek(value)}
              className="flex-1"
            />
            <span className="text-white/60 text-xs">{formatTime(currentTrack.duration)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrackCard({
  track,
  isPlaying,
  onPlay,
  onLike,
  onSave,
  onUse,
}: {
  track: MusicTrack
  isPlaying: boolean
  onPlay: () => void
  onLike: () => void
  onSave: () => void
  onUse: () => void
}) {
  const [isLiked, setIsLiked] = useState(track.isLiked || false)
  const [isSaved, setIsSaved] = useState(track.isSaved || false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike()
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Cover Art & Play Button */}
          <div className="relative flex-shrink-0">
            <img
              src={track.coverArt || "/placeholder.svg"}
              alt={track.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlay}
              className="absolute inset-0 w-16 h-16 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black/70"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-medium text-sm truncate">{track.title}</h3>
              {track.isTrending && <Badge className="bg-red-500 text-white text-xs">Trending</Badge>}
              {track.isPopular && <Badge className="bg-yellow-500 text-white text-xs">Popular</Badge>}
            </div>
            <p className="text-white/60 text-sm mb-2">{track.artist}</p>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span>{formatDuration(track.duration)}</span>
              <span>{track.bpm} BPM</span>
              <span>{formatNumber(track.usageCount)} uses</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {track.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="border-white/20 text-white/60 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={`${isLiked ? "text-red-400" : "text-white/60"} hover:text-red-400`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className={`${isSaved ? "text-purple-400" : "text-white/60"} hover:text-purple-400`}
            >
              <Plus className={`w-4 h-4 ${isSaved ? "rotate-45" : ""} transition-transform`} />
            </Button>
            <Button
              onClick={onUse}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
            >
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <img
            src={playlist.coverArt || "/placeholder.svg"}
            alt={playlist.name}
            className="w-full aspect-square rounded-lg object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-0 w-full h-full rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black/70"
          >
            <Play className="w-8 h-8" />
          </Button>
          {playlist.isOfficial && (
            <Badge className="absolute top-2 right-2 bg-blue-500 text-white text-xs">Official</Badge>
          )}
        </div>
        <h3 className="text-white font-medium text-sm mb-1">{playlist.name}</h3>
        <p className="text-white/60 text-xs mb-2 line-clamp-2">{playlist.description}</p>
        <p className="text-white/50 text-xs">{playlist.trackCount} tracks</p>
      </CardContent>
    </Card>
  )
}

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("trending")
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [tracks, setTracks] = useState(mockTracks)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      const updateTime = () => setCurrentTime(audio.currentTime)

      audio.addEventListener("timeupdate", updateTime)
      audio.addEventListener("ended", handleNext)

      return () => {
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("ended", handleNext)
      }
    }
  }, [currentTrack])

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    if (selectedGenre === "trending") {
      return matchesSearch && track.isTrending
    }

    return matchesSearch && track.genre === selectedGenre
  })

  const handlePlayTrack = (track: MusicTrack) => {
    if (currentTrack?.id === track.id) {
      handlePlayPause()
    } else {
      setCurrentTrack(track)
      setCurrentTime(0)
      setIsPlaying(true)
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleNext = () => {
    if (currentTrack) {
      const currentIndex = filteredTracks.findIndex((t) => t.id === currentTrack.id)
      const nextIndex = (currentIndex + 1) % filteredTracks.length
      setCurrentTrack(filteredTracks[nextIndex])
      setCurrentTime(0)
    }
  }

  const handlePrevious = () => {
    if (currentTrack) {
      const currentIndex = filteredTracks.findIndex((t) => t.id === currentTrack.id)
      const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1
      setCurrentTrack(filteredTracks[prevIndex])
      setCurrentTime(0)
    }
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleLikeTrack = (trackId: string) => {
    setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, isLiked: !track.isLiked } : track)))
  }

  const handleSaveTrack = (trackId: string) => {
    setTracks((prev) => prev.map((track) => (track.id === trackId ? { ...track, isSaved: !track.isSaved } : track)))
  }

  const handleUseTrack = (track: MusicTrack) => {
    // In a real app, this would navigate to create page with selected music
    console.log("Using track for creation:", track)
    // router.push(`/create?music=${track.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark pb-24">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-futuristic">Music Library</h1>
            <p className="text-xl text-white/70">Discover the perfect sound for your content</p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, artists, or moods..."
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
              />
            </div>
          </div>

          <Tabs value={selectedGenre} onValueChange={setSelectedGenre} className="w-full">
            {/* Genre Tabs */}
            <div className="flex justify-center mb-8">
              <TabsList className="bg-black/20 border border-white/10 p-1">
                {musicGenres.map((genre) => {
                  const Icon = genre.icon
                  return (
                    <TabsTrigger
                      key={genre.id}
                      value={genre.id}
                      className="data-[state=active]:bg-purple-600 text-white/70 data-[state=active]:text-white"
                    >
                      <Icon className={`w-4 h-4 mr-2 ${genre.color}`} />
                      {genre.name}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Featured Playlists */}
            {selectedGenre === "trending" && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6 font-futuristic">Featured Playlists</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockPlaylists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </div>
            )}

            {/* Tracks */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-futuristic">
                  {selectedGenre === "trending"
                    ? "Trending Now"
                    : `${musicGenres.find((g) => g.id === selectedGenre)?.name} Music`}
                </h2>
                <Badge className="bg-white/10 text-white">{filteredTracks.length} tracks</Badge>
              </div>

              <div className="space-y-3">
                {filteredTracks.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">No tracks found</p>
                    <p className="text-white/40">Try adjusting your search or browse different genres</p>
                  </div>
                ) : (
                  filteredTracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={isPlaying && currentTrack?.id === track.id}
                      onPlay={() => handlePlayTrack(track)}
                      onLike={() => handleLikeTrack(track.id)}
                      onSave={() => handleSaveTrack(track.id)}
                      onUse={() => handleUseTrack(track)}
                    />
                  ))
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.previewUrl}
          autoPlay={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentTime={currentTime}
        onSeek={handleSeek}
      />
    </div>
  )
}
