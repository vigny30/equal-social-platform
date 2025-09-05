-- Create storage bucket for posts media
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts-media', 'posts-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts-media' AND 
  auth.role() = 'authenticated'
);

-- Create policy to allow public access to files
CREATE POLICY "Allow public access to files" ON storage.objects
FOR SELECT USING (bucket_id = 'posts-media');

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts-media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);