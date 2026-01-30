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
  deltaTime: number;
  primaryRgb: [number, number, number];
  accentRgb: [number, number, number];
  secondaryRgb: [number, number, number];
  effects: SubTheme['effects'];
}

// ═══════════════════════════════════════════════════════════════════════════
// GRIMOIRE - Premium atmospheric candle glow like grimoire.lovable.app
// Candles DISTRIBUTED across screen with heavy blur for background feel
// ═══════════════════════════════════════════════════════════════════════════
class GrimoireRenderer {
  candles: Array<{
    x: number;
    y: number;
    scale: number;
    flamePhase: number;
    flameSpeed: number;
    swayPhase: number;
    swaySpeed: number;
  }> = [];
  floatingRunes: Array<{
    x: number;
    y: number;
    char: string;
    alpha: number;
    speed: number;
    phase: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    // DISTRIBUTE candles across the ENTIRE screen, not just edges
    const candlePositions = [
      // Left side
      { x: 0.05, y: 0.2, scale: 0.6 },
      { x: 0.08, y: 0.5, scale: 0.7 },
      { x: 0.04, y: 0.75, scale: 0.55 },
      // Right side  
      { x: 0.92, y: 0.25, scale: 0.65 },
      { x: 0.95, y: 0.55, scale: 0.7 },
      { x: 0.93, y: 0.8, scale: 0.6 },
      // Top area
      { x: 0.25, y: 0.08, scale: 0.5 },
      { x: 0.5, y: 0.05, scale: 0.45 },
      { x: 0.75, y: 0.1, scale: 0.5 },
      // Bottom corners
      { x: 0.15, y: 0.88, scale: 0.75 },
      { x: 0.85, y: 0.9, scale: 0.7 },
      // Mid-field (very subtle, far background)
      { x: 0.35, y: 0.3, scale: 0.35 },
      { x: 0.65, y: 0.4, scale: 0.3 },
      { x: 0.4, y: 0.65, scale: 0.35 },
      { x: 0.6, y: 0.7, scale: 0.3 },
    ];

    candlePositions.forEach(pos => {
      this.candles.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        scale: pos.scale,
        flamePhase: Math.random() * Math.PI * 2,
        flameSpeed: 0.08 + Math.random() * 0.04,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.015,
      });
    });

    // Floating mystical runes
    const runeChars = '᛭ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛝᛞᛟ';
    for (let i = 0; i < 12; i++) {
      this.floatingRunes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: runeChars[Math.floor(Math.random() * runeChars.length)],
        alpha: 0.1 + Math.random() * 0.15,
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Render each candle with HEAVY BLUR for background feel
    this.candles.forEach(candle => {
      candle.flamePhase += candle.flameSpeed;
      candle.swayPhase += candle.swaySpeed;
      
      // Flame flicker with multiple sine waves for natural look
      const flicker = 0.75 + 
        Math.sin(candle.flamePhase) * 0.12 + 
        Math.sin(candle.flamePhase * 2.7) * 0.08 +
        Math.sin(candle.flamePhase * 5.3) * 0.05;
      
      // Gentle sway
      const sway = Math.sin(candle.swayPhase) * 3 * candle.scale;
      const flameX = candle.x + sway;
      
      // Blur intensity based on scale (smaller = more blur = farther)
      const blurRadius = (1 - candle.scale) * 80 + 40;
      
      // MASSIVE ambient glow - the key to grimoire.lovable.app look
      const glowLayers = [
        { radius: 350 * candle.scale, alpha: 0.03 * flicker },
        { radius: 250 * candle.scale, alpha: 0.05 * flicker },
        { radius: 180 * candle.scale, alpha: 0.08 * flicker },
        { radius: 120 * candle.scale, alpha: 0.12 * flicker },
        { radius: 70 * candle.scale, alpha: 0.18 * flicker },
      ];

      glowLayers.forEach(layer => {
        const grad = ctx.createRadialGradient(
          flameX, candle.y - 20 * candle.scale, 0,
          flameX, candle.y - 20 * candle.scale, layer.radius
        );
        grad.addColorStop(0, `rgba(255, 160, 60, ${layer.alpha})`);
        grad.addColorStop(0.3, `rgba(255, 120, 40, ${layer.alpha * 0.6})`);
        grad.addColorStop(0.6, `rgba(200, 80, 20, ${layer.alpha * 0.3})`);
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Candle body (subtle, blurred)
      const bodyHeight = 50 * candle.scale;
      const bodyWidth = 10 * candle.scale;
      
      ctx.save();
      ctx.filter = `blur(${blurRadius * 0.3}px)`;
      
      ctx.fillStyle = `rgba(240, 230, 200, ${0.4 * candle.scale})`;
      ctx.beginPath();
      ctx.roundRect(
        candle.x - bodyWidth / 2,
        candle.y,
        bodyWidth,
        bodyHeight,
        [3, 3, 5, 5]
      );
      ctx.fill();
      ctx.restore();

      // Flame - heavily blurred for atmosphere
      ctx.save();
      ctx.filter = `blur(${blurRadius * 0.5}px)`;
      
      const flameHeight = 30 * candle.scale * flicker;
      const flameGrad = ctx.createRadialGradient(
        flameX, candle.y - flameHeight * 0.3, 0,
        flameX, candle.y - flameHeight * 0.3, flameHeight
      );
      flameGrad.addColorStop(0, `rgba(255, 255, 220, ${0.9 * candle.scale})`);
      flameGrad.addColorStop(0.2, `rgba(255, 200, 100, ${0.7 * candle.scale})`);
      flameGrad.addColorStop(0.5, `rgba(255, 120, 40, ${0.4 * candle.scale})`);
      flameGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.ellipse(flameX, candle.y - flameHeight * 0.3, flameHeight * 0.4, flameHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Floating runes with blur
    ctx.save();
    ctx.filter = 'blur(2px)';
    this.floatingRunes.forEach(rune => {
      rune.y -= rune.speed;
      rune.phase += 0.02;
      rune.x += Math.sin(rune.phase) * 0.5;
      
      if (rune.y < -50) {
        rune.y = canvas.height + 50;
        rune.x = Math.random() * canvas.width;
      }
      
      ctx.font = '24px serif';
      ctx.fillStyle = `rgba(180, 100, 80, ${rune.alpha * (0.7 + Math.sin(rune.phase) * 0.3)})`;
      ctx.fillText(rune.char, rune.x, rune.y);
    });
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MATRIX RAIN - Dense cascading code like androidport.lovable.app
// ═══════════════════════════════════════════════════════════════════════════
class MatrixRainRenderer {
  columns: Array<{
    x: number;
    chars: Array<{ y: number; char: string; brightness: number }>;
    speed: number;
    depth: number;
  }> = [];
  charSet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01234789<>{}[]|\\/@#$%&';
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    const columnWidth = 18;
    const numColumns = Math.ceil(canvas.width / columnWidth);
    
    for (let i = 0; i < numColumns; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      const chars: Array<{ y: number; char: string; brightness: number }> = [];
      
      const numChars = Math.floor(10 + Math.random() * 25);
      let startY = -Math.random() * canvas.height * 2;
      
      for (let j = 0; j < numChars; j++) {
        chars.push({
          y: startY + j * 20,
          char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
          brightness: 1 - (j / numChars)
        });
      }
      
      this.columns.push({
        x: i * columnWidth + Math.random() * 5,
        chars,
        speed: (2 + Math.random() * 5) * depth,
        depth
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Background glow
    const bgGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    bgGlow.addColorStop(0, 'rgba(0, 80, 40, 0.1)');
    bgGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.columns.forEach(column => {
      const fontSize = Math.floor(12 * column.depth + 8);
      ctx.font = `${fontSize}px monospace`;
      
      column.chars.forEach((char, i) => {
        char.y += column.speed;
        
        // Random character mutation
        if (Math.random() > 0.97) {
          char.char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        }

        const isHead = i === column.chars.length - 1;
        const fadePos = column.chars.length - 1 - i;
        const fade = Math.max(0, 1 - fadePos * 0.04);
        
        if (char.y > 0 && char.y < canvas.height && fade > 0) {
          if (isHead) {
            // Bright white head with strong glow
            ctx.save();
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 20;
            ctx.fillStyle = `rgba(255, 255, 255, ${column.depth * 0.95})`;
            ctx.fillText(char.char, column.x, char.y);
            ctx.restore();
          } else {
            // Green trail with depth-based opacity
            const green = 150 + fadePos * 10;
            ctx.fillStyle = `rgba(0, ${Math.min(255, green)}, ${60 + fadePos * 5}, ${fade * column.depth * 0.75})`;
            ctx.fillText(char.char, column.x, char.y);
          }
        }
      });

      // Reset column when off screen
      if (column.chars[0]?.y > canvas.height + 100) {
        const numChars = Math.floor(10 + Math.random() * 25);
        column.chars = [];
        
        for (let j = 0; j < numChars; j++) {
          column.chars.push({
            y: -numChars * 20 + j * 20,
            char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
            brightness: 1 - (j / numChars)
          });
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CYBERPUNK - Clean neon rain, NO weird shapes, just beautiful atmosphere
// ═══════════════════════════════════════════════════════════════════════════
class CyberpunkRenderer {
  raindrops: Array<{ 
    x: number; 
    y: number; 
    length: number; 
    speed: number; 
    hue: number;
    alpha: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 400; i++) {
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 25 + Math.random() * 50,
        speed: 12 + Math.random() * 18,
        hue: Math.random() > 0.5 ? 320 : 180, // Magenta or Cyan
        alpha: 0.2 + Math.random() * 0.4
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Atmospheric glow from bottom
    const bottomGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 350);
    bottomGlow.addColorStop(0, 'rgba(255, 0, 180, 0.08)');
    bottomGlow.addColorStop(0.4, 'rgba(0, 180, 255, 0.04)');
    bottomGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top glow
    const topGlow = ctx.createLinearGradient(0, 0, 0, 200);
    topGlow.addColorStop(0, 'rgba(180, 0, 255, 0.06)');
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, canvas.width, 200);

    // Rain
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width;
      }

      // Gradient rain trail
      const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      const color = drop.hue === 320 ? '255, 50, 200' : '50, 200, 255';
      gradient.addColorStop(0, `rgba(${color}, 0)`);
      gradient.addColorStop(0.2, `rgba(${color}, ${drop.alpha})`);
      gradient.addColorStop(1, `rgba(${color}, ${drop.alpha * 0.2})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON FIRE - Majestic flames with embers and heat distortion
// ═══════════════════════════════════════════════════════════════════════════
class DragonFireRenderer {
  embers: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    life: number;
    maxLife: number;
  }> = [];

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Massive warm glow from bottom
    const heatGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 500);
    heatGrad.addColorStop(0, 'rgba(255, 80, 20, 0.3)');
    heatGrad.addColorStop(0.3, 'rgba(255, 100, 30, 0.15)');
    heatGrad.addColorStop(0.6, 'rgba(255, 120, 40, 0.06)');
    heatGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated fire waves at bottom
    for (let layer = 0; layer < 4; layer++) {
      const layerY = canvas.height - 20 - layer * 35;
      const alpha = 0.3 - layer * 0.06;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let x = 0; x <= canvas.width; x += 8) {
        const noise = 
          Math.sin(x * 0.015 + time * 5 + layer * 0.5) * 40 +
          Math.sin(x * 0.03 + time * 8 + layer) * 20 +
          Math.sin(x * 0.05 + time * 3) * 10;
        ctx.lineTo(x, layerY + noise);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const flameGrad = ctx.createLinearGradient(0, layerY - 60, 0, canvas.height);
      flameGrad.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
      flameGrad.addColorStop(0.3, `rgba(255, 140, 50, ${alpha})`);
      flameGrad.addColorStop(0.7, `rgba(200, 60, 20, ${alpha * 0.5})`);
      flameGrad.addColorStop(1, `rgba(100, 20, 0, ${alpha * 0.3})`);
      
      ctx.fillStyle = flameGrad;
      ctx.fill();
    }

    // Spawn embers
    if (Math.random() > 0.4) {
      this.embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 80 - Math.random() * 40,
        vx: (Math.random() - 0.5) * 2,
        vy: -3 - Math.random() * 5,
        size: 2 + Math.random() * 5,
        life: 0,
        maxLife: 120 + Math.random() * 100
      });
    }

    // Render embers with glow
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx + Math.sin(ember.life * 0.05) * 0.8;
      ember.y += ember.vy;
      ember.vy *= 0.995;
      ember.life++;

      const lifeRatio = 1 - ember.life / ember.maxLife;
      
      if (lifeRatio > 0) {
        // Ember glow
        const glowGrad = ctx.createRadialGradient(
          ember.x, ember.y, 0,
          ember.x, ember.y, ember.size * 4 * lifeRatio
        );
        glowGrad.addColorStop(0, `rgba(255, 200, 100, ${lifeRatio * 0.6})`);
        glowGrad.addColorStop(0.5, `rgba(255, 120, 50, ${lifeRatio * 0.3})`);
        glowGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 4 * lifeRatio, 0, Math.PI * 2);
        ctx.fill();

        // Ember core
        ctx.fillStyle = `rgba(255, 255, 220, ${lifeRatio * 0.9})`;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 0.5 * lifeRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      return ember.life < ember.maxLife;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SNOWFALL - Soft, dreamy snowflakes with depth
// ═══════════════════════════════════════════════════════════════════════════
class SnowfallRenderer {
  snowflakes: Array<{
    x: number; y: number;
    size: number;
    speed: number;
    wobble: number;
    wobbleSpeed: number;
    alpha: number;
    depth: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 180; i++) {
      const depth = 0.2 + Math.random() * 0.8;
      this.snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: (1.5 + Math.random() * 4) * depth,
        speed: (0.4 + Math.random() * 1.2) * depth,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.015 + Math.random() * 0.025,
        alpha: 0.3 + depth * 0.6,
        depth
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Cool atmospheric glow
    const atmGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    );
    atmGrad.addColorStop(0, 'rgba(180, 200, 255, 0.05)');
    atmGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = atmGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Snowflakes with blur based on depth
    this.snowflakes.forEach(flake => {
      flake.wobble += flake.wobbleSpeed;
      flake.x += Math.sin(flake.wobble) * 0.6;
      flake.y += flake.speed;

      if (flake.y > canvas.height + 20) {
        flake.y = -20;
        flake.x = Math.random() * canvas.width;
      }

      // Soft glow
      const glow = ctx.createRadialGradient(
        flake.x, flake.y, 0,
        flake.x, flake.y, flake.size * 3
      );
      glow.addColorStop(0, `rgba(220, 235, 255, ${flake.alpha})`);
      glow.addColorStop(0.4, `rgba(200, 220, 255, ${flake.alpha * 0.5})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NUCLEAR FALLOUT - Radioactive atmosphere with ash and radiation
// ═══════════════════════════════════════════════════════════════════════════
class NuclearRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
    type: 'ash' | 'radiation';
  }> = [];
  pulsePhase = 0;
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    // Ash particles
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.8,
        size: 1 + Math.random() * 3,
        alpha: 0.2 + Math.random() * 0.3,
        type: 'ash'
      });
    }

    // Radiation particles (yellow/green specks)
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 2 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.4,
        type: 'radiation'
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;
    this.pulsePhase += 0.02;

    // Radiation pulse effect
    const pulseIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.2;
    
    // Yellow/orange atmospheric glow
    const radGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 0.6, 0,
      canvas.width / 2, canvas.height * 0.6, canvas.width * 0.8
    );
    radGrad.addColorStop(0, `rgba(255, 200, 0, ${0.08 * pulseIntensity})`);
    radGrad.addColorStop(0.5, `rgba(255, 150, 0, ${0.04 * pulseIntensity})`);
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hazard glow from corners
    const cornerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 400);
    cornerGlow.addColorStop(0, 'rgba(200, 180, 0, 0.1)');
    cornerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = cornerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.y > canvas.height + 20) p.y = -20;
      if (p.y < -20) p.y = canvas.height + 20;
      if (p.x > canvas.width + 20) p.x = -20;
      if (p.x < -20) p.x = canvas.width + 20;

      if (p.type === 'ash') {
        ctx.fillStyle = `rgba(80, 70, 60, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Radiation particles with glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glow.addColorStop(0, `rgba(180, 255, 0, ${p.alpha * pulseIntensity})`);
        glow.addColorStop(0.5, `rgba(255, 200, 0, ${p.alpha * 0.5 * pulseIntensity})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Subtle grain/noise effect
    ctx.fillStyle = 'rgba(100, 90, 60, 0.02)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STARFIELD - Twinkling stars with nebula
// ═══════════════════════════════════════════════════════════════════════════
class StarfieldRenderer {
  stars: Array<{
    x: number; y: number;
    size: number;
    twinklePhase: number;
    twinkleSpeed: number;
    brightness: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        brightness: 0.3 + Math.random() * 0.7
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Nebula effect
    const nebula = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.4, 0,
      canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.5
    );
    nebula.addColorStop(0, 'rgba(100, 80, 180, 0.06)');
    nebula.addColorStop(0.5, 'rgba(60, 40, 120, 0.03)');
    nebula.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nebula2 = ctx.createRadialGradient(
      canvas.width * 0.7, canvas.height * 0.6, 0,
      canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.4
    );
    nebula2.addColorStop(0, 'rgba(80, 100, 200, 0.05)');
    nebula2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    this.stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;
      const alpha = star.brightness * twinkle;

      // Star glow
      const glow = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 4
      );
      glow.addColorStop(0, `rgba(200, 210, 255, ${alpha})`);
      glow.addColorStop(0.3, `rgba(180, 190, 255, ${alpha * 0.4})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Star core
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENCHANTED FOREST - Fireflies and magical particles
// ═══════════════════════════════════════════════════════════════════════════
class EnchantedForestRenderer {
  fireflies: Array<{
    x: number; y: number;
    vx: number; vy: number;
    phase: number;
    phaseSpeed: number;
    size: number;
    hue: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 50; i++) {
      this.fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.03 + Math.random() * 0.05,
        size: 3 + Math.random() * 4,
        hue: Math.random() > 0.5 ? 120 : 60 // Green or yellow-green
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Mystical mist from bottom
    const mistGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    mistGrad.addColorStop(0, 'rgba(100, 150, 100, 0.12)');
    mistGrad.addColorStop(0.5, 'rgba(80, 120, 80, 0.06)');
    mistGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Purple magic overlay
    const magicGrad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.3, 0,
      canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.6
    );
    magicGrad.addColorStop(0, 'rgba(150, 100, 200, 0.04)');
    magicGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = magicGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fireflies
    this.fireflies.forEach(ff => {
      ff.phase += ff.phaseSpeed;
      ff.x += ff.vx + Math.sin(ff.phase * 0.5) * 0.3;
      ff.y += ff.vy + Math.cos(ff.phase * 0.5) * 0.3;

      // Bounce off edges gently
      if (ff.x < 0 || ff.x > canvas.width) ff.vx *= -1;
      if (ff.y < 0 || ff.y > canvas.height) ff.vy *= -1;

      // Pulsing glow
      const pulse = 0.5 + Math.sin(ff.phase) * 0.5;
      const alpha = 0.4 + pulse * 0.5;

      // Glow
      const glow = ctx.createRadialGradient(
        ff.x, ff.y, 0,
        ff.x, ff.y, ff.size * 5
      );
      glow.addColorStop(0, `hsla(${ff.hue}, 80%, 70%, ${alpha})`);
      glow.addColorStop(0.3, `hsla(${ff.hue}, 70%, 50%, ${alpha * 0.4})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size * 5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `hsla(${ff.hue}, 90%, 85%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEEP SPACE - Vast cosmic expanse
// ═══════════════════════════════════════════════════════════════════════════
class DeepSpaceRenderer {
  stars: Array<{
    x: number; y: number;
    size: number;
    brightness: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.3 + Math.random() * 1.5,
        brightness: 0.2 + Math.random() * 0.6
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Deep nebula layers
    const nebula1 = ctx.createRadialGradient(
      canvas.width * 0.2, canvas.height * 0.3, 0,
      canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.6
    );
    nebula1.addColorStop(0, 'rgba(80, 50, 150, 0.08)');
    nebula1.addColorStop(0.5, 'rgba(50, 30, 100, 0.04)');
    nebula1.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nebula2 = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.7, 0,
      canvas.width * 0.8, canvas.height * 0.7, canvas.width * 0.5
    );
    nebula2.addColorStop(0, 'rgba(100, 60, 180, 0.06)');
    nebula2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars (static, no twinkle for calm feel)
    this.stars.forEach(star => {
      ctx.fillStyle = `rgba(200, 210, 255, ${star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VAMPIRE NIGHT - Gothic with bats and blood moon
// ═══════════════════════════════════════════════════════════════════════════
class VampireNightRenderer {
  bats: Array<{
    x: number; y: number;
    vx: number; vy: number;
    wingPhase: number;
    wingSpeed: number;
    size: number;
  }> = [];
  moonPhase = 0;
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 12; i++) {
      this.bats.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: 1 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 1,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.2 + Math.random() * 0.15,
        size: 8 + Math.random() * 10
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;
    this.moonPhase += 0.01;

    // Blood moon in corner
    const moonX = canvas.width * 0.85;
    const moonY = canvas.height * 0.15;
    const moonSize = 60;
    
    // Moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonSize, moonX, moonY, moonSize * 4);
    moonGlow.addColorStop(0, 'rgba(200, 50, 50, 0.15)');
    moonGlow.addColorStop(0.5, 'rgba(150, 30, 30, 0.06)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moon body
    const moonBody = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonSize);
    moonBody.addColorStop(0, 'rgba(220, 80, 60, 0.9)');
    moonBody.addColorStop(0.7, 'rgba(180, 50, 40, 0.8)');
    moonBody.addColorStop(1, 'rgba(120, 30, 20, 0.6)');
    ctx.fillStyle = moonBody;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
    ctx.fill();

    // Mist at bottom
    const mistGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 200);
    mistGrad.addColorStop(0, 'rgba(50, 30, 40, 0.25)');
    mistGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bats
    this.bats.forEach(bat => {
      bat.wingPhase += bat.wingSpeed;
      bat.x += bat.vx;
      bat.y += bat.vy + Math.sin(bat.wingPhase * 0.3) * 0.5;

      if (bat.x > canvas.width + 50) {
        bat.x = -50;
        bat.y = Math.random() * canvas.height * 0.5;
      }

      const wingFlap = Math.sin(bat.wingPhase);
      
      ctx.save();
      ctx.translate(bat.x, bat.y);
      
      // Simple bat silhouette
      ctx.fillStyle = 'rgba(20, 10, 15, 0.8)';
      ctx.beginPath();
      // Body
      ctx.ellipse(0, 0, bat.size * 0.3, bat.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-bat.size * 0.5, -bat.size * wingFlap * 0.3, -bat.size, bat.size * wingFlap * 0.2);
      ctx.quadraticCurveTo(-bat.size * 0.5, bat.size * 0.2, 0, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(bat.size * 0.5, -bat.size * wingFlap * 0.3, bat.size, bat.size * wingFlap * 0.2);
      ctx.quadraticCurveTo(bat.size * 0.5, bat.size * 0.2, 0, 0);
      ctx.fill();
      
      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTOPIA GARDEN - Peaceful particles and soft light
// ═══════════════════════════════════════════════════════════════════════════
class UtopiaGardenRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
    hue: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        size: 3 + Math.random() * 5,
        alpha: 0.3 + Math.random() * 0.4,
        hue: 40 + Math.random() * 30 // Warm yellows
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    // Warm sunlight glow
    const sunGlow = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.2, 0,
      canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.7
    );
    sunGlow.addColorStop(0, 'rgba(255, 240, 200, 0.1)');
    sunGlow.addColorStop(0.3, 'rgba(255, 220, 180, 0.05)');
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft gradient at bottom
    const groundGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 250);
    groundGlow.addColorStop(0, 'rgba(180, 220, 150, 0.08)');
    groundGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = groundGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floating particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }

      // Soft glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      glow.addColorStop(0, `hsla(${p.hue}, 70%, 80%, ${p.alpha})`);
      glow.addColorStop(0.5, `hsla(${p.hue}, 60%, 70%, ${p.alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT DUST MOTES - Subtle floating dust
// ═══════════════════════════════════════════════════════════════════════════
class DustMotesRenderer {
  motes: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    
    for (let i = 0; i < 80; i++) {
      this.motes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.2,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.25
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas } = rc;

    this.motes.forEach(mote => {
      mote.x += mote.vx;
      mote.y += mote.vy;

      if (mote.y < -10) {
        mote.y = canvas.height + 10;
        mote.x = Math.random() * canvas.width;
      }

      ctx.fillStyle = `rgba(255, 220, 180, ${mote.alpha})`;
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERER FACTORY
// ═══════════════════════════════════════════════════════════════════════════
const renderers: Record<string, any> = {};

function getRenderer(rendererType: string, canvas: HTMLCanvasElement) {
  if (!renderers[rendererType]) {
    switch (rendererType) {
      case 'grimoire':
        renderers[rendererType] = new GrimoireRenderer();
        break;
      case 'matrixRain':
        renderers[rendererType] = new MatrixRainRenderer();
        break;
      case 'cyberpunkCity':
        renderers[rendererType] = new CyberpunkRenderer();
        break;
      case 'dragonFire':
        renderers[rendererType] = new DragonFireRenderer();
        break;
      case 'snowfall':
        renderers[rendererType] = new SnowfallRenderer();
        break;
      case 'nuclearFallout':
        renderers[rendererType] = new NuclearRenderer();
        break;
      case 'starfield':
        renderers[rendererType] = new StarfieldRenderer();
        break;
      case 'enchantedForest':
        renderers[rendererType] = new EnchantedForestRenderer();
        break;
      case 'deepSpace':
        renderers[rendererType] = new DeepSpaceRenderer();
        break;
      case 'vampireNight':
        renderers[rendererType] = new VampireNightRenderer();
        break;
      case 'utopiaGarden':
        renderers[rendererType] = new UtopiaGardenRenderer();
        break;
      case 'dustMotes':
      default:
        renderers[rendererType] = new DustMotesRenderer();
        break;
    }
    renderers[rendererType].init?.(canvas);
  }
  return renderers[rendererType];
}

export function ThemeEffectsCanvas({ subTheme, reducedMotion }: ThemeEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parse colors
    const primary = parseHsl(subTheme.primary);
    const accent = parseHsl(subTheme.accent);
    const secondary = parseHsl(subTheme.secondary);

    const renderContext: RenderContext = {
      ctx,
      canvas,
      time: currentTime / 1000,
      deltaTime: deltaTime / 1000,
      primaryRgb: hslToRgb(primary.h, primary.s, primary.l),
      accentRgb: hslToRgb(accent.h, accent.s, accent.l),
      secondaryRgb: hslToRgb(secondary.h, secondary.s, secondary.l),
      effects: subTheme.effects,
    };

    // Get and run the appropriate renderer
    const renderer = getRenderer(subTheme.effects.renderer, canvas);
    renderer.render(renderContext);

    animationRef.current = requestAnimationFrame(animate);
  }, [subTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    // Set canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset renderer when resizing
      const rendererType = subTheme.effects.renderer;
      if (renderers[rendererType]) {
        renderers[rendererType].initialized = false;
        renderers[rendererType].init?.(canvas);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate, reducedMotion, subTheme.effects.renderer]);

  // Clear renderers cache when theme changes
  useEffect(() => {
    Object.keys(renderers).forEach(key => {
      if (key !== subTheme.effects.renderer) {
        delete renderers[key];
      }
    });
  }, [subTheme.effects.renderer]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        opacity: 0.9,
        mixBlendMode: 'screen',
        filter: 'blur(1px)',
      }}
    />
  );
}
