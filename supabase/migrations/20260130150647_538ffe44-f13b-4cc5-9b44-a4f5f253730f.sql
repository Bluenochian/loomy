-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create projects table (main story container)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Story',
  concept TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  tone_value REAL NOT NULL DEFAULT 0.5,
  genre_influences TEXT[] DEFAULT '{}',
  inferred_genres JSONB DEFAULT '{}',
  narrative_rules JSONB DEFAULT '{}',
  theme_profile JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create projects policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create story overview table
CREATE TABLE public.story_overviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  narrative_intent TEXT,
  central_themes TEXT[],
  stakes TEXT,
  setting_description TEXT,
  time_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_overviews
ALTER TABLE public.story_overviews ENABLE ROW LEVEL SECURITY;

-- Create story_overviews policies
CREATE POLICY "Users can view their own story overviews" ON public.story_overviews FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_overviews.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own story overviews" ON public.story_overviews FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_overviews.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own story overviews" ON public.story_overviews FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_overviews.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own story overviews" ON public.story_overviews FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_overviews.project_id AND projects.user_id = auth.uid()));

-- Create outline table (acts, arcs, story structure)
CREATE TABLE public.outlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  structure JSONB NOT NULL DEFAULT '{"acts": []}',
  arcs JSONB DEFAULT '[]',
  conflicts JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on outlines
ALTER TABLE public.outlines ENABLE ROW LEVEL SECURITY;

-- Create outlines policies
CREATE POLICY "Users can view their own outlines" ON public.outlines FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = outlines.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own outlines" ON public.outlines FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = outlines.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own outlines" ON public.outlines FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = outlines.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own outlines" ON public.outlines FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = outlines.project_id AND projects.user_id = auth.uid()));

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  intent TEXT,
  content TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chapters
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Create chapters policies
CREATE POLICY "Users can view their own chapters" ON public.chapters FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own chapters" ON public.chapters FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own chapters" ON public.chapters FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own chapters" ON public.chapters FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid()));

-- Create characters table
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supporting',
  description TEXT,
  backstory TEXT,
  motivations TEXT[],
  traits TEXT[],
  arc JSONB DEFAULT '{}',
  relationships JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on characters
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Create characters policies
CREATE POLICY "Users can view their own characters" ON public.characters FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own characters" ON public.characters FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own characters" ON public.characters FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own characters" ON public.characters FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid()));

-- Create lore_entries table (world-building, rules, canon facts)
CREATE TABLE public.lore_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT,
  is_canon BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lore_entries
ALTER TABLE public.lore_entries ENABLE ROW LEVEL SECURITY;

-- Create lore_entries policies
CREATE POLICY "Users can view their own lore entries" ON public.lore_entries FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = lore_entries.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own lore entries" ON public.lore_entries FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = lore_entries.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own lore entries" ON public.lore_entries FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = lore_entries.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own lore entries" ON public.lore_entries FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = lore_entries.project_id AND projects.user_id = auth.uid()));

-- Create story_map_nodes table (visual node-based narrative flow)
CREATE TABLE public.story_map_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL DEFAULT 'event',
  title TEXT NOT NULL,
  description TEXT,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  linked_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  linked_character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  linked_lore_id UUID REFERENCES public.lore_entries(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_map_nodes
ALTER TABLE public.story_map_nodes ENABLE ROW LEVEL SECURITY;

-- Create story_map_nodes policies
CREATE POLICY "Users can view their own story map nodes" ON public.story_map_nodes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_nodes.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own story map nodes" ON public.story_map_nodes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_nodes.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own story map nodes" ON public.story_map_nodes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_nodes.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own story map nodes" ON public.story_map_nodes FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_nodes.project_id AND projects.user_id = auth.uid()));

-- Create story_map_edges table (connections between nodes)
CREATE TABLE public.story_map_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.story_map_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.story_map_nodes(id) ON DELETE CASCADE,
  edge_type TEXT DEFAULT 'sequence',
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on story_map_edges
ALTER TABLE public.story_map_edges ENABLE ROW LEVEL SECURITY;

-- Create story_map_edges policies
CREATE POLICY "Users can view their own story map edges" ON public.story_map_edges FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_edges.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create their own story map edges" ON public.story_map_edges FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_edges.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own story map edges" ON public.story_map_edges FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_edges.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own story map edges" ON public.story_map_edges FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = story_map_edges.project_id AND projects.user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_story_overviews_updated_at BEFORE UPDATE ON public.story_overviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_outlines_updated_at BEFORE UPDATE ON public.outlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lore_entries_updated_at BEFORE UPDATE ON public.lore_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_story_map_nodes_updated_at BEFORE UPDATE ON public.story_map_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();