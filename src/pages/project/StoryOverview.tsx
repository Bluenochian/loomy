import { useStory } from '@/context/StoryContext';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function StoryOverviewPage() {
  const { storyOverview, updateStoryOverview } = useStory();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [narrativeIntent, setNarrativeIntent] = useState('');
  const [stakes, setStakes] = useState('');
  const [settingDescription, setSettingDescription] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [newTheme, setNewTheme] = useState('');

  useEffect(() => {
    if (storyOverview) {
      setNarrativeIntent(storyOverview.narrative_intent || '');
      setStakes(storyOverview.stakes || '');
      setSettingDescription(storyOverview.setting_description || '');
      setTimePeriod(storyOverview.time_period || '');
      setThemes(storyOverview.central_themes || []);
    }
  }, [storyOverview]);

  const addTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme('');
    }
  };

  const removeTheme = (theme: string) => {
    setThemes(themes.filter(t => t !== theme));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStoryOverview({
        narrative_intent: narrativeIntent,
        stakes,
        setting_description: settingDescription,
        time_period: timePeriod,
        central_themes: themes,
      });
      toast({ title: 'Story overview saved' });
    } catch (error) {
      toast({ title: 'Error saving', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Story Overview</h1>
          <p className="text-muted-foreground">Define the high-level narrative vision</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <Label className="text-base font-medium">Narrative Intent</Label>
          <Textarea
            value={narrativeIntent}
            onChange={(e) => setNarrativeIntent(e.target.value)}
            placeholder="What is the core purpose of this story? What experience should readers have?"
            className="min-h-[120px] bg-secondary/30"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Stakes</Label>
          <Textarea
            value={stakes}
            onChange={(e) => setStakes(e.target.value)}
            placeholder="What's at risk? Personal, societal, existential consequences..."
            className="min-h-[100px] bg-secondary/30"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Setting Description</Label>
          <Textarea
            value={settingDescription}
            onChange={(e) => setSettingDescription(e.target.value)}
            placeholder="Describe the world where this story takes place..."
            className="min-h-[120px] bg-secondary/30"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Time Period</Label>
          <Input
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            placeholder="When does this story take place?"
            className="bg-secondary/30"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Central Themes</Label>
          <div className="flex gap-2">
            <Input
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
              placeholder="Add a theme..."
              className="bg-secondary/30"
            />
            <Button variant="secondary" onClick={addTheme}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {themes.map((theme, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-destructive/20"
                onClick={() => removeTheme(theme)}
              >
                {theme} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
