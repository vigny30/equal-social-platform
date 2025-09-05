"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import {
  Heart,
  MessageCircle,
  Share,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Music,
  Send,
  Reply,
  Flag,
  Pin,
  Users,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

interface Comment {
  id: string
  user: {
    id: string
    username: string
    avatar: string
    isVerified?: boolean
  }
  content: string
  timestamp: Date
  likes: number
  isLiked: boolean
  replies: Comment[]
  isPinned?: boolean
  isCreator?: boolean
}

interface Post {
  id: string
  type: "video" | "photo" | "text"
  content: string
  mediaUrl?: string
  thumbnail?: string
  user: {
    id: string
    username: string
    avatar: string
    isVerified?: boolean
  }
  stats: {
    likes: number
    comments: number
    shares: number
    echoScore: number
  }
  tone: "rage" | "mystery" | "satire" | "truth"
  music?: {
    title: string
    artist: string
  }
  duration?: number
  isLiked?: boolean
  comments: Comment[]
}

const mockComments: Comment[] = [
  {
    id: "c1",
    user: {
      id: "user1",
      username: "techfan",
      avatar: "/tech-person-avatar.png",
    },
    content: "This is absolutely mind-blowing! The future is here 🚀",
    timestamp: new Date(Date.now() - 3600000),
    likes: 234,
    isLiked: false,
    replies: [
      {
        id: "c1r1",
        user: {
          id: "user2",
          username: "aiartist",
          avatar: "/artist-avatar.png",
          isVerified: true,
        },
        content: "Thanks! Took me weeks to perfect this technique",
        timestamp: new Date(Date.now() - 3500000),
        likes: 45,
        isLiked: true,
        replies: [],
        isCreator: true,
      },
    ],
    isPinned: true,
  },
  {
    id: "c2",
    user: {
      id: "user3",
      username: "creativemind",
      avatar: "/millennial-avatar.png",
    },
    content: "Can you share the prompt you used for this? Amazing work!",
    timestamp: new Date(Date.now() - 1800000),
    likes: 89,
    isLiked: true,
    replies: [],
  },
  {
    id: "c3",
    user: {
      id: "user4",
      username: "digitalartist",
      avatar: "/philosopher-avatar.png",
    },
    content: "The level of detail is incredible. How long did this take to generate?",
    timestamp: new Date(Date.now() - 900000),
    likes: 156,
    isLiked: false,
    replies: [
      {
        id: "c3r1",
        user: {
          id: "user5",
          username: "aiexpert",
          avatar: "/detective-avatar.png",
        },
        content: "Usually takes about 5-10 minutes with the right settings",
        timestamp: new Date(Date.now() - 600000),
        likes: 23,
        isLiked: false,
        replies: [],
      },
    ],
  },
]

const mockPosts: Post[] = [
  {
    id: "1",
    type: "video",
    content: "The future of AI is here and it's changing everything we know about creativity 🚀",
    mediaUrl: "/futuristic-ai-video.png",
    thumbnail: "/ai-technology-thumbnail.png",
    user: {
      id: "user1",
      username: "techvisionary",
      avatar: "/tech-person-avatar.png",
      isVerified: true,
    },
    stats: {
      likes: 12500,
      comments: 892,
      shares: 445,
      echoScore: 87,
    },
    tone: "truth",
    music: {
      title: "Digital Dreams",
      artist: "SynthWave",
    },
    duration: 45,
    isLiked: false,
    comments: mockComments,
  },
  {
    id: "2",
    type: "video",
    content: "When you realize social media algorithms know you better than you know yourself 😅",
    mediaUrl: "/confused-person-social-media.png",
    thumbnail: "/social-media-algorithm-thumbnail.png",
    user: {
      id: "user2",
      username: "digitaldetox",
      avatar: "/millennial-avatar.png",
    },
    stats: {
      likes: 8900,
      comments: 567,
      shares: 234,
      echoScore: 72,
    },
    tone: "satire",
    music: {
      title: "Glitch in the Matrix",
      artist: "ElectroBeats",
    },
    duration: 30,
    isLiked: true,
    comments: [],
  },
  {
    id: "3",
    type: "photo",
    content: "The mystery behind closed doors... what secrets do they hide?",
    mediaUrl: "/mysterious-door-dark-hallway.png",
    user: {
      id: "user3",
      username: "mysteryhunter",
      avatar: "/detective-avatar.png",
    },
    stats: {
      likes: 15600,
      comments: 1203,
      shares: 678,
      echoScore: 94,
    },
    tone: "mystery",
    isLiked: false,
    comments: [],
  },
  {
    id: "4",
    type: "video",
    content: "This is what happens when you give AI complete creative control...",
    mediaUrl: "/ai-art-creation-digital-painting.png",
    thumbnail: "/ai-art-thumbnail.png",
    user: {
      id: "user4",
      username: "aiartist",
      avatar: "/artist-avatar.png",
      isVerified: true,
    },
    stats: {
      likes: 23400,
      comments: 1567,
      shares: 890,
      echoScore: 98,
    },
    tone: "truth",
    music: {
      title: "Neural Networks",
      artist: "DataFlow",
    },
    duration: 60,
    isLiked: false,
    comments: [],
  },
  {
    id: "5",
    type: "text",
    content:
      "Hot take: The real revolution isn't in the technology, it's in how we choose to use it. We're not just consumers anymore - we're co-creators of the digital reality. Every post, every interaction, every choice shapes the algorithm that shapes us back. The question isn't whether AI will replace us, but whether we'll remember how to be human in a world of infinite possibilities.",
    user: {
      id: "user5",
      username: "philosophytech",
      avatar: "/philosopher-avatar.png",
    },
    stats: {
      likes: 7800,
      comments: 445,
      shares: 234,
      echoScore: 85,
    },
    tone: "rage",
    isLiked: true,
    comments: [],
  },
]

const toneColors = {
  rage: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
  mystery: { bg: "bg-teal-500/20", border: "border-teal-500/30", text: "text-teal-400" },
  satire: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400" },
  truth: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
}

function CommentItem({
  comment,
  postCreatorId,
  onReply,
  onLike,
  depth = 0,
}: {
  comment: Comment
  postCreatorId: string
  onReply: (commentId: string, content: string) => void
  onLike: (commentId: string) => void
  depth?: number
}) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [likes, setLikes] = useState(comment.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
    onLike(comment.id)
  }

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent)
      setReplyContent("")
      setShowReplyInput(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  return (
    <div className={`${depth > 0 ? "ml-8 border-l border-white/10 pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
          <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium text-sm">{comment.user.username}</span>
            {comment.user.isVerified && (
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-1 py-0">
                ✓
              </Badge>
            )}
            {comment.isCreator && (
              <Badge variant="secondary" className="bg-purple-500 text-white text-xs px-1 py-0">
                Creator
              </Badge>
            )}
            {comment.isPinned && <Pin className="w-3 h-3 text-yellow-400" />}
            <span className="text-white/50 text-xs">{formatTimeAgo(comment.timestamp)}</span>
          </div>

          <p className="text-white/90 text-sm mb-2 leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-6 px-2 text-xs ${isLiked ? "text-red-400" : "text-white/60"} hover:text-red-400`}
            >
              <Heart className={`w-3 h-3 mr-1 ${isLiked ? "fill-current" : ""}`} />
              {likes > 0 && likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="h-6 px-2 text-xs text-white/60 hover:text-white"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>

            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-white/60 hover:text-white">
              <Flag className="w-3 h-3" />
            </Button>
          </div>

          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <Input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 text-sm h-8"
                onKeyPress={(e) => e.key === "Enter" && handleReply()}
              />
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="bg-purple-600 hover:bg-purple-700 h-8 px-3"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postCreatorId={postCreatorId}
                  onReply={onReply}
                  onLike={onLike}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CommentsModal({
  post,
  isOpen,
  onClose,
  user,
  onCommentAdded,
}: {
  post: Post
  isOpen: boolean
  onClose: () => void
  user: any
  onCommentAdded?: () => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")
  const [loading, setLoading] = useState(false)

  // Fetch comments from database
  const fetchComments = async () => {
    if (!post.id) return
    
    try {
      setLoading(true)
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('User not authenticated, using fallback comments')
        setComments(post.comments || [])
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching comments:', error)
        setComments(post.comments || [])
        return
      }
      
      // Fetch user profiles separately
      const userIds = data?.map(comment => comment.user_id) || []
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds)
      
      // Transform data to match Comment interface
      const transformedComments: Comment[] = data?.map(comment => {
        const userProfile = profiles?.find(p => p.id === comment.user_id)
        return {
          id: comment.id,
          user: {
            id: comment.user_id,
            username: userProfile?.username || 'Unknown',
            avatar: userProfile?.avatar_url || '/placeholder.svg',
          },
          content: comment.content,
          timestamp: new Date(comment.created_at),
          likes: 0,
          isLiked: false,
          replies: [],
        }
      }) || []
      
      setComments(transformedComments)
    } catch (err) {
      console.error('Error fetching comments:', err)
      // Fallback to mock comments
      setComments(post.comments || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, post.id])

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return
    
    try {
      // Double-check authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please sign in to add comments')
        return
      }
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment,
        })
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .single()
      
      if (error) {
        console.error('Error adding comment:', error)
        return
      }
      
      // Fetch user profile separately (with fallback handling)
       const { data: userProfile, error: profileError } = await supabase
         .from('profiles')
         .select('id, username, avatar_url')
         .eq('id', user.id)
         .single()
      
      // Handle case where profile doesn't exist - use fallback values instead of failing
      let username = 'Anonymous'
      let avatarUrl = '/placeholder.svg'
      
      if (profileError) {
        console.warn('User profile not found, using fallback values:', profileError)
        // Try to get username from user.email or user metadata
        if (user.email) {
          username = user.email.split('@')[0] // Use email prefix as fallback username
        }
      } else if (userProfile) {
        username = userProfile.username || username
        avatarUrl = userProfile.avatar_url || avatarUrl
      }
      
      // Transform the data to match our Comment interface
      const newCommentData: Comment = {
        id: data.id,
        user: {
          id: data.user_id,
          username: username,
          avatar: avatarUrl,
        },
        content: data.content,
        timestamp: new Date(data.created_at),
        likes: 0,
        isLiked: false,
        replies: [],
      }
      
      setComments([newCommentData, ...comments])
      setNewComment("")
      
      // Notify parent component that a comment was added
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      alert('Failed to add comment. Please try again.')
    }
  }

  const handleReply = (commentId: string, content: string) => {
    const reply: Comment = {
      id: Date.now().toString(),
      user: {
        id: "currentUser",
        username: "you",
        avatar: "/placeholder.svg",
      },
      content,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: [],
    }

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    )
  }

  const handleLike = (commentId: string) => {
    // Handle comment like logic
    console.log("Liked comment:", commentId)
  }

  const sortedComments = Array.isArray(comments) ? [...comments].sort((a, b) => {
    if (sortBy === "newest") {
      return b.timestamp.getTime() - a.timestamp.getTime()
    } else {
      return b.likes - a.likes
    }
  }) : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-white/20 text-white max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Comments</span>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("newest")}
                className={sortBy === "newest" ? "bg-purple-600" : ""}
              >
                Newest
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("popular")}
                className={sortBy === "popular" ? "bg-purple-600" : ""}
              >
                Popular
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-1">
            {loading ? (
              <div className="text-center py-8 text-white/60">
                <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-4"></div>
                <p>Loading comments...</p>
              </div>
            ) : sortedComments.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            ) : (
              sortedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postCreatorId={post.user?.id || ''}
                  onReply={handleReply}
                  onLike={handleLike}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={`${process.env.NODE_ENV === 'production' ? '/equal-social-platform' : ''}/placeholder.svg`} />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PostCard({ post, isActive, currentUser, trackedUsers, onTrackUser }: { post: any; isActive: boolean; currentUser: any; trackedUsers: Set<string>; onTrackUser: (userId: string) => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likes, setLikes] = useState(post.like_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count || 0)
  const [videoError, setVideoError] = useState(false)
  const [narratorPlaying, setNarratorPlaying] = useState(false)
  const [narratorMuted, setNarratorMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const narratorAudioRef = useRef<HTMLAudioElement>(null)
  const router = useRouter()

  useEffect(() => {
    const video = videoRef.current
    if (video && !videoError) {
      if (isActive && post.type === "video") {
        video.play().catch(() => {
          console.log("[v0] Video play failed, likely due to placeholder URL")
          setVideoError(true)
        })
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }
    
    // Cleanup function to prevent DOM manipulation errors
    return () => {
      if (video && !video.paused) {
        video.pause()
      }
    }
  }, [isActive, post.type, videoError])

  const togglePlay = () => {
    const video = videoRef.current
    if (video && !videoError) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play().catch(() => {
          console.log("[v0] Video play failed, showing thumbnail instead")
          setVideoError(true)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (video && !videoError) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleNarratorPlay = () => {
    const audio = narratorAudioRef.current
    if (audio) {
      if (narratorPlaying) {
        audio.pause()
      } else {
        audio.play().catch((error) => {
          console.log("Narrator audio play failed:", error)
        })
      }
      setNarratorPlaying(!narratorPlaying)
    }
  }

  const toggleNarratorMute = () => {
    const audio = narratorAudioRef.current
    if (audio) {
      audio.muted = !narratorMuted
      setNarratorMuted(!narratorMuted)
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev: number) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleDuet = () => {
    router.push(`/duet?post=${post.id}`)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const toneStyle = toneColors[post.tone as keyof typeof toneColors]

  return (
    <div className="relative w-full h-screen flex-shrink-0 bg-black">
      {/* Media Content */}
      <div className="absolute inset-0">
        {post.media_url && post.media_type === 'video' ? (
          <div className="relative w-full h-full">
            {videoError ? (
              <div className="relative w-full h-full">
                <img
                  src={post.thumbnail_url || "/placeholder.svg?height=720&width=405&query=video+thumbnail"}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-2 opacity-80" />
                    <p className="text-sm opacity-80">Video Preview</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={post.media_url}
                  poster={post.thumbnail_url}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                  onClick={togglePlay}
                  onError={() => {
                    console.log("[v0] Video failed to load, falling back to thumbnail")
                    setVideoError(true)
                  }}
                />

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>
                </div>

                {/* Mute Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              </>
            )}
          </div>
        ) : post.media_url && post.media_type === 'image' ? (
          <div className="relative w-full h-full">
            <img 
              src={post.media_url} 
              alt="Post content" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log("[v0] Image failed to load, showing text content instead")
                e.currentTarget.style.display = 'none'
                const textDiv = e.currentTarget.nextElementSibling as HTMLElement
                if (textDiv) textDiv.style.display = 'flex'
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 flex items-center justify-center p-8" style={{display: 'none'}}>
              <div className="max-w-md text-center">
                <p className="text-white text-xl leading-relaxed">{post.content}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <p className="text-white text-xl leading-relaxed">{post.content}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* User Info & Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 md:pb-4 pointer-events-none">
        <div className="flex justify-between items-end">
          {/* Left Side - User Info & Content */}
          <div className="flex-1 mr-4 pointer-events-auto max-w-[calc(100%-80px)]">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-2">
              <Avatar 
                className="w-10 h-10 border-2 border-white cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push(`/profile?user=${post.username || 'unknown'}`)}
              >
                <AvatarImage src={post.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{(post.display_name || post.username || 'U')[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0 min-w-0">
                {post.display_name && (
                  <span 
                    className="text-white font-semibold truncate cursor-pointer hover:opacity-80 transition-opacity text-sm"
                    onClick={() => router.push(`/profile?user=${post.username || 'unknown'}`)}
                  >
                    {post.display_name}
                  </span>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="text-white/70 text-xs truncate cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push(`/profile?user=${post.username || 'unknown'}`)}
                  >
                    @{post.username || 'unknown'}
                  </span>
                  {post.is_verified && (
                    <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-2 py-0 flex-shrink-0">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
              {currentUser && currentUser.id !== (post.user?.id || post.user_id) && (
                 <Button
                   variant="outline"
                   size="sm"
                   className={`${trackedUsers.has(post.user?.id || post.user_id) 
                     ? 'border-red-400 text-red-400 hover:bg-red-400 hover:text-white' 
                     : 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white'
                   } bg-transparent flex-shrink-0 text-xs px-2 py-1`}
                   onClick={() => {
                     onTrackUser(post.user?.id || post.user_id)
                   }}
                 >
                   {trackedUsers.has(post.user?.id || post.user_id) ? 'Untrack' : 'Track'}
                 </Button>
               )}
            </div>

            {/* Timestamp */}
            <div className="mb-3">
              <span className="text-white/70 text-xs">
                {post.created_at ? new Date(post.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }) : 'Just now'}
              </span>
            </div>

            {/* Content Text (for video/photo posts) */}
            {post.type !== "text" && (
              <p className="text-white mb-3 text-sm leading-relaxed line-clamp-3">{post.content}</p>
            )}

            {/* Tone Badge */}
            <Badge className={`${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} border mb-3`}>
              {post.tone.charAt(0).toUpperCase() + post.tone.slice(1)}
            </Badge>

            {/* AI Narrator Indicator */}
            {post.narrator_audio_url && (
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <Volume2 className="w-4 h-4 flex-shrink-0 text-purple-400" />
                <span className="truncate text-purple-400">
                  AI Narrator Available
                </span>
              </div>
            )}

            {/* Narrator Audio Player */}
            {post.narrator_audio_url && (
              <div className="flex items-center gap-2 mb-2">
                <audio
                  ref={narratorAudioRef}
                  src={post.narrator_audio_url}
                  onPlay={() => setNarratorPlaying(true)}
                  onPause={() => setNarratorPlaying(false)}
                  onEnded={() => setNarratorPlaying(false)}
                  muted={narratorMuted}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleNarratorPlay}
                  className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 h-8 px-3"
                >
                  {narratorPlaying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                  <span className="text-xs">Narrator</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleNarratorMute}
                  className="bg-black/30 hover:bg-black/50 text-white h-8 px-2"
                >
                  {narratorMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </Button>
              </div>
            )}

            {/* Echo Score */}
            <div className="mt-2">
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                Echo Score: {post.echo_score || 0}
              </Badge>
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            {/* Like Button */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLike}
                className={`w-12 h-12 rounded-full ${
                  isLiked ? "text-red-500 bg-red-500/20" : "text-white bg-black/50"
                } hover:scale-110 transition-all touch-manipulation`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <span className="text-white text-xs mt-1 font-medium">{formatNumber(likes)}</span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(true)}
                className="w-12 h-12 rounded-full text-white bg-black/50 hover:scale-110 transition-all touch-manipulation"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <span className="text-white text-xs mt-1 font-medium">{formatNumber(commentCount)}</span>
            </div>

            {/* Remix Button - Updated to Duet functionality */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDuet}
                className="w-12 h-12 rounded-full text-white bg-black/50 hover:scale-110 transition-all touch-manipulation"
              >
                <Users className="w-6 h-6" />
              </Button>
              <span className="text-white text-xs mt-1 font-medium">Duet</span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full text-white bg-black/50 hover:scale-110 transition-all touch-manipulation"
              >
                <Share className="w-6 h-6" />
              </Button>
              <span className="text-white text-xs mt-1 font-medium">{formatNumber(post.share_count || 0)}</span>
            </div>

            {/* More Options */}
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full text-white bg-black/50 hover:scale-110 transition-all touch-manipulation"
            >
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      <CommentsModal 
        post={post} 
        isOpen={showComments} 
        onClose={() => setShowComments(false)} 
        user={currentUser}
        onCommentAdded={() => setCommentCount((prev: number) => prev + 1)}
      />
    </div>
  )
}

export default function ExplorePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trackedUsers, setTrackedUsers] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch tracked users
  const fetchTrackedUsers = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_tracking')
        .select('following_id')
        .eq('follower_id', user.id)
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('user_tracking')) {
          console.warn('Tracking table not found. Please create it using the SQL script.')
          setTrackedUsers(new Set())
          return
        }
        throw error
      }
      
      const trackedUserIds = new Set(data?.map(item => item.following_id) || [])
      setTrackedUsers(trackedUserIds)
    } catch (err) {
      console.error('Error fetching tracked users:', err)
      setTrackedUsers(new Set())
    }
  }

  // Handle track/untrack functionality
  const handleTrackUser = async (userId: string) => {
    if (!user) return
    
    try {
      const isTracked = trackedUsers.has(userId)
      
      if (isTracked) {
        // Untrack user
        const { error } = await supabase
          .from('user_tracking')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId)
        
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('user_tracking')) {
            alert('Tracking table not found. Please create the user_tracking table in your Supabase dashboard first.')
            return
          }
          throw error
        }
        
        setTrackedUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      } else {
        // Track user
        const { error } = await supabase
          .from('user_tracking')
          .insert({
            follower_id: user.id,
            following_id: userId
          })
        
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('user_tracking')) {
            alert('Tracking table not found. Please create the user_tracking table in your Supabase dashboard first.')
            return
          }
          throw error
        }
        
        setTrackedUsers(prev => new Set([...prev, userId]))
      }
    } catch (err) {
      console.error('Error tracking/untracking user:', err)
      alert('Failed to update tracking status. Please try again.')
    }
  }

  // Fetch posts from Supabase
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      console.log('Explore page - Posts fetched:', data?.length || 0, 'posts')
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
      // Fallback to mock data if database fails
      setPosts(mockPosts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    if (user) {
      fetchTrackedUsers()
    }
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop
        const windowHeight = window.innerHeight
        const newIndex = Math.round(scrollTop / windowHeight)

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
          setCurrentIndex(newIndex)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [currentIndex, posts.length])

  // Load more posts when approaching the end
  useEffect(() => {
    if (currentIndex >= posts.length - 2 && posts.length > 0 && !loading) {
      // In a real app, you'd fetch more posts with pagination
      // For now, we'll just cycle through existing posts
    }
  }, [currentIndex, posts.length, loading])

  return (
    <div className="h-screen bg-black overflow-hidden">
      {/* Navigation - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block absolute top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden">
        <Navigation />
      </div>

      {/* For You Feed */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide pt-14 md:pt-16"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p>Loading posts...</p>
            </div>
          </div>
        ) : error && posts.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button 
                onClick={fetchPosts}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} className="snap-start">
              <PostCard 
                post={post} 
                isActive={index === currentIndex} 
                currentUser={user} 
                trackedUsers={trackedUsers}
                onTrackUser={handleTrackUser}
              />
            </div>
          ))
        )}
      </div>

      {/* Page Indicator - Hidden on mobile for cleaner look */}
      {!loading && posts.length > 0 && (
        <div className="hidden md:block absolute right-2 top-1/2 transform -translate-y-1/2 z-40">
          <div className="flex flex-col gap-1">
            {posts.slice(0, 10).map((_, index) => (
              <div
                key={index}
                className={`w-1 h-6 rounded-full transition-all ${index === currentIndex ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .touch-manipulation {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  )
}
