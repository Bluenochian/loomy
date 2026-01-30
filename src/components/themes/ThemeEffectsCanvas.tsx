import { useEffect, useRef, useCallback } from 'react';
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
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
};

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  time: number;
  primaryRgb: [number, number, number];
  accentRgb: [number, number, number];
  secondaryRgb: [number, number, number];
  effects: SubTheme['effects'];
}

// ═══════════════════════════════════════════════════════════════════════════
// GRIMOIRE - Atmospheric candle glow like grimoire.lovable.app
// Deep warm blur, realistic flickering candles, dark mystical atmosphere
// ═══════════════════════════════════════════════════════════════════════════
class GrimoireRenderer {
  candles: Array<{
    x: number;
    y: number;
    scale: number;
    flamePhase: number;
    flameSpeed: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    // Position candles like reference - corners and edges
    const positions = [
      { x: 0.06, y: 0.35, scale: 1.0 },
      { x: 0.05, y: 0.68, scale: 0.85 },
      { x: 0.94, y: 0.32, scale: 0.95 },
      { x: 0.93, y: 0.65, scale: 0.9 },
      { x: 0.08, y: 0.85, scale: 0.75 },
      { x: 0.92, y: 0.82, scale: 0.8 },
    ];

    positions.forEach(pos => {
      this.candles.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        scale: pos.scale,
        flamePhase: Math.random() * Math.PI * 2,
        flameSpeed: 0.06 + Math.random() * 0.03,
      });
    });
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Each candle creates a massive warm glow zone
    this.candles.forEach(candle => {
      candle.flamePhase += candle.flameSpeed;
      
      const flicker = 0.7 + Math.sin(candle.flamePhase) * 0.15 + 
                     Math.sin(candle.flamePhase * 2.3) * 0.1 +
                     Math.sin(candle.flamePhase * 4.7) * 0.05;
      
      const glowSize = 280 * candle.scale * flicker;
      
      // Multi-layer atmospheric glow (the key to the reference look)
      const layers = [
        { size: glowSize * 1.8, color: [255, 150, 50], alpha: 0.04 },
        { size: glowSize * 1.4, color: [255, 130, 40], alpha: 0.06 },
        { size: glowSize * 1.0, color: [255, 100, 30], alpha: 0.10 },
        { size: glowSize * 0.6, color: [255, 80, 20], alpha: 0.15 },
      ];
      
      layers.forEach(layer => {
        const grad = ctx.createRadialGradient(
          candle.x, candle.y, 0,
          candle.x, candle.y, layer.size
        );
        grad.addColorStop(0, `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.alpha})`);
        grad.addColorStop(0.4, `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      
      // Candle body (simple ivory rectangle with rounded top)
      const candleWidth = 16 * candle.scale;
      const candleHeight = 65 * candle.scale;
      const bodyY = candle.y;
      
      // Candle body
      ctx.fillStyle = 'rgba(245, 235, 210, 0.95)';
      ctx.beginPath();
      ctx.roundRect(
        candle.x - candleWidth / 2, 
        bodyY, 
        candleWidth, 
        candleHeight, 
        [3, 3, 5, 5]
      );
      ctx.fill();
      
      // Subtle wax drip
      ctx.fillStyle = 'rgba(240, 225, 195, 0.8)';
      ctx.beginPath();
      ctx.ellipse(candle.x - candleWidth * 0.3, bodyY + 5, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Flame - outer orange
      const flameHeight = 35 * candle.scale * (0.9 + flicker * 0.2);
      const flameWidth = 10 * candle.scale;
      const flameX = candle.x + Math.sin(candle.flamePhase * 1.5) * 2;
      
      const outerFlame = ctx.createLinearGradient(flameX, bodyY, flameX, bodyY - flameHeight);
      outerFlame.addColorStop(0, 'rgba(255, 200, 100, 0.95)');
      outerFlame.addColorStop(0.3, 'rgba(255, 140, 50, 0.9)');
      outerFlame.addColorStop(0.6, 'rgba(255, 80, 20, 0.6)');
      outerFlame.addColorStop(1, 'rgba(255, 40, 0, 0)');
      
      ctx.fillStyle = outerFlame;
      ctx.beginPath();
      ctx.moveTo(flameX - flameWidth, bodyY);
      ctx.quadraticCurveTo(flameX - flameWidth * 0.5, bodyY - flameHeight * 0.4, flameX, bodyY - flameHeight);
      ctx.quadraticCurveTo(flameX + flameWidth * 0.5, bodyY - flameHeight * 0.4, flameX + flameWidth, bodyY);
      ctx.closePath();
      ctx.fill();
      
      // Flame inner core - bright white/yellow
      const innerHeight = flameHeight * 0.4;
      const innerWidth = flameWidth * 0.5;
      const innerFlame = ctx.createLinearGradient(flameX, bodyY, flameX, bodyY - innerHeight);
      innerFlame.addColorStop(0, 'rgba(255, 255, 250, 1)');
      innerFlame.addColorStop(0.5, 'rgba(255, 250, 200, 0.9)');
      innerFlame.addColorStop(1, 'rgba(255, 200, 100, 0)');
      
      ctx.fillStyle = innerFlame;
      ctx.beginPath();
      ctx.ellipse(flameX, bodyY - innerHeight * 0.4, innerWidth, innerHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MATRIX RAIN - Like androidport.lovable.app
// Dense cascading code with bright heads and depth-based parallax
// ═══════════════════════════════════════════════════════════════════════════
class MatrixRainRenderer {
  columns: Array<{
    x: number;
    chars: Array<{ y: number; char: string; brightness: number }>;
    speed: number;
    depth: number;
  }> = [];
  charSet = 'アイウエオカキクケコサシスセソタチツテト01234789<>{}[]|\\/@#$%';

  init(canvas: HTMLCanvasElement) {
    const columnWidth = 20;
    const numColumns = Math.ceil(canvas.width / columnWidth);
    
    for (let i = 0; i < numColumns; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      const chars: Array<{ y: number; char: string; brightness: number }> = [];
      
      const numChars = Math.floor(8 + Math.random() * 20);
      let startY = -Math.random() * canvas.height;
      
      for (let j = 0; j < numChars; j++) {
        chars.push({
          y: startY + j * 22,
          char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
          brightness: 1 - (j / numChars)
        });
      }
      
      this.columns.push({
        x: i * columnWidth + Math.random() * 5,
        chars,
        speed: (2 + Math.random() * 4) * depth,
        depth
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    this.columns.forEach(column => {
      const fontSize = Math.floor(14 * column.depth + 8);
      ctx.font = `${fontSize}px monospace`;
      
      column.chars.forEach((char, i) => {
        char.y += column.speed;
        
        // Random character mutation
        if (Math.random() > 0.96) {
          char.char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        }

        const isHead = i === column.chars.length - 1;
        const fadePos = column.chars.length - 1 - i;
        const fade = Math.max(0, 1 - fadePos * 0.05);
        
        if (char.y > 0 && char.y < canvas.height && fade > 0) {
          if (isHead) {
            // Bright white head with glow
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 25;
            ctx.fillStyle = `rgba(255, 255, 255, ${column.depth})`;
            ctx.fillText(char.char, column.x, char.y);
            ctx.shadowBlur = 0;
          } else {
            // Green trailing characters
            const green = 180 + fadePos * 8;
            ctx.fillStyle = `rgba(0, ${Math.min(255, green)}, ${80 + fadePos * 3}, ${fade * column.depth * 0.8})`;
            ctx.fillText(char.char, column.x, char.y);
          }
        }
      });

      // Reset when off-screen
      if (column.chars[0]?.y > canvas.height + 50) {
        const numChars = Math.floor(8 + Math.random() * 20);
        column.chars = [];
        
        for (let j = 0; j < numChars; j++) {
          column.chars.push({
            y: -numChars * 22 + j * 22,
            char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
            brightness: 1 - (j / numChars)
          });
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CYBERPUNK RAIN - Clean neon rain WITHOUT weird shapes
// Just beautiful colored rain and atmospheric glow
// ═══════════════════════════════════════════════════════════════════════════
class CyberpunkRenderer {
  raindrops: Array<{ 
    x: number; 
    y: number; 
    length: number; 
    speed: number; 
    color: [number, number, number];
    alpha: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    // Dense neon rain
    const colors: Array<[number, number, number]> = [
      [0, 255, 255],   // Cyan
      [255, 0, 255],   // Magenta
      [255, 100, 200], // Pink
    ];
    
    for (let i = 0; i < 350; i++) {
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 20 + Math.random() * 40,
        speed: 10 + Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Subtle ambient glow at bottom
    const ambientGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    ambientGrad.addColorStop(0, 'rgba(255, 0, 150, 0.08)');
    ambientGrad.addColorStop(0.5, 'rgba(0, 200, 255, 0.04)');
    ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rain with gradient trails
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width;
      }

      const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      gradient.addColorStop(0, `rgba(${drop.color[0]}, ${drop.color[1]}, ${drop.color[2]}, 0)`);
      gradient.addColorStop(0.3, `rgba(${drop.color[0]}, ${drop.color[1]}, ${drop.color[2]}, ${drop.alpha})`);
      gradient.addColorStop(1, `rgba(${drop.color[0]}, ${drop.color[1]}, ${drop.color[2]}, 0.1)`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });

    // Very subtle scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON FIRE - Flames rising from bottom with embers
// ═══════════════════════════════════════════════════════════════════════════
class DragonFireRenderer {
  embers: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    life: number;
    maxLife: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {}

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Warm glow from bottom
    const heatGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 400);
    heatGrad.addColorStop(0, 'rgba(255, 80, 20, 0.25)');
    heatGrad.addColorStop(0.5, 'rgba(255, 120, 40, 0.1)');
    heatGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, canvas.height - 400, canvas.width, 400);

    // Animated fire waves at bottom
    for (let layer = 0; layer < 3; layer++) {
      const layerY = canvas.height - 10 - layer * 40;
      const alpha = 0.25 - layer * 0.06;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let x = 0; x <= canvas.width; x += 12) {
        const noise = Math.sin(x * 0.02 + time * 4 + layer) * 35 +
                     Math.sin(x * 0.04 + time * 6) * 18;
        ctx.lineTo(x, layerY + noise);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const flameGrad = ctx.createLinearGradient(0, layerY - 50, 0, canvas.height);
      flameGrad.addColorStop(0, `rgba(255, 200, 80, ${alpha})`);
      flameGrad.addColorStop(0.4, `rgba(255, 100, 30, ${alpha})`);
      flameGrad.addColorStop(1, `rgba(150, 30, 0, ${alpha * 0.5})`);
      
      ctx.fillStyle = flameGrad;
      ctx.fill();
    }

    // Spawn embers
    if (Math.random() > 0.5) {
      this.embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2 - Math.random() * 4,
        size: 2 + Math.random() * 4,
        life: 0,
        maxLife: 100 + Math.random() * 80
      });
    }

    // Render embers
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx + Math.sin(ember.life * 0.06) * 0.6;
      ember.y += ember.vy;
      ember.vy *= 0.997;
      ember.life++;

      const lifeRatio = 1 - ember.life / ember.maxLife;
      
      // Glow
      const glowGrad = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.size * 3 * lifeRatio);
      glowGrad.addColorStop(0, `rgba(255, 200, 100, ${lifeRatio * 0.7})`);
      glowGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size * 3 * lifeRatio, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(255, 255, 200, ${lifeRatio})`;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size * 0.4 * lifeRatio, 0, Math.PI * 2);
      ctx.fill();

      return ember.life < ember.maxLife;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SNOWFALL - Gentle falling snow with depth
// ═══════════════════════════════════════════════════════════════════════════
class SnowfallRenderer {
  snowflakes: Array<{
    x: number; y: number;
    size: number;
    speed: number;
    wobble: number;
    wobbleSpeed: number;
    alpha: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 150; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      this.snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: (2 + Math.random() * 4) * depth,
        speed: (0.5 + Math.random() * 1.5) * depth,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        alpha: 0.4 + depth * 0.5
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    this.snowflakes.forEach(flake => {
      flake.wobble += flake.wobbleSpeed;
      flake.x += Math.sin(flake.wobble) * 0.8;
      flake.y += flake.speed;

      if (flake.y > canvas.height + 10) {
        flake.y = -10;
        flake.x = Math.random() * canvas.width;
      }

      // Soft glow
      const glow = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.size * 2);
      glow.addColorStop(0, `rgba(200, 220, 255, ${flake.alpha})`);
      glow.addColorStop(0.5, `rgba(180, 200, 240, ${flake.alpha * 0.4})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Snowflake core
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GHOSTLY - Ethereal mist with subtle apparitions
// ═══════════════════════════════════════════════════════════════════════════
class GhostlyRenderer {
  mistLayers: Array<{ y: number; speed: number; opacity: number; offset: number }> = [];
  orbs: Array<{ x: number; y: number; phase: number; speed: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 6; i++) {
      this.mistLayers.push({
        y: canvas.height * (0.3 + i * 0.12),
        speed: 0.15 + Math.random() * 0.15,
        opacity: 0.06 + Math.random() * 0.06,
        offset: Math.random() * 1000
      });
    }

    for (let i = 0; i < 5; i++) {
      this.orbs.push({
        x: 0.2 * canvas.width + Math.random() * 0.6 * canvas.width,
        y: 0.2 * canvas.height + Math.random() * 0.6 * canvas.height,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.004,
        alpha: 0.04 + Math.random() * 0.06
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Rolling mist
    this.mistLayers.forEach(layer => {
      const wave = Math.sin(time * layer.speed + layer.offset) * 25;
      
      const mistGrad = ctx.createLinearGradient(0, layer.y - 60, 0, layer.y + 60);
      mistGrad.addColorStop(0, 'transparent');
      mistGrad.addColorStop(0.5, `rgba(180, 190, 210, ${layer.opacity})`);
      mistGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, layer.y - 60 + wave, canvas.width, 120);
    });

    // Ghostly orbs
    this.orbs.forEach(orb => {
      orb.phase += orb.speed;
      const ox = orb.x + Math.sin(orb.phase) * 40;
      const oy = orb.y + Math.cos(orb.phase * 0.6) * 30;
      const flicker = orb.alpha * (0.5 + Math.sin(orb.phase * 3) * 0.5);

      const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 100);
      glow.addColorStop(0, `rgba(220, 230, 250, ${flicker})`);
      glow.addColorStop(0.5, `rgba(200, 210, 230, ${flicker * 0.3})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ox, oy, 100, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NUCLEAR WASTELAND - Radiation pulse and ash
// ═══════════════════════════════════════════════════════════════════════════
class NuclearRenderer {
  ashParticles: Array<{ x: number; y: number; size: number; drift: number; alpha: number }> = [];
  pulse: number = 0;

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 100; i++) {
      this.ashParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        drift: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    this.pulse += 0.02;
    const pulseIntensity = 0.5 + Math.sin(this.pulse) * 0.3;

    // Radiation glow from edges
    const radGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radGrad.addColorStop(0.6, `rgba(140, 130, 20, ${0.04 * pulseIntensity})`);
    radGrad.addColorStop(1, `rgba(120, 110, 10, ${0.1 * pulseIntensity})`);
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Falling ash
    this.ashParticles.forEach(ash => {
      ash.drift += 0.01;
      ash.x += Math.sin(ash.drift) * 0.5;
      ash.y += 0.3;

      if (ash.y > canvas.height + 10) {
        ash.y = -10;
        ash.x = Math.random() * canvas.width;
      }

      ctx.fillStyle = `rgba(80, 75, 60, ${ash.alpha})`;
      ctx.beginPath();
      ctx.arc(ash.x, ash.y, ash.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hazard stripe hint at bottom
    ctx.fillStyle = `rgba(200, 180, 20, ${0.06 * pulseIntensity})`;
    ctx.fillRect(0, canvas.height - 8, canvas.width, 8);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTOPIA - Gentle particles and warm light
// ═══════════════════════════════════════════════════════════════════════════
class UtopiaRenderer {
  particles: Array<{ x: number; y: number; size: number; phase: number; speed: number }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.015
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    this.particles.forEach(p => {
      p.phase += p.speed;
      const floatY = p.y + Math.sin(p.phase) * 3;
      const alpha = 0.15 + Math.sin(p.phase * 2) * 0.1;

      const glow = ctx.createRadialGradient(p.x, floatY, 0, p.x, floatY, p.size * 4);
      glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${alpha})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, floatY, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STARFIELD - Deep space with nebula
// ═══════════════════════════════════════════════════════════════════════════
class StarfieldRenderer {
  stars: Array<{ x: number; y: number; size: number; twinkle: number; speed: number }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, primaryRgb, accentRgb } = rc;

    this.stars.forEach(star => {
      star.twinkle += star.speed;
      const alpha = 0.3 + Math.sin(star.twinkle) * 0.4;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC - Fallback floating dust motes
// ═══════════════════════════════════════════════════════════════════════════
class GenericRenderer {
  particles: Array<{ x: number; y: number; size: number; phase: number; speed: number }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.012
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, primaryRgb } = rc;

    this.particles.forEach(p => {
      p.phase += p.speed;
      const floatY = p.y + Math.sin(p.phase) * 2;
      const alpha = 0.1 + Math.sin(p.phase * 2) * 0.05;

      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, floatY, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERER FACTORY
// ═══════════════════════════════════════════════════════════════════════════
const createRenderer = (type: string) => {
  switch (type) {
    case 'grimoire': return new GrimoireRenderer();
    case 'matrixRain': return new MatrixRainRenderer();
    case 'cyberpunkCity': return new CyberpunkRenderer();
    case 'dragonFire': return new DragonFireRenderer();
    case 'snowfall': return new SnowfallRenderer();
    case 'ghostlyApparitions': return new GhostlyRenderer();
    case 'nuclearWasteland': return new NuclearRenderer();
    case 'deepSpace':
    case 'starfield': return new StarfieldRenderer();
    case 'utopiaGarden':
    case 'floatingIslands':
    case 'zenGarden': return new UtopiaRenderer();
    default: return new GenericRenderer();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function ThemeEffectsCanvas({ subTheme, reducedMotion }: ThemeEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !rendererRef.current) return;

    timeRef.current += 0.016;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const primary = parseHsl(subTheme.primary);
    const accent = parseHsl(subTheme.accent);
    const secondary = parseHsl(subTheme.secondary);

    const renderContext: RenderContext = {
      ctx,
      canvas,
      time: timeRef.current,
      primaryRgb: hslToRgb(primary.h, primary.s, primary.l),
      accentRgb: hslToRgb(accent.h, accent.s, accent.l),
      secondaryRgb: hslToRgb(secondary.h, secondary.s, secondary.l),
      effects: subTheme.effects,
    };

    rendererRef.current.render(renderContext);
    animationRef.current = requestAnimationFrame(animate);
  }, [subTheme]);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const renderer = createRenderer(subTheme.effects.renderer);
      renderer.init(canvas);
      rendererRef.current = renderer;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, reducedMotion, subTheme.effects.renderer]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}
