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
      {/* Base background - solid color from theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: `hsl(${activeSubTheme.background})`,
        }}
      />

      {/* Subtle ambient glow - NOT excessive blur */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, hsl(${activeSubTheme.primary} / 0.08) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 60%, hsl(${activeSubTheme.accent} / 0.05) 0%, transparent 45%)`,
        }}
      />

      {/* Canvas effects - the actual animated content */}
      <ThemeEffectsCanvas 
        subTheme={activeSubTheme} 
        reducedMotion={settings.reducedMotion} 
      />

      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, hsl(${activeSubTheme.background} / 0.4) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
