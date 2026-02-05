-- =============================================
-- LOOMY NARRATIVE OPERATING SYSTEM - CORE TABLES
-- =============================================

-- 1. STORY SNAPSHOTS - Immutable history of all state at each sync
CREATE TABLE public.story_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  chapter_number INTEGER,
  sync_number INTEGER NOT NULL DEFAULT 1,
  snapshot_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Snapshot contains immutable state:
  -- { characters: [...], lore: [...], outline: {...}, storyMap: {...}, stats: {...} }
  
  UNIQUE(project_id, chapter_id, sync_number)
);

-- Enable RLS
ALTER TABLE public.story_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own snapshots" 
ON public.story_snapshots FOR SELECT 
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own snapshots" 
ON public.story_snapshots FOR INSERT 
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own snapshots" 
ON public.story_snapshots FOR UPDATE 
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own snapshots" 
ON public.story_snapshots FOR DELETE 
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 2. CANON STATE - Compressed living truth for AI
CREATE TABLE public.canon_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Compressed canon data
  characters_canon JSONB NOT NULL DEFAULT '[]',
  world_canon JSONB NOT NULL DEFAULT '{}',
  plot_canon JSONB NOT NULL DEFAULT '{}',
  themes_canon JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  last_sync_snapshot_id UUID REFERENCES public.story_snapshots(id),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canon_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own canon" 
ON public.canon_state FOR SELECT 
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own canon" 
ON public.canon_state FOR INSERT 
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own canon" 
ON public.canon_state FOR UPDATE 
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own canon" 
ON public.canon_state FOR DELETE 
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- 3. EXTEND PROFILES with user preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_settings JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS editor_settings JSONB NOT NULL DEFAULT '{}';

-- Add trigger for canon_state updated_at
CREATE TRIGGER update_canon_state_updated_at
BEFORE UPDATE ON public.canon_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast snapshot lookups
CREATE INDEX idx_snapshots_project_chapter ON public.story_snapshots(project_id, chapter_id, sync_number DESC);
CREATE INDEX idx_snapshots_created ON public.story_snapshots(project_id, created_at DESC);