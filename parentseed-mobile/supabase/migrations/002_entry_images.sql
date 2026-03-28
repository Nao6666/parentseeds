-- Add image_urls column to entries table
ALTER TABLE entries ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Create storage bucket for entry images
INSERT INTO storage.buckets (id, name, public)
VALUES ('entry-images', 'entry-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'entry-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to images
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'entry-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'entry-images' AND (storage.foldername(name))[1] = auth.uid()::text);
