import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ChaptersPage() {
  const { chapters, addChapter, updateChapter, deleteChapter } = useStory();
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddChapter = async () => {
    setIsAdding(true);
    const chapter = await addChapter({
      title: `Chapter ${chapters.length + 1}`,
      chapter_number: chapters.length + 1,
    });
    if (chapter) {
      setSelectedChapter(chapter.id);
      toast({ title: 'Chapter created' });
    }
    setIsAdding(false);
  };

  const handleDeleteChapter = async (id: string) => {
    await deleteChapter(id);
    if (selectedChapter === id) {
      setSelectedChapter(null);
    }
    toast({ title: 'Chapter deleted' });
  };

  const selected = chapters.find(ch => ch.id === selectedChapter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-success/20 text-success';
      case 'in_progress': return 'bg-primary/20 text-primary';
      case 'revision': return 'bg-accent/20 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      {/* Chapter List */}
      <div className="w-80 border-r border-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Chapters</h2>
          <Button variant="outline" size="sm" onClick={handleAddChapter} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedChapter === chapter.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-card border border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chapter.chapter_number}. {chapter.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chapter.word_count} words
                  </p>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(chapter.status)}`}>
                  {chapter.status}
                </Badge>
              </div>
            </button>
          ))}

          {chapters.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No chapters yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Input
                  value={selected.title}
                  onChange={(e) => updateChapter(selected.id, { title: e.target.value })}
                  className="text-2xl font-display font-bold bg-transparent border-transparent hover:border-border h-auto py-1"
                  placeholder="Chapter title..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Chapter {selected.chapter_number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selected.status}
                  onChange={(e) => updateChapter(selected.id, { status: e.target.value as typeof selected.status })}
                  className="text-sm px-3 py-2 rounded-lg bg-secondary border-none"
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                  <option value="revision">Revision</option>
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteChapter(selected.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Chapter Intent
              </label>
              <Input
                value={selected.intent || ''}
                onChange={(e) => updateChapter(selected.id, { intent: e.target.value })}
                placeholder="What should this chapter accomplish?"
                className="bg-secondary/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Content
              </label>
              <Textarea
                value={selected.content}
                onChange={(e) => {
                  const content = e.target.value;
                  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
                  updateChapter(selected.id, { content, word_count: wordCount });
                }}
                placeholder="Begin writing your chapter..."
                className="min-h-[500px] bg-secondary/30 font-display text-lg leading-relaxed resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2 text-right">
                {selected.word_count} words
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Select a Chapter</h3>
              <p className="text-muted-foreground mb-4">
                Choose a chapter from the list or create a new one
              </p>
              <Button onClick={handleAddChapter} disabled={isAdding}>
                <Plus className="h-4 w-4" /> Create Chapter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
