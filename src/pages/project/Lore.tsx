import { useStory } from '@/context/StoryContext';
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

const CATEGORY_CONFIG = {
  world: { 
    icon: Globe, 
    label: 'World', 
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    description: 'Geography, nations, and the physical world'
  },
  magic: { 
    icon: Wand2, 
    label: 'Magic', 
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    description: 'Magical systems and supernatural elements'
  },
  technology: { 
    icon: Cpu, 
    label: 'Technology', 
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    description: 'Technological advances and inventions'
  },
  culture: { 
    icon: Crown, 
    label: 'Culture', 
    color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    description: 'Societies, customs, and traditions'
  },
  history: { 
    icon: History, 
    label: 'History', 
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    description: 'Past events and historical figures'
  },
  rules: { 
    icon: Scroll, 
    label: 'Rules', 
    color: 'text-red-400 bg-red-500/20 border-red-500/30',
    description: 'Laws, constraints, and world rules'
  },
  general: { 
    icon: BookOpen, 
    label: 'General', 
    color: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
    description: 'Other world-building elements'
  },
} as const;

type Category = keyof typeof CATEGORY_CONFIG;

export default function LorePage() {
  const { loreEntries, addLoreEntry, updateLoreEntry, deleteLoreEntry } = useStory();
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  // Group entries by category
  const groupedEntries = useMemo(() => {
    const groups: Record<Category, LoreEntry[]> = {
      world: [],
      magic: [],
      technology: [],
      culture: [],
      history: [],
      rules: [],
      general: [],
    };
    
    loreEntries.forEach(entry => {
      const cat = entry.category as Category;
      if (groups[cat]) {
        groups[cat].push(entry);
      } else {
        groups.general.push(entry);
      }
    });
    
    return groups;
  }, [loreEntries]);

  const handleAdd = async (category: Category = 'general') => {
    setIsAdding(true);
    const entry = await addLoreEntry({ 
      title: `New ${CATEGORY_CONFIG[category].label} Entry`, 
      category 
    });
    if (entry) {
      setSelectedEntry(entry.id);
      setActiveCategory(category);
      toast({ title: 'Lore entry created' });
    }
    setIsAdding(false);
  };

  const filteredEntries = activeCategory === 'all' 
    ? loreEntries 
    : groupedEntries[activeCategory];

  const selected = loreEntries.find(e => e.id === selectedEntry);

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      {/* Category Tabs Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Lore & World
            </h2>
            <div className="flex items-center gap-1">
              <AIGenerateButton
                type="lore"
                context={activeCategory !== 'all' ? `Create a ${CATEGORY_CONFIG[activeCategory].label} entry for my story world.` : ''}
                onGenerated={(content) => {
                  // Create new entry with generated content
                  addLoreEntry({
                    title: 'AI Generated Entry',
                    category: activeCategory === 'all' ? 'general' : activeCategory,
                    content
                  }).then((entry) => {
                    if (entry) {
                      setSelectedEntry(entry.id);
                      toast({ title: 'Lore entry generated!' });
                    }
                  });
                }}
                size="icon"
                variant="ghost"
              >
                <Sparkles className="h-4 w-4" />
              </AIGenerateButton>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAdd(activeCategory === 'all' ? 'general' : activeCategory)}
                disabled={isAdding}
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs 
          value={activeCategory} 
          onValueChange={(v) => {
            setActiveCategory(v as Category | 'all');
            setSelectedEntry(null);
          }}
          className="flex-1 flex flex-col"
        >
          <TabsList className="flex flex-wrap gap-1 p-2 h-auto bg-transparent justify-start">
            <TabsTrigger 
              value="all" 
              className="text-xs px-2 py-1 data-[state=active]:bg-primary/20"
            >
              All ({loreEntries.length})
            </TabsTrigger>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const count = groupedEntries[key as Category].length;
              const Icon = config.icon;
              return (
                <TabsTrigger 
                  key={key}
                  value={key}
                  className={cn(
                    "text-xs px-2 py-1 gap-1",
                    `data-[state=active]:${config.color}`
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {config.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Entries List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No entries yet</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleAdd(activeCategory === 'all' ? 'general' : activeCategory)}
                  >
                    <Plus className="h-3 w-3" /> Create Entry
                  </Button>
                </div>
              ) : (
                filteredEntries.map((entry) => {
                  const config = CATEGORY_CONFIG[entry.category as Category] || CATEGORY_CONFIG.general;
                  const Icon = config.icon;
                  
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200 border",
                        config.color,
                        selectedEntry === entry.id 
                          ? "ring-2 ring-primary ring-offset-1 ring-offset-background" 
                          : "hover:opacity-80"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <p className="font-medium truncate text-sm">{entry.title}</p>
                      </div>
                      {entry.content && (
                        <p className="text-xs opacity-70 line-clamp-2">{entry.content}</p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </Tabs>
      </div>

      {/* Content Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Input
                  value={selected.title}
                  onChange={(e) => updateLoreEntry(selected.id, { title: e.target.value })}
                  className="text-2xl font-display font-bold bg-transparent border-transparent hover:border-border focus:border-primary h-auto py-1 mb-2"
                />
                <div className="flex items-center gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = selected.category === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateLoreEntry(selected.id, { category: key as LoreEntry['category'] })}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-all",
                          isActive ? config.color : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { 
                  deleteLoreEntry(selected.id); 
                  setSelectedEntry(null); 
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Description */}
            <Card className={cn(
              "p-3 mb-6 border",
              CATEGORY_CONFIG[selected.category as Category]?.color || CATEGORY_CONFIG.general.color
            )}>
              <p className="text-sm opacity-80">
                {CATEGORY_CONFIG[selected.category as Category]?.description || CATEGORY_CONFIG.general.description}
              </p>
            </Card>

            {/* Content Editor */}
            <div className="relative">
              <Textarea
                value={selected.content || ''}
                onChange={(e) => updateLoreEntry(selected.id, { content: e.target.value })}
                placeholder="Describe this aspect of your world in detail..."
                className="min-h-[400px] bg-secondary/30 font-display text-lg leading-relaxed resize-none"
              />
              <div className="absolute top-2 right-2">
                <AIGenerateButton
                  type="lore"
                  context={`Expand on this ${CATEGORY_CONFIG[selected.category as Category]?.label || 'lore'} entry titled "${selected.title}": ${selected.content || ''}`}
                  onGenerated={(content) => {
                    updateLoreEntry(selected.id, { content: (selected.content || '') + '\n\n' + content });
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Sparkles className="h-3 w-3" /> Expand
                </AIGenerateButton>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Tags</p>
              <Input
                value={selected.tags?.join(', ') || ''}
                onChange={(e) => updateLoreEntry(selected.id, { 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                })}
                placeholder="Add tags separated by commas..."
                className="bg-secondary/30"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Build Your World</h3>
              <p className="text-muted-foreground mb-4">Create lore entries to define your story's universe</p>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={() => handleAdd('world')}>
                  <Plus className="h-4 w-4" /> Create Entry
                </Button>
                <AIGenerateButton
                  type="lore"
                  context="Create an interesting world-building lore entry for my story."
                  onGenerated={(content) => {
                    addLoreEntry({
                      title: 'AI Generated Entry',
                      category: 'world',
                      content
                    }).then((entry) => {
                      if (entry) {
                        setSelectedEntry(entry.id);
                        toast({ title: 'Lore entry generated!' });
                      }
                    });
                  }}
                >
                  <Sparkles className="h-4 w-4" /> AI Generate
                </AIGenerateButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
