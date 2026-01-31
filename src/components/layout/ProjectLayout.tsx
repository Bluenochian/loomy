import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { ThemeEffects } from '@/components/themes/ThemeEffects';
import { useStory } from '@/context/StoryContext';

interface ProjectLayoutProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  const { currentProject } = useStory();
  const themeId = currentProject?.theme_profile?.themeId || 'default';

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Background effects - always show theme effects */}
      <ThemeEffects themeId={themeId} />
      
      <AppSidebar projectId={projectId} />
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
