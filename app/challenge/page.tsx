"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Clock, Users, Heart, MessageCircle, Zap, Flame, Target } from "lucide-react"
import { useState, useEffect } from "react"

const emotionalTones = [
  { value: "rage", label: "Rage", color: "text-red-400", bgColor: "bg-red-500/20" },
  { value: "mystery", label: "Mystery", color: "text-teal-400", bgColor: "bg-teal-500/20" },
  { value: "satire", label: "Satire", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  { value: "truth", label: "Truth", color: "text-blue-400", bgColor: "bg-blue-500/20" },
]

// Mock current challenge data
const currentChallenge = {
  id: 1,
  title: "Digital Detox Dilemma",
  prompt:
    "In a world where we're more connected than ever, why do we feel so alone? Share your perspective on finding authentic human connection in the digital age.",
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  participants: 2847,
  submissions: 1203,
  prize: "Featured placement + Echo Score boost",
  difficulty: "Viral",
}

// Mock submissions data
const challengeSubmissions = [
  {
    id: 1,
    author: "Maya Rodriguez",
    avatar: "/diverse-woman-portrait.png",
    content:
      "We swipe through hundreds of faces but never truly see anyone. Real connection happens when we put down our phones and pick up our courage to be vulnerable.",
    tone: "truth",
    likes: 1847,
    reactions: 923,
    echoScore: 89,
    timestamp: "3h ago",
    featured: true,
  },
  {
    id: 2,
    author: "Jordan Kim",
    avatar: "/diverse-group-conversation.png",
    content:
      "The irony: we have 1000 'friends' online but no one to call at 3am. Maybe the real connection was the loneliness we made along the way.",
    tone: "satire",
    likes: 2156,
    reactions: 1247,
    echoScore: 92,
    timestamp: "5h ago",
    featured: false,
  },
  {
    id: 3,
    author: "Sam Taylor",
    avatar: "/diverse-group-meeting.png",
    content:
      "Every notification is a cry for attention, every like a desperate plea for validation. We've built a tower of digital babel, and we're all speaking different languages of loneliness.",
    tone: "mystery",
    likes: 1634,
    reactions: 789,
    echoScore: 85,
    timestamp: "8h ago",
    featured: false,
  },
  {
    id: 4,
    author: "Alex Chen",
    avatar: "/diverse-group.png",
    content:
      "WAKE UP! We're drowning in a sea of shallow interactions while our souls starve for depth. When did we trade meaningful conversations for meaningless scrolling?",
    tone: "rage",
    likes: 2934,
    reactions: 1567,
    echoScore: 96,
    timestamp: "12h ago",
    featured: true,
  },
]

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center justify-center gap-4 text-center">
      <div className="bg-white/10 rounded-lg p-3 min-w-16">
        <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
        <div className="text-xs text-white/60">DAYS</div>
      </div>
      <div className="text-white/40">:</div>
      <div className="bg-white/10 rounded-lg p-3 min-w-16">
        <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
        <div className="text-xs text-white/60">HOURS</div>
      </div>
      <div className="text-white/40">:</div>
      <div className="bg-white/10 rounded-lg p-3 min-w-16">
        <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-xs text-white/60">MIN</div>
      </div>
      <div className="text-white/40">:</div>
      <div className="bg-white/10 rounded-lg p-3 min-w-16">
        <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
        <div className="text-xs text-white/60">SEC</div>
      </div>
    </div>
  )
}

function JoinChallengeDialog() {
  const [submission, setSubmission] = useState("")
  const [selectedTone, setSelectedTone] = useState("")

  const selectedToneData = emotionalTones.find((tone) => tone.value === selectedTone)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-8 py-4 text-lg"
        >
          <Target className="w-5 h-5 mr-2" />
          Join Challenge
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-futuristic">Submit Your Response</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-semibold mb-2">{currentChallenge.title}</h4>
            <p className="text-white/80 text-sm">{currentChallenge.prompt}</p>
          </div>

          <div>
            <Label className="text-white/90">Your Response</Label>
            <Textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Share your unique perspective on this challenge..."
              className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-32"
            />
          </div>

          <div>
            <Label className="text-white/90">Emotional Tone</Label>
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Choose your tone..." />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                {emotionalTones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value} className={`${tone.color} hover:bg-white/10`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tone.bgColor} border border-current`} />
                      {tone.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedToneData && (
              <div className={`mt-2 p-3 rounded-lg ${selectedToneData.bgColor} border border-white/20`}>
                <p className={`text-sm ${selectedToneData.color}`}>
                  Selected tone: <span className="font-semibold">{selectedToneData.label}</span>
                </p>
              </div>
            )}
          </div>

          <Button
            disabled={!submission.trim() || !selectedTone}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50"
          >
            Submit Challenge Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SubmissionCard({ submission }: { submission: any }) {
  const toneData = emotionalTones.find((tone) => tone.value === submission.tone)

  return (
    <Card
      className={`bg-black/20 backdrop-blur-md border transition-all duration-300 hover:border-white/30 ${
        submission.featured ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/10"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={submission.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-white/10 text-white">
                {submission.author
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white">{submission.author}</p>
              <p className="text-sm text-white/60">{submission.timestamp}</p>
            </div>
          </div>
          {submission.featured && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Trophy className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-white/90 leading-relaxed">{submission.content}</p>

        <div className="flex items-center gap-2">
          {toneData && <Badge className={`${toneData.bgColor} ${toneData.color} border-0`}>{toneData.label}</Badge>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/70">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{submission.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{submission.reactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Echo {submission.echoScore}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ChallengePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 font-futuristic">Challenge</h1>
            <p className="text-xl text-white/70">Weekly viral prompts that spark global conversations</p>
          </div>

          {/* Current Challenge */}
          <Card className="bg-black/20 backdrop-blur-md border border-white/10 mb-12">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl text-white font-futuristic flex items-center gap-3">
                  <Flame className="w-8 h-8 text-orange-400" />
                  {currentChallenge.title}
                </CardTitle>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-lg px-3 py-1">
                  {currentChallenge.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <p className="text-xl text-white/90 leading-relaxed">{currentChallenge.prompt}</p>

              {/* Challenge Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{currentChallenge.participants.toLocaleString()}</div>
                  <div className="text-white/60">Participants</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{currentChallenge.submissions.toLocaleString()}</div>
                  <div className="text-white/60">Submissions</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-white">{currentChallenge.prize}</div>
                  <div className="text-white/60">Prize</div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-white/70">
                  <Clock className="w-5 h-5" />
                  <span>Challenge ends in:</span>
                </div>
                <CountdownTimer endDate={currentChallenge.endDate} />
              </div>

              {/* Join Challenge Button */}
              <div className="text-center">
                <JoinChallengeDialog />
              </div>
            </CardContent>
          </Card>

          {/* Submissions Gallery */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white font-futuristic">Top Submissions</h2>
              <Badge variant="outline" className="border-white/20 text-white/70">
                {challengeSubmissions.length} entries
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {challengeSubmissions.map((submission) => (
                <SubmissionCard key={submission.id} submission={submission} />
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Load More Submissions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
