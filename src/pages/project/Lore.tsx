import { useStory } from '@/context/StoryContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Globe, Loader2, Trash2, Sparkles, Cpu, Crown, History, Scroll, BookOpen, Wand2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIGenerateButton } from '@/components/ai/AIGenerateButton';
import type { LoreEntry } from '@/types/story';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS = {
  world: Globe,
  magic: Wand2,
  technology: Cpu,
  culture: Crown,
  history: History,
  rules: Scroll,
  general: BookOpen,
} as const;

const CATEGORY_COLORS = {
  world: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  magic: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  technology: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  culture: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  history: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  rules: 'text-red-400 bg-red-500/20 border-red-500/30',
  general: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
} as const;

type Category = keyof typeof CATEGORY_ICONS;

export default function LorePage() {
  const { t } = useTranslation();
  const {
    loreEntries,
    addLoreEntry,
    updateLoreEntry,
    deleteLoreEntry
  } = useStory();
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const groupedEntries = useMemo(() => {
    const groups: Record<Category, LoreEntry[]> = {
      world: [], magic: [], technology: [], culture: [], history: [], rules: [], general: []
    };
    loreEntries.forEach(entry => {
      const cat = entry.category as Category;
      if (groups[cat]) groups[cat].push(entry);
      else groups.general.push(entry);
    });
    return groups;
  }, [loreEntries]);

  const handleAdd = async (category: Category = 'general') => {
    setIsAdding(true);
    const entry = await addLoreEntry({
      title: `${t('lore.newEntry')} - ${t(`lore.categories.${category}`)}`,
      category
    });
    if (entry) {
      setSelectedEntry(entry.id);
      setActiveCategory(category);
      toast({ title: t('lore.created') });
    }
    setIsAdding(false);
  };

  const filteredEntries = activeCategory === 'all' ? loreEntries : groupedEntries[activeCategory];
  const selected = loreEntries.find(e => e.id === selectedEntry);

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> {t('lore.title')}
            </h2>
            <div className="flex items-center gap-1">
              <AIGenerateButton type="lore" context={activeCategory !== 'all' ? `Create a ${t(`lore.categories.${activeCategory}`)} entry for my story world.` : ''} onGenerated={content => {
                addLoreEntry({
                  title: t('lore.newEntry'),
                  category: activeCategory === 'all' ? 'general' : activeCategory,
                  content
                }).then(entry => {
                  if (entry) {
                    setSelectedEntry(entry.id);
                    toast({ title: t('lore.generated') });
                  }
                });
              }} size="icon" variant="ghost">
                <Sparkles className="h-4 w-4" />
              </AIGenerateButton>
              <Button variant="outline" size="sm" onClick={() => handleAdd(activeCategory === 'all' ? 'general' : activeCategory)} disabled={isAdding}>
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeCategory} onValueChange={v => { setActiveCategory(v as Category | 'all'); setSelectedEntry(null); }} className="flex-1 flex flex-col">
          <TabsList className="flex flex-wrap gap-1 p-2 h-auto bg-transparent justify-start">
            <TabsTrigger value="all" className="text-xs px-2 py-1 data-[state=active]:bg-primary/20">
              {t('common.all')} ({loreEntries.length})
            </TabsTrigger>
            {(Object.keys(CATEGORY_ICONS) as Category[]).map((key) => {
              const count = groupedEntries[key].length;
              const Icon = CATEGORY_ICONS[key];
              return (
                <TabsTrigger key={key} value={key} className={cn("text-xs px-2 py-1 gap-1", `data-[state=active]:${CATEGORY_COLORS[key]}`)}>
                  <Icon className="h-3 w-3" />
                  {t(`lore.categories.${key}`)} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">{t('lore.noEntries')}</p>
                  <Button size="sm" variant="outline" onClick={() => handleAdd(activeCategory === 'all' ? 'general' : activeCategory)}>
                    <Plus className="h-3 w-3" /> {t('lore.createEntry')}
                  </Button>
                </div>
              ) : filteredEntries.map(entry => {
                const Icon = CATEGORY_ICONS[entry.category as Category] || CATEGORY_ICONS.general;
                const color = CATEGORY_COLORS[entry.category as Category] || CATEGORY_COLORS.general;
                return (
                  <button key={entry.id} onClick={() => setSelectedEntry(entry.id)} className={cn("w-full text-left p-3 rounded-lg transition-all duration-200 border", color, selectedEntry === entry.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "hover:opacity-80")}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <p className="font-medium truncate text-sm">{entry.title}</p>
                    </div>
                    {entry.content && <p className="text-xs opacity-70 line-clamp-2">{entry.content}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        </Tabs>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Input value={selected.title} onChange={e => updateLoreEntry(selected.id, { title: e.target.value })} className="text-2xl font-display font-bold bg-transparent border-transparent hover:border-border focus:border-primary h-auto py-1 mb-2" />
                <div className="flex items-center gap-2">
                  {(Object.keys(CATEGORY_ICONS) as Category[]).map((key) => {
                    const Icon = CATEGORY_ICONS[key];
                    const isActive = selected.category === key;
                    return (
                      <button key={key} onClick={() => updateLoreEntry(selected.id, { category: key as LoreEntry['category'] })} className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-all", isActive ? CATEGORY_COLORS[key] : "border-border text-muted-foreground hover:border-primary/30")}>
                        <Icon className="h-3 w-3" />
                        {t(`lore.categories.${key}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { deleteLoreEntry(selected.id); setSelectedEntry(null); }} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Card className={cn("p-3 mb-6 border", CATEGORY_COLORS[selected.category as Category] || CATEGORY_COLORS.general)}>
              <p className="text-sm opacity-80">
                {t(`lore.categoryDescriptions.${selected.category as Category}`) || t('lore.categoryDescriptions.general')}
              </p>
            </Card>

            <div className="relative">
              <Textarea value={selected.content || ''} onChange={e => updateLoreEntry(selected.id, { content: e.target.value })} placeholder={t('lore.contentPlaceholder')} className="min-h-[400px] bg-secondary/30 font-display text-lg leading-relaxed resize-none" />
              <div className="absolute top-2 right-2">
                <AIGenerateButton type="lore" context={`Expand on this ${t(`lore.categories.${selected.category as Category}`)} entry titled "${selected.title}": ${selected.content || ''}`} onGenerated={content => {
                  updateLoreEntry(selected.id, { content: (selected.content || '') + '\n\n' + content });
                }} size="sm" variant="ghost">
                  <Sparkles className="h-3 w-3" /> {t('lore.expand')}
                </AIGenerateButton>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">{t('lore.tags')}</p>
              <Input value={selected.tags?.join(', ') || ''} onChange={e => updateLoreEntry(selected.id, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder={t('lore.tagsPlaceholder')} className="bg-secondary/30" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">{t('lore.buildWorld')}</h3>
              <p className="text-muted-foreground mb-4">{t('lore.buildWorldDesc')}</p>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={() => handleAdd('world')}>
                  <Plus className="h-4 w-4" /> {t('lore.createEntry')}
                </Button>
                <AIGenerateButton type="lore" context="Create an interesting world-building lore entry for my story." onGenerated={content => {
                  addLoreEntry({ title: t('lore.newEntry'), category: 'world', content }).then(entry => {
                    if (entry) { setSelectedEntry(entry.id); toast({ title: t('lore.generated') }); }
                  });
                }}>
                  {t('lore.aiGenerate')}
                </AIGenerateButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}