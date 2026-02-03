// STORYLOOM Type Definitions

export interface Project {
  id: string;
  user_id: string;
  title: string;
  concept: string;
  language: string;
  tone_value: number;
  genre_influences: string[];
  inferred_genres: InferredGenres;
  narrative_rules: NarrativeRules;
  theme_profile: ThemeProfile;
  status: 'draft' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface InferredGenres {
  primary?: string;
  secondary?: string[];
  weights?: Record<string, number>;
}

export interface NarrativeRules {
  constraints?: string[];
  tone_guidelines?: string[];
  pacing_profile?: 'slow' | 'medium' | 'fast' | 'variable';
}

export interface ThemeProfile {
  themeId?: string;
  subThemeId?: string;
  colorPalette?: {
    primary: string;
    secondary?: string;
    accent: string;
    background?: string;
  };
  typography?: {
    displayFont: string;
    bodyFont: string;
  };
  visualStyle?: {
    texture: 'paper' | 'digital' | 'grunge' | 'clean';
    motionIntensity: 'subtle' | 'moderate' | 'dynamic';
    depth: 'flat' | 'layered' | 'immersive';
  };
  mood?: string;
}

export interface StoryOverview {
  id: string;
  project_id: string;
  narrative_intent: string | null;
  central_themes: string[] | null;
  stakes: string | null;
  setting_description: string | null;
  time_period: string | null;
  created_at: string;
  updated_at: string;
}

export interface Outline {
  id: string;
  project_id: string;
  structure: OutlineStructure;
  arcs: StoryArc[];
  conflicts: Conflict[];
  created_at: string;
  updated_at: string;
}

export interface OutlineStructure {
  acts: Act[];
}

export interface Act {
  id: string;
  number: number;
  title: string;
  description: string;
  chapters: string[]; // chapter IDs
}

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'subplot' | 'character';
  status: 'setup' | 'rising' | 'climax' | 'falling' | 'resolution';
}

export interface Conflict {
  id: string;
  type: 'internal' | 'external' | 'interpersonal' | 'societal';
  description: string;
  characters: string[]; // character IDs
  resolution?: string;
}

export interface Chapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  intent: string | null;
  content: string;
  word_count: number;
  status: 'draft' | 'in_progress' | 'complete' | 'revision';
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string | null;
  backstory: string | null;
  motivations: string[] | null;
  traits: string[] | null;
  arc: CharacterArc;
  relationships: Relationship[];
  created_at: string;
  updated_at: string;
}

export interface CharacterArc {
  startingState?: string;
  desiredChange?: string;
  keyMoments?: string[];
  endingState?: string;
}

export interface Relationship {
  characterId: string;
  characterName: string;
  type: string;
  description: string;
  dynamic: 'positive' | 'negative' | 'complex' | 'neutral';
}

export interface LoreEntry {
  id: string;
  project_id: string;
  category: 'world' | 'magic' | 'technology' | 'culture' | 'history' | 'rules' | 'general';
  title: string;
  content: string | null;
  is_canon: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface StoryMapNode {
  id: string;
  project_id: string;
  node_type: 'event' | 'character' | 'location' | 'item' | 'concept' | 'chapter';
  title: string;
  description: string | null;
  position_x: number;
  position_y: number;
  linked_chapter_id: string | null;
  linked_character_id: string | null;
  linked_lore_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StoryMapEdge {
  id: string;
  project_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: 'sequence' | 'cause' | 'reference' | 'conflict';
  label: string | null;
  created_at: string;
}

// Genre definitions for UI
export const GENRE_OPTIONS = [
  'Fantasy',
  'Sci-Fi',
  'Thriller',
  'Romance',
  'Horror',
  'Mystery',
  'Adventure',
  'Literary Fiction',
  'Historical',
  'Dystopian',
  'Urban Fantasy',
  'Space Opera',
] as const;

export type GenreOption = typeof GENRE_OPTIONS[number];

// Language options for AI-generated story content
export const LANGUAGE_OPTIONS = [
  'English',
  'Turkish',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Japanese',
  'Chinese',
  'Korean',
  'Arabic',
] as const;

export type LanguageOption = typeof LANGUAGE_OPTIONS[number];
