import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStory } from '@/context/StoryContext';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';

interface AICharacterGeneratorProps {
  onCharacterGenerated?: (character: {
    name: string;
    role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
    description: string;
    backstory: string;
    motivations: string[];
    traits: string[];
  }) => void;
}

export function AICharacterGenerator({ onCharacterGenerated }: AICharacterGeneratorProps) {
  const { currentProject, storyOverview, characters } = useStory();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState<any>(null);

  const generateCharacter = async () => {
    if (!currentProject || !summary.trim()) {
      toast({ title: 'Please provide a character summary', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedCharacter(null);

    try {
      const existingCharacterNames = characters.map(c => c.name).join(', ');
      const storyContext = `
Story: ${currentProject.title}
Concept: ${currentProject.concept}
Genre: ${currentProject.genre_influences?.join(', ') || 'General fiction'}
Tone: ${currentProject.tone_value < 0.3 ? 'Hopeful' : currentProject.tone_value > 0.7 ? 'Dark' : 'Balanced'}
${storyOverview?.narrative_intent ? `Narrative Intent: ${storyOverview.narrative_intent}` : ''}
${storyOverview?.setting_description ? `Setting: ${storyOverview.setting_description}` : ''}
Existing Characters: ${existingCharacterNames || 'None yet'}
      `.trim();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'generate_character',
          context: storyContext,
          summary: summary,
          settings: {
            temperature: settings.aiTemperature,
            model: settings.aiModel,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate character');
      }

      const data = await response.json();
      setGeneratedCharacter(data.character);
    } catch (error) {
      console.error('Character generation error:', error);
      toast({ title: 'Failed to generate character', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedCharacter && onCharacterGenerated) {
      onCharacterGenerated(generatedCharacter);
      setOpen(false);
      setSummary('');
      setGeneratedCharacter(null);
      toast({ title: 'Character added!' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wand2 className="h-4 w-4" /> AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Character Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!generatedCharacter ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Describe your character idea</label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g., 'A mysterious librarian who secretly protects forbidden knowledge' or 'The protagonist's estranged sister who returns with dark secrets'"
                  className="min-h-[120px] bg-secondary/30"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  AI will create a full character profile based on your story's world and existing characters.
                </p>
              </div>

              <Button onClick={generateCharacter} disabled={isGenerating || !summary.trim()} className="w-full">
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate Character</>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-display text-xl font-bold">{generatedCharacter.name}</h3>
                  <span className="text-sm text-primary capitalize">{generatedCharacter.role}</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-sm">{generatedCharacter.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Backstory</h4>
                  <p className="text-sm">{generatedCharacter.backstory}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Motivations</h4>
                    <ul className="text-sm list-disc list-inside">
                      {generatedCharacter.motivations?.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Traits</h4>
                    <ul className="text-sm list-disc list-inside">
                      {generatedCharacter.traits?.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setGeneratedCharacter(null)} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleAccept} className="flex-1">
                  <Sparkles className="h-4 w-4" /> Add Character
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
