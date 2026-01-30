import { useStory } from '@/context/StoryContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Settings, Trash2, Palette, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GENRE_THEMES = [
  {
    id: 'default',
    name: 'Default',
    description: 'Warm amber with dark cinematic tones',
    primary: '38 85% 55%',
    accent: '35 90% 50%',
    preview: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Golden mystical with arcane purple',
    primary: '45 80% 50%',
    accent: '280 60% 50%',
    preview: 'from-yellow-500/20 to-purple-500/20',
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    description: 'Neon cyan with electric violet',
    primary: '190 80% 50%',
    accent: '260 70% 60%',
    preview: 'from-cyan-500/20 to-violet-500/20',
  },
  {
    id: 'thriller',
    name: 'Thriller',
    description: 'High contrast black and crimson',
    primary: '0 0% 95%',
    accent: '0 70% 50%',
    preview: 'from-slate-300/20 to-red-500/20',
  },
  {
    id: 'romance',
    name: 'Romance',
    description: 'Soft rose with blush pink',
    primary: '340 70% 60%',
    accent: '320 60% 50%',
    preview: 'from-rose-500/20 to-pink-500/20',
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Blood red with shadow purple',
    primary: '0 60% 45%',
    accent: '270 50% 40%',
    preview: 'from-red-700/20 to-purple-900/20',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    description: 'Deep indigo with shadowy teal',
    primary: '230 60% 55%',
    accent: '180 50% 40%',
    preview: 'from-indigo-500/20 to-teal-700/20',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    description: 'Earthy bronze with forest green',
    primary: '30 60% 50%',
    accent: '140 50% 40%',
    preview: 'from-orange-600/20 to-green-700/20',
  },
];

export default function SettingsPage() {
  const { currentProject, updateProject } = useStory();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  // Load current theme from project
  useEffect(() => {
    if (currentProject?.theme_profile?.themeId) {
      setSelectedTheme(currentProject.theme_profile.themeId);
    }
  }, [currentProject]);

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

  const applyTheme = (themeId: string) => {
    const theme = GENRE_THEMES.find(t => t.id === themeId);
    if (!theme) return;

    setSelectedTheme(themeId);
    
    // Apply theme to document
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--glow-primary', theme.primary);
    root.setAttribute('data-theme', themeId);

    // Save to project
    updateProject({
      theme_profile: {
        ...currentProject.theme_profile,
        themeId,
        colorPalette: {
          primary: theme.primary,
          accent: theme.accent,
        },
      },
    });

    toast({ title: `${theme.name} theme applied!` });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-2">
        <Settings className="h-7 w-7" /> Settings
      </h1>

      <div className="space-y-10">
        {/* Basic Settings */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Story Details</h2>
          <div className="space-y-4">
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
              <Label>
                Tone ({currentProject.tone_value < 0.3 ? 'Hopeful' : currentProject.tone_value > 0.7 ? 'Dark' : 'Balanced'})
              </Label>
              <Slider
                value={[currentProject.tone_value]}
                onValueChange={([val]) => updateProject({ tone_value: val })}
                max={1} min={0} step={0.1}
                className="mt-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Hopeful</span>
                <span>Balanced</span>
                <span>Dark</span>
              </div>
            </div>
          </div>
        </section>

        {/* Theme Settings */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Theme Colors
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a color theme that matches your story's genre
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GENRE_THEMES.map((theme) => (
              <Card
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden border-2",
                  selectedTheme === theme.id 
                    ? "border-primary ring-2 ring-primary/30" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Theme Preview Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50",
                  theme.preview
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{theme.name}</span>
                    {selectedTheme === theme.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {theme.description}
                  </p>
                  
                  {/* Color Swatches */}
                  <div className="flex gap-1 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: `hsl(${theme.primary})` }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: `hsl(${theme.accent})` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-8 border-t border-border">
          <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete this story and all its content. This action cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" /> Delete Story
          </Button>
        </section>
      </div>
    </div>
  );
}
