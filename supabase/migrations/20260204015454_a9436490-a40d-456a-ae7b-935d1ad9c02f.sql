-- Create element_timeline table to track changes to story elements per chapter
CREATE TABLE public.element_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  element_type TEXT NOT NULL CHECK (element_type IN ('character', 'lore', 'setting', 'theme', 'technology', 'magic', 'event', 'rule')),
  element_id UUID,
  element_name TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('introduced', 'updated', 'removed', 'referenced')),
  previous_state JSONB,
  new_state JSONB,
  description TEXT,
  chapter_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_element_timeline_project ON public.element_timeline(project_id);
CREATE INDEX idx_element_timeline_chapter ON public.element_timeline(chapter_id);
CREATE INDEX idx_element_timeline_element ON public.element_timeline(element_type, element_id);
CREATE INDEX idx_element_timeline_chapter_number ON public.element_timeline(project_id, chapter_number);

-- Enable RLS
ALTER TABLE public.element_timeline ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own timeline entries"
ON public.element_timeline
FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create timeline entries for their projects"
ON public.element_timeline
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own timeline entries"
ON public.element_timeline
FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own timeline entries"
ON public.element_timeline
FOR DELETE
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);