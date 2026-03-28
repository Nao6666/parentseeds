-- Entries table for emotion journal entries
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,                          -- YYYY-MM-DD in JST
  emotions TEXT[] NOT NULL,                    -- Array of emotion labels
  content TEXT NOT NULL,                       -- Journal entry text
  "aiAdvice" TEXT,                             -- AI-generated advice (nullable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only insert their own entries
CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only view their own entries
CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only update their own entries
CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own entries
CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);
