import { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { getSubThemeById, getParentTheme } from '@/config/themes';

/**
 * Apply global theme based on saved settings
 * This hook should be used at the app root level to ensure
 * theme persists across all pages
 */
export function useGlobalTheme() {
  const { settings } = useSettings();
  const subThemeId = settings.selectedSubTheme;

  useEffect(() => {
    const root = document.documentElement;
    
    if (!subThemeId) {
      // Default theme
      root.removeAttribute('data-subtheme');
      root.removeAttribute('data-theme');
      return;
    }

    const subTheme = getSubThemeById(subThemeId);
    const parentTheme = getParentTheme(subThemeId);

    if (subTheme) {
      // Apply CSS variables
      root.style.setProperty('--primary', subTheme.primary);
      root.style.setProperty('--accent', subTheme.accent);
      root.style.setProperty('--ring', subTheme.primary);
      root.style.setProperty('--glow-primary', subTheme.primary);
      root.style.setProperty('--sidebar-primary', subTheme.primary);
      root.style.setProperty('--sidebar-ring', subTheme.primary);

      // Calculate foreground colors for contrast
      const primaryParts = subTheme.primary.split(' ').map(p => parseFloat(p));
      const primaryLightness = primaryParts[2] || 50;
      root.style.setProperty('--primary-foreground', primaryLightness > 50 ? '222 25% 8%' : '40 20% 95%');

      const accentParts = subTheme.accent.split(' ').map(p => parseFloat(p));
      const accentLightness = accentParts[2] || 50;
      root.style.setProperty('--accent-foreground', accentLightness > 50 ? '222 25% 8%' : '40 20% 95%');

      // Set data attributes for CSS selectors
      root.setAttribute('data-subtheme', subThemeId);
      root.setAttribute('data-theme', parentTheme?.id || 'default');
    }
  }, [subThemeId]);
}
