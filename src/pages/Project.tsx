import { useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useStory } from '@/context/StoryContext';
import { useAuth } from '@/context/AuthContext';
import { ProjectLayout } from '@/components/layout/ProjectLayout';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    currentProject, 
    loadProject, 
    isLoading, 
    isGenerating, 
    setIsGenerating,
    refreshData 
  } = useStory();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Load project data
  useEffect(() => {
    if (projectId && user) {
      loadProject(projectId);
    }
  }, [projectId, user, loadProject]);

  // Handle AI generation on first load
  const generateStoryContent = useCallback(async () => {
    if (!currentProject || isGenerating) return;

    setIsGenerating(true);
    toast({
      title: 'Generating your story world...',
      description: 'This may take a moment. The AI is crafting your narrative foundation.',
    });

    try {
      const response = await supabase.functions.invoke('generate-story', {
        body: {
          type: 'full_generation',
          projectData: {
            concept: currentProject.concept,
            language: currentProject.language,
            tone_value: currentProject.tone_value,
            genre_influences: currentProject.genre_influences,
          },
        },
      });

      if (response.error) throw response.error;
      
      const result = response.data?.result;
      if (!result) throw new Error('No result from AI');

      // Update project with inferred genres and theme
      await supabase
        .from('projects')
        .update({
          inferred_genres: result.inferred_genres as Json,
          theme_profile: result.theme_profile as Json,
          title: result.story_overview?.narrative_intent?.split('.')[0]?.substring(0, 50) || 'Untitled Story',
        })
        .eq('id', currentProject.id);

      // Update story overview
      await supabase
        .from('story_overviews')
        .update({
          narrative_intent: result.story_overview?.narrative_intent,
          central_themes: result.story_overview?.central_themes,
          stakes: result.story_overview?.stakes,
          setting_description: result.story_overview?.setting_description,
          time_period: result.story_overview?.time_period,
        })
        .eq('project_id', currentProject.id);

      // Update outline
      const acts = result.outline?.acts?.map((act: { number: number; title: string; description: string }, index: number) => ({
        id: crypto.randomUUID(),
        number: act.number || index + 1,
        title: act.title,
        description: act.description,
        chapters: [],
      })) || [];

      const arcs = result.outline?.arcs?.map((arc: { name: string; description: string; type: string }) => ({
        id: crypto.randomUUID(),
        name: arc.name,
        description: arc.description,
        type: arc.type,
        status: 'setup',
      })) || [];

      const conflicts = result.outline?.conflicts?.map((conflict: { type: string; description: string; characters: string[] }) => ({
        id: crypto.randomUUID(),
        type: conflict.type,
        description: conflict.description,
        characters: conflict.characters,
      })) || [];

      await supabase
        .from('outlines')
        .update({
          structure: { acts } as Json,
          arcs: arcs as Json,
          conflicts: conflicts as Json,
        })
        .eq('project_id', currentProject.id);

      // Create chapters
      if (result.chapters?.length > 0) {
        const chaptersToInsert = result.chapters.map((ch: { chapter_number: number; title: string; intent: string }) => ({
          project_id: currentProject.id,
          chapter_number: ch.chapter_number,
          title: ch.title,
          intent: ch.intent,
          content: '',
          word_count: 0,
          status: 'draft',
        }));

        await supabase.from('chapters').insert(chaptersToInsert);
      }

      // Create characters
      if (result.characters?.length > 0) {
        const charactersToInsert = result.characters.map((char: { 
          name: string; 
          role: string; 
          description: string; 
          backstory: string;
          motivations: string[];
          traits: string[];
          arc: { startingState?: string; desiredChange?: string; endingState?: string };
        }) => ({
          project_id: currentProject.id,
          name: char.name,
          role: char.role,
          description: char.description,
          backstory: char.backstory,
          motivations: char.motivations,
          traits: char.traits,
          arc: char.arc as Json,
          relationships: [] as Json,
        }));

        await supabase.from('characters').insert(charactersToInsert);
      }

      // Create lore entries
      if (result.lore_entries?.length > 0) {
        const loreToInsert = result.lore_entries.map((entry: { 
          category: string; 
          title: string; 
          content: string;
          tags: string[];
        }) => ({
          project_id: currentProject.id,
          category: entry.category,
          title: entry.title,
          content: entry.content,
          is_canon: true,
          tags: entry.tags,
        }));

        await supabase.from('lore_entries').insert(loreToInsert);
      }

      // Create story map nodes for main characters and key events
      const nodesToInsert = [];
      
      // Add character nodes
      if (result.characters?.length > 0) {
        result.characters.slice(0, 4).forEach((char: { name: string; description: string }, index: number) => {
          nodesToInsert.push({
            project_id: currentProject.id,
            node_type: 'character',
            title: char.name,
            description: char.description,
            position_x: 100 + (index % 2) * 200,
            position_y: 100 + Math.floor(index / 2) * 150,
            metadata: {} as Json,
          });
        });
      }

      // Add event nodes for each act
      if (result.outline?.acts?.length > 0) {
        result.outline.acts.forEach((act: { title: string; description: string }, index: number) => {
          nodesToInsert.push({
            project_id: currentProject.id,
            node_type: 'event',
            title: act.title,
            description: act.description,
            position_x: 500 + index * 200,
            position_y: 200,
            metadata: {} as Json,
          });
        });
      }

      if (nodesToInsert.length > 0) {
        await supabase.from('story_map_nodes').insert(nodesToInsert);
      }

      toast({
        title: 'Story world created!',
        description: 'Your narrative foundation is ready. Explore your dashboard.',
      });

      // Refresh data and clear the generate param
      await refreshData();
      setSearchParams({});
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [currentProject, isGenerating, setIsGenerating, toast, refreshData, setSearchParams]);

  // Trigger generation if needed
  useEffect(() => {
    const shouldGenerate = searchParams.get('generate') === 'true';
    if (shouldGenerate && currentProject && !isGenerating) {
      generateStoryContent();
    }
  }, [searchParams, currentProject, isGenerating, generateStoryContent]);

  if (authLoading || isLoading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your story...</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
          <div className="relative">
            <Sparkles className="h-16 w-16 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold">Weaving Your Story World</h2>
          <p className="text-muted-foreground">
            The AI is analyzing your concept and creating characters, lore, 
            plot structure, and a visual theme that matches your narrative...
          </p>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Check if we're at the base project route
  const isBaseRoute = location.pathname === `/project/${projectId}` || location.pathname === `/project/${projectId}/`;

  return (
    <ProjectLayout projectId={projectId!}>
      {isBaseRoute ? (
        <Dashboard />
      ) : (
        <Outlet />
      )}
    </ProjectLayout>
  );
}

// Inline Dashboard component for the base route
function Dashboard() {
  const { 
    currentProject, 
    storyOverview, 
    chapters, 
    characters, 
    loreEntries 
  } = useStory();

  if (!currentProject) return null;

  const wordCount = chapters.reduce((acc, ch) => acc + (ch.word_count || 0), 0);
  const completedChapters = chapters.filter(ch => ch.status === 'complete').length;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">{currentProject.title}</h1>
        <p className="text-muted-foreground">{currentProject.concept}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Chapters</p>
          <p className="text-2xl font-bold">{chapters.length}</p>
          <p className="text-xs text-muted-foreground">{completedChapters} complete</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Characters</p>
          <p className="text-2xl font-bold">{characters.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Lore Entries</p>
          <p className="text-2xl font-bold">{loreEntries.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Word Count</p>
          <p className="text-2xl font-bold">{wordCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Story Overview */}
      {storyOverview && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-display text-lg font-semibold mb-3">Narrative Intent</h2>
            <p className="text-muted-foreground leading-relaxed">
              {storyOverview.narrative_intent || 'Not yet defined'}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="font-display text-lg font-semibold mb-3">Stakes</h2>
            <p className="text-muted-foreground leading-relaxed">
              {storyOverview.stakes || 'Not yet defined'}
            </p>
          </div>
        </div>
      )}

      {/* Genres */}
      {currentProject.inferred_genres?.primary && (
        <div className="p-6 rounded-xl bg-card border border-border mb-8">
          <h2 className="font-display text-lg font-semibold mb-3">Inferred Genres</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {currentProject.inferred_genres.primary}
            </span>
            {currentProject.inferred_genres.secondary?.map((genre) => (
              <span key={genre} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Themes */}
      {storyOverview?.central_themes && storyOverview.central_themes.length > 0 && (
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="font-display text-lg font-semibold mb-3">Central Themes</h2>
          <div className="flex flex-wrap gap-2">
            {storyOverview.central_themes.map((theme, index) => (
              <span key={index} className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
