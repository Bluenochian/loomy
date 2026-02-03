import { useStory } from '@/context/StoryContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2, Trash2, Sparkles, Wand2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ChapterSyncButton } from '@/components/chapters/ChapterSyncButton';

export default function ChaptersPage() {
  const { 
    chapters, 
    addChapter, 
    updateChapter, 
    deleteChapter, 
    currentProject, 
    characters, 
    loreEntries, 
    outline, 
    storyMapNodes, 
    storyOverview,
    addCharacter,
    addLoreEntry,
    updateStoryOverview,
  } = useStory();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const selected = chapters.find(ch => ch.id === selectedChapterId);

  const handleAddChapter = async () => {
    setIsAdding(true);
    const chapter = await addChapter({ title: `${t('chapters.title')} ${chapters.length + 1}`, chapter_number: chapters.length + 1 });
    if (chapter) {
      setSelectedChapterId(chapter.id);
      toast({ title: t('chapters.addChapter') });
    }
    setIsAdding(false);
  };

  const handleDeleteChapter = async (id: string) => {
    await deleteChapter(id);
    if (selectedChapterId === id) setSelectedChapterId(null);
    toast({ title: t('common.delete') });
  };

  const generateDraft = useCallback(async () => {
    if (!currentProject || !selected) return;
    setIsGeneratingDraft(true);
    try {
      const toneDescription = currentProject.tone_value < 0.3 ? "hopeful" : currentProject.tone_value > 0.7 ? "dark" : "balanced";
      const primaryGenre = currentProject.inferred_genres?.primary || currentProject.genre_influences?.[0] || 'literary fiction';
      const prevChapterIndex = chapters.findIndex(c => c.id === selected.id) - 1;
      const prevChapter = prevChapterIndex >= 0 ? chapters[prevChapterIndex] : null;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          action: 'draft',
          content: selected.intent || selected.title,
          context: {
            storyTitle: currentProject.title, genre: primaryGenre, tone: toneDescription,
            characters: settings.aiUseCharacters ? characters.slice(0, 8).map(c => ({ name: c.name, role: c.role, traits: c.traits })) : [],
            lore: settings.aiUseLore ? loreEntries.slice(0, 8).map(l => ({ title: l.title, content: l.content || '' })) : [],
            outline: settings.aiUseOutline && outline ? { acts: outline.structure?.acts, arcs: outline.arcs } : undefined,
            storyMap: settings.aiUseStoryMap ? storyMapNodes.slice(0, 10).map(n => ({ title: n.title, type: n.node_type, description: n.description })) : [],
            chapterTitle: selected.title, chapterNumber: selected.chapter_number,
            previousChapterSummary: prevChapter?.content?.slice(0, 500),
            narrativeIntent: storyOverview?.narrative_intent, stakes: storyOverview?.stakes,
            language: currentProject.language,
          },
          settings: { useLore: settings.aiUseLore, useOutline: settings.aiUseOutline, useStoryMap: settings.aiUseStoryMap, useCharacters: settings.aiUseCharacters, temperature: settings.aiTemperature, model: settings.aiModel },
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to generate');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) { content += delta; updateChapter(selected.id, { content, word_count: content.split(/\s+/).length }); }
          } catch {}
        }
      }
      toast({ title: t('chapters.generateDraft') + '!' });
    } catch (e) {
      toast({ title: t('auth.failed'), variant: 'destructive' });
    } finally {
      setIsGeneratingDraft(false);
    }
  }, [currentProject, selected, chapters, characters, loreEntries, outline, storyMapNodes, storyOverview, settings, updateChapter, toast, t]);

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
      <div className="w-80 border-r border-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">{t('chapters.title')}</h2>
          <Button variant="outline" size="sm" onClick={handleAddChapter} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <div className="space-y-2">
          {chapters.map((ch) => (
            <button key={ch.id} onClick={() => setSelectedChapterId(ch.id)} className={`w-full text-left p-3 rounded-lg transition-all ${selectedChapterId === ch.id ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-border hover:border-primary/20'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ch.chapter_number}. {ch.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ch.word_count || 0} {t('chapters.words')}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(ch.status)}`}>{ch.status}</Badge>
              </div>
            </button>
          ))}
          {chapters.length === 0 && <div className="text-center py-8"><FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t('chapters.title')}</p></div>}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {selected && currentProject ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Input value={selected.title} onChange={(e) => updateChapter(selected.id, { title: e.target.value })} className="text-2xl font-display font-bold bg-transparent border-transparent hover:border-border h-auto py-1" placeholder="Chapter title..." />
                <p className="text-sm text-muted-foreground mt-1">{t('map.chapter')} {selected.chapter_number}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Sync Button */}
                <ChapterSyncButton
                  chapter={selected}
                  project={currentProject}
                  storyOverview={storyOverview}
                  characters={characters}
                  loreEntries={loreEntries}
                  onAddCharacter={addCharacter}
                  onAddLoreEntry={addLoreEntry}
                  onUpdateStoryOverview={updateStoryOverview}
                />
                <select value={selected.status} onChange={(e) => updateChapter(selected.id, { status: e.target.value as any })} className="text-sm px-3 py-2 rounded-lg bg-secondary border-none">
                  <option value="draft">Draft</option><option value="in_progress">In Progress</option><option value="complete">Complete</option><option value="revision">Revision</option>
                </select>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteChapter(selected.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('overview.narrativeIntent')}</label>
              <Input value={selected.intent || ''} onChange={(e) => updateChapter(selected.id, { intent: e.target.value })} placeholder="What should this chapter accomplish?" className="bg-secondary/30" />
            </div>
            {(!selected.content || selected.content.length < 50) && settings.aiEnabled && (
              <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20"><Wand2 className="h-5 w-5 text-primary" /></div>
                    <div><p className="font-medium">{t('chapters.generateDraft')}</p><p className="text-xs text-muted-foreground">AI writes based on your story context</p></div>
                  </div>
                  <Button onClick={generateDraft} disabled={isGeneratingDraft}>{isGeneratingDraft ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('common.loading')}</> : <><Sparkles className="h-4 w-4" /> {t('chapters.generateDraft')}</>}</Button>
                </div>
              </Card>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Content</label>
              <Textarea value={selected.content || ''} onChange={(e) => { const c = e.target.value; updateChapter(selected.id, { content: c, word_count: c.trim() ? c.trim().split(/\s+/).length : 0 }); }} placeholder="Begin writing..." className="min-h-[500px] bg-secondary/30 font-display text-lg leading-relaxed resize-none" />
              <p className="text-sm text-muted-foreground mt-2 text-right">{selected.word_count || 0} {t('chapters.words')}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{t('chapters.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('chapters.addChapter')}</p>
              <Button onClick={handleAddChapter} disabled={isAdding}><Plus className="h-4 w-4" /> {t('chapters.addChapter')}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
