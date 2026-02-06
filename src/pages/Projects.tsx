import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { ThemeEffects } from '@/components/themes/ThemeEffects';
import { ThemedLogo } from '@/components/themes/ThemedLogo';
import { Sparkles, Plus, BookOpen, Clock, Loader2, LogOut, User } from 'lucide-react';
import type { Project } from '@/types/story';

export default function Projects() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const themeId = settings.selectedSubTheme || 'default';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadProjects() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        setProjects(data as Project[]);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadProjects();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Effects Background */}
      <ThemeEffects themeId={themeId} />
      
      {/* Language Selector */}
      <div className="fixed top-4 left-4 z-50">
        <LanguageSelector variant="compact" />
      </div>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThemedLogo size="md" />
             </div>
             <h1 className="font-display text-3xl font-bold">{t('projects.yourStories')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('projects.signOut')}</span>
            </Button>
            <Button variant="hero" onClick={() => navigate('/')}>
              <Plus className="h-4 w-4" />
              {t('projects.newStory')}
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold mb-2">{t('projects.noStories')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('projects.createFirst')}
            </p>
            <Button variant="hero" onClick={() => navigate('/')}>
              <Sparkles className="h-4 w-4" />
              {t('projects.createFirstButton')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group text-left p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize px-2 py-1 rounded-full bg-secondary">
                    {t(`projects.status.${project.status}` as any) || project.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.concept}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {t('projects.updated')} {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
