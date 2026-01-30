import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface ThemeEffectsProps {
  themeId?: string;
}

export function ThemeEffects({ themeId = 'default' }: ThemeEffectsProps) {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated gradient background
  useEffect(() => {
    if (!settings.animations || settings.reducedMotion) return;
    
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

    const getThemeColors = () => {
      const root = document.documentElement;
      const primary = getComputedStyle(root).getPropertyValue('--primary').trim();
      const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
      return { primary, accent };
    };

    const animate = () => {
      time += 0.002;
      const { primary, accent } = getThemeColors();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create animated gradient orbs
      const orbs = [
        { x: canvas.width * 0.3 + Math.sin(time) * 100, y: canvas.height * 0.3 + Math.cos(time * 0.7) * 80, r: 300, color: primary },
        { x: canvas.width * 0.7 + Math.cos(time * 0.8) * 120, y: canvas.height * 0.6 + Math.sin(time * 0.6) * 100, r: 250, color: accent },
        { x: canvas.width * 0.5 + Math.sin(time * 1.2) * 80, y: canvas.height * 0.8 + Math.cos(time) * 60, r: 200, color: primary },
      ];

      for (const orb of orbs) {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        gradient.addColorStop(0, `hsla(${orb.color}, 0.15)`);
        gradient.addColorStop(0.5, `hsla(${orb.color}, 0.05)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
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
  }, [settings.animations, settings.reducedMotion, themeId]);

  if (!settings.experimentalFeatures) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated gradient canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 opacity-60 transition-opacity duration-1000",
          settings.reducedMotion && "opacity-30"
        )}
      />

      {/* Glassmorphism overlay patterns */}
      <div className="absolute inset-0">
        {/* Top left glow */}
        <div 
          className={cn(
            "absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl animate-float",
            "bg-gradient-to-br from-primary/20 to-transparent"
          )} 
          style={{ animationDuration: '8s' }}
        />
        
        {/* Bottom right glow */}
        <div 
          className={cn(
            "absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl animate-float",
            "bg-gradient-to-tl from-accent/20 to-transparent"
          )}
          style={{ animationDuration: '10s', animationDelay: '-4s' }}
        />

        {/* Center subtle pulse */}
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[600px] h-[600px] rounded-full blur-3xl animate-glow",
            "bg-gradient-radial from-primary/10 to-transparent"
          )}
        />
      </div>

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
