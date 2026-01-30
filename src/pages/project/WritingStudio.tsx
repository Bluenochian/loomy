import { useStory } from '@/context/StoryContext';
import { Textarea } from '@/components/ui/textarea';
import { PenTool } from 'lucide-react';

export default function WritingStudioPage() {
  const { chapters, updateChapter } = useStory();
  const fullManuscript = chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n---\n\n');
  const totalWords = chapters.reduce((acc, ch) => acc + (ch.word_count || 0), 0);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <PenTool className="h-6 w-6 text-primary" /> Writing Studio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{totalWords.toLocaleString()} words across {chapters.length} chapters</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {chapters.length === 0 ? (
            <div className="text-center py-16">
              <PenTool className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Create chapters to start writing your manuscript</p>
            </div>
          ) : (
            <div className="prose-narrative whitespace-pre-wrap">{fullManuscript}</div>
          )}
        </div>
      </div>
    </div>
  );
}
