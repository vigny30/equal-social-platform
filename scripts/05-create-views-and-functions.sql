-- Create view for posts with user info and stats
CREATE OR REPLACE VIEW public.posts_with_details AS
SELECT 
  p.*,
  pr.display_name,
  pr.username,
  pr.avatar_url,
  pr.avatar_type,
  COALESCE(like_counts.like_count, 0) as like_count,
  COALESCE(comment_counts.comment_count, 0) as comment_count
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as like_count
  FROM public.likes
  GROUP BY post_id
) like_counts ON p.id = like_counts.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comment_count
  FROM public.comments
  GROUP BY post_id
) comment_counts ON p.id = comment_counts.post_id
ORDER BY p.created_at DESC;

-- Create function to get user's posts with stats
CREATE OR REPLACE FUNCTION public.get_user_posts(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  tone TEXT,
  ai_narration TEXT,
  created_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT,
  user_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.tone,
    p.ai_narration,
    p.created_at,
    COALESCE(like_counts.like_count, 0) as like_count,
    COALESCE(comment_counts.comment_count, 0) as comment_count,
    CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as user_liked
  FROM public.posts p
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM public.likes
    GROUP BY post_id
  ) like_counts ON p.id = like_counts.post_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM public.comments
    GROUP BY post_id
  ) comment_counts ON p.id = comment_counts.post_id
  LEFT JOIN (
    SELECT post_id, user_id
    FROM public.likes
    WHERE user_id = auth.uid()
  ) user_likes ON p.id = user_likes.post_id
  WHERE p.user_id = user_uuid
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
