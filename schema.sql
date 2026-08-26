-- Models table
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  thumbnail TEXT,
  videos_count INTEGER DEFAULT 0
);

-- Resolution lookup table (for UI/Filtering reference)
CREATE TABLE IF NOT EXISTS resolutions (
  id TEXT PRIMARY KEY, -- e.g., '4k', '1080p', '720p'
  label TEXT NOT NULL   -- e.g., '4K Ultra HD', 'Full HD'
);

-- Orientation lookup table (for UI/Filtering reference)
CREATE TABLE IF NOT EXISTS orientations (
  id TEXT PRIMARY KEY, -- e.g., 'landscape', 'portrait'
  label TEXT NOT NULL
);

-- Videos table with direct resolution and orientation columns
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT CHECK(type IN ('onlyfans', 'normal')) DEFAULT 'normal',
  model_id TEXT,
  duration INTEGER, -- total seconds
  views INTEGER DEFAULT 0,
  thumbnail TEXT,
  hover_preview_url TEXT,
  resolution TEXT DEFAULT '1080p', -- Direct column
  orientation TEXT DEFAULT 'landscape', -- Direct column
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Join table for video tags
CREATE TABLE IF NOT EXISTS video_tags (
  video_id TEXT,
  tag_id TEXT,
  PRIMARY KEY (video_id, tag_id),
  FOREIGN KEY (video_id) REFERENCES videos(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- Performance Indexes for reducing D1 rows read and query times
CREATE INDEX IF NOT EXISTS idx_videos_model_id ON videos(model_id);
CREATE INDEX IF NOT EXISTS idx_videos_published_created ON videos(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag_id ON video_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_video_id ON video_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Seed lookup values
INSERT OR IGNORE INTO resolutions (id, label) VALUES 
('4k', '4K Ultra HD'),
('1080p', '1080p Full HD'),
('720p', '720p HD'),
('360p', '360p SD');

INSERT OR IGNORE INTO orientations (id, label) VALUES 
('landscape', 'Landscape (16:9)'),
('portrait', 'Portrait (9:16)'),
('square', 'Square (1:1)');