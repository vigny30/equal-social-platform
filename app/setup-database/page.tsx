"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface TableStatus {
  name: string
  exists: boolean
  error?: string
}

interface BucketStatus {
  name: string
  exists: boolean
  error?: string
}

export default function SetupDatabasePage() {
  const [status, setStatus] = useState<string>('Ready to check database...')
  const [tables, setTables] = useState<TableStatus[]>([])
  const [buckets, setBuckets] = useState<BucketStatus[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)
  const { user } = useAuth()

  const checkTable = async (tableName: string): Promise<TableStatus> => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes(tableName)) {
          return { name: tableName, exists: false }
        } else {
          return { name: tableName, exists: false, error: error.message }
        }
      } else {
        return { name: tableName, exists: true }
      }
    } catch (err: any) {
      return { name: tableName, exists: false, error: err.message }
    }
  }

  const checkBucket = async (bucketName: string): Promise<BucketStatus> => {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName)
      
      if (error) {
        return { name: bucketName, exists: false, error: error.message }
      } else {
        return { name: bucketName, exists: true }
      }
    } catch (err: any) {
      return { name: bucketName, exists: false, error: err.message }
    }
  }

  const checkAllTables = async () => {
    setIsChecking(true)
    setStatus('Checking database tables and storage buckets...')
    
    const tablesToCheck = ['profiles', 'posts', 'stories', 'likes', 'comments', 'user_tracking', 'live_streams']
    const results: TableStatus[] = []
    
    for (const table of tablesToCheck) {
      const result = await checkTable(table)
      results.push(result)
    }
    
    // Check storage buckets
    const bucketsToCheck = ['avatars', 'posts-media']
    const bucketResults: BucketStatus[] = []
    
    for (const bucket of bucketsToCheck) {
      const result = await checkBucket(bucket)
      bucketResults.push(result)
    }
    
    setTables(results)
    setBuckets(bucketResults)
    setStatus('Database and storage check complete!')
    setIsChecking(false)
  }

  const createUserTrackingTable = async () => {
    if (!user) {
      setStatus('❌ Please log in first')
      return
    }

    try {
      setStatus('Creating user_tracking table...')
      
      // Try to create the table using a stored procedure or direct SQL
      // Since we can't execute DDL directly, we'll try to use the RPC function
      const { error } = await supabase.rpc('create_user_tracking_table')
      
      if (error) {
        // If RPC doesn't exist, show manual instructions
        setStatus('❌ Cannot create table automatically. Please use manual setup.')
        return
      }
      
      setStatus('✅ user_tracking table created successfully!')
      // Recheck tables
      await checkAllTables()
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`)
    }
  }

  const addNarratorFields = async () => {
    if (!user) {
      setStatus('❌ Please log in first')
      return
    }

    try {
      setStatus('Adding narrator fields to posts table...')
      
      // Execute the narrator fields migration SQL
      const { error } = await supabase.rpc('add_narrator_fields_to_posts')
      
      if (error) {
        setStatus('❌ Cannot add narrator fields automatically. Please use manual setup.')
        console.error('Error adding narrator fields:', error)
        return
      }
      
      setStatus('✅ Narrator fields added successfully!')
      // Recheck tables
      await checkAllTables()
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`)
    }
  }

  const createStoriesTable = async () => {
    if (!user) {
      setStatus('❌ Please log in first')
      return
    }

    try {
      setStatus('Creating stories table...')
      
      // Try to create the table using a stored procedure or direct SQL
      const { error } = await supabase.rpc('create_stories_table')
      
      if (error) {
        // If RPC doesn't exist, show manual instructions
        setStatus('❌ Cannot create table automatically. Please use manual setup.')
        return
      }
      
      setStatus('✅ stories table created successfully!')
      // Recheck tables
      await checkAllTables()
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`)
    }
  }

  const createAvatarsBucket = async () => {
    if (!user) {
      setStatus('❌ Please log in first')
      return
    }

    try {
      setIsCreatingBucket(true)
      setStatus('Creating avatars storage bucket...')
      
      // Create the avatars bucket
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (error) {
        setStatus(`❌ Error creating avatars bucket: ${error.message}`)
        console.error('Error creating bucket:', error)
        return
      }
      
      setStatus('✅ Avatars storage bucket created successfully!')
      // Recheck buckets
      await checkAllTables()
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`)
    } finally {
      setIsCreatingBucket(false)
    }
  }

  useEffect(() => {
    if (user) {
      checkAllTables()
    }
  }, [user])

  const getStatusIcon = (table: TableStatus) => {
    if (table.exists) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (table.error) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getBucketStatusIcon = (bucket: BucketStatus) => {
    if (bucket.exists) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (bucket.error) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const missingTables = tables.filter(t => !t.exists)
  const missingBuckets = buckets.filter(b => !b.exists)
  const trackingTableMissing = tables.find(t => t.name === 'user_tracking' && !t.exists)
  const storiesTableMissing = tables.find(t => t.name === 'stories' && !t.exists)
  const liveStreamsTableMissing = tables.find(t => t.name === 'live_streams' && !t.exists)
  const avatarsBucketMissing = buckets.find(b => b.name === 'avatars' && !b.exists)

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Database Setup</h1>
          <p className="text-gray-400">Check and setup required database tables</p>
        </div>

        {!user && (
          <Alert className="bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to check and setup the database.
            </AlertDescription>
          </Alert>
        )}

        {user && (
          <>
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Database Status
                  <Button 
                    onClick={checkAllTables} 
                    disabled={isChecking}
                    variant="outline"
                  >
                    {isChecking ? 'Checking...' : 'Refresh'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{status}</p>
                
                {tables.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold mb-3">Database Tables</h3>
                    {tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(table)}
                          <span className="font-medium">{table.name}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {table.exists ? 'Exists' : table.error ? 'Error' : 'Missing'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {buckets.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="text-lg font-semibold mb-3">Storage Buckets</h3>
                    {buckets.map((bucket) => (
                      <div key={bucket.name} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div className="flex items-center space-x-3">
                          {getBucketStatusIcon(bucket)}
                          <span className="font-medium">{bucket.name}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {bucket.exists ? 'Exists' : bucket.error ? 'Error' : 'Missing'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {trackingTableMissing && (
              <Card className="bg-yellow-900/20 border-yellow-700">
                <CardHeader>
                  <CardTitle>User Tracking Table Missing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>The user_tracking table is required for the tracking functionality to work.</p>
                  
                  <div className="space-y-4">
                    <Button onClick={createUserTrackingTable} className="w-full">
                      Try Auto-Create Table
                    </Button>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="font-semibold mb-2">Manual Setup Instructions:</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        If auto-creation fails, please run this SQL in your Supabase dashboard:
                      </p>
                      <pre className="bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`-- Create tracking table for user relationships
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

-- Grant permissions
GRANT ALL ON user_tracking TO authenticated;

-- Create view for tracking details
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

GRANT SELECT ON user_tracking_details TO authenticated;`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {storiesTableMissing && (
              <Card className="bg-yellow-900/20 border-yellow-700">
                <CardHeader>
                  <CardTitle>Stories Table Missing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>The stories table is required for the story publishing functionality to work.</p>
                  
                  <div className="space-y-4">
                    <Button onClick={createStoriesTable} className="w-full">
                      Try Auto-Create Stories Table
                    </Button>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="font-semibold mb-2">Manual Setup Instructions:</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        If auto-creation fails, please run this SQL in your Supabase dashboard:
                      </p>
                      <pre className="bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`-- Create stories table for temporary story content
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
  duration INTEGER DEFAULT 24 CHECK (duration > 0 AND duration <= 168),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies and indexes
CREATE POLICY "Users can view public stories" ON public.stories
  FOR SELECT USING (
    privacy = 'public' AND expires_at > NOW() AND
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

-- Create indexes
CREATE INDEX IF NOT EXISTS stories_user_id_idx ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS stories_expires_at_idx ON public.stories(expires_at);`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-yellow-900/20 border-yellow-700">
              <CardHeader>
                <CardTitle>Narrator Fields Missing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The narrator fields are required for the AI narrator functionality to work. Please execute the SQL below in your Supabase dashboard.</p>
                
                <div className="space-y-4">
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-semibold mb-2">Manual Setup Instructions:</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      If auto-creation fails, please run this SQL in your Supabase dashboard:
                    </p>
                    <pre className="bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`-- Step 1: Add narrator fields to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS narrator_audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_narrator_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_narrator_enabled BOOLEAN DEFAULT false;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_narrator_audio ON public.posts(narrator_audio_url);
CREATE INDEX IF NOT EXISTS idx_posts_video_narrator_enabled ON public.posts(video_narrator_enabled);
CREATE INDEX IF NOT EXISTS idx_posts_photo_narrator_enabled ON public.posts(photo_narrator_enabled);

-- Step 3: Drop and recreate the posts_with_details view
DROP VIEW IF EXISTS public.posts_with_details;

CREATE VIEW public.posts_with_details AS
SELECT 
  p.*,
  pr.display_name,
  pr.username,
  pr.avatar_url,
  pr.bio,
  COALESCE(l.like_count, 0) as like_count,
  COALESCE(c.comment_count, 0) as comment_count,
  EXISTS(
    SELECT 1 FROM public.likes 
    WHERE post_id = p.id AND user_id = auth.uid()
  ) as is_liked_by_user
FROM public.posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as like_count
  FROM public.likes
  GROUP BY post_id
) l ON p.id = l.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comment_count
  FROM public.comments
  GROUP BY post_id
) c ON p.id = c.post_id
ORDER BY p.created_at DESC;`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {liveStreamsTableMissing && (
              <Card className="bg-yellow-900/20 border-yellow-700">
                <CardHeader>
                  <CardTitle>Live Streams Table Missing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>The live_streams table is required for the live streaming functionality to work.</p>
                  
                  <div className="space-y-4">
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="font-semibold mb-2">Manual Setup Instructions:</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Please run this SQL in your Supabase dashboard:
                      </p>
                      <pre className="bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`-- Create live_streams table
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  thumbnail TEXT,
  viewers INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  tone TEXT,
  stream_key TEXT UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE,
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
GRANT ALL ON public.live_streams TO authenticated;`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {avatarsBucketMissing && (
              <Card className="bg-yellow-900/20 border-yellow-700">
                <CardHeader>
                  <CardTitle>Avatars Storage Bucket Missing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>The avatars storage bucket is required for profile image uploads to work.</p>
                  
                  <div className="space-y-4">
                    <Button 
                      onClick={createAvatarsBucket} 
                      className="w-full"
                      disabled={isCreatingBucket}
                    >
                      {isCreatingBucket ? 'Creating Bucket...' : 'Create Avatars Bucket'}
                    </Button>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="font-semibold mb-2">Manual Setup Instructions:</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        If auto-creation fails, please run this SQL in your Supabase dashboard:
                      </p>
                      <pre className="bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {missingTables.length > 0 && (
              <Alert className="bg-blue-900/20 border-blue-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {missingTables.length} table(s) are missing. Some features may not work correctly until all tables are created.
                </AlertDescription>
              </Alert>
            )}

            {missingBuckets.length > 0 && (
              <Alert className="bg-blue-900/20 border-blue-700">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {missingBuckets.length} storage bucket(s) are missing. Some features may not work correctly until all buckets are created.
                </AlertDescription>
              </Alert>
            )}

            {tables.length > 0 && buckets.length > 0 && missingTables.length === 0 && missingBuckets.length === 0 && (
              <Alert className="bg-green-900/20 border-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All required tables and storage buckets exist! Your database is properly configured.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  )
}