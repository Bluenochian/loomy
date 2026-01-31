import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useStory } from '@/context/StoryContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
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

export function AppSidebar({ projectId }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useStory();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [collapsed, setCollapsed] = useState(false);
  const basePath = `/project/${projectId}`;

  const currentTheme = useMemo(() => {
    return currentProject?.theme_profile?.themeId || 'default';
  }, [currentProject?.theme_profile?.themeId]);

  const navItems = [
    { titleKey: 'nav.dashboard' as const, icon: LayoutDashboard, path: '' },
    { titleKey: 'nav.overview' as const, icon: BookOpen, path: '/overview' },
    { titleKey: 'nav.outline' as const, icon: ListTree, path: '/outline' },
    { titleKey: 'nav.chapters' as const, icon: FileText, path: '/chapters' },
    { titleKey: 'nav.characters' as const, icon: Users, path: '/characters' },
    { titleKey: 'nav.lore' as const, icon: Globe, path: '/lore' },
    { titleKey: 'nav.map' as const, icon: Map, path: '/map' },
    { titleKey: 'nav.studio' as const, icon: PenTool, path: '/studio' },
    { titleKey: 'nav.settings' as const, icon: Settings, path: '/settings' },
  ];

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
        'h-screen flex flex-col transition-all duration-300 ease-out-expo sticky top-0 z-10',
        collapsed ? 'w-16' : 'w-64',
        // Glass effect - slightly more transparent
        settings.glassSidebar 
          ? 'bg-sidebar/50 backdrop-blur-xl border-r border-white/5 shadow-xl' 
          : 'bg-sidebar/80 backdrop-blur-sm border-r border-sidebar-border/50'
      )}
    >
      {/* Frosted glass overlay for extra effect */}
      {settings.glassSidebar && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" />
      )}
      
      {/* Logo / Brand */}
      <div className={cn(
        "relative h-16 flex items-center justify-between px-4",
        settings.glassSidebar 
          ? "border-b border-white/10" 
          : "border-b border-sidebar-border"
      )}>
        {!collapsed ? (
          <ThemedLogo size="md" />
        ) : (
          <ThemedLogo size="sm" showText={false} />
        )}
      </div>

      {/* All Projects Button */}
      <div className={cn(
        "relative px-2 py-2",
        settings.glassSidebar 
          ? "border-b border-white/10" 
          : "border-b border-sidebar-border"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className={cn(
            "w-full gap-2 transition-all",
            collapsed ? "justify-center px-0" : "justify-start",
            settings.glassSidebar && "hover:bg-white/10"
          )}
        >
          <Library className="h-4 w-4" />
          {!collapsed && <span>{t('nav.allProjects')}</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 py-4 overflow-y-auto no-scrollbar">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.titleKey}>
              <NavLink
                to={`${basePath}${item.path}`}
                end={item.path === ''}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  collapsed && 'justify-center',
                  settings.glassSidebar
                    ? 'text-foreground/70 hover:text-foreground hover:bg-white/10'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                )}
                activeClassName={cn(
                  "font-medium",
                  settings.glassSidebar
                    ? "bg-white/15 backdrop-blur-sm text-foreground border-l-2 border-primary"
                    : "bg-gradient-warm border-l-2 border-primary text-sidebar-foreground"
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive(item.path) && 'text-primary')} />
                {!collapsed && <span>{t(item.titleKey)}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className={cn(
        "relative p-3",
        settings.glassSidebar 
          ? "border-t border-white/10" 
          : "border-t border-sidebar-border"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center",
            settings.glassSidebar && "hover:bg-white/10"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">{t('nav.collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
