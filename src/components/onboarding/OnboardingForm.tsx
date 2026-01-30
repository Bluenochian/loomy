import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GENRE_OPTIONS, LANGUAGE_OPTIONS } from '@/types/story';
import { Loader2, Sparkles, X, Feather, Globe, Palette } from 'lucide-react';

export function OnboardingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [concept, setConcept] = useState('');
  const [genreInfluences, setGenreInfluences] = useState<string[]>([]);
  const [language, setLanguage] = useState('English');
  const [toneValue, setToneValue] = useState([0.5]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleGenre = (genre: string) => {
    setGenreInfluences(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concept.trim()) {
      toast({
        title: 'Story concept required',
        description: 'Please describe your story idea',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to create a story',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: 'Untitled Story',
          concept: concept.trim(),
          language,
          tone_value: toneValue[0],
          genre_influences: genreInfluences,
          status: 'draft',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create initial story overview
      await supabase
        .from('story_overviews')
        .insert({
          project_id: project.id,
        });

      // Create initial outline
      await supabase
        .from('outlines')
        .insert({
          project_id: project.id,
          structure: { acts: [] },
          arcs: [],
          conflicts: [],
        });

      toast({
        title: 'Story created!',
        description: 'Generating your story world...',
      });

      // Navigate to the project and trigger AI generation
      navigate(`/project/${project.id}?generate=true`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error creating story',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Story Concept */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Feather className="h-5 w-5 text-primary" />
          <Label htmlFor="concept" className="text-lg font-display font-medium">
            Your Story Concept
          </Label>
        </div>
        <Textarea
          id="concept"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Describe your story idea... What world do you want to explore? Who are the characters? What conflict drives the narrative?"
          className="min-h-[160px] bg-secondary/30 border-border/50 focus:border-primary/50 text-base leading-relaxed resize-none"
          required
        />
        <p className="text-sm text-muted-foreground">
          Be as detailed as you like. The AI will analyze your concept to create a rich story world.
        </p>
      </div>

      {/* Genre Influences (Optional) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <Label className="text-lg font-display font-medium">
            Genre Influences
            <span className="text-muted-foreground font-normal text-sm ml-2">(optional)</span>
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Select genres to influence the style and tone. The AI will blend these with your story concept.
        </p>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <Badge
              key={genre}
              variant={genreInfluences.includes(genre) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all duration-200 ${
                genreInfluences.includes(genre)
                  ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30'
                  : 'hover:bg-secondary hover:border-primary/30'
              }`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
              {genreInfluences.includes(genre) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <Label className="text-lg font-display font-medium">
            Language
          </Label>
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full max-w-xs bg-secondary/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tone Slider */}
      <div className="space-y-4">
        <Label className="text-lg font-display font-medium">
          Narrative Tone
        </Label>
        <div className="space-y-3">
          <Slider
            value={toneValue}
            onValueChange={setToneValue}
            max={1}
            min={0}
            step={0.1}
            className="py-4"
          />
          <div className="flex justify-between text-sm">
            <span className={`transition-colors ${toneValue[0] < 0.3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              ☀️ Hopeful
            </span>
            <span className={`transition-colors ${toneValue[0] >= 0.3 && toneValue[0] <= 0.7 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              ⚖️ Balanced
            </span>
            <span className={`transition-colors ${toneValue[0] > 0.7 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              🌑 Dark
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="hero"
        size="xl"
        className="w-full"
        disabled={isCreating || !concept.trim()}
      >
        {isCreating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Weaving your story...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Begin Weaving
          </>
        )}
      </Button>
    </form>
  );
}
