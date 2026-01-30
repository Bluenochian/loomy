import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
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
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  const [collapsed, setCollapsed] = useState(false);
  const basePath = `/project/${projectId}`;

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
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-semibold gradient-text">
              STORYLOOM
            </span>
          </div>
        )}
        {collapsed && (
          <Sparkles className="h-6 w-6 text-primary mx-auto" />
        )}
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
