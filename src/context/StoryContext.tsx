import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { 
  Project, 
  StoryOverview, 
  Outline, 
  Chapter, 
  Character, 
  LoreEntry,
  StoryMapNode,
  StoryMapEdge,
  ThemeProfile,
  InferredGenres,
  NarrativeRules,
  OutlineStructure,
  StoryArc,
  Conflict,
  CharacterArc,
  Relationship
} from '@/types/story';
import { useToast } from '@/hooks/use-toast';

interface StoryContextType {
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  // Story data
  storyOverview: StoryOverview | null;
  outline: Outline | null;
  chapters: Chapter[];
  characters: Character[];
  loreEntries: LoreEntry[];
  storyMapNodes: StoryMapNode[];
  storyMapEdges: StoryMapEdge[];
  
  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  
  // Actions
  loadProject: (projectId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // CRUD operations
  updateProject: (updates: Partial<Project>) => Promise<void>;
  updateStoryOverview: (updates: Partial<StoryOverview>) => Promise<void>;
  updateOutline: (updates: Partial<Outline>) => Promise<void>;
  
  addChapter: (chapter: Partial<Chapter>) => Promise<Chapter | null>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  
  addCharacter: (character: Partial<Character>) => Promise<Character | null>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  
  addLoreEntry: (entry: Partial<LoreEntry>) => Promise<LoreEntry | null>;
  updateLoreEntry: (id: string, updates: Partial<LoreEntry>) => Promise<void>;
  deleteLoreEntry: (id: string) => Promise<void>;
  
  addStoryMapNode: (node: Partial<StoryMapNode>) => Promise<StoryMapNode | null>;
  updateStoryMapNode: (id: string, updates: Partial<StoryMapNode>) => Promise<void>;
  deleteStoryMapNode: (id: string) => Promise<void>;
  
  addStoryMapEdge: (edge: Partial<StoryMapEdge>) => Promise<StoryMapEdge | null>;
  deleteStoryMapEdge: (id: string) => Promise<void>;
  
  // AI Generation
  setIsGenerating: (value: boolean) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Helper to safely parse JSON from database
function parseJson<T>(data: unknown, fallback: T): T {
  if (data === null || data === undefined) return fallback;
  if (typeof data === 'object') return data as T;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// Helper to convert to Json type for Supabase
function toJson(data: unknown): Json {
  return data as Json;
}

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [storyOverview, setStoryOverview] = useState<StoryOverview | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [storyMapNodes, setStoryMapNodes] = useState<StoryMapNode[]>([]);
  const [storyMapEdges, setStoryMapEdges] = useState<StoryMapEdge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
      // Load project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Transform project data
      const transformedProject: Project = {
        ...project,
        genre_influences: project.genre_influences || [],
        inferred_genres: parseJson<InferredGenres>(project.inferred_genres, {}),
        narrative_rules: parseJson<NarrativeRules>(project.narrative_rules, {}),
        theme_profile: parseJson<ThemeProfile>(project.theme_profile, {}),
        status: project.status as Project['status'],
      };
      
      setCurrentProject(transformedProject);
      
      // Load related data in parallel
      const [
        overviewResult,
        outlineResult,
        chaptersResult,
        charactersResult,
        loreResult,
        nodesResult,
        edgesResult,
      ] = await Promise.all([
        supabase.from('story_overviews').select('*').eq('project_id', projectId).single(),
        supabase.from('outlines').select('*').eq('project_id', projectId).single(),
        supabase.from('chapters').select('*').eq('project_id', projectId).order('chapter_number'),
        supabase.from('characters').select('*').eq('project_id', projectId).order('created_at'),
        supabase.from('lore_entries').select('*').eq('project_id', projectId).order('created_at'),
        supabase.from('story_map_nodes').select('*').eq('project_id', projectId),
        supabase.from('story_map_edges').select('*').eq('project_id', projectId),
      ]);
      
      if (overviewResult.data) {
        setStoryOverview(overviewResult.data as StoryOverview);
      }
      
      if (outlineResult.data) {
        const outlineData = outlineResult.data;
        setOutline({
          ...outlineData,
          structure: parseJson<OutlineStructure>(outlineData.structure, { acts: [] }),
          arcs: parseJson<StoryArc[]>(outlineData.arcs, []),
          conflicts: parseJson<Conflict[]>(outlineData.conflicts, []),
        } as Outline);
      }
      
      if (chaptersResult.data) {
        setChapters(chaptersResult.data.map(ch => ({
          ...ch,
          status: ch.status as Chapter['status'],
        })));
      }
      
      if (charactersResult.data) {
        setCharacters(charactersResult.data.map(char => ({
          ...char,
          role: char.role as Character['role'],
          arc: parseJson<CharacterArc>(char.arc, {}),
          relationships: parseJson<Relationship[]>(char.relationships, []),
        })));
      }
      
      if (loreResult.data) {
        setLoreEntries(loreResult.data.map(entry => ({
          ...entry,
          category: entry.category as LoreEntry['category'],
        })));
      }
      
      if (nodesResult.data) {
        setStoryMapNodes(nodesResult.data.map(node => ({
          ...node,
          node_type: node.node_type as StoryMapNode['node_type'],
          metadata: parseJson<Record<string, unknown>>(node.metadata, {}),
        })));
      }
      
      if (edgesResult.data) {
        setStoryMapEdges(edgesResult.data.map(edge => ({
          ...edge,
          edge_type: edge.edge_type as StoryMapEdge['edge_type'],
        })));
      }
      
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Error loading project',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshData = useCallback(async () => {
    if (currentProject) {
      await loadProject(currentProject.id);
    }
  }, [currentProject, loadProject]);

  // Update operations with proper JSON conversion
  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!currentProject) return;
    
    try {
      // Convert complex types to Json for Supabase
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.concept !== undefined) dbUpdates.concept = updates.concept;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.tone_value !== undefined) dbUpdates.tone_value = updates.tone_value;
      if (updates.genre_influences !== undefined) dbUpdates.genre_influences = updates.genre_influences;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.inferred_genres !== undefined) dbUpdates.inferred_genres = toJson(updates.inferred_genres);
      if (updates.narrative_rules !== undefined) dbUpdates.narrative_rules = toJson(updates.narrative_rules);
      if (updates.theme_profile !== undefined) dbUpdates.theme_profile = toJson(updates.theme_profile);
      
      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', currentProject.id);
      
      if (error) throw error;
      
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error updating project',
        variant: 'destructive',
      });
    }
  }, [currentProject, toast]);

  const updateStoryOverview = useCallback(async (updates: Partial<StoryOverview>) => {
    if (!currentProject || !storyOverview) return;
    
    try {
      const { error } = await supabase
        .from('story_overviews')
        .update(updates)
        .eq('id', storyOverview.id);
      
      if (error) throw error;
      
      setStoryOverview(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating story overview:', error);
      toast({
        title: 'Error updating story overview',
        variant: 'destructive',
      });
    }
  }, [currentProject, storyOverview, toast]);

  const updateOutline = useCallback(async (updates: Partial<Outline>) => {
    if (!currentProject || !outline) return;
    
    try {
      // Convert complex types to Json for Supabase
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.structure !== undefined) dbUpdates.structure = toJson(updates.structure);
      if (updates.arcs !== undefined) dbUpdates.arcs = toJson(updates.arcs);
      if (updates.conflicts !== undefined) dbUpdates.conflicts = toJson(updates.conflicts);
      
      const { error } = await supabase
        .from('outlines')
        .update(dbUpdates)
        .eq('id', outline.id);
      
      if (error) throw error;
      
      setOutline(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating outline:', error);
      toast({
        title: 'Error updating outline',
        variant: 'destructive',
      });
    }
  }, [currentProject, outline, toast]);

  // Chapter operations
  const addChapter = useCallback(async (chapter: Partial<Chapter>): Promise<Chapter | null> => {
    if (!currentProject) return null;
    
    try {
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          project_id: currentProject.id,
          chapter_number: chapter.chapter_number || chapters.length + 1,
          title: chapter.title || 'Untitled Chapter',
          intent: chapter.intent,
          content: chapter.content || '',
          word_count: chapter.word_count || 0,
          status: chapter.status || 'draft',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newChapter = { ...data, status: data.status as Chapter['status'] };
      setChapters(prev => [...prev, newChapter]);
      return newChapter;
    } catch (error) {
      console.error('Error adding chapter:', error);
      toast({
        title: 'Error adding chapter',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentProject, chapters.length, toast]);

  const updateChapter = useCallback(async (id: string, updates: Partial<Chapter>) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch));
    } catch (error) {
      console.error('Error updating chapter:', error);
      toast({
        title: 'Error updating chapter',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteChapter = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setChapters(prev => prev.filter(ch => ch.id !== id));
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: 'Error deleting chapter',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Character operations
  const addCharacter = useCallback(async (character: Partial<Character>): Promise<Character | null> => {
    if (!currentProject) return null;
    
    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          project_id: currentProject.id,
          name: character.name || 'New Character',
          role: character.role || 'supporting',
          description: character.description,
          backstory: character.backstory,
          motivations: character.motivations,
          traits: character.traits,
          arc: toJson(character.arc || {}),
          relationships: toJson(character.relationships || []),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newCharacter: Character = {
        ...data,
        role: data.role as Character['role'],
        arc: parseJson<CharacterArc>(data.arc, {}),
        relationships: parseJson<Relationship[]>(data.relationships, []),
      };
      setCharacters(prev => [...prev, newCharacter]);
      return newCharacter;
    } catch (error) {
      console.error('Error adding character:', error);
      toast({
        title: 'Error adding character',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentProject, toast]);

  const updateCharacter = useCallback(async (id: string, updates: Partial<Character>) => {
    try {
      // Convert complex types to Json for Supabase
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.backstory !== undefined) dbUpdates.backstory = updates.backstory;
      if (updates.motivations !== undefined) dbUpdates.motivations = updates.motivations;
      if (updates.traits !== undefined) dbUpdates.traits = updates.traits;
      if (updates.arc !== undefined) dbUpdates.arc = toJson(updates.arc);
      if (updates.relationships !== undefined) dbUpdates.relationships = toJson(updates.relationships);
      
      const { error } = await supabase
        .from('characters')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      setCharacters(prev => prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch));
    } catch (error) {
      console.error('Error updating character:', error);
      toast({
        title: 'Error updating character',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteCharacter = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCharacters(prev => prev.filter(ch => ch.id !== id));
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: 'Error deleting character',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Lore operations
  const addLoreEntry = useCallback(async (entry: Partial<LoreEntry>): Promise<LoreEntry | null> => {
    if (!currentProject) return null;
    
    try {
      const { data, error } = await supabase
        .from('lore_entries')
        .insert({
          project_id: currentProject.id,
          category: entry.category || 'general',
          title: entry.title || 'New Entry',
          content: entry.content,
          is_canon: entry.is_canon ?? true,
          tags: entry.tags,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newEntry: LoreEntry = {
        ...data,
        category: data.category as LoreEntry['category'],
      };
      setLoreEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('Error adding lore entry:', error);
      toast({
        title: 'Error adding lore entry',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentProject, toast]);

  const updateLoreEntry = useCallback(async (id: string, updates: Partial<LoreEntry>) => {
    try {
      const { error } = await supabase
        .from('lore_entries')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      setLoreEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (error) {
      console.error('Error updating lore entry:', error);
      toast({
        title: 'Error updating lore entry',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteLoreEntry = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('lore_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setLoreEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting lore entry:', error);
      toast({
        title: 'Error deleting lore entry',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Story Map operations
  const addStoryMapNode = useCallback(async (node: Partial<StoryMapNode>): Promise<StoryMapNode | null> => {
    if (!currentProject) return null;
    
    try {
      const { data, error } = await supabase
        .from('story_map_nodes')
        .insert({
          project_id: currentProject.id,
          node_type: node.node_type || 'event',
          title: node.title || 'New Node',
          description: node.description,
          position_x: node.position_x ?? 0,
          position_y: node.position_y ?? 0,
          linked_chapter_id: node.linked_chapter_id,
          linked_character_id: node.linked_character_id,
          linked_lore_id: node.linked_lore_id,
          metadata: toJson(node.metadata || {}),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newNode: StoryMapNode = {
        ...data,
        node_type: data.node_type as StoryMapNode['node_type'],
        metadata: parseJson<Record<string, unknown>>(data.metadata, {}),
      };
      setStoryMapNodes(prev => [...prev, newNode]);
      return newNode;
    } catch (error) {
      console.error('Error adding story map node:', error);
      toast({
        title: 'Error adding node',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentProject, toast]);

  const updateStoryMapNode = useCallback(async (id: string, updates: Partial<StoryMapNode>) => {
    try {
      // Convert complex types to Json for Supabase
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.node_type !== undefined) dbUpdates.node_type = updates.node_type;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.position_x !== undefined) dbUpdates.position_x = updates.position_x;
      if (updates.position_y !== undefined) dbUpdates.position_y = updates.position_y;
      if (updates.linked_chapter_id !== undefined) dbUpdates.linked_chapter_id = updates.linked_chapter_id;
      if (updates.linked_character_id !== undefined) dbUpdates.linked_character_id = updates.linked_character_id;
      if (updates.linked_lore_id !== undefined) dbUpdates.linked_lore_id = updates.linked_lore_id;
      if (updates.metadata !== undefined) dbUpdates.metadata = toJson(updates.metadata);
      
      const { error } = await supabase
        .from('story_map_nodes')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      setStoryMapNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    } catch (error) {
      console.error('Error updating story map node:', error);
      toast({
        title: 'Error updating node',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteStoryMapNode = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('story_map_nodes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStoryMapNodes(prev => prev.filter(n => n.id !== id));
      setStoryMapEdges(prev => prev.filter(e => e.source_node_id !== id && e.target_node_id !== id));
    } catch (error) {
      console.error('Error deleting story map node:', error);
      toast({
        title: 'Error deleting node',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const addStoryMapEdge = useCallback(async (edge: Partial<StoryMapEdge>): Promise<StoryMapEdge | null> => {
    if (!currentProject) return null;
    
    try {
      const { data, error } = await supabase
        .from('story_map_edges')
        .insert({
          project_id: currentProject.id,
          source_node_id: edge.source_node_id!,
          target_node_id: edge.target_node_id!,
          edge_type: edge.edge_type || 'sequence',
          label: edge.label,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newEdge: StoryMapEdge = {
        ...data,
        edge_type: data.edge_type as StoryMapEdge['edge_type'],
      };
      setStoryMapEdges(prev => [...prev, newEdge]);
      return newEdge;
    } catch (error) {
      console.error('Error adding story map edge:', error);
      toast({
        title: 'Error adding connection',
        variant: 'destructive',
      });
      return null;
    }
  }, [currentProject, toast]);

  const deleteStoryMapEdge = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('story_map_edges')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStoryMapEdges(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting story map edge:', error);
      toast({
        title: 'Error deleting connection',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const value: StoryContextType = {
    currentProject,
    setCurrentProject,
    storyOverview,
    outline,
    chapters,
    characters,
    loreEntries,
    storyMapNodes,
    storyMapEdges,
    isLoading,
    isGenerating,
    loadProject,
    refreshData,
    updateProject,
    updateStoryOverview,
    updateOutline,
    addChapter,
    updateChapter,
    deleteChapter,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addLoreEntry,
    updateLoreEntry,
    deleteLoreEntry,
    addStoryMapNode,
    updateStoryMapNode,
    deleteStoryMapNode,
    addStoryMapEdge,
    deleteStoryMapEdge,
    setIsGenerating,
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
}
