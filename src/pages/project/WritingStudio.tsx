import { useStory } from '@/context/StoryContext';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Sparkles, RefreshCw, Maximize2, MessageSquare, Eye, Loader2, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AIAction = 'continue' | 'rewrite' | 'expand' | 'dialogue' | 'describe';

const AI_ACTION_ICONS = {
  continue: Sparkles,
  rewrite: RefreshCw,
  expand: Maximize2,
  dialogue: MessageSquare,
  describe: Eye,
} as const;

export default function WritingStudioPage() {
  const { t } = useTranslation();
  const { chapters, updateChapter, currentProject, characters, loreEntries } = useStory();
  const { toast } = useToast();
  
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(chapters[0]?.id || null);
  const [selectedText, setSelectedText] = useState('');
  const [aiAction, setAiAction] = useState<AIAction>('continue');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId);
  const totalWords = chapters.reduce((acc, ch) => acc + (ch.word_count || 0), 0);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  const generateWithAI = async () => {
    if (!currentProject) return;
    
    const contentToProcess = selectedText || selectedChapter?.content || '';
    if (!contentToProcess.trim()) {
      toast({ title: t('studio.selectTextFirst'), variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const toneDescription = currentProject.tone_value < 0.3 
        ? "hopeful and uplifting" 
        : currentProject.tone_value > 0.7 
          ? "dark and intense" 
          : "balanced";

      const genres = currentProject.inferred_genres;
      const primaryGenre = genres?.primary || currentProject.genre_influences?.[0] || 'literary fiction';

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: aiAction,
          content: contentToProcess,
          context: {
            storyTitle: currentProject.title,
            genre: primaryGenre,
            tone: toneDescription,
            characters: characters.slice(0, 5).map(c => ({
              name: c.name, role: c.role, traits: c.traits,
            })),
            lore: loreEntries.slice(0, 5).map(l => ({
              title: l.title, content: l.content || '',
            })),
            chapterTitle: selectedChapter?.title,
          },
          instructions: customPrompt || undefined,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to start AI generation');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let contentSoFar = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { contentSoFar += content; setGeneratedContent(contentSoFar); }
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }
      toast({ title: t('studio.contentGenerated') });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({ title: t('studio.generationFailed'), description: error instanceof Error ? error.message : t('auth.tryAgain'), variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const insertGeneratedContent = () => {
    if (!selectedChapter || !generatedContent) return;
    const currentContent = selectedChapter.content || '';
    const newContent = currentContent + (currentContent ? '\n\n' : '') + generatedContent;
    const wordCount = newContent.split(/\s+/).filter(Boolean).length;
    updateChapter(selectedChapter.id, { content: newContent, word_count: wordCount });
    setGeneratedContent('');
    setSelectedText('');
    toast({ title: t('studio.contentInserted') });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const AI_ACTIONS: AIAction[] = ['continue', 'rewrite', 'expand', 'dialogue', 'describe'];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <PenTool className="h-6 w-6 text-primary" /> {t('studio.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalWords.toLocaleString()} {t('studio.wordsAcross')} {chapters.length} {t('nav.chapters').toLowerCase()}
            </p>
          </div>
          <Select value={selectedChapterId || undefined} onValueChange={setSelectedChapterId}>
            <SelectTrigger className="w-64 bg-secondary/50">
              <SelectValue placeholder={t('studio.selectChapter')} />
            </SelectTrigger>
            <SelectContent>
              {chapters.map(ch => (
                <SelectItem key={ch.id} value={ch.id}>
                  {t('chapters.chapterNumber', { number: ch.chapter_number })}: {ch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          {selectedChapter ? (
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-xl font-semibold mb-4">{selectedChapter.title}</h2>
              <Textarea
                value={selectedChapter.content || ''}
                onChange={(e) => {
                  const content = e.target.value;
                  const wordCount = content.split(/\s+/).filter(Boolean).length;
                  updateChapter(selectedChapter.id, { content, word_count: wordCount });
                }}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                placeholder={t('studio.beginWriting')}
                className="min-h-[500px] bg-secondary/20 font-display text-lg leading-relaxed resize-none prose-narrative"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {selectedChapter.word_count?.toLocaleString() || 0} {t('common.words')}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <PenTool className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('studio.createChapters')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-96 border-l border-border p-6 overflow-auto bg-card/50">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> {t('studio.aiAssistant')}
          </h3>

          {selectedText && (
            <Card className="p-3 mb-4 bg-secondary/30 border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">{t('studio.selectedText')}</p>
              <p className="text-sm line-clamp-3 italic">"{selectedText}"</p>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            {AI_ACTIONS.map(action => {
              const Icon = AI_ACTION_ICONS[action];
              return (
                <Button
                  key={action}
                  variant={aiAction === action ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAiAction(action)}
                  className={cn("flex flex-col items-center gap-1 h-auto py-3", aiAction === action && "glow-subtle")}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{t(`studio.aiActions.${action}`)}</span>
                </Button>
              );
            })}
          </div>

          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={t('studio.instructionsPlaceholder')}
            className="mb-4 bg-secondary/30 text-sm h-20 resize-none"
          />

          <Button onClick={generateWithAI} disabled={isGenerating || !selectedChapter} className="w-full mb-4">
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {t('studio.generating')}</>
            ) : (
              <><Sparkles className="h-4 w-4" /> {t('studio.generateWithAI')}</>
            )}
          </Button>

          {generatedContent && (
            <Card className="p-4 bg-secondary/30 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{t('studio.generatedContent')}</p>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="prose-narrative text-sm max-h-64 overflow-auto mb-3">{generatedContent}</div>
              <Button onClick={insertGeneratedContent} size="sm" className="w-full">{t('studio.insertIntoChapter')}</Button>
            </Card>
          )}

          <div className="mt-6 p-4 rounded-lg bg-muted/30">
            <h4 className="text-sm font-medium mb-2">{t('studio.tips')}</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• {t('studio.tip1')}</li>
              <li>• {t('studio.tip2')}</li>
              <li>• {t('studio.tip3')}</li>
              <li>• {t('studio.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}