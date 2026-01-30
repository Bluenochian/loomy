import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Loader2, Trash2, User, Heart, Swords, Star } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Character } from '@/types/story';

export default function CharactersPage() {
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useStory();
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCharacter = async () => {
    setIsAdding(true);
    const character = await addCharacter({
      name: 'New Character',
      role: 'supporting',
    });
    if (character) {
      setSelectedCharacter(character.id);
      toast({ title: 'Character created' });
    }
    setIsAdding(false);
  };

  const handleDeleteCharacter = async (id: string) => {
    await deleteCharacter(id);
    if (selectedCharacter === id) {
      setSelectedCharacter(null);
    }
    toast({ title: 'Character deleted' });
  };

  const selected = characters.find(ch => ch.id === selectedCharacter);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'protagonist': return <Star className="h-4 w-4 text-primary" />;
      case 'antagonist': return <Swords className="h-4 w-4 text-destructive" />;
      case 'supporting': return <Heart className="h-4 w-4 text-accent" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'protagonist': return 'bg-primary/20 text-primary';
      case 'antagonist': return 'bg-destructive/20 text-destructive';
      case 'supporting': return 'bg-accent/20 text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      {/* Character List */}
      <div className="w-80 border-r border-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Characters</h2>
          <Button variant="outline" size="sm" onClick={handleAddCharacter} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          {characters.map((character) => (
            <button
              key={character.id}
              onClick={() => setSelectedCharacter(character.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedCharacter === character.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-card border border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  {getRoleIcon(character.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{character.name}</p>
                  <Badge variant="outline" className={`text-xs mt-1 ${getRoleColor(character.role)}`}>
                    {character.role}
                  </Badge>
                </div>
              </div>
            </button>
          ))}

          {characters.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No characters yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Character Editor */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Input
                  value={selected.name}
                  onChange={(e) => updateCharacter(selected.id, { name: e.target.value })}
                  className="text-2xl font-display font-bold bg-transparent border-transparent hover:border-border h-auto py-1"
                  placeholder="Character name..."
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selected.role}
                  onChange={(e) => updateCharacter(selected.id, { role: e.target.value as Character['role'] })}
                  className="text-sm px-3 py-2 rounded-lg bg-secondary border-none"
                >
                  <option value="protagonist">Protagonist</option>
                  <option value="antagonist">Antagonist</option>
                  <option value="supporting">Supporting</option>
                  <option value="minor">Minor</option>
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteCharacter(selected.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Description
                </label>
                <Textarea
                  value={selected.description || ''}
                  onChange={(e) => updateCharacter(selected.id, { description: e.target.value })}
                  placeholder="Physical appearance, personality, first impressions..."
                  className="min-h-[100px] bg-secondary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Backstory
                </label>
                <Textarea
                  value={selected.backstory || ''}
                  onChange={(e) => updateCharacter(selected.id, { backstory: e.target.value })}
                  placeholder="Their history, formative experiences, what shaped them..."
                  className="min-h-[120px] bg-secondary/30"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Motivations
                  </label>
                  <Textarea
                    value={selected.motivations?.join('\n') || ''}
                    onChange={(e) => updateCharacter(selected.id, { 
                      motivations: e.target.value.split('\n').filter(m => m.trim()) 
                    })}
                    placeholder="What drives them? (one per line)"
                    className="min-h-[100px] bg-secondary/30"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Traits
                  </label>
                  <Textarea
                    value={selected.traits?.join('\n') || ''}
                    onChange={(e) => updateCharacter(selected.id, { 
                      traits: e.target.value.split('\n').filter(t => t.trim()) 
                    })}
                    placeholder="Key personality traits (one per line)"
                    className="min-h-[100px] bg-secondary/30"
                  />
                </div>
              </div>

              {/* Character Arc */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Character Arc</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Starting State</label>
                    <Input
                      value={selected.arc?.startingState || ''}
                      onChange={(e) => updateCharacter(selected.id, { 
                        arc: { ...selected.arc, startingState: e.target.value } 
                      })}
                      placeholder="Where do they begin emotionally/mentally?"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Desired Change</label>
                    <Input
                      value={selected.arc?.desiredChange || ''}
                      onChange={(e) => updateCharacter(selected.id, { 
                        arc: { ...selected.arc, desiredChange: e.target.value } 
                      })}
                      placeholder="What must they learn or become?"
                      className="bg-secondary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Ending State</label>
                    <Input
                      value={selected.arc?.endingState || ''}
                      onChange={(e) => updateCharacter(selected.id, { 
                        arc: { ...selected.arc, endingState: e.target.value } 
                      })}
                      placeholder="Where do they end up?"
                      className="bg-secondary/30"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Select a Character</h3>
              <p className="text-muted-foreground mb-4">
                Choose a character from the list or create a new one
              </p>
              <Button onClick={handleAddCharacter} disabled={isAdding}>
                <Plus className="h-4 w-4" /> Create Character
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
