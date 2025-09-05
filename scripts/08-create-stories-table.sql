-- Create stories table for temporary story content
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tone TEXT,
  ai_narration BOOLEAN DEFAULT false,
  media_url TEXT,
  media_type TEXT,
  narrator_audio_url TEXT,
  video_narrator_enabled BOOLEAN DEFAULT false,
  photo_narrator_enabled BOOLEAN DEFAULT false,
  audience TEXT DEFAULT 'public' CHECK (audience IN ('public', 'followers', 'close_friends')),
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
  duration INTEGER DEFAULT 24 CHECK (duration > 0 AND duration <= 168), -- hours, max 1 week
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public stories" ON public.stories
  FOR SELECT USING (
    privacy = 'public' AND 
    expires_at > NOW() AND
    (audience = 'public' OR 
     (audience = 'followers' AND EXISTS (
       SELECT 1 FROM user_tracking 
       WHERE following_id = stories.user_id AND follower_id = auth.uid()
     ))
    )
  );

CREATE POLICY "Users can view own stories" ON public.stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stories" ON public.stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON public.stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON public.stories
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS stories_user_id_idx ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS stories_expires_at_idx ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS stories_audience_idx ON public.stories(audience);
CREATE INDEX IF NOT EXISTS stories_privacy_idx ON public.stories(privacy);

-- Create function to automatically delete expired stories
CREATE OR REPLACE FUNCTION delete_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM public.stories WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_expired_stories() TO authenticated;