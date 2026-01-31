import { useState, useEffect } from 'react';
import { getRandomSubTheme, getSubThemeById, getParentTheme, SubTheme, MainTheme } from '@/config/themes';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Shuffle, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemePreviewBadge() {
  const { settings, updateSetting } = useSettings();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Get current theme info
  const currentSubTheme = settings.selectedSubTheme 
    ? getSubThemeById(settings.selectedSubTheme) 
    : null;
  const currentParentTheme = settings.selectedSubTheme 
    ? getParentTheme(settings.selectedSubTheme) 
    : null;
  
  // Randomize on first load if no theme selected
  useEffect(() => {
    if (!settings.selectedSubTheme) {
      const random = getRandomSubTheme();
      updateSetting('selectedSubTheme', random.subTheme.id);
    }
  }, []);
  
  const handleRandomize = () => {
    setIsAnimating(true);
    const random = getRandomSubTheme();
    updateSetting('selectedSubTheme', random.subTheme.id);
    
    setTimeout(() => setIsAnimating(false), 600);
  };
  
  if (!currentSubTheme || !currentParentTheme) return null;
  
  // Get translated names
  const parentName = t(currentParentTheme.nameKey as any) || currentParentTheme.nameKey;
  const subName = t(currentSubTheme.nameKey as any) || currentSubTheme.nameKey;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-full",
          "bg-background/60 backdrop-blur-md border border-border/50",
          "shadow-lg transition-all duration-300",
          isAnimating && "scale-105"
        )}
      >
        {/* Theme color preview */}
        <div 
          className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
          style={{ 
            background: `linear-gradient(135deg, hsl(${currentSubTheme.primary}), hsl(${currentSubTheme.accent}))`
          }}
        />
        
        {/* Theme info */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground/70 flex items-center gap-1">
            <span>{currentParentTheme.icon}</span>
            {parentName}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {subName}
          </span>
        </div>
        
        {/* Randomize button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/20"
          onClick={handleRandomize}
          title="Randomize Theme"
        >
          <Shuffle className={cn(
            "h-4 w-4 transition-transform duration-300",
            isAnimating && "animate-spin"
          )} />
        </Button>
      </div>
    </div>
  );
}
