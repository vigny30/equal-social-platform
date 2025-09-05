-- Add narrator audio fields to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS narrator_audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_narrator_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_narrator_enabled BOOLEAN DEFAULT false;

-- Create index for narrator audio queries
CREATE INDEX IF NOT EXISTS posts_narrator_audio_url_idx ON public.posts(narrator_audio_url) WHERE narrator_audio_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_video_narrator_enabled_idx ON public.posts(video_narrator_enabled) WHERE video_narrator_enabled = true;
CREATE INDEX IF NOT EXISTS posts_photo_narrator_enabled_idx ON public.posts(photo_narrator_enabled) WHERE photo_narrator_enabled = true;

-- Update the posts_with_details view to include narrator fields
DROP VIEW IF EXISTS public.posts_with_details;

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