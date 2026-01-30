import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

interface ProjectLayoutProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar projectId={projectId} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
