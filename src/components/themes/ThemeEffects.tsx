import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import { getSubThemeById, THEME_CONFIG } from '@/config/themes';
import { ThemeEffectsCanvas } from './ThemeEffectsCanvas';

interface ThemeEffectsProps {
  themeId?: string;
}

// Get default sub-theme for a main theme
const getDefaultSubTheme = (themeId: string) => {
  const theme = THEME_CONFIG.find(t => t.id === themeId);
  return theme?.subThemes[0] || THEME_CONFIG[0].subThemes[0];
};

export function ThemeEffects({ themeId = 'default' }: ThemeEffectsProps) {
  const { settings } = useSettings();
  
  // Get the active sub-theme
  const activeSubTheme = settings.selectedSubTheme 
    ? getSubThemeById(settings.selectedSubTheme) 
    : getDefaultSubTheme(themeId);

  if (!activeSubTheme) return null;

  // Don't render if reduced motion is enabled
  if (settings.reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated effects canvas */}
      <ThemeEffectsCanvas 
        subTheme={activeSubTheme} 
        reducedMotion={settings.reducedMotion} 
      />

      {/* Seamless gradient orbs - CSS based for smooth performance */}
      <div className="absolute inset-0">
        {/* Top-left glow */}
        <div 
          className={cn(
            "absolute -top-64 -left-64 w-[800px] h-[800px] rounded-full blur-[180px] animate-float",
            "bg-gradient-to-br from-primary/25 via-primary/10 to-transparent"
          )} 
          style={{ animationDuration: '15s' }}
        />
        
        {/* Bottom-right glow */}
        <div 
          className={cn(
            "absolute -bottom-64 -right-64 w-[700px] h-[700px] rounded-full blur-[160px] animate-float",
            "bg-gradient-to-tl from-accent/25 via-accent/10 to-transparent"
          )}
          style={{ animationDuration: '18s', animationDelay: '-6s' }}
        />

        {/* Center ambient glow */}
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[1200px] h-[1200px] rounded-full blur-[200px]",
            "bg-gradient-radial from-primary/12 via-transparent to-transparent"
          )}
        />

        {/* Floating accent orbs */}
        <div 
          className={cn(
            "absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full blur-[120px]",
            "bg-gradient-to-br from-accent/20 to-transparent animate-float"
          )}
          style={{ animationDuration: '22s', animationDelay: '-10s' }}
        />
        
        <div 
          className={cn(
            "absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full blur-[100px]",
            "bg-gradient-to-tr from-primary/18 to-accent/8 animate-float"
          )}
          style={{ animationDuration: '25s', animationDelay: '-15s' }}
        />
      </div>

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
