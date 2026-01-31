import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ChevronDown, ChevronRight, Save, Loader2, Trash2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIGenerateButton } from '@/components/ai/AIGenerateButton';
import type { Act, StoryArc, Conflict } from '@/types/story';
export default function OutlinePage() {
  const {
    outline,
    updateOutline,
    currentProject
  } = useStory();
  const {
    toast
  } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [expandedActs, setExpandedActs] = useState<string[]>([]);
  const acts = outline?.structure?.acts || [];
  const arcs = outline?.arcs || [];
  const conflicts = outline?.conflicts || [];
  const toggleAct = (actId: string) => {
    setExpandedActs(prev => prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]);
  };
  const addAct = async () => {
    const newAct: Act = {
      id: crypto.randomUUID(),
      number: acts.length + 1,
      title: `Act ${acts.length + 1}`,
      description: '',
      chapters: []
    };
    await updateOutline({
      structure: {
        acts: [...acts, newAct]
      }
    });
    toast({
      title: 'Act added'
    });
  };
  const updateAct = async (actId: string, updates: Partial<Act>) => {
    const updatedActs = acts.map(act => act.id === actId ? {
      ...act,
      ...updates
    } : act);
    await updateOutline({
      structure: {
        acts: updatedActs
      }
    });
  };
  const deleteAct = async (actId: string) => {
    const updatedActs = acts.filter(act => act.id !== actId);
    await updateOutline({
      structure: {
        acts: updatedActs
      }
    });
    toast({
      title: 'Act deleted'
    });
  };
  const addArc = async () => {
    const newArc: StoryArc = {
      id: crypto.randomUUID(),
      name: 'New Arc',
      description: '',
      type: 'subplot',
      status: 'setup'
    };
    await updateOutline({
      arcs: [...arcs, newArc]
    });
    toast({
      title: 'Arc added'
    });
  };
  const updateArc = async (arcId: string, updates: Partial<StoryArc>) => {
    const updatedArcs = arcs.map(arc => arc.id === arcId ? {
      ...arc,
      ...updates
    } : arc);
    await updateOutline({
      arcs: updatedArcs
    });
  };
  const deleteArc = async (arcId: string) => {
    await updateOutline({
      arcs: arcs.filter(arc => arc.id !== arcId)
    });
    toast({
      title: 'Arc deleted'
    });
  };
  const addConflict = async () => {
    const newConflict: Conflict = {
      id: crypto.randomUUID(),
      type: 'external',
      description: '',
      characters: []
    };
    await updateOutline({
      conflicts: [...conflicts, newConflict]
    });
    toast({
      title: 'Conflict added'
    });
  };
  const updateConflict = async (conflictId: string, updates: Partial<Conflict>) => {
    const updatedConflicts = conflicts.map(c => c.id === conflictId ? {
      ...c,
      ...updates
    } : c);
    await updateOutline({
      conflicts: updatedConflicts
    });
  };
  const deleteConflict = async (conflictId: string) => {
    await updateOutline({
      conflicts: conflicts.filter(c => c.id !== conflictId)
    });
    toast({
      title: 'Conflict deleted'
    });
  };
  return <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Story Outline</h1>
          <p className="text-muted-foreground">Structure your narrative with acts, arcs, and conflicts</p>
        </div>
        <AIGenerateButton type="outline" context={`Story: ${currentProject?.title || 'Untitled'}. Concept: ${currentProject?.concept || ''}`} onGenerated={content => {
        // Parse and add generated acts
        const newAct: Act = {
          id: crypto.randomUUID(),
          number: acts.length + 1,
          title: `Generated Act ${acts.length + 1}`,
          description: content,
          chapters: []
        };
        updateOutline({
          structure: {
            acts: [...acts, newAct]
          }
        });
      }}>
          <Sparkles className="h-4 w-4" /> AI Generate Structure
        </AIGenerateButton>
      </div>

      {/* Acts Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Acts</h2>
          <div className="flex items-center gap-2">
            <AIGenerateButton type="outline" context={`Generate content for Act ${acts.length + 1} of story: ${currentProject?.title}`} onGenerated={content => {
            const newAct: Act = {
              id: crypto.randomUUID(),
              number: acts.length + 1,
              title: `Act ${acts.length + 1}`,
              description: content,
              chapters: []
            };
            updateOutline({
              structure: {
                acts: [...acts, newAct]
              }
            });
            toast({
              title: 'Act generated!'
            });
          }} size="sm" variant="ghost">
              <Sparkles className="h-3 w-3" />
            </AIGenerateButton>
            <Button variant="outline" size="sm" onClick={addAct}>
              <Plus className="h-4 w-4" /> Add Act
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {acts.map(act => {})}
          {acts.length === 0 && <p className="text-center text-muted-foreground py-8">
              No acts yet. Add your first act to structure your story.
            </p>}
        </div>
      </div>

      {/* Story Arcs Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Story Arcs</h2>
          <div className="flex items-center gap-2">
            <AIGenerateButton type="arc" context={`Generate a story arc for: ${currentProject?.title}`} onGenerated={content => {
            const newArc: StoryArc = {
              id: crypto.randomUUID(),
              name: 'Generated Arc',
              description: content,
              type: 'subplot',
              status: 'setup'
            };
            updateOutline({
              arcs: [...arcs, newArc]
            });
            toast({
              title: 'Arc generated!'
            });
          }} size="sm" variant="ghost">
              <Sparkles className="h-3 w-3" />
            </AIGenerateButton>
            <Button variant="outline" size="sm" onClick={addArc}>
              <Plus className="h-4 w-4" /> Add Arc
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {arcs.map(arc => <Card key={arc.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Input value={arc.name} onChange={e => updateArc(arc.id, {
              name: e.target.value
            })} className="font-medium bg-transparent border-transparent hover:border-border" placeholder="Arc name..." />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteArc(arc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mb-2">
                <select value={arc.type} onChange={e => updateArc(arc.id, {
              type: e.target.value as StoryArc['type']
            })} className="text-xs px-2 py-1 rounded bg-secondary border-none">
                  <option value="main">Main</option>
                  <option value="subplot">Subplot</option>
                  <option value="character">Character</option>
                </select>
                <select value={arc.status} onChange={e => updateArc(arc.id, {
              status: e.target.value as StoryArc['status']
            })} className="text-xs px-2 py-1 rounded bg-secondary border-none">
                  <option value="setup">Setup</option>
                  <option value="rising">Rising</option>
                  <option value="climax">Climax</option>
                  <option value="falling">Falling</option>
                  <option value="resolution">Resolution</option>
                </select>
              </div>
              <Textarea value={arc.description} onChange={e => updateArc(arc.id, {
            description: e.target.value
          })} placeholder="Arc description..." className="bg-secondary/30 min-h-[60px] text-sm" />
            </Card>)}
        </div>
      </div>

      {/* Conflicts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Conflicts</h2>
          <div className="flex items-center gap-2">
            <AIGenerateButton type="conflict" context={`Generate a conflict for story: ${currentProject?.title}`} onGenerated={content => {
            const newConflict: Conflict = {
              id: crypto.randomUUID(),
              type: 'external',
              description: content,
              characters: []
            };
            updateOutline({
              conflicts: [...conflicts, newConflict]
            });
            toast({
              title: 'Conflict generated!'
            });
          }} size="sm" variant="ghost">
              <Sparkles className="h-3 w-3" />
            </AIGenerateButton>
            <Button variant="outline" size="sm" onClick={addConflict}>
              <Plus className="h-4 w-4" /> Add Conflict
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {conflicts.map(conflict => <Card key={conflict.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive capitalize">
                  {conflict.type}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteConflict(conflict.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{conflict.description}</p>
            </Card>)}
        </div>
      </div>
    </div>;
}