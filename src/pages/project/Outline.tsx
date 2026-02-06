import { useStory } from '@/context/StoryContext';
import { useTranslation } from 'react-i18next';
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
   const { t } = useTranslation();
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
       title: t('outline.actAdded')
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
       title: t('outline.actDeleted')
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
       title: t('outline.arcAdded')
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
       title: t('outline.arcDeleted')
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
       title: t('outline.conflictAdded')
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
       title: t('outline.conflictDeleted')
     });
  };
   return <div className="p-8 max-w-5xl mx-auto animate-fade-in">
       <div className="flex items-center justify-between mb-8">
         <div>
           <h1 className="font-display text-3xl font-bold mb-2">{t('outline.title')}</h1>
           <p className="text-muted-foreground">{t('outline.structureDescription')}</p>
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
            {t('outline.aiGenerateStructure')}
         </AIGenerateButton>
      </div>

       {/* Acts Section */}
       <div className="mb-10">
         <div className="flex items-center justify-between mb-4">
           <h2 className="font-display text-xl font-semibold">{t('outline.acts')}</h2>
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
               <Plus className="h-4 w-4" /> {t('outline.newAct')}
             </Button>
          </div>
        </div>

        <div className="space-y-3">
          {acts.map(act => (
            <Card key={act.id} className="p-4 bg-card/50">
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => toggleAct(act.id)}
                  className="mt-1 text-muted-foreground hover:text-foreground"
                >
                  {expandedActs.includes(act.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-muted-foreground">Act {act.number}</span>
                    <Input
                      value={act.title}
                      onChange={(e) => updateAct(act.id, { title: e.target.value })}
                      className="font-semibold bg-transparent border-none h-auto p-0 text-lg"
                    />
                  </div>
                   {expandedActs.includes(act.id) && (
                     <Textarea
                       value={act.description || ''}
                       onChange={(e) => updateAct(act.id, { description: e.target.value })}
                       placeholder={t('outline.conflictDescription')}
                       className="min-h-[100px] bg-secondary/30"
                     />
                   )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAct(act.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
           {acts.length === 0 && (
             <p className="text-center text-muted-foreground py-8">
               {t('outline.noActs')}
             </p>
           )}
        </div>
      </div>

       {/* Story Arcs Section */}
       <div className="mb-10">
         <div className="flex items-center justify-between mb-4">
           <h2 className="font-display text-xl font-semibold">{t('outline.arcs')}</h2>
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
               <Plus className="h-4 w-4" /> {t('outline.newArc')}
             </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {arcs.map(arc => <Card key={arc.id} className="p-4">
               <div className="flex items-start justify-between mb-2">
                 <Input value={arc.name} onChange={e => updateArc(arc.id, {
               name: e.target.value
             })} className="font-medium bg-transparent border-transparent hover:border-border" placeholder={t('outline.arcName')} />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteArc(arc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mb-2">
                 <select value={arc.type} onChange={e => updateArc(arc.id, {
               type: e.target.value as StoryArc['type']
             })} className="text-xs px-2 py-1 rounded bg-secondary border-none">
                   <option value="main">{t('outline.arcTypes.main')}</option>
                   <option value="subplot">{t('outline.arcTypes.subplot')}</option>
                   <option value="character">{t('outline.arcTypes.character')}</option>
                 </select>
                 <select value={arc.status} onChange={e => updateArc(arc.id, {
               status: e.target.value as StoryArc['status']
             })} className="text-xs px-2 py-1 rounded bg-secondary border-none">
                   <option value="setup">{t('outline.arcStatus.setup')}</option>
                   <option value="rising">{t('outline.arcStatus.rising')}</option>
                   <option value="climax">{t('outline.arcStatus.climax')}</option>
                   <option value="falling">{t('outline.arcStatus.falling')}</option>
                   <option value="resolution">{t('outline.arcStatus.resolution')}</option>
                 </select>
              </div>
               <Textarea value={arc.description} onChange={e => updateArc(arc.id, {
             description: e.target.value
           })} placeholder={t('outline.arcDescription')} className="bg-secondary/30 min-h-[60px] text-sm" />
            </Card>)}
        </div>
      </div>

       {/* Conflicts Section */}
       <div>
         <div className="flex items-center justify-between mb-4">
           <h2 className="font-display text-xl font-semibold">{t('outline.conflicts')}</h2>
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
               <Plus className="h-4 w-4" /> {t('outline.newConflict')}
             </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {conflicts.map(conflict => <Card key={conflict.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive capitalize">
                   {t(`outline.conflictTypes.${conflict.type}` as any) || conflict.type}
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