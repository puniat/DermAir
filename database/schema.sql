-- Supabase Database Schema for DermAir
-- This schema supports up to 5000+ users with their data
-- Optimized for the free tier limits

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  skin_type TEXT CHECK (skin_type IN ('dry', 'oily', 'combination', 'sensitive')),
  age_range TEXT CHECK (age_range IN ('18-25', '26-35', '36-45', '46-55', '55+')),
  known_triggers TEXT[] DEFAULT '{}',
  triggers TEXT[] DEFAULT '{}',
  severity_history JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily check-ins table
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  itch_score INTEGER CHECK (itch_score >= 0 AND itch_score <= 10),
  redness_score INTEGER CHECK (redness_score >= 0 AND redness_score <= 10),
  triggers_today TEXT[] DEFAULT '{}',
  notes TEXT,
  weather_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training data table (shared across all users)
CREATE TABLE training_data (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'system', -- 'system' for shared data
  image_url TEXT NOT NULL,
  condition TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'synthetic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_date ON checkins(date);
CREATE INDEX idx_training_data_condition ON training_data(condition);
CREATE INDEX idx_training_data_source ON training_data(source);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Check-ins policies
CREATE POLICY "Users can view own checkins" ON checkins FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can insert own checkins" ON checkins FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own checkins" ON checkins FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Training data is readable by all (shared resource)
CREATE POLICY "Training data is readable by all" ON training_data FOR SELECT TO public USING (true);
CREATE POLICY "System can manage training data" ON training_data FOR ALL TO service_role USING (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage for images (using Supabase Storage)
-- This will be configured in the Supabase dashboard
-- Bucket: 'dermair-images'
-- Max file size: 10MB per image
-- Allowed file types: jpg, jpeg, png, webp
-- Public access: false (authenticated users only)

-- Sample data for testing (optional)
-- INSERT INTO training_data (id, condition, image_url, metadata, is_verified, source)
-- VALUES 
--   ('sample-1', 'normal', 'https://example.com/normal-skin.jpg', '{"verified": true}', true, 'demo'),
--   ('sample-2', 'acne', 'https://example.com/acne-skin.jpg', '{"verified": true}', true, 'demo');

-- Performance monitoring views (optional)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.created_at as user_created,
  COUNT(DISTINCT c.id) as total_checkins,
  COUNT(DISTINCT n.id) as total_notifications,
  MAX(c.created_at) as last_checkin
FROM users u
LEFT JOIN checkins c ON u.id = c.user_id
LEFT JOIN notifications n ON u.id = n.user_id
GROUP BY u.id, u.created_at;

-- Database size monitoring
CREATE OR REPLACE VIEW database_stats AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;