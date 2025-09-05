-- Add media fields to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Create index for media queries
CREATE INDEX IF NOT EXISTS posts_media_url_idx ON public.posts(media_url) WHERE media_url IS NOT NULL;