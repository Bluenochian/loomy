import { useSettings } from '@/context/SettingsContext';
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
      {/* PREMIUM DEEP ATMOSPHERIC BACKGROUND */}
      {/* Creates the glassy, blurred depth effect like grimoire.lovable.app */}
      
      {/* Base background color */}
      <div 
        className="absolute inset-0"
        style={{
          background: `hsl(${activeSubTheme.background})`,
        }}
      />

      {/* Large blurred atmospheric orbs - creates premium depth */}
      <div className="absolute inset-0">
        {/* Primary glow - top left with massive blur */}
        <div 
          className="absolute animate-float"
          style={{
            top: '-30%',
            left: '-25%',
            width: '80vw',
            height: '80vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.primary} / 0.18) 0%, hsl(${activeSubTheme.primary} / 0.06) 40%, transparent 70%)`,
            filter: 'blur(100px)',
            animationDuration: '30s',
          }}
        />
        
        {/* Accent glow - bottom right */}
        <div 
          className="absolute animate-float"
          style={{
            bottom: '-30%',
            right: '-25%',
            width: '75vw',
            height: '75vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.accent} / 0.12) 0%, hsl(${activeSubTheme.accent} / 0.04) 40%, transparent 70%)`,
            filter: 'blur(120px)',
            animationDuration: '35s',
            animationDelay: '-12s',
          }}
        />

        {/* Center ambient depth - subtle */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '120vw',
            height: '120vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.primary} / 0.08) 0%, transparent 50%)`,
            filter: 'blur(150px)',
          }}
        />

        {/* Secondary floating orb - top right */}
        <div 
          className="absolute animate-float"
          style={{
            top: '10%',
            right: '15%',
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.secondary} / 0.1) 0%, transparent 60%)`,
            filter: 'blur(90px)',
            animationDuration: '40s',
            animationDelay: '-20s',
          }}
        />
        
        {/* Extra accent orb - bottom left */}
        <div 
          className="absolute animate-float"
          style={{
            bottom: '15%',
            left: '10%',
            width: '45vw',
            height: '45vw',
            borderRadius: '50%',
            background: `radial-gradient(circle, hsl(${activeSubTheme.accent} / 0.08) 0%, transparent 60%)`,
            filter: 'blur(80px)',
            animationDuration: '32s',
            animationDelay: '-25s',
          }}
        />
      </div>

      {/* Canvas effects layer - rendered with blur for background feel */}
      <div style={{ filter: 'blur(2px)', opacity: 0.9 }}>
        <ThemeEffectsCanvas 
          subTheme={activeSubTheme} 
          reducedMotion={settings.reducedMotion} 
        />
      </div>

      {/* Deep vignette overlay for premium depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, transparent 30%, hsl(${activeSubTheme.background} / 0.5) 80%, hsl(${activeSubTheme.background} / 0.8) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle grain texture for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
