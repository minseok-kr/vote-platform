-- Vote Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories enum
CREATE TYPE poll_category AS ENUM (
  'tech',
  'sports',
  'entertainment',
  'politics',
  'lifestyle',
  'business',
  'other'
);

-- Poll status enum
CREATE TYPE poll_status AS ENUM (
  'active',
  'completed'
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  description TEXT,
  category poll_category DEFAULT 'other',
  status poll_status DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table (for tracking unique votes)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL, -- Browser fingerprint or IP hash
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate votes per poll
  UNIQUE(poll_id, visitor_id)
);

-- Indexes for performance
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_category ON polls(category);
CREATE INDEX idx_polls_expires_at ON polls(expires_at);
CREATE INDEX idx_polls_is_featured ON polls(is_featured);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_visitor_id ON votes(visitor_id);

-- Function to update poll total_votes
CREATE OR REPLACE FUNCTION update_poll_total_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE polls
  SET total_votes = (
    SELECT COALESCE(SUM(votes), 0)
    FROM poll_options
    WHERE poll_id = COALESCE(NEW.poll_id, OLD.poll_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.poll_id, OLD.poll_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update total_votes
CREATE TRIGGER trigger_update_poll_total_votes
AFTER INSERT OR UPDATE OR DELETE ON poll_options
FOR EACH ROW
EXECUTE FUNCTION update_poll_total_votes();

-- Function to increment option votes
CREATE OR REPLACE FUNCTION increment_option_votes(option_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE poll_options
  SET votes = votes + 1
  WHERE id = option_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-complete expired polls
CREATE OR REPLACE FUNCTION complete_expired_polls()
RETURNS void AS $$
BEGIN
  UPDATE polls
  SET status = 'completed', updated_at = NOW()
  WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read
CREATE POLICY "Polls are viewable by everyone"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Poll options are viewable by everyone"
  ON poll_options FOR SELECT
  USING (true);

-- Policies: Allow public insert for votes
CREATE POLICY "Anyone can vote"
  ON votes FOR INSERT
  WITH CHECK (true);

-- Policies: Allow public insert for polls (for create feature)
CREATE POLICY "Anyone can create polls"
  ON polls FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create poll options"
  ON poll_options FOR INSERT
  WITH CHECK (true);

-- View for polls with options and percentages
CREATE OR REPLACE VIEW polls_with_options AS
SELECT
  p.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', po.id,
        'text', po.text,
        'votes', po.votes,
        'percentage', CASE
          WHEN p.total_votes > 0
          THEN ROUND((po.votes::DECIMAL / p.total_votes) * 100, 1)
          ELSE 0
        END
      ) ORDER BY po.votes DESC
    ) FILTER (WHERE po.id IS NOT NULL),
    '[]'
  ) as options
FROM polls p
LEFT JOIN poll_options po ON p.id = po.poll_id
GROUP BY p.id;
