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
      {/* PREMIUM DEEP BLUR BACKGROUND - Like grimoire.lovable.app */}
      {/* This creates the atmospheric depth with heavy blur */}
      
      {/* Base dark gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `hsl(${activeSubTheme.background})`,
        }}
      />

      {/* Large blurred atmospheric orbs - the key to the reference look */}
      <div className="absolute inset-0">
        {/* Primary glow - top left with massive blur */}
        <div 
          className="absolute animate-float"
          style={{
            top: '-25%',
            left: '-20%',
            width: '70vw',
            height: '70vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.primary} / 0.2) 0%, hsl(${activeSubTheme.primary} / 0.08) 40%, transparent 70%)`,
            filter: 'blur(120px)',
            animationDuration: '25s',
          }}
        />
        
        {/* Accent glow - bottom right */}
        <div 
          className="absolute animate-float"
          style={{
            bottom: '-25%',
            right: '-20%',
            width: '65vw',
            height: '65vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.accent} / 0.15) 0%, hsl(${activeSubTheme.accent} / 0.05) 40%, transparent 70%)`,
            filter: 'blur(140px)',
            animationDuration: '30s',
            animationDelay: '-10s',
          }}
        />

        {/* Center ambient depth */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '100vw',
            height: '100vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.primary} / 0.1) 0%, transparent 50%)`,
            filter: 'blur(150px)',
          }}
        />

        {/* Additional floating orbs */}
        <div 
          className="absolute animate-float"
          style={{
            top: '15%',
            right: '20%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.secondary} / 0.12) 0%, transparent 60%)`,
            filter: 'blur(100px)',
            animationDuration: '35s',
            animationDelay: '-15s',
          }}
        />
        
        <div 
          className="absolute animate-float"
          style={{
            bottom: '20%',
            left: '15%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.accent} / 0.1) 0%, transparent 60%)`,
            filter: 'blur(90px)',
            animationDuration: '28s',
            animationDelay: '-20s',
          }}
        />
      </div>

      {/* Canvas effects layer */}
      <ThemeEffectsCanvas 
        subTheme={activeSubTheme} 
        reducedMotion={settings.reducedMotion} 
      />

      {/* Vignette overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, hsl(${activeSubTheme.background} / 0.4) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
