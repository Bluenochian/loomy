import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStory } from '@/context/StoryContext';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

interface AIGenerateButtonProps {
  type: 'lore' | 'outline' | 'arc' | 'conflict' | 'chapter';
  context?: string;
  onGenerated?: (content: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function AIGenerateButton({
  type,
  context = '',
  onGenerated,
  className,
  variant = 'outline',
  size = 'sm',
  children,
}: AIGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { currentProject, characters, loreEntries, outline, storyMapNodes, storyOverview } = useStory();
  const { settings } = useSettings();

  const generateContent = async () => {
    if (!settings.aiEnabled) {
      toast({ title: 'AI is disabled in settings', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const toneDescription = currentProject?.tone_value
        ? currentProject.tone_value < 0.3 ? 'hopeful' : currentProject.tone_value > 0.7 ? 'dark' : 'balanced'
        : 'balanced';
      const primaryGenre = currentProject?.inferred_genres?.primary || currentProject?.genre_influences?.[0] || 'literary fiction';

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'describe',
          content: getPromptForType(type, context),
          context: {
            storyTitle: currentProject?.title || 'Untitled',
            genre: primaryGenre,
            tone: toneDescription,
            characters: settings.aiUseCharacters ? characters.slice(0, 8).map(c => ({ name: c.name, role: c.role, traits: c.traits })) : [],
            lore: settings.aiUseLore ? loreEntries.slice(0, 8).map(l => ({ title: l.title, content: l.content || '' })) : [],
            outline: settings.aiUseOutline && outline ? { acts: outline.structure?.acts, arcs: outline.arcs } : undefined,
            storyMap: settings.aiUseStoryMap ? storyMapNodes.slice(0, 10).map(n => ({ title: n.title, type: n.node_type, description: n.description })) : [],
            narrativeIntent: storyOverview?.narrative_intent,
            stakes: storyOverview?.stakes,
          },
          settings: {
            useLore: settings.aiUseLore,
            useOutline: settings.aiUseOutline,
            useStoryMap: settings.aiUseStoryMap,
            useCharacters: settings.aiUseCharacters,
            temperature: settings.aiTemperature,
            model: settings.aiModel,
          },
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) content += delta;
          } catch {}
        }
      }

      if (content && onGenerated) {
        onGenerated(content.trim());
      }
      toast({ title: 'Content generated!' });
    } catch (e) {
      console.error('AI generate error:', e);
      toast({ title: e instanceof Error ? e.message : 'Generation failed', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={generateContent}
      disabled={isGenerating || !settings.aiEnabled}
      className={cn('gap-1', className)}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3" />
          {children || 'AI Generate'}
        </>
      )}
    </Button>
  );
}

function getPromptForType(type: string, context: string): string {
  switch (type) {
    case 'lore':
      return `Generate a detailed lore entry for the following topic. Include world-building details, history, and interesting facts that could be useful in the story:\n\n${context || 'Create an original lore entry for this story world.'}`;
    case 'outline':
      return `Generate a story outline structure with acts and key plot points based on:\n\n${context || 'Create an engaging three-act story structure.'}`;
    case 'arc':
      return `Generate a compelling story arc description that includes setup, rising action, climax, and resolution:\n\n${context || 'Create a character or subplot arc.'}`;
    case 'conflict':
      return `Generate a detailed conflict description including the nature of the conflict, involved parties, and potential resolutions:\n\n${context || 'Create an interesting story conflict.'}`;
    case 'chapter':
      return `Generate an opening or continuation for this chapter:\n\n${context || 'Create an engaging chapter opening.'}`;
    default:
      return context || 'Generate creative content for this story.';
  }
}
