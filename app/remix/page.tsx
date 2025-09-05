"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Shuffle, TrendingUp, Zap, Volume2, ImageIcon } from "lucide-react"
import { useState } from "react"

const emotionalTones = [
  { value: "rage", label: "Rage", color: "text-red-400", bgColor: "bg-red-500/20" },
  { value: "mystery", label: "Mystery", color: "text-teal-400", bgColor: "bg-teal-500/20" },
  { value: "satire", label: "Satire", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  { value: "truth", label: "Truth", color: "text-blue-400", bgColor: "bg-blue-500/20" },
]

const voiceStyles = [
  { value: "narrator", label: "Professional Narrator" },
  { value: "casual", label: "Casual Friend" },
  { value: "dramatic", label: "Dramatic Voice" },
  { value: "whisper", label: "Mysterious Whisper" },
]

// Mock trending posts data
const trendingPosts = [
  {
    id: 1,
    author: "Alex Chen",
    avatar: "/diverse-group.png",
    content: "The future isn't something that happens to us—it's something we create with every choice we make today.",
    tone: "truth",
    likes: 2847,
    reactions: 1203,
    echoScore: 94,
    remixDepth: 3,
    timestamp: "2h ago",
    hasAudio: true,
    hasImage: false,
  },
  {
    id: 2,
    author: "Maya Rodriguez",
    avatar: "/diverse-woman-portrait.png",
    content:
      "They say money can't buy happiness, but have you tried buying happiness with cryptocurrency? Still broke, but now I'm confused too.",
    tone: "satire",
    likes: 1924,
    reactions: 856,
    echoScore: 78,
    remixDepth: 2,
    timestamp: "4h ago",
    hasAudio: false,
    hasImage: true,
  },
  {
    id: 3,
    author: "Jordan Kim",
    avatar: "/diverse-group-conversation.png",
    content:
      "In the shadows of the digital age, we've forgotten that the most powerful connections aren't made through screens, but through souls.",
    tone: "mystery",
    likes: 3156,
    reactions: 1847,
    echoScore: 89,
    remixDepth: 4,
    timestamp: "6h ago",
    hasAudio: true,
    hasImage: true,
  },
  {
    id: 4,
    author: "Sam Taylor",
    avatar: "/diverse-group-meeting.png",
    content:
      "ENOUGH! We sit in silence while the world burns around us. When did we become so comfortable with our own powerlessness?",
    tone: "rage",
    likes: 4203,
    reactions: 2156,
    echoScore: 96,
    remixDepth: 5,
    timestamp: "8h ago",
    hasAudio: true,
    hasImage: false,
  },
]

function RemixEditor({ post, onClose }: { post: any; onClose: () => void }) {
  const [remixContent, setRemixContent] = useState(post.content)
  const [selectedTone, setSelectedTone] = useState(post.tone)
  const [voiceStyle, setVoiceStyle] = useState("")

  const selectedToneData = emotionalTones.find((tone) => tone.value === selectedTone)

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="text-sm font-semibold text-white/70 mb-2">Original Post</h4>
        <p className="text-white/80">{post.content}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            className={`${emotionalTones.find((t) => t.value === post.tone)?.bgColor} ${emotionalTones.find((t) => t.value === post.tone)?.color} border-0`}
          >
            {emotionalTones.find((t) => t.value === post.tone)?.label}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white/90">Your Remix</Label>
          <Textarea
            value={remixContent}
            onChange={(e) => setRemixContent(e.target.value)}
            className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-24"
            placeholder="Add your unique perspective..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/90">Voice Style</Label>
            <Select value={voiceStyle} onValueChange={setVoiceStyle}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Choose voice style..." />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                {voiceStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value} className="text-white hover:bg-white/10">
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white/90">Emotional Tone</Label>
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                {emotionalTones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value} className={`${tone.color} hover:bg-white/10`}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedToneData && (
          <div className={`p-3 rounded-lg ${selectedToneData.bgColor} border border-white/20`}>
            <p className={`text-sm ${selectedToneData.color}`}>
              Tone: <span className="font-semibold">{selectedToneData.label}</span>
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Create Remix
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  const toneData = emotionalTones.find((tone) => tone.value === post.tone)

  return (
    <Card className="bg-black/20 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-white/10 text-white">
                {post.author
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{post.author}</p>
              <p className="text-sm text-white/60">{post.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-white/90 leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-2">
          {toneData && <Badge className={`${toneData.bgColor} ${toneData.color} border-0`}>{toneData.label}</Badge>}
          {post.hasAudio && (
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              <Volume2 className="w-3 h-3 mr-1" />
              Audio
            </Badge>
          )}
          {post.hasImage && (
            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
              <ImageIcon className="w-3 h-3 mr-1" />
              Visual
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/70">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{post.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.reactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Echo {post.echoScore}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Remix This
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white font-futuristic">Create Remix</DialogTitle>
              </DialogHeader>
              <RemixEditor post={post} onClose={() => {}} />
            </DialogContent>
          </Dialog>
        </div>

        {post.remixDepth > 1 && <div className="text-xs text-white/50 pt-2">Remix depth: {post.remixDepth} levels</div>}
      </CardContent>
    </Card>
  )
}

export default function RemixPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-futuristic">Remix</h1>
            <p className="text-xl text-white/70">Discover trending content and add your unique perspective</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trendingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Load More Posts
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
