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
// MATRIX RAIN - Like androidport.lovable.app - Dense cascading code
// Premium quality with depth, proper character animation, glowing heads
// ═══════════════════════════════════════════════════════════════════════════
class MatrixRainRenderer {
  columns: Array<{
    x: number;
    chars: Array<{ y: number; char: string; speed: number }>;
    speed: number;
    depth: number;
  }> = [];
  charSet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>{}[]|/@#$%&=+*';
  initialized = false;

  init(canvas: HTMLCanvasElement, primaryRgb: [number, number, number]) {
    if (this.initialized) return;
    this.initialized = true;

    const columnWidth = 20;
    const numColumns = Math.ceil(canvas.width / columnWidth) + 5;

    for (let i = 0; i < numColumns; i++) {
      const depth = 0.4 + Math.random() * 0.6;
      const chars: Array<{ y: number; char: string; speed: number }> = [];
      const charCount = Math.floor(8 + Math.random() * 20);
      const startY = -Math.random() * canvas.height * 1.5;

      for (let j = 0; j < charCount; j++) {
        chars.push({
          y: startY + j * 22,
          char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
          speed: 1 + Math.random() * 0.5
        });
      }

      this.columns.push({
        x: i * columnWidth + (Math.random() - 0.5) * 8,
        chars,
        speed: (3 + Math.random() * 6) * depth,
        depth
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;
    const [pr, pg, pb] = primaryRgb;

    // Subtle center glow
    const centerGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    );
    centerGlow.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.03)`);
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.columns.forEach(column => {
      const fontSize = Math.floor(14 * column.depth + 6);
      ctx.font = `${fontSize}px 'Courier New', monospace`;

      column.chars.forEach((charObj, i) => {
        charObj.y += column.speed * charObj.speed;

        // Random character change
        if (Math.random() > 0.96) {
          charObj.char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        }

        const isHead = i === column.chars.length - 1;
        const distFromHead = column.chars.length - 1 - i;
        const fade = Math.max(0, 1 - distFromHead * 0.05);

        if (charObj.y >= 0 && charObj.y <= canvas.height && fade > 0.05) {
          if (isHead) {
            // Bright glowing head
            ctx.save();
            ctx.shadowColor = `rgb(${pr}, ${pg}, ${pb})`;
            ctx.shadowBlur = 15 * column.depth;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * column.depth})`;
            ctx.fillText(charObj.char, column.x, charObj.y);
            ctx.restore();
          } else {
            // Fading trail with primary color
            const brightness = Math.min(255, pg + distFromHead * 8);
            ctx.fillStyle = `rgba(${Math.floor(pr * 0.3)}, ${brightness}, ${Math.floor(pb * 0.5)}, ${fade * column.depth * 0.8})`;
            ctx.fillText(charObj.char, column.x, charObj.y);
          }
        }
      });

      // Reset when off screen
      const firstChar = column.chars[0];
      if (firstChar && firstChar.y > canvas.height + 200) {
        const charCount = Math.floor(8 + Math.random() * 20);
        column.chars = [];
        for (let j = 0; j < charCount; j++) {
          column.chars.push({
            y: -charCount * 22 + j * 22,
            char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
            speed: 1 + Math.random() * 0.5
          });
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STARFIELD - Gentle twinkling stars with subtle nebula colors
// ═══════════════════════════════════════════════════════════════════════════
class StarfieldRenderer {
  stars: Array<{
    x: number; y: number;
    size: number;
    baseAlpha: number;
    twinkleSpeed: number;
    twinklePhase: number;
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
        baseAlpha: 0.3 + Math.random() * 0.5,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Subtle nebula clouds
    const nebula1 = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.3, 0,
      canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4
    );
    nebula1.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    nebula1.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nebula2 = ctx.createRadialGradient(
      canvas.width * 0.7, canvas.height * 0.6, 0,
      canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.35
    );
    nebula2.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.03)`);
    nebula2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    this.stars.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;
      const alpha = star.baseAlpha * twinkle;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();

      // Glow for larger stars
      if (star.size > 1.2) {
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.3})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(star.x - star.size * 3, star.y - star.size * 3, star.size * 6, star.size * 6);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DUST MOTES - Gentle floating particles with warm glow
// ═══════════════════════════════════════════════════════════════════════════
class DustMotesRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
    phase: number;
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
        vy: -0.1 - Math.random() * 0.3,
        size: 1 + Math.random() * 3,
        alpha: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, time } = rc;

    // Warm ambient light
    const warmGlow = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.3, 0,
      canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.5
    );
    warmGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.05)`);
    warmGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.particles.forEach(p => {
      p.phase += 0.02;
      p.x += p.vx + Math.sin(p.phase) * 0.2;
      p.y += p.vy;

      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha})`);
      glow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FALLING LEAVES - Gentle drifting leaves with natural movement
// ═══════════════════════════════════════════════════════════════════════════
class FallingLeavesRenderer {
  leaves: Array<{
    x: number; y: number;
    rotation: number;
    rotSpeed: number;
    size: number;
    swayPhase: number;
    speed: number;
    hue: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 25; i++) {
      this.leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        size: 8 + Math.random() * 12,
        swayPhase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1,
        hue: 30 + Math.random() * 30
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Forest mist
    const mist = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    mist.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`);
    mist.addColorStop(1, 'transparent');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.leaves.forEach(leaf => {
      leaf.swayPhase += 0.015;
      leaf.rotation += leaf.rotSpeed;
      leaf.x += Math.sin(leaf.swayPhase) * 1.5;
      leaf.y += leaf.speed;

      if (leaf.y > canvas.height + 30) {
        leaf.y = -30;
        leaf.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.scale(leaf.size / 15, leaf.size / 15);

      // Simple leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(8, -5, 6, 5);
      ctx.quadraticCurveTo(0, 12, -6, 5);
      ctx.quadraticCurveTo(-8, -5, 0, -10);
      ctx.fillStyle = `hsla(${leaf.hue}, 60%, 40%, 0.6)`;
      ctx.fill();

      // Leaf vein
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 8);
      ctx.strokeStyle = `hsla(${leaf.hue}, 40%, 30%, 0.4)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SNOWFALL - Gentle falling snow with subtle sparkle
// ═══════════════════════════════════════════════════════════════════════════
class SnowfallRenderer {
  flakes: Array<{
    x: number; y: number;
    size: number;
    speed: number;
    swayPhase: number;
    swaySpeed: number;
    alpha: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 80; i++) {
      this.flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 4,
        speed: 0.5 + Math.random() * 1.5,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        alpha: 0.4 + Math.random() * 0.5
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Cold ambient glow
    const coldGlow = ctx.createRadialGradient(
      canvas.width * 0.5, 0, 0,
      canvas.width * 0.5, 0, canvas.height * 0.6
    );
    coldGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    coldGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = coldGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.flakes.forEach(flake => {
      flake.swayPhase += flake.swaySpeed;
      flake.x += Math.sin(flake.swayPhase) * 0.8;
      flake.y += flake.speed;

      if (flake.y > canvas.height + 10) {
        flake.y = -10;
        flake.x = Math.random() * canvas.width;
      }

      // Snowflake with glow
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
      ctx.fill();

      // Subtle glow
      const glow = ctx.createRadialGradient(flake.x, flake.y, 0, flake.x, flake.y, flake.size * 3);
      glow.addColorStop(0, `rgba(200, 220, 255, ${flake.alpha * 0.3})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(flake.x - flake.size * 3, flake.y - flake.size * 3, flake.size * 6, flake.size * 6);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON FIRE - Warm embers rising with flame glow
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
    const { ctx, canvas, time, primaryRgb } = rc;

    // Heat glow from bottom
    const heatGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 400);
    heatGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${Math.floor(primaryRgb[1] * 0.5)}, 0, 0.15)`);
    heatGlow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${Math.floor(primaryRgb[1] * 0.3)}, 0, 0.05)`);
    heatGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = heatGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated fire line at bottom
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
      const flame = Math.sin(x * 0.02 + time * 4) * 30 + Math.sin(x * 0.05 + time * 6) * 15;
      ctx.lineTo(x, canvas.height - 40 - flame);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    const fireGrad = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    fireGrad.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    fireGrad.addColorStop(0.4, 'rgba(255, 100, 20, 0.2)');
    fireGrad.addColorStop(1, 'rgba(150, 30, 0, 0.1)');
    ctx.fillStyle = fireGrad;
    ctx.fill();

    // Spawn embers
    if (Math.random() > 0.5) {
      this.embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 50,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2 - Math.random() * 3,
        size: 1 + Math.random() * 4,
        life: 0,
        maxLife: 80 + Math.random() * 80
      });
    }

    // Render embers
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx + Math.sin(ember.life * 0.08) * 0.5;
      ember.y += ember.vy;
      ember.vy *= 0.99;
      ember.life++;

      const lifeRatio = 1 - ember.life / ember.maxLife;

      if (lifeRatio > 0) {
        const glow = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.size * 4);
        glow.addColorStop(0, `rgba(255, 200, 80, ${lifeRatio * 0.7})`);
        glow.addColorStop(0.5, `rgba(255, 100, 30, ${lifeRatio * 0.3})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${lifeRatio})`;
        ctx.fill();
      }

      return ember.life < ember.maxLife;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CYBERPUNK - Neon rain with ambient city glow
// ═══════════════════════════════════════════════════════════════════════════
class CyberpunkRenderer {
  raindrops: Array<{
    x: number; y: number;
    length: number;
    speed: number;
    color: string;
    alpha: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 250; i++) {
      const isCyan = Math.random() > 0.5;
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 20 + Math.random() * 40,
        speed: 8 + Math.random() * 12,
        color: isCyan ? '0, 255, 255' : '255, 0, 200',
        alpha: 0.15 + Math.random() * 0.3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb } = rc;

    // Neon ambient glow
    const bottomGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    bottomGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`);
    bottomGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const topGlow = ctx.createLinearGradient(0, 0, 0, 200);
    topGlow.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.05)`);
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

      const grad = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      grad.addColorStop(0, `rgba(${drop.color}, 0)`);
      grad.addColorStop(0.3, `rgba(${drop.color}, ${drop.alpha})`);
      grad.addColorStop(1, `rgba(${drop.color}, 0.05)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GRIMOIRE - Warm candlelight atmosphere with floating runes
// ═══════════════════════════════════════════════════════════════════════════
class GrimoireRenderer {
  candles: Array<{
    x: number; y: number;
    scale: number;
    flickerPhase: number;
    flickerSpeed: number;
  }> = [];
  runes: Array<{
    x: number; y: number;
    char: string;
    alpha: number;
    speed: number;
    phase: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Candle positions around edges
    const positions = [
      { x: 0.05, y: 0.3, s: 0.7 }, { x: 0.08, y: 0.7, s: 0.6 },
      { x: 0.92, y: 0.25, s: 0.65 }, { x: 0.95, y: 0.65, s: 0.7 },
      { x: 0.3, y: 0.05, s: 0.5 }, { x: 0.7, y: 0.08, s: 0.5 },
      { x: 0.15, y: 0.9, s: 0.6 }, { x: 0.85, y: 0.92, s: 0.55 }
    ];

    positions.forEach(pos => {
      this.candles.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        scale: pos.s,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.1 + Math.random() * 0.05
      });
    });

    // Floating runes
    const runeChars = '᛭ᚠᚢᚦᚨᚱᚲ☽☾✧⚝';
    for (let i = 0; i < 15; i++) {
      this.runes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: runeChars[Math.floor(Math.random() * runeChars.length)],
        alpha: 0.1 + Math.random() * 0.2,
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Render candle glows
    this.candles.forEach(candle => {
      candle.flickerPhase += candle.flickerSpeed;
      const flicker = 0.7 + Math.sin(candle.flickerPhase) * 0.15 + Math.sin(candle.flickerPhase * 2.3) * 0.1;

      // Large warm glow
      const glow = ctx.createRadialGradient(
        candle.x, candle.y - 10, 0,
        candle.x, candle.y - 10, 200 * candle.scale
      );
      glow.addColorStop(0, `rgba(255, 160, 60, ${0.12 * flicker * candle.scale})`);
      glow.addColorStop(0.3, `rgba(255, 100, 40, ${0.06 * flicker * candle.scale})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Floating runes
    this.runes.forEach(rune => {
      rune.phase += 0.02;
      rune.y -= rune.speed;
      rune.x += Math.sin(rune.phase) * 0.5;

      if (rune.y < -30) {
        rune.y = canvas.height + 30;
        rune.x = Math.random() * canvas.width;
      }

      const pulse = 0.6 + Math.sin(rune.phase) * 0.4;
      ctx.font = '18px serif';
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${Math.floor(primaryRgb[1] * 0.6)}, ${Math.floor(primaryRgb[2] * 0.4)}, ${rune.alpha * pulse})`;
      ctx.fillText(rune.char, rune.x, rune.y);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENCHANTED FOREST - Fireflies and magic mist
// ═══════════════════════════════════════════════════════════════════════════
class EnchantedForestRenderer {
  fireflies: Array<{
    x: number; y: number;
    vx: number; vy: number;
    glowPhase: number;
    glowSpeed: number;
    size: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 40; i++) {
      this.fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.5,
        glowPhase: Math.random() * Math.PI * 2,
        glowSpeed: 0.03 + Math.random() * 0.05,
        size: 2 + Math.random() * 3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb } = rc;

    // Magic mist from bottom
    const mist = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 350);
    mist.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.1)`);
    mist.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    mist.addColorStop(1, 'transparent');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fireflies
    this.fireflies.forEach(fly => {
      fly.glowPhase += fly.glowSpeed;
      fly.x += fly.vx;
      fly.y += fly.vy;

      // Change direction occasionally
      if (Math.random() > 0.98) {
        fly.vx = (Math.random() - 0.5) * 0.8;
        fly.vy = (Math.random() - 0.5) * 0.5;
      }

      // Wrap
      if (fly.x < -20) fly.x = canvas.width + 20;
      if (fly.x > canvas.width + 20) fly.x = -20;
      if (fly.y < -20) fly.y = canvas.height + 20;
      if (fly.y > canvas.height + 20) fly.y = -20;

      const glow = Math.max(0, Math.sin(fly.glowPhase));
      if (glow > 0.1) {
        const grad = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 8);
        grad.addColorStop(0, `rgba(180, 255, 100, ${glow * 0.8})`);
        grad.addColorStop(0.3, `rgba(100, 255, 80, ${glow * 0.3})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${glow})`;
        ctx.fill();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VAMPIRE NIGHT - Bats and blood moon atmosphere
// ═══════════════════════════════════════════════════════════════════════════
class VampireNightRenderer {
  bats: Array<{
    x: number; y: number;
    speed: number;
    wingPhase: number;
    size: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 12; i++) {
      this.bats.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        speed: 1 + Math.random() * 2,
        wingPhase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 10
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Blood moon glow
    const moonX = canvas.width * 0.8;
    const moonY = canvas.height * 0.15;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, 200);
    moonGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${Math.floor(primaryRgb[1] * 0.3)}, ${Math.floor(primaryRgb[2] * 0.3)}, 0.3)`);
    moonGlow.addColorStop(0.3, `rgba(${primaryRgb[0]}, 0, 0, 0.1)`);
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moon disc
    ctx.beginPath();
    ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${primaryRgb[0]}, ${Math.floor(primaryRgb[1] * 0.4)}, ${Math.floor(primaryRgb[2] * 0.3)}, 0.4)`;
    ctx.fill();

    // Bats
    this.bats.forEach(bat => {
      bat.wingPhase += 0.2;
      bat.x -= bat.speed;
      bat.y += Math.sin(bat.wingPhase * 0.3) * 0.5;

      if (bat.x < -30) {
        bat.x = canvas.width + 30;
        bat.y = Math.random() * canvas.height * 0.5;
      }

      const wingUp = Math.sin(bat.wingPhase) * 0.4;

      ctx.save();
      ctx.translate(bat.x, bat.y);
      ctx.scale(bat.size / 15, bat.size / 15);

      // Simple bat shape
      ctx.fillStyle = 'rgba(20, 10, 10, 0.7)';
      ctx.beginPath();
      // Body
      ctx.ellipse(0, 0, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.quadraticCurveTo(-15, -8 + wingUp * 10, -18, 2 + wingUp * 5);
      ctx.quadraticCurveTo(-10, 4, -3, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.quadraticCurveTo(15, -8 + wingUp * 10, 18, 2 + wingUp * 5);
      ctx.quadraticCurveTo(10, 4, 3, 2);
      ctx.fill();

      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEEP SPACE - Nebulae and distant galaxies
// ═══════════════════════════════════════════════════════════════════════════
class DeepSpaceRenderer {
  stars: Array<{ x: number; y: number; size: number; alpha: number }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 150; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.3 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.6
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb, time } = rc;

    // Nebula cloud 1
    const nebula1 = ctx.createRadialGradient(
      canvas.width * 0.25, canvas.height * 0.35, 0,
      canvas.width * 0.25, canvas.height * 0.35, canvas.width * 0.35
    );
    nebula1.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.06)`);
    nebula1.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.02)`);
    nebula1.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula cloud 2
    const nebula2 = ctx.createRadialGradient(
      canvas.width * 0.75, canvas.height * 0.6, 0,
      canvas.width * 0.75, canvas.height * 0.6, canvas.width * 0.3
    );
    nebula2.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.05)`);
    nebula2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    this.stars.forEach(star => {
      const twinkle = 0.7 + Math.sin(time * 2 + star.x * 0.01) * 0.3;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC PARTICLE RENDERER - For themes without specific renderers
// ═══════════════════════════════════════════════════════════════════════════
class GenericParticleRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
    phase: number;
  }> = [];
  initialized = false;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Ambient glow
    const glow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.5
    );
    glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.particles.forEach(p => {
      p.phase += 0.02;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// Renderer instances
const matrixRain = new MatrixRainRenderer();
const starfield = new StarfieldRenderer();
const dustMotes = new DustMotesRenderer();
const fallingLeaves = new FallingLeavesRenderer();
const snowfall = new SnowfallRenderer();
const dragonFire = new DragonFireRenderer();
const cyberpunk = new CyberpunkRenderer();
const grimoire = new GrimoireRenderer();
const enchantedForest = new EnchantedForestRenderer();
const vampireNight = new VampireNightRenderer();
const deepSpace = new DeepSpaceRenderer();
const genericParticle = new GenericParticleRenderer();

// Get renderer by name
const getRenderer = (rendererName: string) => {
  const renderers: Record<string, any> = {
    matrixRain,
    starfield,
    dustMotes,
    fallingLeaves,
    snowfall,
    dragonFire,
    cyberpunkCity: cyberpunk,
    grimoire,
    enchantedForest,
    vampireNight,
    deepSpace,
    // Map other names to appropriate renderers
    royalSparkles: dustMotes,
    potionBrew: enchantedForest,
    celestialMagic: starfield,
    ghostlyApparitions: grimoire,
    darkForest: enchantedForest,
    cosmicHorror: deepSpace,
    asylum: cyberpunk,
    hologramDisplay: cyberpunk,
    nuclearFallout: dragonFire,
    utopiaGarden: enchantedForest,
    steamEngine: dustMotes,
    clockwork: dustMotes,
    aetherPunk: cyberpunk,
    passionFlame: dragonFire,
    secretGarden: fallingLeaves,
    masquerade: grimoire,
    paranoidMind: cyberpunk,
    detectiveNoir: grimoire,
    escapeTension: cyberpunk,
    jungleExpedition: fallingLeaves,
    treasureHunt: dustMotes,
    seafaring: deepSpace,
    medievalCourt: grimoire,
    ancientEmpire: dustMotes,
    vikingAge: snowfall,
    wildWest: dustMotes,
    samurai: fallingLeaves
  };
  return renderers[rendererName] || genericParticle;
};

export function ThemeEffectsCanvas({ subTheme, reducedMotion }: ThemeEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const primary = parseHsl(subTheme.primary);
  const accent = parseHsl(subTheme.accent);
  const secondary = parseHsl(subTheme.secondary);

  const primaryRgb = hslToRgb(primary.h, primary.s, primary.l);
  const accentRgb = hslToRgb(accent.h, accent.s, accent.l);
  const secondaryRgb = hslToRgb(secondary.h, secondary.s, secondary.l);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || reducedMotion) return;

    const now = performance.now();
    if (!startTimeRef.current) startTimeRef.current = now;
    const time = (now - startTimeRef.current) / 1000;
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderer = getRenderer(subTheme.effects.renderer);
    if (renderer.init) {
      renderer.init(canvas, primaryRgb);
    }

    const renderContext: RenderContext = {
      ctx,
      canvas,
      time,
      deltaTime,
      primaryRgb,
      accentRgb,
      secondaryRgb,
      effects: subTheme.effects
    };

    renderer.render(renderContext);

    animationRef.current = requestAnimationFrame(animate);
  }, [subTheme, reducedMotion, primaryRgb, accentRgb, secondaryRgb]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (!reducedMotion) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
