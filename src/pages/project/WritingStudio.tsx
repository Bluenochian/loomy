import { useStory } from '@/context/StoryContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenTool, Sparkles, RefreshCw, Maximize2, MessageSquare, Eye, Loader2, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AIAction = 'continue' | 'rewrite' | 'expand' | 'dialogue' | 'describe';

const AI_ACTIONS = [
  { value: 'continue', label: 'Continue', icon: Sparkles, description: 'Write the next paragraphs' },
  { value: 'rewrite', label: 'Rewrite', icon: RefreshCw, description: 'Improve the passage' },
  { value: 'expand', label: 'Expand', icon: Maximize2, description: 'Add more detail' },
  { value: 'dialogue', label: 'Dialogue', icon: MessageSquare, description: 'Create a scene' },
  { value: 'describe', label: 'Describe', icon: Eye, description: 'Vivid descriptions' },
] as const;

export default function WritingStudioPage() {
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
      toast({ title: 'Select text or write content first', variant: 'destructive' });
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
              name: c.name,
              role: c.role,
              traits: c.traits,
            })),
            lore: loreEntries.slice(0, 5).map(l => ({
              title: l.title,
              content: l.content || '',
            })),
            chapterTitle: selectedChapter?.title,
          },
          instructions: customPrompt || undefined,
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to start AI generation');
      }

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
            if (content) {
              contentSoFar += content;
              setGeneratedContent(contentSoFar);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast({ title: 'Content generated!' });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({ 
        title: 'Generation failed', 
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const insertGeneratedContent = () => {
    if (!selectedChapter || !generatedContent) return;
    
    const currentContent = selectedChapter.content || '';
    const newContent = currentContent + (currentContent ? '\n\n' : '') + generatedContent;
    const wordCount = newContent.split(/\s+/).filter(Boolean).length;
    
    updateChapter(selectedChapter.id, { 
      content: newContent,
      word_count: wordCount 
    });
    
    setGeneratedContent('');
    setSelectedText('');
    toast({ title: 'Content inserted!' });
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <PenTool className="h-6 w-6 text-primary" /> Writing Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalWords.toLocaleString()} words across {chapters.length} chapters
            </p>
          </div>
          <Select value={selectedChapterId || undefined} onValueChange={setSelectedChapterId}>
            <SelectTrigger className="w-64 bg-secondary/50">
              <SelectValue placeholder="Select chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map(ch => (
                <SelectItem key={ch.id} value={ch.id}>
                  Ch. {ch.chapter_number}: {ch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
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
                placeholder="Begin writing your story..."
                className="min-h-[500px] bg-secondary/20 font-display text-lg leading-relaxed resize-none prose-narrative"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {selectedChapter.word_count?.toLocaleString() || 0} words
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <PenTool className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Create chapters to start writing</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        <div className="w-96 border-l border-border p-6 overflow-auto bg-card/50">
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Assistant
          </h3>

          {/* Selected Text Preview */}
          {selectedText && (
            <Card className="p-3 mb-4 bg-secondary/30 border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Selected text:</p>
              <p className="text-sm line-clamp-3 italic">"{selectedText}"</p>
            </Card>
          )}

          {/* AI Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {AI_ACTIONS.map(action => (
              <Button
                key={action.value}
                variant={aiAction === action.value ? "default" : "outline"}
                size="sm"
                onClick={() => setAiAction(action.value)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-3",
                  aiAction === action.value && "glow-subtle"
                )}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Custom Instructions */}
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific instructions (optional)..."
            className="mb-4 bg-secondary/30 text-sm h-20 resize-none"
          />

          {/* Generate Button */}
          <Button 
            onClick={generateWithAI} 
            disabled={isGenerating || !selectedChapter}
            className="w-full mb-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>

          {/* Generated Content */}
          {generatedContent && (
            <Card className="p-4 bg-secondary/30 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Generated content:</p>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="prose-narrative text-sm max-h-64 overflow-auto mb-3">
                {generatedContent}
              </div>
              <Button 
                onClick={insertGeneratedContent} 
                size="sm" 
                className="w-full"
              >
                Insert into Chapter
              </Button>
            </Card>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30">
            <h4 className="text-sm font-medium mb-2">Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Select text in the editor to transform it</li>
              <li>• Use "Continue" to write the next paragraphs</li>
              <li>• "Expand" adds sensory details and depth</li>
              <li>• AI respects your characters and lore</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
