import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Globe, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { LoreEntry } from '@/types/story';

const CATEGORIES = ['world', 'magic', 'technology', 'culture', 'history', 'rules', 'general'] as const;

export default function LorePage() {
  const { loreEntries, addLoreEntry, updateLoreEntry, deleteLoreEntry } = useStory();
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleAdd = async () => {
    setIsAdding(true);
    const entry = await addLoreEntry({ title: 'New Entry', category: 'general' });
    if (entry) {
      setSelectedEntry(entry.id);
      toast({ title: 'Lore entry created' });
    }
    setIsAdding(false);
  };

  const filtered = filterCategory === 'all' 
    ? loreEntries 
    : loreEntries.filter(e => e.category === filterCategory);

  const selected = loreEntries.find(e => e.id === selectedEntry);

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      <div className="w-80 border-r border-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Lore & World</h2>
          <Button variant="outline" size="sm" onClick={handleAdd} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>

        <div className="space-y-2">
          {filtered.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setSelectedEntry(entry.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedEntry === entry.id ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-border hover:border-primary/20'
              }`}
            >
              <p className="font-medium truncate">{entry.title}</p>
              <Badge variant="outline" className="text-xs mt-1">{entry.category}</Badge>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No entries yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <Input
                value={selected.title}
                onChange={(e) => updateLoreEntry(selected.id, { title: e.target.value })}
                className="text-2xl font-display font-bold bg-transparent border-transparent hover:border-border h-auto py-1"
              />
              <div className="flex items-center gap-2">
                <select
                  value={selected.category}
                  onChange={(e) => updateLoreEntry(selected.id, { category: e.target.value as LoreEntry['category'] })}
                  className="text-sm px-3 py-2 rounded-lg bg-secondary border-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
                <Button variant="ghost" size="icon" onClick={() => { deleteLoreEntry(selected.id); setSelectedEntry(null); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              value={selected.content || ''}
              onChange={(e) => updateLoreEntry(selected.id, { content: e.target.value })}
              placeholder="Describe this aspect of your world..."
              className="min-h-[400px] bg-secondary/30 font-display text-lg leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Build Your World</h3>
              <Button onClick={handleAdd}><Plus className="h-4 w-4" /> Create Entry</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
