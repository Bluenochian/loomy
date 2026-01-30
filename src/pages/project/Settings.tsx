import { useStory } from '@/context/StoryContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Trash2, Palette, Check, Monitor, Sparkles, Shield, Bell, 
  Wrench, RotateCcw, BookOpen, Eye, Type, Save, Brain, Globe, Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ExportDialog } from '@/components/export/ExportDialog';

const GENRE_THEMES = [
  { id: 'default', name: 'Default', description: 'Warm amber with dark cinematic tones', primary: '38 85% 55%', accent: '35 90% 50%', preview: 'from-amber-500/20 to-orange-500/20' },
  { id: 'fantasy', name: 'Fantasy', description: 'Golden mystical with arcane purple', primary: '45 80% 50%', accent: '280 60% 50%', preview: 'from-yellow-500/20 to-purple-500/20' },
  { id: 'scifi', name: 'Sci-Fi', description: 'Neon cyan with electric violet', primary: '190 80% 50%', accent: '260 70% 60%', preview: 'from-cyan-500/20 to-violet-500/20' },
  { id: 'thriller', name: 'Thriller', description: 'High contrast black and crimson', primary: '0 0% 95%', accent: '0 70% 50%', preview: 'from-slate-300/20 to-red-500/20' },
  { id: 'romance', name: 'Romance', description: 'Soft rose with blush pink', primary: '340 70% 60%', accent: '320 60% 50%', preview: 'from-rose-500/20 to-pink-500/20' },
  { id: 'horror', name: 'Horror', description: 'Blood red with shadow purple', primary: '0 60% 45%', accent: '270 50% 40%', preview: 'from-red-700/20 to-purple-900/20' },
  { id: 'mystery', name: 'Mystery', description: 'Deep indigo with shadowy teal', primary: '230 60% 55%', accent: '180 50% 40%', preview: 'from-indigo-500/20 to-teal-700/20' },
  { id: 'adventure', name: 'Adventure', description: 'Earthy bronze with forest green', primary: '30 60% 50%', accent: '140 50% 40%', preview: 'from-orange-600/20 to-green-700/20' },
];

const AI_MODELS = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast)', description: 'Fast, efficient for most tasks' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Balanced speed and quality' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'High quality, complex tasks' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', description: 'Strong reasoning, balanced' },
  { id: 'openai/gpt-5', name: 'GPT-5', description: 'Most capable, slower' },
];

export default function SettingsPage() {
  const { currentProject, updateProject } = useStory();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { language, setLanguage, languages, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [activeSection, setActiveSection] = useState('story');

  useEffect(() => {
    if (currentProject?.theme_profile?.themeId) {
      setSelectedTheme(currentProject.theme_profile.themeId);
    }
  }, [currentProject]);

  if (!currentProject) return null;

  const handleDelete = async () => {
    if (!confirm(t('settings.deleteStory') + '?')) return;
    setIsDeleting(true);
    try {
      await supabase.from('projects').delete().eq('id', currentProject.id);
      toast({ title: t('settings.deleteStory') });
      navigate('/projects');
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setIsDeleting(false);
  };

  const applyTheme = (themeId: string) => {
    const theme = GENRE_THEMES.find(t => t.id === themeId);
    if (!theme) return;
    setSelectedTheme(themeId);
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--glow-primary', theme.primary);
    root.setAttribute('data-theme', themeId);
    updateProject({ theme_profile: { ...currentProject.theme_profile, themeId, colorPalette: { primary: theme.primary, accent: theme.accent } } });
    toast({ title: `${theme.name} theme applied!` });
  };

  const sections = [
    { id: 'story', label: t('settings.storyDetails'), icon: BookOpen },
    { id: 'theme', label: t('settings.themeColors'), icon: Palette },
    { id: 'display', label: t('settings.display'), icon: Monitor },
    { id: 'editor', label: t('settings.editor'), icon: Type },
    { id: 'ai', label: t('settings.ai'), icon: Brain },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'privacy', label: t('settings.privacy'), icon: Shield },
    { id: 'advanced', label: t('settings.advanced'), icon: Wrench },
    { id: 'danger', label: t('settings.dangerZone'), icon: Trash2 },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      {/* Sidebar */}
      <div className="w-56 border-r border-border p-4 space-y-1">
        <h1 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" /> {t('settings.title')}
        </h1>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors",
              activeSection === section.id ? "bg-primary/10 text-primary" : "hover:bg-secondary/50",
              section.id === 'danger' && "text-destructive hover:bg-destructive/10"
            )}
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </button>
        ))}
        <Separator className="my-4" />
        <Button variant="ghost" size="sm" onClick={resetSettings} className="w-full gap-2">
          <RotateCcw className="h-4 w-4" /> {t('settings.resetAll')}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl space-y-8">
          
          {/* Story Details */}
          {activeSection === 'story' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> {t('settings.storyDetails')}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label>{t('settings.storyTitle')}</Label>
                  <Input value={currentProject.title} onChange={(e) => updateProject({ title: e.target.value })} className="mt-2 bg-secondary/30" />
                </div>
                <div>
                  <Label>{t('settings.storyLanguage')}</Label>
                  <Input value={currentProject.language} onChange={(e) => updateProject({ language: e.target.value })} className="mt-2 bg-secondary/30" placeholder="English" />
                </div>
                <div>
                  <Label>{t('settings.tone')} ({currentProject.tone_value < 0.3 ? 'Hopeful' : currentProject.tone_value > 0.7 ? 'Dark' : 'Balanced'})</Label>
                  <Slider value={[currentProject.tone_value]} onValueChange={([val]) => updateProject({ tone_value: val })} max={1} min={0} step={0.1} className="mt-4" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Hopeful</span><span>Balanced</span><span>Dark</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <Label>{t('settings.export')}</Label>
                  <p className="text-xs text-muted-foreground mb-2">Download your story in different formats</p>
                  <ExportDialog />
                </div>
              </div>
            </section>
          )}

          {/* Theme */}
          {activeSection === 'theme' && (
            <section>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> {t('settings.themeColors')}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Choose a color theme that matches your story's genre</p>
              <div className="grid grid-cols-2 gap-3">
                {GENRE_THEMES.map((theme) => (
                  <Card
                    key={theme.id}
                    onClick={() => applyTheme(theme.id)}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden border-2",
                      selectedTheme === theme.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", theme.preview)} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{theme.name}</span>
                        {selectedTheme === theme.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                      <div className="flex gap-1 mt-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.accent})` }} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Display */}
          {activeSection === 'display' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" /> {t('settings.display')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('settings.particles')}</Label>
                    <p className="text-xs text-muted-foreground">Animated particles in the background</p>
                  </div>
                  <Switch checked={settings.particles} onCheckedChange={(v) => updateSetting('particles', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('settings.animations')}</Label>
                    <p className="text-xs text-muted-foreground">Enable UI animations and transitions</p>
                  </div>
                  <Switch checked={settings.animations} onCheckedChange={(v) => updateSetting('animations', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('settings.reducedMotion')}</Label>
                    <p className="text-xs text-muted-foreground">Minimize motion for accessibility</p>
                  </div>
                  <Switch checked={settings.reducedMotion} onCheckedChange={(v) => updateSetting('reducedMotion', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('settings.compactMode')}</Label>
                    <p className="text-xs text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch checked={settings.compactMode} onCheckedChange={(v) => updateSetting('compactMode', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('settings.wordCount')}</Label>
                    <p className="text-xs text-muted-foreground">Display word counts in editor</p>
                  </div>
                  <Switch checked={settings.showWordCount} onCheckedChange={(v) => updateSetting('showWordCount', v)} />
                </div>
              </div>
            </section>
          )}

          {/* Editor */}
          {activeSection === 'editor' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" /> {t('settings.editor')}
              </h2>
              <div className="space-y-6">
                <div>
                  <Label>{t('settings.fontSize')}: {settings.fontSize}px</Label>
                  <Slider value={[settings.fontSize]} onValueChange={([v]) => updateSetting('fontSize', v)} min={12} max={28} step={1} className="mt-2" />
                </div>
                <div>
                  <Label>{t('settings.lineHeight')}: {settings.lineHeight}</Label>
                  <Slider value={[settings.lineHeight]} onValueChange={([v]) => updateSetting('lineHeight', v)} min={1.2} max={2.5} step={0.1} className="mt-2" />
                </div>
                <div>
                  <Label>{t('settings.fontFamily')}</Label>
                  <Select value={settings.fontFamily} onValueChange={(v) => updateSetting('fontFamily', v as any)}>
                    <SelectTrigger className="mt-2 bg-secondary/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif (Classic)</SelectItem>
                      <SelectItem value="sans">Sans-serif (Modern)</SelectItem>
                      <SelectItem value="mono">Monospace (Code)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('settings.autosave')}: {settings.autosaveInterval}s</Label>
                  <Slider value={[settings.autosaveInterval]} onValueChange={([v]) => updateSetting('autosaveInterval', v)} min={5} max={120} step={5} className="mt-2" />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.spellcheck')}</Label><p className="text-xs text-muted-foreground">Browser spellcheck</p></div>
                  <Switch checked={settings.spellcheck} onCheckedChange={(v) => updateSetting('spellcheck', v)} />
                </div>
              </div>
            </section>
          )}

          {/* AI */}
          {activeSection === 'ai' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> {t('settings.ai')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.aiEnabled')}</Label><p className="text-xs text-muted-foreground">AI-powered writing help</p></div>
                  <Switch checked={settings.aiEnabled} onCheckedChange={(v) => updateSetting('aiEnabled', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.autoSuggest')}</Label><p className="text-xs text-muted-foreground">Suggest completions as you type</p></div>
                  <Switch checked={settings.aiAutoSuggest} onCheckedChange={(v) => updateSetting('aiAutoSuggest', v)} />
                </div>
                <Separator />
                <p className="text-sm font-medium">{t('settings.contextSources')}</p>
                <p className="text-xs text-muted-foreground mb-2">Which data should AI use when writing?</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t('settings.useLore')}</Label>
                    <Switch checked={settings.aiUseLore} onCheckedChange={(v) => updateSetting('aiUseLore', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('settings.useOutline')}</Label>
                    <Switch checked={settings.aiUseOutline} onCheckedChange={(v) => updateSetting('aiUseOutline', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('settings.useStoryMap')}</Label>
                    <Switch checked={settings.aiUseStoryMap} onCheckedChange={(v) => updateSetting('aiUseStoryMap', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t('settings.useCharacters')}</Label>
                    <Switch checked={settings.aiUseCharacters} onCheckedChange={(v) => updateSetting('aiUseCharacters', v)} />
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>{t('settings.aiModel')}</Label>
                  <Select value={settings.aiModel} onValueChange={(v) => updateSetting('aiModel', v)}>
                    <SelectTrigger className="mt-2 bg-secondary/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <div><span>{model.name}</span><span className="text-xs text-muted-foreground ml-2">{model.description}</span></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('settings.creativity')}: {settings.aiTemperature}</Label>
                  <Slider value={[settings.aiTemperature]} onValueChange={([v]) => updateSetting('aiTemperature', v)} min={0.1} max={1.5} step={0.05} className="mt-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Focused</span><span>Balanced</span><span>Creative</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Language */}
          {activeSection === 'language' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> {t('settings.uiLanguage')}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Select the language for the user interface</p>
              <div className="grid grid-cols-2 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      "p-3 rounded-lg border-2 flex items-center gap-3 transition-all",
                      language === lang.code ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground">{lang.name}</p>
                    </div>
                    {language === lang.code && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> {t('settings.notifications')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.notifyOnSave')}</Label><p className="text-xs text-muted-foreground">Show toast when saving</p></div>
                  <Switch checked={settings.notifyOnSave} onCheckedChange={(v) => updateSetting('notifyOnSave', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.notifyOnAI')}</Label><p className="text-xs text-muted-foreground">Alert when AI generation finishes</p></div>
                  <Switch checked={settings.notifyOnAIComplete} onCheckedChange={(v) => updateSetting('notifyOnAIComplete', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.soundEffects')}</Label><p className="text-xs text-muted-foreground">Play sounds for actions</p></div>
                  <Switch checked={settings.soundEnabled} onCheckedChange={(v) => updateSetting('soundEnabled', v)} />
                </div>
              </div>
            </section>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> {t('settings.privacy')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.analytics')}</Label><p className="text-xs text-muted-foreground">Help improve the app</p></div>
                  <Switch checked={settings.analyticsEnabled} onCheckedChange={(v) => updateSetting('analyticsEnabled', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.crashReports')}</Label><p className="text-xs text-muted-foreground">Send error reports</p></div>
                  <Switch checked={settings.crashReports} onCheckedChange={(v) => updateSetting('crashReports', v)} />
                </div>
              </div>
            </section>
          )}

          {/* Advanced */}
          {activeSection === 'advanced' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" /> {t('settings.advanced')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.debugMode')}</Label><p className="text-xs text-muted-foreground">Show developer info</p></div>
                  <Switch checked={settings.debugMode} onCheckedChange={(v) => updateSetting('debugMode', v)} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t('settings.experimental')}
                    </Label>
                    <p className="text-xs text-muted-foreground">Enable advanced visual effects (glassmorphism, glows, animated orbs)</p>
                  </div>
                  <Switch checked={settings.experimentalFeatures} onCheckedChange={(v) => updateSetting('experimentalFeatures', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div><Label>{t('settings.autoBackup')}</Label><p className="text-xs text-muted-foreground">Automatic cloud backup</p></div>
                  <Switch checked={settings.autoBackup} onCheckedChange={(v) => updateSetting('autoBackup', v)} />
                </div>
                <div>
                  <Label>{t('settings.backupInterval')}: {settings.backupInterval}s</Label>
                  <Slider value={[settings.backupInterval]} onValueChange={([v]) => updateSetting('backupInterval', v)} min={60} max={600} step={60} className="mt-2" />
                </div>
              </div>
            </section>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" /> {t('settings.dangerZone')}
              </h2>
              <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5 space-y-4">
                <div>
                  <p className="font-medium text-destructive">{t('settings.deleteStory')}</p>
                  <p className="text-sm text-muted-foreground">This action cannot be undone. All chapters, characters, and lore will be permanently deleted.</p>
                </div>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? t('common.loading') : t('settings.deleteStory')}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
