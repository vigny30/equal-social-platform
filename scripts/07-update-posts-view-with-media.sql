-- Update posts_with_details view to include media fields
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