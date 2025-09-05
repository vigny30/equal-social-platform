"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

interface Comment {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles?: {
    display_name: string
    username: string
    avatar_url: string
  }
}

interface PostInteractionsProps {
  postId: string
  likes: { user_id: string }[]
  comments: Comment[]
  onUpdate: () => void
}

export function PostInteractions({ postId, likes, comments, onUpdate }: PostInteractionsProps) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [localComments, setLocalComments] = useState(comments)

  // Debug logging for profile page issue
  useEffect(() => {
    console.log('PostInteractions props:', { postId, likesCount: likes?.length, commentsCount: comments?.length })
  }, [postId, likes, comments])

  const isLiked = user ? likes.some((like) => like.user_id === user.id) : false

  // Sync local state with props
  useEffect(() => {
    setLocalComments(comments)
  }, [comments])

  const handleLike = async () => {
    if (isLiking) return

    // Check if user is authenticated
    if (!user) {
      alert("Please sign in to like posts")
      return
    }

    setIsLiking(true)

    try {
      // Double-check authentication with Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert("Please sign in to like posts")
        setIsLiking(false)
        return
      }

      if (isLiked) {
        // Remove like
        const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id)

        if (error) {
          if (error.message.includes('JWT') || error.message.includes('auth')) {
            alert("Authentication error. Please sign in again.")
          } else {
            alert("Failed to remove like. Please try again.")
          }
          return
        }
      } else {
        // Add like
        const { error } = await supabase.from("likes").insert([
          {
            post_id: postId,
            user_id: user.id,
          },
        ])

        if (error) {
          if (error.message.includes('JWT') || error.message.includes('auth')) {
            alert("Authentication error. Please sign in again.")
          } else {
            alert("Failed to add like. Please try again.")
          }
          return
        }
      }

      onUpdate()
    } catch (error) {
      alert("Failed to update like. Please try again.")
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    // Check if user is authenticated
    if (!user) {
      alert("Please sign in to add comments")
      return
    }

    // Basic validation
    if (!postId) {
      console.error("No postId provided")
      return
    }

    setIsSubmitting(true)

    try {
      // Double-check authentication with Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert("Please sign in to add comments")
        setIsSubmitting(false)
        return
      }

      const { data, error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        },
      ]).select(`
        id,
        content,
        created_at,
        user_id
      `).single()

      if (error) {
        console.error('Error adding comment:', error)
        if (error.message.includes('JWT') || error.message.includes('auth')) {
          alert("Authentication error. Please sign in again.")
        } else {
          alert("Failed to add comment. Please try again.")
        }
        return
      }

      // Fetch user profile separately (with fallback handling)
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .eq('id', user.id)
        .single()
      
      // Handle case where profile doesn't exist - use fallback values instead of failing
      let displayName = 'Anonymous'
      let username = 'anonymous'
      let avatarUrl = '/placeholder.svg'
      
      if (profileError) {
        console.warn('User profile not found, using fallback values:', profileError)
        // Try to get username from user.email or user metadata
        if (user.email) {
          displayName = user.email.split('@')[0] // Use email prefix as fallback
          username = user.email.split('@')[0]
        }
      } else if (userProfile) {
        displayName = userProfile.display_name || userProfile.username || displayName
        username = userProfile.username || username
        avatarUrl = userProfile.avatar_url || avatarUrl
      }
      
      // Transform the data to match our Comment interface with fallback profile data
      const newCommentData = {
        ...data,
        profiles: {
          display_name: displayName,
          username: username,
          avatar_url: avatarUrl,
        }
      }

      if (data) {
        // Add the new comment to local comments immediately
        setLocalComments(prev => [...prev, newCommentData])
      }
      
      setNewComment("")
      onUpdate()
    } catch (error) {
      alert("Failed to add comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Like and Comment Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-2 ${
            isLiked ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
          }`}
          disabled={!user || isLiking}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>{likes.length}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-500"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{localComments.length}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3 border-t border-gray-800 pt-4">
          {/* Add Comment */}
          {user && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                className="flex-1 bg-gray-900/50 border-gray-700"
              />
              <Button onClick={handleComment} disabled={!newComment.trim() || isSubmitting} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {localComments.map((comment) => (
              <div key={comment.id} className="bg-gray-900/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-400">
                    {comment.profiles?.display_name || comment.profiles?.username || "User"}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>

          {localComments.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  )
}
