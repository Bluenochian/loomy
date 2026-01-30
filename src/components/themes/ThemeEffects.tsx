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
      {/* Deep atmospheric blur background - like grimoire.lovable.app */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, 
            hsl(${activeSubTheme.background} / 0.3) 0%, 
            hsl(${activeSubTheme.background} / 0.7) 50%, 
            hsl(${activeSubTheme.background} / 0.95) 100%)`,
        }}
      />

      {/* Animated effects canvas */}
      <ThemeEffectsCanvas 
        subTheme={activeSubTheme} 
        reducedMotion={settings.reducedMotion} 
      />

      {/* Deep atmospheric blur orbs for premium feel */}
      <div className="absolute inset-0">
        {/* Primary glow - large, blurred, positioned for depth */}
        <div 
          className="absolute rounded-full animate-float"
          style={{
            top: '-15%',
            left: '-10%',
            width: '60vw',
            height: '60vw',
            background: `radial-gradient(circle, hsl(${activeSubTheme.primary} / 0.15) 0%, hsl(${activeSubTheme.primary} / 0.05) 40%, transparent 70%)`,
            filter: 'blur(80px)',
            animationDuration: '20s',
          }}
        />
        
        {/* Accent glow - opposite corner */}
        <div 
          className="absolute rounded-full animate-float"
          style={{
            bottom: '-20%',
            right: '-15%',
            width: '55vw',
            height: '55vw',
            background: `radial-gradient(circle, hsl(${activeSubTheme.accent} / 0.12) 0%, hsl(${activeSubTheme.accent} / 0.04) 40%, transparent 70%)`,
            filter: 'blur(100px)',
            animationDuration: '25s',
            animationDelay: '-8s',
          }}
        />

        {/* Center ambient - creates depth */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '80vw',
            height: '80vw',
            background: `radial-gradient(circle, hsl(${activeSubTheme.primary} / 0.08) 0%, transparent 60%)`,
            filter: 'blur(120px)',
          }}
        />

        {/* Floating secondary orbs for motion */}
        <div 
          className="absolute rounded-full animate-float"
          style={{
            top: '20%',
            right: '25%',
            width: '35vw',
            height: '35vw',
            background: `radial-gradient(circle, hsl(${activeSubTheme.secondary} / 0.1) 0%, transparent 60%)`,
            filter: 'blur(60px)',
            animationDuration: '28s',
            animationDelay: '-12s',
          }}
        />
        
        <div 
          className="absolute rounded-full animate-float"
          style={{
            bottom: '25%',
            left: '20%',
            width: '30vw',
            height: '30vw',
            background: `radial-gradient(circle, hsl(${activeSubTheme.accent} / 0.08) 0%, transparent 60%)`,
            filter: 'blur(70px)',
            animationDuration: '32s',
            animationDelay: '-18s',
          }}
        />
      </div>

      {/* Very subtle noise for texture - barely visible */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
