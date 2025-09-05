-- Create tracking table for user relationships
CREATE TABLE IF NOT EXISTS user_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tracking_follower ON user_tracking(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_following ON user_tracking(following_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own tracking relationships" ON user_tracking
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own tracking relationships" ON user_tracking
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own tracking relationships" ON user_tracking
  FOR DELETE USING (auth.uid() = follower_id);

-- Create a view to get tracking details with user information
CREATE OR REPLACE VIEW user_tracking_details AS
SELECT 
  ut.id,
  ut.follower_id,
  ut.following_id,
  ut.created_at,
  p_follower.username as follower_username,
  p_follower.avatar_url as follower_avatar,
  p_following.username as following_username,
  p_following.avatar_url as following_avatar
FROM user_tracking ut
LEFT JOIN profiles p_follower ON ut.follower_id = p_follower.id
LEFT JOIN profiles p_following ON ut.following_id = p_following.id;

-- Grant permissions
GRANT SELECT ON user_tracking_details TO authenticated;
GRANT ALL ON user_tracking TO authenticated;