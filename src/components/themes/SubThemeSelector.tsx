import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { THEME_CONFIG, MainTheme, SubTheme } from '@/config/themes';

interface SubThemeSelectorProps {
  selectedSubTheme: string | null;
  onSelectSubTheme: (subTheme: SubTheme, parentTheme: MainTheme) => void;
}

export function SubThemeSelector({ selectedSubTheme, onSelectSubTheme }: SubThemeSelectorProps) {
  const { t } = useLanguage();
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);

  const getSelectedParentTheme = () => {
    if (!selectedSubTheme) return null;
    for (const theme of THEME_CONFIG) {
      if (theme.subThemes.some(s => s.id === selectedSubTheme)) {
        return theme.id;
      }
    }
    return null;
  };

  const selectedParent = getSelectedParentTheme();

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEME_CONFIG.map((theme) => {
        const isExpanded = expandedTheme === theme.id;
        const hasSelectedChild = theme.subThemes.some(s => s.id === selectedSubTheme);
        
        return (
          <Popover key={theme.id} open={isExpanded} onOpenChange={(open) => setExpandedTheme(open ? theme.id : null)}>
            <PopoverTrigger asChild>
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] relative overflow-hidden border-2 group",
                  hasSelectedChild 
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Preview gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity group-hover:opacity-60",
                  theme.subThemes[0]?.preview || 'from-primary/20 to-accent/20'
                )} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{theme.icon}</span>
                      <span className="font-medium text-sm">{t(theme.nameKey as any)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasSelectedChild && <Check className="h-4 w-4 text-primary" />}
                      <ChevronRight className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                  <div className="flex gap-1 mt-2">
                    {theme.subThemes.slice(0, 4).map((sub, i) => (
                      <div 
                        key={i}
                        className="w-3 h-3 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: `hsl(${sub.primary})` }}
                      />
                    ))}
                    {theme.subThemes.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{theme.subThemes.length - 4}</span>
                    )}
                  </div>
                </div>
              </Card>
            </PopoverTrigger>
            
            <PopoverContent 
              side="right" 
              align="start" 
              className="w-80 p-0 bg-background/95 backdrop-blur-xl border-primary/20"
              sideOffset={8}
            >
              <div className="p-3 border-b border-border bg-primary/5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{theme.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{t(theme.nameKey as any)}</h3>
                    <p className="text-xs text-muted-foreground">Select a style</p>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="h-[320px]">
                <div className="p-2 space-y-2">
                  {theme.subThemes.map((subTheme) => {
                    const isSelected = selectedSubTheme === subTheme.id;
                    
                    return (
                      <button
                        key={subTheme.id}
                        onClick={() => {
                          onSelectSubTheme(subTheme, theme);
                          setExpandedTheme(null);
                        }}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all duration-200 relative overflow-hidden group/sub",
                          isSelected 
                            ? "bg-primary/15 ring-2 ring-primary/50" 
                            : "hover:bg-secondary/50"
                        )}
                      >
                        {/* Sub-theme preview gradient */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r opacity-30 group-hover/sub:opacity-50 transition-opacity",
                          subTheme.preview
                        )} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm flex items-center gap-2">
                              {t(subTheme.nameKey as any)}
                              {subTheme.effects.overlays.length > 2 && (
                                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                              )}
                            </span>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {subTheme.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div 
                                className="w-4 h-4 rounded-full ring-1 ring-white/20"
                                style={{ backgroundColor: `hsl(${subTheme.primary})` }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full ring-1 ring-white/20"
                                style={{ backgroundColor: `hsl(${subTheme.accent})` }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full ring-1 ring-white/20"
                                style={{ backgroundColor: `hsl(${subTheme.secondary})` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {subTheme.effects.overlays.length} effects • {subTheme.effects.style}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
