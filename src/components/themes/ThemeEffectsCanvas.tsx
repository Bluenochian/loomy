import { useEffect, useRef } from 'react';
import { SubTheme } from '@/config/themes';

interface ThemeEffectsCanvasProps {
  subTheme: SubTheme;
  reducedMotion: boolean;
}

// Parse HSL string to object
const parseHsl = (hslString: string) => {
  const parts = hslString.split(' ').map(p => parseFloat(p));
  return { h: parts[0] || 0, s: parts[1] || 0, l: parts[2] || 0 };
};

// Convert HSL to RGB
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

export function ThemeEffectsCanvas({ subTheme, reducedMotion }: ThemeEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

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

    const primaryHsl = parseHsl(subTheme.primary);
    const accentHsl = parseHsl(subTheme.accent);
    const secondaryHsl = parseHsl(subTheme.secondary);
    const { effects } = subTheme;

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      hsl: { h: number; s: number; l: number };
      life: number;
      maxLife: number;
      type: string;
    }

    const particles: Particle[] = [];

    const createParticle = (type: string): Particle => {
      const hslOptions = [primaryHsl, accentHsl, secondaryHsl];
      const hsl = hslOptions[Math.floor(Math.random() * hslOptions.length)];
      
      return {
        x: Math.random() * canvas.width,
        y: type === 'snow' || type === 'petals' || type === 'sakura' ? -20 : 
           type === 'embers' || type === 'bubbles' ? canvas.height + 20 : 
           Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: type === 'snow' || type === 'petals' ? 0.5 + Math.random() * 1.5 : 
            type === 'embers' || type === 'bubbles' ? -(1 + Math.random() * 2) :
            (Math.random() - 0.5) * 2,
        size: 2 + Math.random() * 6,
        alpha: 0.3 + Math.random() * 0.5,
        hsl,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        type
      };
    };

    // Initialize particles
    for (let i = 0; i < effects.particleCount; i++) {
      particles.push(createParticle(effects.particleType));
    }

    const drawParticle = (p: Particle) => {
      const rgb = hslToRgb(p.hsl.h, p.hsl.s, p.hsl.l);
      const fadeAlpha = p.alpha * Math.min(1, (p.maxLife - p.life) / 50);

      ctx.save();
      
      switch (p.type) {
        case 'snowflakes':
        case 'snow':
          // Snowflake shape
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.02);
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha})`;
          for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.fillRect(-0.5, 0, 1, p.size);
          }
          break;

        case 'embers':
          // Glowing ember
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gradient.addColorStop(0, `rgba(255, ${150 + Math.random() * 50}, 0, ${fadeAlpha})`);
          gradient.addColorStop(0.5, `rgba(255, 100, 0, ${fadeAlpha * 0.5})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'sparkles':
        case 'stardust':
          // Star sparkle
          const sparkleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
          sparkleGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha})`);
          sparkleGradient.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha * 0.3})`);
          sparkleGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = sparkleGradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          // Core
          ctx.fillStyle = `rgba(255, 255, 255, ${fadeAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'petals':
        case 'sakura':
          // Petal shape
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.03 + Math.sin(p.life * 0.05) * 0.5);
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'bubbles':
          // Bubble with highlight
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          // Highlight
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${fadeAlpha * 0.5})`;
          ctx.fill();
          break;

        case 'rain':
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - 15);
          ctx.stroke();
          break;

        case 'candles':
          // Candle flame
          const flameGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          flameGradient.addColorStop(0, `rgba(255, 200, 100, ${fadeAlpha})`);
          flameGradient.addColorStop(0.3, `rgba(255, 150, 50, ${fadeAlpha * 0.6})`);
          flameGradient.addColorStop(0.6, `rgba(200, 50, 0, ${fadeAlpha * 0.3})`);
          flameGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = flameGradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'mist':
        case 'fog':
          const mistGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 10);
          mistGradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha * 0.15})`);
          mistGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = mistGradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 10, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'codeRain':
          // Matrix-style characters
          ctx.font = `${p.size * 2}px monospace`;
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha})`;
          const chars = '01アイウエオカキクケコ';
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], p.x, p.y);
          break;

        case 'dataStreams':
          ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha * 0.6})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 20, p.y + p.vy * 20);
          ctx.stroke();
          break;

        case 'bats':
          // Simple bat silhouette
          ctx.fillStyle = `rgba(20, 20, 20, ${fadeAlpha})`;
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.5, p.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          const wingFlap = Math.sin(p.life * 0.3) * 0.5;
          ctx.beginPath();
          ctx.ellipse(-p.size, wingFlap * p.size, p.size, p.size * 0.3, -0.3, 0, Math.PI * 2);
          ctx.ellipse(p.size, wingFlap * p.size, p.size, p.size * 0.3, 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'fireflies':
          // Pulsing glow
          const pulse = Math.sin(p.life * 0.1) * 0.5 + 0.5;
          const fireflyGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          fireflyGradient.addColorStop(0, `rgba(200, 255, 100, ${fadeAlpha * pulse})`);
          fireflyGradient.addColorStop(0.5, `rgba(150, 255, 50, ${fadeAlpha * pulse * 0.3})`);
          fireflyGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = fireflyGradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'gems':
          // Shimmering gem
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.02);
          const gemColors = ['rgba(255,50,50,', 'rgba(50,255,50,', 'rgba(50,50,255,', 'rgba(255,255,50,'];
          ctx.fillStyle = gemColors[Math.floor(p.x) % 4] + fadeAlpha + ')';
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.7, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.7, 0);
          ctx.closePath();
          ctx.fill();
          break;

        case 'sand':
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'leaves':
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.04 + Math.sin(p.life * 0.02) * 0.8);
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          // Leaf vein
          ctx.strokeStyle = `rgba(0, 0, 0, ${fadeAlpha * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
          break;

        default:
          // Default circular particle
          ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fadeAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      }

      ctx.restore();
    };

    const drawSpecialEffects = () => {
      const rgb1 = hslToRgb(primaryHsl.h, primaryHsl.s, primaryHsl.l);
      const rgb2 = hslToRgb(accentHsl.h, accentHsl.s, accentHsl.l);

      // Draw base orbs
      const orbCount = Math.ceil(effects.particleCount / 10);
      for (let i = 0; i < orbCount; i++) {
        const angle = (i / orbCount) * Math.PI * 2 + time * 0.5;
        const radius = 200 + i * 80;
        const x = canvas.width * 0.5 + Math.sin(angle) * (canvas.width * 0.35);
        const y = canvas.height * 0.5 + Math.cos(angle * 0.7) * (canvas.height * 0.3);
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
        const rgb = i % 2 === 0 ? rgb1 : rgb2;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * pulse);
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${effects.glowIntensity})`);
        gradient.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${effects.glowIntensity * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Style-specific overlays
      if (effects.specialEffects.includes('filmGrain')) {
        for (let i = 0; i < 300; i++) {
          const grainX = Math.random() * canvas.width;
          const grainY = Math.random() * canvas.height;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.03})`;
          ctx.fillRect(grainX, grainY, 1, 1);
        }
      }

      if (effects.specialEffects.includes('scanlines') || effects.style === 'digital' || effects.style === 'cyberpunk') {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.02)';
        for (let y = 0; y < canvas.height; y += 3) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }

      if (effects.specialEffects.includes('glitchEffect') && Math.random() > 0.97) {
        const glitchY = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]}, 0.1)`;
        ctx.fillRect(0, glitchY, canvas.width, 2 + Math.random() * 5);
      }

      if (effects.specialEffects.includes('voidPulse') || effects.style === 'eldritch') {
        const voidGradient = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.5, 0,
          canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.7
        );
        const pulse = Math.sin(time) * 0.1 + 0.2;
        voidGradient.addColorStop(0, 'transparent');
        voidGradient.addColorStop(0.7, `rgba(${rgb2[0]}, ${rgb2[1]}, ${rgb2[2]}, ${pulse * 0.1})`);
        voidGradient.addColorStop(1, `rgba(0, 0, 0, ${pulse})`);
        ctx.fillStyle = voidGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (effects.specialEffects.includes('laserGrid')) {
        ctx.strokeStyle = `rgba(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]}, 0.15)`;
        ctx.lineWidth = 1;
        const spacing = 100;
        const offset = (time * 20) % spacing;
        for (let x = offset; x < canvas.width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = offset; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      if (effects.specialEffects.includes('bloodMoon') || effects.style === 'gothic') {
        const moonX = canvas.width * 0.8;
        const moonY = canvas.height * 0.15;
        const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 80);
        moonGradient.addColorStop(0, `rgba(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]}, 0.4)`);
        moonGradient.addColorStop(0.7, `rgba(${rgb1[0]}, ${rgb1[1]}, ${rgb1[2]}, 0.1)`);
        moonGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      time += 0.01 * effects.particleSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw special effects first (background)
      drawSpecialEffects();

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update position
        p.x += p.vx * effects.particleSpeed;
        p.y += p.vy * effects.particleSpeed;
        p.life++;

        // Add some waviness
        if (p.type === 'petals' || p.type === 'sakura' || p.type === 'leaves') {
          p.x += Math.sin(p.life * 0.05) * 0.5;
        }
        if (p.type === 'fireflies') {
          p.x += Math.sin(p.life * 0.03 + p.y * 0.01) * 0.8;
          p.y += Math.cos(p.life * 0.02 + p.x * 0.01) * 0.5;
        }

        // Check if particle should be recycled
        if (p.life > p.maxLife || p.y > canvas.height + 50 || p.y < -50 || p.x < -50 || p.x > canvas.width + 50) {
          particles[i] = createParticle(effects.particleType);
        }

        drawParticle(p);
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
  }, [subTheme, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-70 transition-opacity duration-1000"
    />
  );
}
