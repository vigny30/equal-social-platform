"use client"

import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Crown, TrendingUp, Volume2, Palette, User, Plus, Settings, Users, UserMinus, Heart, MessageCircle, Share, Send, Reply, Flag, Pin } from "lucide-react"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { AvatarSelector } from "@/components/avatar-selector"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { PostInteractions } from "@/components/post-interactions"

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

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}

function CommentsModal({
  isOpen,
  onClose,
  postId,
  comments,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  postId: string
  comments: any[]
  onUpdate: () => void
}) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processedComments, setProcessedComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch comments from database
  const fetchComments = async () => {
    if (!postId) return
    
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching comments:', error)
        setProcessedComments([])
        return
      }
      
      // Fetch user profiles separately
      const userIds = data?.map(comment => comment.user_id) || []
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, display_name')
        .in('id', userIds)
      
      // Transform data to match Comment interface
      const transformedComments: Comment[] = data?.map(comment => {
        const userProfile = profiles?.find(p => p.id === comment.user_id)
        return {
          id: comment.id,
          user: {
            id: comment.user_id,
            username: userProfile?.display_name || userProfile?.username || 'Anonymous',
            avatar: userProfile?.avatar_url || '/placeholder.svg',
          },
          content: comment.content,
          timestamp: new Date(comment.created_at),
          likes: 0,
          isLiked: false,
          replies: [],
        }
      }) || []
      
      setProcessedComments(transformedComments)
    } catch (err) {
      console.error('Error fetching comments:', err)
      setProcessedComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments()
    }
  }, [isOpen, postId])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // Use a default user ID if no user is authenticated
      const userId = user?.id || 'anonymous-user'
      
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: userId,
        content: newComment.trim(),
      })

      if (error) {
        console.error("Error adding comment:", error)
        return
      }

      setNewComment("")
      // Refresh comments to show the new one
      await fetchComments()
      onUpdate()
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (commentId: string, content: string) => {
    try {
      // Use a default user ID if no user is authenticated
      const userId = user?.id || 'anonymous-user'
      
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_id: commentId,
      })

      if (error) {
        console.error("Error adding reply:", error)
        return
      }

      // Refresh comments to show the new reply
      await fetchComments()
      onUpdate()
    } catch (error) {
      console.error("Error submitting reply:", error)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("comment_likes").upsert(
        {
          comment_id: commentId,
          user_id: user.id,
        },
        {
          onConflict: "comment_id,user_id",
        },
      )

      if (error) {
        console.error("Error liking comment:", error)
        return
      }

      onUpdate()
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-white/20 max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white font-futuristic flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            Comments ({comments.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-1">
              {processedComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No comments yet</p>
                  <p className="text-white/40 text-sm">Be the first to share your thoughts!</p>
                </div>
              ) : (
                processedComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postCreatorId={""}
                    onReply={handleReply}
                    onLike={handleLike}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={`${process.env.NODE_ENV === 'production' ? '/equal-social-platform' : ''}/placeholder.svg`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSubmitComment()}
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



const avatarTraits = {
  style: [
    { value: "realistic", label: "Realistic" },
    { value: "cartoon", label: "Cartoon" },
    { value: "abstract", label: "Abstract" },
    { value: "pixel", label: "Pixel Art" },
  ],
  color: [
    { value: "warm", label: "Warm Tones" },
    { value: "cool", label: "Cool Tones" },
    { value: "vibrant", label: "Vibrant" },
    { value: "monochrome", label: "Monochrome" },
  ],
  expression: [
    { value: "confident", label: "Confident" },
    { value: "mysterious", label: "Mysterious" },
    { value: "friendly", label: "Friendly" },
    { value: "intense", label: "Intense" },
  ],
}

const voiceStyles = [
  { value: "narrator", label: "Professional Narrator", description: "Clear, authoritative voice" },
  { value: "casual", label: "Casual Friend", description: "Relaxed, conversational tone" },
  { value: "dramatic", label: "Dramatic Voice", description: "Theatrical, emotional delivery" },
  { value: "whisper", label: "Mysterious Whisper", description: "Soft, intriguing tone" },
]

const emotionalTones = [
  { value: "rage", label: "Rage", color: "text-red-400", bgColor: "bg-red-500/20" },
  { value: "mystery", label: "Mystery", color: "text-teal-400", bgColor: "bg-teal-500/20" },
  { value: "satire", label: "Satire", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  { value: "truth", label: "Truth", color: "text-blue-400", bgColor: "bg-blue-500/20" },
]

function AvatarBuilder({ currentAvatar, onSave }: { currentAvatar: any; onSave: (avatar: any) => void }) {
  const [avatar, setAvatar] = useState(currentAvatar)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <User className="w-16 h-16 text-white" />
        </div>
        <p className="text-white/70 text-sm">Preview of your avatar</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-white/90">Style</Label>
          <Select value={avatar.style} onValueChange={(value) => setAvatar({ ...avatar, style: value })}>
            <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {avatarTraits.style.map((style) => (
                <SelectItem key={style.value} value={style.value} className="text-white hover:bg-white/10">
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white/90">Color Palette</Label>
          <Select value={avatar.color} onValueChange={(value) => setAvatar({ ...avatar, color: value })}>
            <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {avatarTraits.color.map((color) => (
                <SelectItem key={color.value} value={color.value} className="text-white hover:bg-white/10">
                  {color.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white/90">Expression</Label>
          <Select value={avatar.expression} onValueChange={(value) => setAvatar({ ...avatar, expression: value })}>
            <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {avatarTraits.expression.map((expression) => (
                <SelectItem key={expression.value} value={expression.value} className="text-white hover:bg-white/10">
                  {expression.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={() => onSave(avatar)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        Save Avatar
      </Button>
    </div>
  )
}

function VoiceStyleSelector({ currentStyle, onSave }: { currentStyle: string; onSave: (style: string) => void }) {
  const [selectedStyle, setSelectedStyle] = useState(currentStyle)

  return (
    <div className="space-y-4">
      {voiceStyles.map((style) => (
        <div
          key={style.value}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedStyle === style.value
              ? "border-purple-500 bg-purple-500/10"
              : "border-white/20 bg-white/5 hover:border-white/30"
          }`}
          onClick={() => setSelectedStyle(style.value)}
        >
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <div>
              <h4 className="text-white font-semibold">{style.label}</h4>
              <p className="text-white/60 text-sm">{style.description}</p>
            </div>
          </div>
        </div>
      ))}

      <Button
        onClick={() => onSave(selectedStyle)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        Save Voice Style
      </Button>
    </div>
  )
}

function ProfileEditor({ currentProfile, onSave }: { currentProfile: any; onSave: (profile: any) => void }) {
  const [profile, setProfile] = useState(currentProfile)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(profile)
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white/90 mb-4 block">Profile Picture</Label>
        <AvatarSelector
          currentAvatar={profile.avatarSrc}
          onSave={(avatarData) =>
            setProfile({
              ...profile,
              avatarSrc: avatarData.src,
              avatarType: avatarData.type,
              avatarName: avatarData.name,
            })
          }
        />
      </div>

      <div>
        <Label className="text-white/90">Display Name</Label>
        <Input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50"
          placeholder="Enter your display name"
        />
      </div>

      <div>
        <Label className="text-white/90">Username</Label>
        <Input
          value={profile.username.replace("@", "")}
          onChange={(e) => setProfile({ ...profile, username: `@${e.target.value.replace("@", "")}` })}
          className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50"
          placeholder="Enter your username"
        />
        <p className="text-white/50 text-xs mt-1">Username will be prefixed with @</p>
      </div>

      <div>
        <Label className="text-white/90">Bio</Label>
        <Textarea
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 resize-none"
          placeholder="Tell us about yourself..."
          rows={3}
        />
      </div>

      <div>
        <Label className="text-white/90">Location</Label>
        <Input
          value={profile.location || ""}
          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50"
          placeholder="Where are you from?"
        />
      </div>

      <div>
        <Label className="text-white/90">Website</Label>
        <Input
          value={profile.website || ""}
          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
          className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isSaving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  )
}

function ProfilePageContent() {
  const { user: authUser, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUser = typeof window !== 'undefined' ? searchParams.get('user') : null
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isLoadingTrackedUsers, setIsLoadingTrackedUsers] = useState(false)
  const [trackedUsers, setTrackedUsers] = useState<any[]>([])
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatarSrc: null as string | null,
    avatarType: "preset" as "upload" | "preset",
    avatarName: "",
    totalLikes: 0,
    totalReactions: 0,
    echoScore: 0,
    joinDate: "",
    monetized: false,
    avatar: {
      style: "realistic",
      color: "cool",
      expression: "confident",
    },
    voiceStyle: "narrator",
  })

  const echoHistory = [
    { month: "January", score: 80 },
    { month: "February", score: 85 },
    { month: "March", score: 90 },
    { month: "April", score: 95 },
  ]

  useEffect(() => {
    if (authUser) {
      loadUserProfile()
      if (!targetUser) {
        loadTrackedUsers()
      }
    }
  }, [authUser, refreshTrigger, targetUser])

  // Load posts after profile is loaded
  useEffect(() => {
    if (authUser && (profileUser || !targetUser)) {
      loadUserPosts()
    }
  }, [authUser, profileUser, targetUser, refreshTrigger])

  // Real-time subscription for comments and likes
  useEffect(() => {
    if (!authUser) return

    const channel = supabase
      .channel('profile-interactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          // Refresh posts when comments are added/updated/deleted
          setRefreshTrigger((prev) => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          // Refresh posts when likes are added/removed
          setRefreshTrigger((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authUser])

  const loadUserProfile = async () => {
    if (!authUser) return

    setIsLoadingProfile(true)
    try {
      let profile, profileUserId
      
      if (targetUser) {
        // Load target user's profile by username
        const { data: targetProfile, error: targetError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", targetUser)
          .single()
        
        if (targetError) {
          console.log("Target user lookup error:", targetError, "for username:", targetUser)
          // Set default empty profile if user not found
          setUser({
            name: targetUser || "Unknown User",
            username: `@${targetUser}`,
            email: "",
            bio: "Profile not found",
            location: "",
            website: "",
            avatarSrc: null,
            avatarType: "preset",
            avatarName: "",
            totalLikes: 0,
            totalReactions: 0,
            echoScore: 0,
            joinDate: "Unknown",
            monetized: false,
            avatar: {
              style: "realistic",
              color: "cool",
              expression: "confident",
            },
            voiceStyle: "narrator",
          })
          setUserPosts([])
          setIsLoadingProfile(false)
          return
        }
        
        profile = targetProfile
        profileUserId = targetProfile.id
        setProfileUser(targetProfile)
      } else {
        // Load authenticated user's profile
        const { data: authProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()
        
        if (error && error.code !== "PGRST116") {
          return
        }
        
        profile = authProfile
        profileUserId = authUser.id
        setProfileUser(null)
      }

      const joinDate = new Date(profile?.created_at || authUser.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })

      const { data: posts, error: postsError } = await supabase.rpc("get_user_posts", { user_uuid: profileUserId })

      if (postsError) {
        // Handle posts loading error silently
      }

      const totalLikes = posts?.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0) || 0
      const totalReactions = posts?.reduce((sum: number, post: any) => sum + (post.comment_count || 0), 0) || 0

      setUser({
        name: profile?.display_name || (targetUser ? profile?.username : authUser.user_metadata?.full_name) || authUser.email?.split("@")[0] || "User",
        username: profile?.username ? `@${profile.username}` : `@${authUser.email?.split("@")[0] || "user"}`,
        email: targetUser ? "" : (authUser.email || ""),
        bio: profile?.bio || "",
        location: profile?.location || "",
        website: profile?.website || "",
        avatarSrc: profile?.avatar_url || null,
        avatarType: profile?.avatar_type || "preset",
        avatarName: "",
        totalLikes,
        totalReactions,
        echoScore: Math.min(95, Math.floor((totalLikes + totalReactions) / 10)),
        joinDate,
        monetized: totalReactions > 1000,
        avatar: {
          style: "realistic",
          color: "cool",
          expression: "confident",
        },
        voiceStyle: "narrator",
      })
    } catch (error) {
      console.error("Error loading user profile:", error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const loadUserPosts = async () => {
    if (!authUser) return

    try {
      let userId = authUser.id
      
      // If viewing a target user's profile, use their ID
      if (targetUser) {
        if (!profileUser) {
          console.log('Profile user not loaded yet, skipping posts load')
          return
        }
        userId = profileUser.id
      }
      
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading posts:", error)
        return
      }

      const postsWithInteractions = await Promise.all(
        posts.map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from("likes").select("user_id").eq("post_id", post.id),
            supabase
              .from("comments")
              .select("*, profiles(display_name, username, avatar_url)")
              .eq("post_id", post.id)
              .order("created_at", { ascending: true }),
          ])

          return {
            ...post,
            likes: likesResult.data || [],
            comments: commentsResult.data || [],
          }
        }),
      )

      console.log('DEBUG: Loaded posts for profile page:', postsWithInteractions.length, postsWithInteractions)
      console.log('DEBUG: Auth user:', authUser?.id, authUser?.email)
      console.log('DEBUG: Target user:', targetUser)
      console.log('DEBUG: Profile user:', profileUser?.id)
      setUserPosts(postsWithInteractions)
    } catch (error) {
      console.error("Error loading user posts:", error)
    }
  }

  const loadTrackedUsers = async () => {
    if (!authUser) return

    setIsLoadingTrackedUsers(true)
    try {
      // First try the view, if it doesn't exist, try the table directly
      let { data, error } = await supabase
        .from('user_tracking_details')
        .select('*')
        .eq('follower_id', authUser.id)
        .order('created_at', { ascending: false })

      if (error && (error.code === 'PGRST116' || error.message.includes('user_tracking'))) {
        // Try the table directly if view doesn't exist
        const result = await supabase
          .from('user_tracking')
          .select(`
            *,
            profiles!user_tracking_following_id_fkey(
              name,
              username
            )
          `)
          .eq('follower_id', authUser.id)
          .order('created_at', { ascending: false })
        
        if (result.error) {
          if (result.error.code === 'PGRST116' || result.error.message.includes('user_tracking')) {
            console.warn('Tracking table not found. Please create it using the SQL script.')
            setTrackedUsers([])
            return
          }
          throw result.error
        }
        
        // Transform the data to match the expected format
        data = result.data?.map(item => ({
          ...item,
          name: item.profiles?.name || 'Unknown User',
          username: item.profiles?.username || 'unknown'
        })) || []
      } else if (error) {
        throw error
      }

      setTrackedUsers(data || [])
    } catch (error) {
      console.error('Error loading tracked users:', error)
      setTrackedUsers([])
    } finally {
      setIsLoadingTrackedUsers(false)
    }
  }

  const handleUntrackUser = async (userId: string) => {
    if (!authUser) return

    try {
      const { error } = await supabase
        .from('user_tracking')
        .delete()
        .eq('follower_id', authUser.id)
        .eq('following_id', userId)

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('user_tracking')) {
          alert('Tracking table not found. Please create the user_tracking table in your Supabase dashboard first.')
          return
        }
        console.error('Error untracking user:', error)
        return
      }

      // Remove the user from the tracked users list
      setTrackedUsers(prev => prev.filter(user => user.following_id !== userId))
    } catch (error) {
      console.error('Error untracking user:', error)
      alert('Failed to untrack user. Please try again.')
    }
  }

  const uploadImageToStorage = async (dataUrl: string, userId: string): Promise<string | null> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Generate unique filename
      const fileExt = blob.type.split('/')[1] || 'jpg'
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        console.error('Error uploading image:', error)
        return null
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      return publicUrl
    } catch (error) {
      console.error('Error processing image upload:', error)
      return null
    }
  }

  const handleProfileSave = async (newProfile: any) => {
    if (!authUser) return

    try {
      let avatarUrl = newProfile.avatarSrc
      
      // If it's an uploaded image (data URL), upload to storage first
      if (newProfile.avatarType === 'upload' && newProfile.avatarSrc?.startsWith('data:')) {
        const uploadedUrl = await uploadImageToStorage(newProfile.avatarSrc, authUser.id)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        } else {
          console.error('Failed to upload avatar image')
          return
        }
      }
      
      const profileData = {
        id: authUser.id,
        email: authUser.email,
        display_name: newProfile.name,
        username: newProfile.username.replace("@", ""),
        bio: newProfile.bio,
        location: newProfile.location,
        website: newProfile.website,
        avatar_url: avatarUrl,
        avatar_type: newProfile.avatarType,
      }

      const { error } = await supabase.from("profiles").upsert(profileData)

      if (error) {
        console.error("Error saving profile:", error)
        return
      }

      // Trigger refresh to reload profile data from database
      setRefreshTrigger((prev) => prev + 1)
      setIsProfileDialogOpen(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const handleAvatarSave = async (newAvatar: any) => {
    const updatedUser = { ...user, avatar: newAvatar }
    setUser(updatedUser)
    await handleProfileSave(updatedUser)
  }

  const handleVoiceSave = async (newVoiceStyle: string) => {
    const updatedUser = { ...user, voiceStyle: newVoiceStyle }
    setUser(updatedUser)
    await handleProfileSave(updatedUser)
  }

  const handlePostUpdate = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleLike = async (postId: string, currentLikes: any[]) => {
    if (!authUser) {
      alert("Please sign in to like posts")
      return
    }

    try {
      const isLiked = currentLikes.some((like: any) => like.user_id === authUser.id)
      
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", authUser.id)
        
        if (error) {
          console.error("Error unliking post:", error)
          return
        }
      } else {
        // Like the post
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: authUser.id })
        
        if (error) {
          console.error("Error liking post:", error)
          return
        }
      }
      
      // Update local state
      setUserPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedLikes = isLiked
            ? post.likes.filter((like: any) => like.user_id !== authUser.id)
            : [...post.likes, { user_id: authUser.id }]
          return { ...post, likes: updatedLikes }
        }
        return post
      }))
    } catch (error) {
      console.error("Error handling like:", error)
    }
  }

  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark flex items-center justify-center">
        <div className="text-white text-xl">Please sign in to view your profile</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 dark">
      <Navigation />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
                <AvatarImage src={user.avatarSrc || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2 font-futuristic">{user.name}</h1>
            <p className="text-xl text-white/70 mb-2">{user.username}</p>
            <p className="text-sm text-white/50 mb-2">{user.email}</p>

            {user.bio && <p className="text-white/80 mb-2 max-w-md mx-auto">{user.bio}</p>}

            <div className="flex items-center justify-center gap-4 text-sm text-white/60 mb-4">
              {user.location && <span>📍 {user.location}</span>}
              {user.website && (
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  🔗 Website
                </a>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              {!targetUser ? (
                // Show Edit Profile button only when viewing your own profile
                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black/90 border-white/20 max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white font-futuristic">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <ProfileEditor currentProfile={user} onSave={handleProfileSave} />
                  </DialogContent>
                </Dialog>
              ) : (
                // Show Track button when viewing someone else's profile
                <Button 
                  variant="outline" 
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white bg-transparent"
                  onClick={() => {
                    // TODO: Implement track functionality
                    console.log('Track user:', targetUser)
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Track
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              {user.monetized && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Monetized Creator
                </Badge>
              )}
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Echo {user.echoScore}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Joined {user.joinDate}</Badge>
            </div>

            <div className="flex items-center justify-center gap-8 text-white/80 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.totalLikes.toLocaleString()}</div>
                <div className="text-sm">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.totalReactions.toLocaleString()}</div>
                <div className="text-sm">Total Reactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userPosts.length}</div>
                <div className="text-sm">Posts</div>
              </div>
            </div>

            <Button
              onClick={() => router.push("/create")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mb-8"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </div>

          {userPosts.length === 0 && (
            <div className="text-center mb-8">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-2">Welcome to Equal!</h3>
                  <p className="text-white/70 mb-4">
                    You haven't created any posts yet. Start sharing your thoughts to build your Echo Score!
                  </p>
                  <Button
                    onClick={() => router.push("/create")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className={`grid w-full ${!targetUser ? 'grid-cols-5' : 'grid-cols-3'} bg-black/20 border border-white/10`}>
              <TabsTrigger value="posts" className="data-[state=active]:bg-white/10 text-white">
                Posts
              </TabsTrigger>
              <TabsTrigger value="tracking" className="data-[state=active]:bg-white/10 text-white">
                Tracking
              </TabsTrigger>
              <TabsTrigger value="echo" className="data-[state=active]:bg-white/10 text-white">
                Echo Score
              </TabsTrigger>
              {!targetUser && (
                <>
                  <TabsTrigger value="avatar" className="data-[state=active]:bg-white/10 text-white">
                    Avatar
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="data-[state=active]:bg-white/10 text-white">
                    Voice
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {userPosts.map((post) => {
                const toneData = emotionalTones.find((tone) => tone.value === post.tone)
                const timeAgo = new Date(post.created_at).toLocaleDateString()

                return (
                  <Card key={post.id} className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardContent className="p-6">
                      {/* Media Content */}
                      {post.media_url && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          {post.media_type === 'video' ? (
                            <video
                              className="w-full h-auto max-h-96 object-cover"
                              controls
                              preload="metadata"
                            >
                              <source src={post.media_url} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          ) : post.media_type === 'image' ? (
                            <img
                              src={post.media_url}
                              alt="Post media"
                              className="w-full h-auto max-h-96 object-cover"
                              onError={(e) => {
                                console.log("Image failed to load in profile")
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : null}
                        </div>
                      )}

                      {/* Narrator Audio Player */}
                      {post.narrator_audio_url && (
                        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-purple-400" />
                              <span className="text-white/80 text-sm font-medium">AI Narrator</span>
                            </div>
                            <audio
                              src={post.narrator_audio_url}
                              className="flex-1 h-8"
                              controls
                              preload="metadata"
                            />
                          </div>
                        </div>
                      )}
                      
                      <p className="text-white/90 mb-4 leading-relaxed">{post.content}</p>

                      <div className="flex items-center gap-2 mb-4">
                        {toneData && (
                          <Badge className={`${toneData.bgColor} ${toneData.color} border-0`}>{toneData.label}</Badge>
                        )}
                        {post.narrator_audio_url && (
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                            <Volume2 className="w-3 h-3 mr-1" />
                            AI Narrator
                          </Badge>
                        )}
                      </div>

                      {/* Like and Comment Interactions */}
                      <div className="flex items-center gap-6 mb-4">
                        {/* Like Button */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id, post.likes || [])}
                            className={`flex items-center gap-2 hover:scale-110 transition-all ${
                              (post.likes || []).some((like: any) => like.user_id === authUser?.id)
                                ? "text-red-500"
                                : "text-white/70 hover:text-red-500"
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${
                              (post.likes || []).some((like: any) => like.user_id === authUser?.id)
                                ? "fill-current"
                                : ""
                            }`} />
                          </Button>
                          <span className="text-white/80 text-sm font-medium">
                            {(post.likes || []).length}
                          </span>
                        </div>

                        {/* Comment Button */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCommentsFor(showCommentsFor === post.id ? null : post.id)}
                            className="flex items-center gap-2 text-white/70 hover:text-blue-500 hover:scale-110 transition-all"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                          <span className="text-white/80 text-sm font-medium">
                            {post.commentCount || (post.comments || []).length}
                          </span>
                        </div>

                        {/* Share Button */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-white/70 hover:text-green-500 hover:scale-110 transition-all"
                          >
                            <Share className="w-5 h-5" />
                          </Button>
                          <span className="text-white/80 text-sm font-medium">0</span>
                        </div>
                      </div>

                      {/* Comments Modal */}
                      <CommentsModal
                        isOpen={showCommentsFor === post.id}
                        onClose={() => setShowCommentsFor(null)}
                        postId={post.id}
                        comments={post.comments || []}
                        onUpdate={() => {
                          // Update local comment count
                          setUserPosts(prev => prev.map(p => 
                            p.id === post.id 
                              ? { ...p, commentCount: (p.commentCount || (p.comments || []).length) + 1 }
                              : p
                          ))
                          handlePostUpdate()
                        }}
                      />

                      <div className="flex items-center justify-between text-white/70 mt-4">
                        <div className="flex items-center gap-2 text-purple-400">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-semibold">Echo {Math.floor(Math.random() * 20) + 70}</span>
                        </div>
                        <span className="text-sm">{timeAgo}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="echo">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white font-futuristic flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Echo Score History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={echoHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="month" stroke="#ffffff60" />
                        <YAxis stroke="#ffffff60" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            color: "white",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <p className="text-white/80 text-sm">
                      Your Echo Score reflects your content's impact and engagement depth. Higher scores indicate
                      greater influence and remix potential.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {!targetUser && (
              <>
                <TabsContent value="avatar">
                  <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white font-futuristic flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-400" />
                        Avatar Customization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AvatarBuilder currentAvatar={user.avatar} onSave={handleAvatarSave} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="voice">
                  <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white font-futuristic flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-purple-400" />
                        Voice Style Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VoiceStyleSelector currentStyle={user.voiceStyle} onSave={handleVoiceSave} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}

            <TabsContent value="tracking">
              <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white font-futuristic flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    People You're Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTrackedUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    </div>
                  ) : trackedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">You're not tracking anyone yet</p>
                      <p className="text-white/40 text-sm mt-2">Start tracking users from the explore page!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trackedUsers.map((trackedUser) => (
                        <div key={trackedUser.following_id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {trackedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{trackedUser.name || 'Unknown User'}</h3>
                              <p className="text-white/60 text-sm">@{trackedUser.username || 'unknown'}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleUntrackUser(trackedUser.following_id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Untrack
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
