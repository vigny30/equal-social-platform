-- Create live_streams table for storing live streaming data
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  viewers INTEGER DEFAULT 0,
  duration TEXT DEFAULT '00:00:00',
  is_live BOOLEAN DEFAULT true,
  tone VARCHAR(50) DEFAULT 'truth',
  stream_key TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all live streams" ON public.live_streams
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own live streams" ON public.live_streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live streams" ON public.live_streams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live streams" ON public.live_streams
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS live_streams_user_id_idx ON public.live_streams(user_id);
CREATE INDEX IF NOT EXISTS live_streams_is_live_idx ON public.live_streams(is_live);
CREATE INDEX IF NOT EXISTS live_streams_started_at_idx ON public.live_streams(started_at);

-- Create view for live streams with user details
CREATE OR REPLACE VIEW public.live_streams_with_details AS
SELECT
  ls.*,
  pr.display_name,
  pr.username,
  pr.avatar_url
FROM public.live_streams ls
LEFT JOIN public.profiles pr ON ls.user_id = pr.id
WHERE ls.is_live = true
ORDER BY ls.started_at DESC;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_live_streams_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON public.live_streams
    FOR EACH ROW EXECUTE FUNCTION update_live_streams_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.live_streams_with_details TO authenticated;
GRANT ALL ON public.live_streams TO authenticated;