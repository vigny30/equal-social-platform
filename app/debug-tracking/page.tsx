"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugTrackingPage() {
  const [status, setStatus] = useState<string>('Checking...')
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const { user } = useAuth()

  const checkTableExists = async () => {
    try {
      setStatus('Checking if user_tracking table exists...')
      
      // Try to query the table
      const { data, error } = await supabase
        .from('user_tracking')
        .select('id')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('user_tracking')) {
          setTableExists(false)
          setStatus('❌ user_tracking table does NOT exist')
        } else {
          setTableExists(false)
          setStatus(`❌ Error: ${error.message}`)
        }
      } else {
        setTableExists(true)
        setStatus('✅ user_tracking table exists!')
      }
    } catch (err: any) {
      setTableExists(false)
      setStatus(`❌ Unexpected error: ${err.message}`)
    }
  }

  const testTrackingOperation = async () => {
    if (!user || !tableExists) {
      setStatus('❌ Cannot test - user not logged in or table missing')
      return
    }

    try {
      setStatus('Testing tracking operation...')
      
      // Try to insert a test record
      const testUserId = '00000000-0000-0000-0000-000000000000' // dummy UUID
      
      const { error: insertError } = await supabase
        .from('user_tracking')
        .insert({
          follower_id: user.id,
          following_id: testUserId
        })
      
      if (insertError) {
        setStatus(`❌ Insert failed: ${insertError.message}`)
        return
      }
      
      // Try to delete the test record
      const { error: deleteError } = await supabase
        .from('user_tracking')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', testUserId)
      
      if (deleteError) {
        setStatus(`❌ Delete failed: ${deleteError.message}`)
        return
      }
      
      setStatus('✅ Tracking operations work correctly!')
    } catch (err: any) {
      setStatus(`❌ Test failed: ${err.message}`)
    }
  }

  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.id,
        email: user.email
      })
      checkTableExists()
    } else {
      setStatus('❌ User not logged in')
    }
  }, [user])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Tracking Debug Page</h1>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            {userInfo ? (
              <div className="space-y-2">
                <p><strong>User ID:</strong> {userInfo.id}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
              </div>
            ) : (
              <p>Not logged in</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{status}</p>
            <div className="space-x-4">
              <Button onClick={checkTableExists} variant="outline">
                Check Table
              </Button>
              {tableExists && (
                <Button onClick={testTrackingOperation} variant="outline">
                  Test Operations
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!tableExists && tableExists !== null && (
          <Card className="bg-red-900/20 border-red-700">
            <CardHeader>
              <CardTitle>Setup Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">The user_tracking table needs to be created. Please run this SQL in your Supabase dashboard:</p>
              <pre className="bg-gray-800 p-4 rounded text-sm overflow-x-auto">
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
GRANT ALL ON user_tracking TO authenticated;`}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}