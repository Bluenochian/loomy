import { cn } from '@/lib/utils';
import { Sparkles, Sword, Zap, Heart, Skull, Search, Compass, BookOpen, Radiation, Flower2, Cog, History, Crown, Snowflake, Flame, FlaskConical, Star, Ghost, TreePine, Eye, Activity, Cpu, Binary, Atom, Factory, Biohazard, ShieldAlert, Sun, Gem, Cloud, Waves, Anchor, Mountain, Castle, Columns, Axe, Swords, Lock, Radar, LampDesk, BookMarked, Flashlight, Landmark, TreeDeciduous, Moon, Feather } from 'lucide-react';
import { getSubThemeById, getParentTheme } from '@/config/themes';
import { useSettings } from '@/context/SettingsContext';
interface ThemedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// Map icon names to components
const ICON_MAP: Record<string, typeof Sparkles> = {
  'sparkles': Sparkles,
  'crown': Crown,
  'snowflake': Snowflake,
  'flame': Flame,
  'flask-conical': FlaskConical,
  'star': Star,
  'ghost': Ghost,
  'tree-pine': TreePine,
  'bat': Skull,
  // Using Skull as bat alternative
  'eye': Eye,
  'activity': Activity,
  'cpu': Cpu,
  'orbit': Compass,
  'binary': Binary,
  'scan': Zap,
  'atom': Atom,
  'zap': Zap,
  'radiation': Radiation,
  'factory': Factory,
  'biohazard': Biohazard,
  'shield-alert': ShieldAlert,
  'sun': Sun,
  'gem': Gem,
  'cloud': Cloud,
  'waves': Waves,
  'flower-2': Flower2,
  'cog': Cog,
  'ship': Compass,
  'lightbulb': Sparkles,
  'lamp': LampDesk,
  'heart': Heart,
  'sparkle': Sparkles,
  'sunset': Sun,
  'flower': Flower2,
  'search': Search,
  'link': Zap,
  'lock': Lock,
  'radar': Radar,
  'lamp-desk': LampDesk,
  'book-marked': BookMarked,
  'flashlight': Flashlight,
  'landmark': Landmark,
  'palmtree': TreeDeciduous,
  'mountain-snow': Mountain,
  'anchor': Anchor,
  'mountain': Mountain,
  'coins': Star,
  'castle': Castle,
  'columns': Columns,
  'axe': Axe,
  'pyramid': Mountain,
  'swords': Swords,
  'book-open': BookOpen,
  'tree-deciduous': TreeDeciduous,
  'moon': Moon,
  'feather': Feather
};

// Font families for different themes
const FONT_FAMILIES: Record<string, string> = {
  // Fantasy
  'Cinzel Decorative': '"Cinzel Decorative", serif',
  'Cormorant Garamond': '"Cormorant Garamond", serif',
  'Pirata One': '"Pirata One", cursive',
  'Tangerine': '"Tangerine", cursive',
  'Mystery Quest': '"Mystery Quest", cursive',
  'Almendra Display': '"Almendra Display", cursive',
  // Horror
  'Nosifer': '"Nosifer", display',
  'Eater': '"Eater", display',
  'Creepster': '"Creepster", display',
  'UnifrakturMaguntia': '"UnifrakturMaguntia", cursive',
  'Butcherman': '"Butcherman", display',
  'Special Elite': '"Special Elite", monospace',
  // Sci-Fi
  'Orbitron': '"Orbitron", sans-serif',
  'Exo 2': '"Exo 2", sans-serif',
  'Share Tech Mono': '"Share Tech Mono", monospace',
  'Rajdhani': '"Rajdhani", sans-serif',
  'Audiowide': '"Audiowide", display',
  'Electrolize': '"Electrolize", sans-serif',
  // Dystopia
  'Bungee': '"Bungee", display',
  'Russo One': '"Russo One", sans-serif',
  'Bangers': '"Bangers", display',
  'Black Ops One': '"Black Ops One", display',
  'Anton': '"Anton", sans-serif',
  // Utopia
  'Comfortaa': '"Comfortaa", display',
  'Poiret One': '"Poiret One", display',
  'Quicksand': '"Quicksand", sans-serif',
  'Satisfy': '"Satisfy", cursive',
  'Noto Serif JP': '"Noto Serif JP", serif',
  // Steampunk
  'IM Fell English': '"IM Fell English", serif',
  'Marcellus': '"Marcellus", serif',
  'Vollkorn': '"Vollkorn", serif',
  'Libre Baskerville': '"Libre Baskerville", serif',
  // Romance
  'Great Vibes': '"Great Vibes", cursive',
  'Dancing Script': '"Dancing Script", cursive',
  'Pacifico': '"Pacifico", display',
  'Kaushan Script': '"Kaushan Script", cursive',
  'Cormorant Upright': '"Cormorant Upright", serif',
  // Thriller
  'Permanent Marker': '"Permanent Marker", cursive',
  'Cutive Mono': '"Cutive Mono", monospace',
  'Bebas Neue': '"Bebas Neue", display',
  'Roboto Mono': '"Roboto Mono", monospace',
  // Mystery
  'EB Garamond': '"EB Garamond", serif',
  'Spectral': '"Spectral", serif',
  'Oswald': '"Oswald", sans-serif',
  'Uncial Antiqua': '"Uncial Antiqua", cursive',
  // Adventure
  'Amatic SC': '"Amatic SC", cursive',
  'Philosopher': '"Philosopher", sans-serif',
  'Lora': '"Lora", serif',
  'Arvo': '"Arvo", serif',
  'Rye': '"Rye", display',
  // Historical
  'MedievalSharp': '"MedievalSharp", cursive',
  'Caesar Dressing': '"Caesar Dressing", cursive',
  'Germania One': '"Germania One", display',
  'Papyrus': '"Papyrus", fantasy',
  'Shippori Mincho': '"Shippori Mincho", serif',
  // Default
  'Playfair Display': '"Playfair Display", serif',
  'Crimson Text': '"Crimson Text", serif',
  'Merriweather': '"Merriweather", serif'
};
const SIZES = {
  sm: {
    icon: 'h-5 w-5',
    text: 'text-lg',
    container: 'p-1.5',
    glow: 20
  },
  md: {
    icon: 'h-6 w-6',
    text: 'text-xl',
    container: 'p-2',
    glow: 25
  },
  lg: {
    icon: 'h-8 w-8',
    text: 'text-2xl',
    container: 'p-2.5',
    glow: 30
  },
  xl: {
    icon: 'h-10 w-10',
    text: 'text-3xl',
    container: 'p-3',
    glow: 40
  }
};

// Default theme styles when no sub-theme selected
const DEFAULT_STYLE = {
  iconClass: 'text-primary',
  glowColor: 'hsl(var(--primary) / 0.4)',
  textGradient: 'from-primary to-accent',
  font: '"Playfair Display", serif',
  icon: Sparkles
};
export function ThemedLogo({
  size = 'md',
  showText = true,
  className
}: ThemedLogoProps) {
  const {
    settings
  } = useSettings();
  const subThemeId = settings.selectedSubTheme;

  // Get sub-theme and parent theme
  const subTheme = subThemeId ? getSubThemeById(subThemeId) : null;
  const parentTheme = subThemeId ? getParentTheme(subThemeId) : null;
  const sizeConfig = SIZES[size];

  // Determine icon
  const iconName = subTheme?.logoIcon || 'sparkles';
  const Icon = ICON_MAP[iconName] || Sparkles;

  // Determine font
  const fontFamily = subTheme?.logoFont ? FONT_FAMILIES[subTheme.logoFont] || FONT_FAMILIES['Playfair Display'] : FONT_FAMILIES['Playfair Display'];

  // Colors from sub-theme - use theme colors properly
  const primaryColor = subTheme ? `hsl(${subTheme.primary})` : 'hsl(var(--primary))';
  const accentColor = subTheme ? `hsl(${subTheme.accent})` : 'hsl(var(--accent))';
  const glowColor = subTheme ? `hsl(${subTheme.primary} / 0.4)` : 'hsl(var(--primary) / 0.4)';
  return <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 transition-all duration-500", sizeConfig.container)} style={{
      boxShadow: `0 0 ${sizeConfig.glow}px -5px ${glowColor}`
    }}>
        <Icon className={cn("transition-colors duration-500 text-green-600", sizeConfig.icon)} style={{
        color: primaryColor
      }} />
      </div>
      {showText && <span className={cn("font-bold transition-all duration-500 text-green-600", sizeConfig.text)} style={{
      fontFamily,
      color: primaryColor,
      textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
    }}>
          LOOMY
        </span>}
    </div>;
}