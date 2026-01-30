import { cn } from '@/lib/utils';
import { Sparkles, Sword, Zap, Heart, Skull, Search, Compass, BookOpen } from 'lucide-react';

interface ThemedLogoProps {
  themeId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const THEME_ICONS: Record<string, typeof Sparkles> = {
  default: Sparkles,
  fantasy: Sword,
  scifi: Zap,
  romance: Heart,
  horror: Skull,
  mystery: Search,
  adventure: Compass,
  thriller: BookOpen,
};

const THEME_STYLES: Record<string, { iconClass: string; glowClass: string; textGradient: string }> = {
  default: {
    iconClass: 'text-primary',
    glowClass: 'shadow-glow',
    textGradient: 'from-primary to-accent',
  },
  fantasy: {
    iconClass: 'text-yellow-400',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(45_80%_50%/0.5)]',
    textGradient: 'from-yellow-400 to-purple-500',
  },
  scifi: {
    iconClass: 'text-cyan-400',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(190_80%_50%/0.5)]',
    textGradient: 'from-cyan-400 to-violet-500',
  },
  romance: {
    iconClass: 'text-rose-400',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(340_70%_60%/0.5)]',
    textGradient: 'from-rose-400 to-pink-500',
  },
  horror: {
    iconClass: 'text-red-500',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(0_60%_45%/0.5)]',
    textGradient: 'from-red-500 to-purple-800',
  },
  mystery: {
    iconClass: 'text-indigo-400',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(230_60%_55%/0.5)]',
    textGradient: 'from-indigo-400 to-teal-500',
  },
  adventure: {
    iconClass: 'text-orange-400',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(30_60%_50%/0.5)]',
    textGradient: 'from-orange-400 to-green-500',
  },
  thriller: {
    iconClass: 'text-slate-300',
    glowClass: 'shadow-[0_0_30px_-5px_hsl(0_0%_95%/0.3)]',
    textGradient: 'from-slate-300 to-red-500',
  },
};

const SIZES = {
  sm: { icon: 'h-5 w-5', text: 'text-lg', container: 'p-1.5' },
  md: { icon: 'h-6 w-6', text: 'text-xl', container: 'p-2' },
  lg: { icon: 'h-8 w-8', text: 'text-2xl', container: 'p-2.5' },
  xl: { icon: 'h-10 w-10', text: 'text-3xl', container: 'p-3' },
};

export function ThemedLogo({ themeId = 'default', size = 'md', showText = true, className }: ThemedLogoProps) {
  const Icon = THEME_ICONS[themeId] || THEME_ICONS.default;
  const style = THEME_STYLES[themeId] || THEME_STYLES.default;
  const sizeConfig = SIZES[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-500",
          sizeConfig.container,
          style.glowClass
        )}
      >
        <Icon className={cn(sizeConfig.icon, style.iconClass, "transition-colors duration-500")} />
      </div>
      {showText && (
        <span 
          className={cn(
            "font-display font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500",
            sizeConfig.text,
            style.textGradient
          )}
        >
          LOOMY
        </span>
      )}
    </div>
  );
}
