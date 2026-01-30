import { useStory } from '@/context/StoryContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { currentProject, updateProject } = useStory();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentProject) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await supabase.from('projects').delete().eq('id', currentProject.id);
      toast({ title: 'Story deleted' });
      navigate('/projects');
    } catch (error) {
      toast({ title: 'Error deleting story', variant: 'destructive' });
    }
    setIsDeleting(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-2">
        <Settings className="h-7 w-7" /> Settings
      </h1>

      <div className="space-y-8">
        <div>
          <Label>Story Title</Label>
          <Input
            value={currentProject.title}
            onChange={(e) => updateProject({ title: e.target.value })}
            className="mt-2 bg-secondary/30"
          />
        </div>

        <div>
          <Label>Language</Label>
          <Input
            value={currentProject.language}
            onChange={(e) => updateProject({ language: e.target.value })}
            className="mt-2 bg-secondary/30"
          />
        </div>

        <div>
          <Label>Tone ({currentProject.tone_value < 0.3 ? 'Hopeful' : currentProject.tone_value > 0.7 ? 'Dark' : 'Balanced'})</Label>
          <Slider
            value={[currentProject.tone_value]}
            onValueChange={([val]) => updateProject({ tone_value: val })}
            max={1} min={0} step={0.1}
            className="mt-4"
          />
        </div>

        <div className="pt-8 border-t border-border">
          <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" /> Delete Story
          </Button>
        </div>
      </div>
    </div>
  );
}
