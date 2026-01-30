import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useStory } from '@/context/StoryContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  ListTree,
  FileText,
  Users,
  Globe,
  Map,
  PenTool,
  Settings,
  ChevronLeft,
  ChevronRight,
  Library,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemedLogo } from '@/components/themes/ThemedLogo';
import { useState, useMemo } from 'react';

interface AppSidebarProps {
  projectId: string;
}

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '' },
  { title: 'Story Overview', icon: BookOpen, path: '/overview' },
  { title: 'Outline', icon: ListTree, path: '/outline' },
  { title: 'Chapters', icon: FileText, path: '/chapters' },
  { title: 'Characters', icon: Users, path: '/characters' },
  { title: 'Lore & World', icon: Globe, path: '/lore' },
  { title: 'Story Map', icon: Map, path: '/map' },
  { title: 'Writing Studio', icon: PenTool, path: '/studio' },
  { title: 'Settings', icon: Settings, path: '/settings' },
];

export function AppSidebar({ projectId }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useStory();
  const [collapsed, setCollapsed] = useState(false);
  const basePath = `/project/${projectId}`;

  const currentTheme = useMemo(() => {
    return currentProject?.theme_profile?.themeId || 'default';
  }, [currentProject?.theme_profile?.themeId]);

  const isActive = (path: string) => {
    const fullPath = `${basePath}${path}`;
    if (path === '') {
      return location.pathname === basePath || location.pathname === `${basePath}/`;
    }
    return location.pathname.startsWith(fullPath);
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-out-expo sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed ? (
          <ThemedLogo themeId={currentTheme} size="md" />
        ) : (
          <ThemedLogo themeId={currentTheme} size="sm" showText={false} />
        )}
      </div>

      {/* All Projects Button */}
      <div className="px-2 py-2 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className={cn("w-full gap-2", collapsed ? "justify-center px-0" : "justify-start")}
        >
          <Library className="h-4 w-4" />
          {!collapsed && <span>All Projects</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={`${basePath}${item.path}`}
                end={item.path === ''}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                  collapsed && 'justify-center'
                )}
                activeClassName="bg-gradient-warm border-l-2 border-primary text-sidebar-foreground font-medium"
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive(item.path) && 'text-primary')} />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
