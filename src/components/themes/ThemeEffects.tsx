import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface ThemeEffectsProps {
  themeId?: string;
}

// Theme-specific configurations for wild visual effects
const THEME_EFFECTS = {
  default: {
    primary: '38 85% 55%',
    accent: '35 90% 50%',
    glowIntensity: 0.2,
    particleSpeed: 0.5,
    orbCount: 4,
    style: 'warm',
  },
  fantasy: {
    primary: '45 80% 50%',
    accent: '280 60% 50%',
    glowIntensity: 0.35,
    particleSpeed: 0.3,
    orbCount: 6,
    style: 'magical',
  },
  scifi: {
    primary: '190 80% 50%',
    accent: '260 70% 60%',
    glowIntensity: 0.4,
    particleSpeed: 0.8,
    orbCount: 5,
    style: 'digital',
  },
  thriller: {
    primary: '0 0% 95%',
    accent: '0 70% 50%',
    glowIntensity: 0.15,
    particleSpeed: 0.6,
    orbCount: 3,
    style: 'noir',
  },
  romance: {
    primary: '340 70% 60%',
    accent: '320 60% 50%',
    glowIntensity: 0.3,
    particleSpeed: 0.4,
    orbCount: 7,
    style: 'soft',
  },
  horror: {
    primary: '0 60% 45%',
    accent: '270 50% 40%',
    glowIntensity: 0.45,
    particleSpeed: 0.2,
    orbCount: 4,
    style: 'dark',
  },
  mystery: {
    primary: '230 60% 55%',
    accent: '180 50% 40%',
    glowIntensity: 0.2,
    particleSpeed: 0.5,
    orbCount: 5,
    style: 'shadowy',
  },
  adventure: {
    primary: '30 60% 50%',
    accent: '140 50% 40%',
    glowIntensity: 0.25,
    particleSpeed: 0.7,
    orbCount: 5,
    style: 'earthy',
  },
};

export function ThemeEffects({ themeId = 'default' }: ThemeEffectsProps) {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeConfig = THEME_EFFECTS[themeId as keyof typeof THEME_EFFECTS] || THEME_EFFECTS.default;

  // Animated gradient background with theme-specific effects
  useEffect(() => {
    if (settings.reducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Parse HSL to RGB for canvas use
    const hslToRgb = (h: number, s: number, l: number) => {
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      };
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    };

    const parseHsl = (hslString: string) => {
      const parts = hslString.split(' ').map(p => parseFloat(p));
      return { h: parts[0], s: parts[1], l: parts[2] };
    };

    const primaryHsl = parseHsl(themeConfig.primary);
    const accentHsl = parseHsl(themeConfig.accent);

    const animate = () => {
      time += 0.003 * themeConfig.particleSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create animated gradient orbs based on theme style
      const orbs: Array<{ x: number; y: number; r: number; hsl: { h: number; s: number; l: number }; pulseOffset: number }> = [];
      
      for (let i = 0; i < themeConfig.orbCount; i++) {
        const angle = (i / themeConfig.orbCount) * Math.PI * 2 + time;
        const radius = 180 + i * 60;
        orbs.push({
          x: canvas.width * 0.5 + Math.sin(angle) * (canvas.width * 0.3),
          y: canvas.height * 0.5 + Math.cos(angle * 0.7) * (canvas.height * 0.25),
          r: radius,
          hsl: i % 2 === 0 ? primaryHsl : accentHsl,
          pulseOffset: i * 0.5,
        });
      }

      // Draw orbs with glassmorphism-style gradients
      for (const orb of orbs) {
        const pulse = Math.sin(time * 2 + orb.pulseOffset) * 0.3 + 0.7;
        const rgb = hslToRgb(orb.hsl.h, orb.hsl.s, orb.hsl.l);
        
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * pulse);
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${themeConfig.glowIntensity})`);
        gradient.addColorStop(0.4, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${themeConfig.glowIntensity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Style-specific effects
      if (themeConfig.style === 'digital') {
        // Add scanlines for sci-fi
        ctx.fillStyle = 'rgba(0, 255, 255, 0.03)';
        for (let y = 0; y < canvas.height; y += 3) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
        // Add glitch lines
        if (Math.random() > 0.97) {
          const glitchY = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(0, 255, 255, 0.1)`;
          ctx.fillRect(0, glitchY, canvas.width, 2);
        }
      } else if (themeConfig.style === 'magical') {
        // Add sparkle particles for fantasy
        for (let i = 0; i < 30; i++) {
          const sparkleX = (Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5) * canvas.width;
          const sparkleY = (Math.cos(time * 2 + i * 0.7) * 0.5 + 0.5) * canvas.height;
          const sparkleSize = Math.sin(time * 4 + i) * 3 + 3;
          const sparkleAlpha = Math.sin(time * 5 + i) * 0.4 + 0.4;
          
          // Golden sparkle
          ctx.fillStyle = `rgba(255, 215, 0, ${sparkleAlpha})`;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow around sparkle
          const sparkleGradient = ctx.createRadialGradient(sparkleX, sparkleY, 0, sparkleX, sparkleY, sparkleSize * 3);
          sparkleGradient.addColorStop(0, `rgba(255, 215, 0, ${sparkleAlpha * 0.3})`);
          sparkleGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = sparkleGradient;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, sparkleSize * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (themeConfig.style === 'dark') {
        // Add creeping shadows for horror
        const shadowGradient = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.5, 0,
          canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
        );
        shadowGradient.addColorStop(0, 'transparent');
        shadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Occasional red flash
        if (Math.random() > 0.995) {
          ctx.fillStyle = 'rgba(180, 0, 0, 0.05)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (themeConfig.style === 'noir') {
        // Add vignette for thriller
        const vignetteGradient = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.15,
          canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.65
        );
        vignetteGradient.addColorStop(0, 'transparent');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Film grain effect
        for (let i = 0; i < 500; i++) {
          const grainX = Math.random() * canvas.width;
          const grainY = Math.random() * canvas.height;
          const grainAlpha = Math.random() * 0.03;
          ctx.fillStyle = `rgba(255, 255, 255, ${grainAlpha})`;
          ctx.fillRect(grainX, grainY, 1, 1);
        }
      } else if (themeConfig.style === 'soft') {
        // Add floating hearts/bokeh for romance
        for (let i = 0; i < 20; i++) {
          const heartX = (Math.sin(time * 0.5 + i * 1.2) * 0.4 + 0.5) * canvas.width;
          const heartY = ((time * 0.08 + i * 0.1) % 1.2 - 0.1) * canvas.height;
          const heartSize = 10 + Math.sin(i) * 5;
          const heartAlpha = 0.25 + Math.sin(time + i) * 0.15;
          
          const rgb = hslToRgb(primaryHsl.h, primaryHsl.s, primaryHsl.l);
          
          // Soft glow
          const glowGradient = ctx.createRadialGradient(heartX, heartY, 0, heartX, heartY, heartSize * 2.5);
          glowGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${heartAlpha})`);
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(heartX, heartY, heartSize * 2.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${heartAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(heartX, heartY, heartSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (themeConfig.style === 'shadowy') {
        // Mystery fog effect
        for (let i = 0; i < 8; i++) {
          const fogX = (Math.sin(time * 0.3 + i * 0.8) * 0.6 + 0.5) * canvas.width;
          const fogY = canvas.height * 0.7 + Math.sin(time * 0.5 + i) * 50;
          const fogSize = 200 + i * 40;
          
          const rgb = hslToRgb(accentHsl.h, accentHsl.s * 0.3, accentHsl.l * 0.5);
          const fogGradient = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, fogSize);
          fogGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.08)`);
          fogGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = fogGradient;
          ctx.beginPath();
          ctx.arc(fogX, fogY, fogSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (themeConfig.style === 'earthy') {
        // Adventure dust particles
        for (let i = 0; i < 40; i++) {
          const dustX = ((time * 50 + i * 30) % (canvas.width + 100)) - 50;
          const dustY = Math.sin(time * 2 + i) * 100 + canvas.height * 0.6;
          const dustSize = 2 + Math.random() * 2;
          const dustAlpha = 0.15 + Math.random() * 0.1;
          
          const rgb = hslToRgb(primaryHsl.h, primaryHsl.s * 0.5, primaryHsl.l);
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${dustAlpha})`;
          ctx.beginPath();
          ctx.arc(dustX, dustY, dustSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [settings.reducedMotion, themeId, themeConfig, settings.animations]);

  // Always show effects unless reducedMotion is on
  if (settings.reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated gradient canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-80 transition-opacity duration-1000"
      />

      {/* Glassmorphism overlay patterns - always visible */}
      <div className="absolute inset-0">
        {/* Top glow with glassmorphism */}
        <div 
          className={cn(
            "absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] animate-float",
            "bg-gradient-to-br from-primary/40 via-primary/15 to-transparent"
          )} 
          style={{ animationDuration: '12s' }}
        />
        
        {/* Bottom accent glow */}
        <div 
          className={cn(
            "absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[100px] animate-float",
            "bg-gradient-to-tl from-accent/40 via-accent/15 to-transparent"
          )}
          style={{ animationDuration: '15s', animationDelay: '-5s' }}
        />

        {/* Center radial glow */}
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[900px] h-[900px] rounded-full blur-[150px] animate-glow",
            "bg-gradient-radial from-primary/20 via-primary/8 to-transparent"
          )}
          style={{ animationDuration: '6s' }}
        />

        {/* Moving accent orb */}
        <div 
          className={cn(
            "absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[80px]",
            "bg-gradient-to-br from-accent/30 to-transparent animate-float"
          )}
          style={{ animationDuration: '18s', animationDelay: '-8s' }}
        />
        
        {/* Additional glowing orb */}
        <div 
          className={cn(
            "absolute bottom-1/3 left-1/3 w-[350px] h-[350px] rounded-full blur-[70px]",
            "bg-gradient-to-tr from-primary/25 to-accent/10 animate-float"
          )}
          style={{ animationDuration: '20s', animationDelay: '-12s' }}
        />
      </div>

      {/* Glass panel overlays for depth */}
      <div className="absolute inset-0">
        {/* Top glass strip */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/90 via-background/50 to-transparent backdrop-blur-[3px]"
        />
        
        {/* Side glass accents */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-background/40 to-transparent"
        />
      </div>

      {/* Noise texture for glassmorphism */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
