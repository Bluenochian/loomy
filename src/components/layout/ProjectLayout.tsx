import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { ThemeEffects } from '@/components/themes/ThemeEffects';
import { ParticlesBackground } from '@/components/ParticlesBackground';
import { ExportDialog } from '@/components/export/ExportDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useSettings } from '@/context/SettingsContext';
import { useStory } from '@/context/StoryContext';

interface ProjectLayoutProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  const { settings } = useSettings();
  const { currentProject } = useStory();
  const themeId = currentProject?.theme_profile?.themeId || 'default';

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Background effects */}
      {settings.particles && <ParticlesBackground />}
      {settings.experimentalFeatures && <ThemeEffects themeId={themeId} />}
      
      <AppSidebar projectId={projectId} />
      <main className="flex-1 overflow-y-auto relative">
        {/* Top bar with export and language */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <ExportDialog />
          <LanguageSelector variant="minimal" />
        </div>
        {children}
      </main>
    </div>
  );
}
