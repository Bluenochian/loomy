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

// ═══════════════════════════════════════════════════════════════
// UNIQUE RENDERERS FOR EACH THEME
// ═══════════════════════════════════════════════════════════════

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  time: number;
  primaryRgb: [number, number, number];
  accentRgb: [number, number, number];
  secondaryRgb: [number, number, number];
  effects: SubTheme['effects'];
}

// ═══════════════════════════════════════════════════════════════
// GRIMOIRE - Floating candles with dripping wax & blood
// ═══════════════════════════════════════════════════════════════
class GrimoireRenderer {
  candles: Array<{
    x: number; y: number; 
    height: number; 
    flicker: number; 
    phase: number;
    dripTimer: number;
  }> = [];
  drips: Array<{ x: number; y: number; vy: number; size: number; alpha: number }> = [];
  runes: Array<{ x: number; y: number; char: string; alpha: number; pulse: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Create floating candles
    for (let i = 0; i < 12; i++) {
      this.candles.push({
        x: Math.random() * canvas.width,
        y: 100 + Math.random() * (canvas.height - 300),
        height: 40 + Math.random() * 30,
        flicker: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        dripTimer: Math.random() * 200
      });
    }
    // Create ancient runes
    const runeChars = '᚛᚜ᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚ';
    for (let i = 0; i < 20; i++) {
      this.runes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: runeChars[Math.floor(Math.random() * runeChars.length)],
        alpha: Math.random() * 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Draw rune circle in center
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(time * 0.1);
    const circleRadius = Math.min(canvas.width, canvas.height) * 0.3;
    ctx.strokeStyle = `rgba(150, 30, 30, ${0.1 + Math.sin(time) * 0.05})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    // Rune symbols around circle
    ctx.font = '24px serif';
    ctx.fillStyle = `rgba(180, 50, 50, ${0.15 + Math.sin(time * 2) * 0.05})`;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const rx = Math.cos(angle) * circleRadius * 0.85;
      const ry = Math.sin(angle) * circleRadius * 0.85;
      ctx.fillText('᚛', rx - 8, ry + 8);
    }
    ctx.restore();

    // Floating runes
    this.runes.forEach(rune => {
      rune.pulse += 0.02;
      const alpha = rune.alpha + Math.sin(rune.pulse) * 0.1;
      ctx.font = '28px serif';
      ctx.fillStyle = `rgba(180, 60, 60, ${alpha})`;
      ctx.fillText(rune.char, rune.x, rune.y);
    });

    // Draw candles
    this.candles.forEach(candle => {
      // Gentle floating motion
      candle.phase += 0.01;
      const floatY = Math.sin(candle.phase) * 8;
      const floatX = Math.cos(candle.phase * 0.7) * 4;
      
      const cx = candle.x + floatX;
      const cy = candle.y + floatY;

      // Candle body
      ctx.fillStyle = '#e8d4b8';
      ctx.beginPath();
      ctx.roundRect(cx - 8, cy, 16, candle.height, 2);
      ctx.fill();

      // Wax drips on candle
      ctx.fillStyle = '#d4c4a8';
      for (let d = 0; d < 3; d++) {
        const dx = cx - 6 + d * 5;
        const dh = 5 + Math.sin(candle.phase + d) * 3;
        ctx.beginPath();
        ctx.ellipse(dx, cy + 2, 3, dh, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flame
      candle.flicker += 0.15;
      const flameHeight = 20 + Math.sin(candle.flicker) * 5 + Math.sin(candle.flicker * 3.7) * 3;
      const flameWidth = 8 + Math.sin(candle.flicker * 2.3) * 2;
      
      // Outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy - 10, 0, cx, cy - 10, 60);
      glowGrad.addColorStop(0, 'rgba(255, 180, 80, 0.4)');
      glowGrad.addColorStop(0.5, 'rgba(255, 120, 40, 0.15)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 60, 0, Math.PI * 2);
      ctx.fill();

      // Flame body
      const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy - flameHeight);
      flameGrad.addColorStop(0, 'rgba(255, 200, 100, 1)');
      flameGrad.addColorStop(0.3, 'rgba(255, 150, 50, 1)');
      flameGrad.addColorStop(0.6, 'rgba(255, 100, 20, 0.9)');
      flameGrad.addColorStop(1, 'rgba(255, 60, 10, 0)');
      
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(cx - flameWidth, cy);
      ctx.quadraticCurveTo(cx - flameWidth * 0.8, cy - flameHeight * 0.4, cx, cy - flameHeight);
      ctx.quadraticCurveTo(cx + flameWidth * 0.8, cy - flameHeight * 0.4, cx + flameWidth, cy);
      ctx.fill();

      // Inner bright core
      ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 5, 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Blood drips
      candle.dripTimer++;
      if (candle.dripTimer > 150 && Math.random() > 0.98) {
        this.drips.push({
          x: cx + (Math.random() - 0.5) * 16,
          y: cy + candle.height,
          vy: 0.5,
          size: 2 + Math.random() * 2,
          alpha: 0.8
        });
        candle.dripTimer = 0;
      }
    });

    // Render blood drips
    this.drips = this.drips.filter(drip => {
      drip.y += drip.vy;
      drip.vy += 0.05;
      drip.alpha -= 0.002;
      
      // Elongated drop shape
      ctx.fillStyle = `rgba(120, 20, 20, ${drip.alpha})`;
      ctx.beginPath();
      ctx.ellipse(drip.x, drip.y, drip.size, drip.size * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      return drip.alpha > 0 && drip.y < canvas.height;
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// GHOSTLY - Drifting apparitions with cold mist
// ═══════════════════════════════════════════════════════════════
class GhostlyRenderer {
  ghosts: Array<{
    x: number; y: number;
    scale: number;
    alpha: number;
    drift: number;
    phase: number;
  }> = [];
  mistLayers: Array<{ y: number; speed: number; opacity: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Create ghost apparitions
    for (let i = 0; i < 5; i++) {
      this.ghosts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        scale: 0.5 + Math.random() * 0.5,
        alpha: 0.1 + Math.random() * 0.15,
        drift: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
    // Mist layers
    for (let i = 0; i < 4; i++) {
      this.mistLayers.push({
        y: canvas.height * (0.5 + i * 0.15),
        speed: 0.2 + Math.random() * 0.3,
        opacity: 0.1 + Math.random() * 0.1
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Mist layers
    this.mistLayers.forEach(layer => {
      const gradient = ctx.createLinearGradient(0, layer.y - 100, 0, layer.y + 100);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, `rgba(180, 190, 200, ${layer.opacity})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, layer.y - 100 + Math.sin(time * layer.speed) * 20, canvas.width, 200);
    });

    // Ghost apparitions
    this.ghosts.forEach(ghost => {
      ghost.drift += 0.005;
      ghost.phase += 0.02;
      
      const gx = ghost.x + Math.sin(ghost.drift) * 50;
      const gy = ghost.y + Math.cos(ghost.drift * 0.7) * 30;
      const flickerAlpha = ghost.alpha * (0.7 + Math.sin(ghost.phase * 3) * 0.3);

      // Ghost body - ethereal form
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(ghost.scale, ghost.scale);

      // Outer glow
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
      glowGrad.addColorStop(0, `rgba(200, 210, 220, ${flickerAlpha * 0.5})`);
      glowGrad.addColorStop(0.5, `rgba(180, 190, 200, ${flickerAlpha * 0.2})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.fill();

      // Ghost shape
      const bodyGrad = ctx.createLinearGradient(0, -60, 0, 80);
      bodyGrad.addColorStop(0, `rgba(220, 225, 230, ${flickerAlpha})`);
      bodyGrad.addColorStop(0.7, `rgba(200, 210, 220, ${flickerAlpha * 0.5})`);
      bodyGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, -20, 30, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wispy tail
      ctx.beginPath();
      ctx.moveTo(-20, 20);
      ctx.quadraticCurveTo(-30, 60, -15 + Math.sin(ghost.phase) * 10, 80);
      ctx.quadraticCurveTo(0, 70, 15 + Math.sin(ghost.phase + 1) * 10, 80);
      ctx.quadraticCurveTo(30, 60, 20, 20);
      ctx.fill();

      // Eyes - hollow voids
      ctx.fillStyle = `rgba(40, 50, 60, ${flickerAlpha * 2})`;
      ctx.beginPath();
      ctx.ellipse(-12, -25, 6, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(12, -25, 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Occasional flicker effect
    if (Math.random() > 0.995) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// DRAGON FIRE - Rising embers with dragon silhouette
// ═══════════════════════════════════════════════════════════════
class DragonFireRenderer {
  embers: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    life: number;
    maxLife: number;
    brightness: number;
  }> = [];
  fireWaves: Array<{ x: number; width: number; phase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Fire waves at bottom
    for (let i = 0; i < 8; i++) {
      this.fireWaves.push({
        x: i * (canvas.width / 7),
        width: canvas.width / 5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Draw fire at bottom
    const fireHeight = 150;
    
    // Multiple fire layers
    for (let layer = 0; layer < 3; layer++) {
      const layerOffset = layer * 20;
      const layerAlpha = 0.3 - layer * 0.08;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let x = 0; x <= canvas.width; x += 20) {
        const waveY = canvas.height - fireHeight + layerOffset +
          Math.sin(x * 0.02 + time * 3 + layer) * 30 +
          Math.sin(x * 0.05 + time * 5) * 15;
        ctx.lineTo(x, waveY);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const fireGrad = ctx.createLinearGradient(0, canvas.height - fireHeight, 0, canvas.height);
      fireGrad.addColorStop(0, `rgba(255, 200, 50, ${layerAlpha})`);
      fireGrad.addColorStop(0.3, `rgba(255, 120, 20, ${layerAlpha})`);
      fireGrad.addColorStop(0.7, `rgba(200, 50, 0, ${layerAlpha})`);
      fireGrad.addColorStop(1, `rgba(100, 20, 0, ${layerAlpha})`);
      
      ctx.fillStyle = fireGrad;
      ctx.fill();
    }

    // Spawn embers
    if (Math.random() > 0.7) {
      this.embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 100,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 3,
        size: 2 + Math.random() * 4,
        life: 0,
        maxLife: 150 + Math.random() * 100,
        brightness: 0.5 + Math.random() * 0.5
      });
    }

    // Update and draw embers
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx + Math.sin(ember.life * 0.05) * 0.5;
      ember.y += ember.vy;
      ember.vy *= 0.99;
      ember.life++;

      const lifeRatio = 1 - ember.life / ember.maxLife;
      const alpha = lifeRatio * ember.brightness;

      // Glowing ember
      const glowGrad = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.size * 3);
      glowGrad.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
      glowGrad.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.5})`);
      glowGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      return ember.life < ember.maxLife;
    });

    // Dragon silhouette (subtle)
    const dragonX = canvas.width * 0.7 + Math.sin(time * 0.5) * 50;
    const dragonY = canvas.height * 0.3 + Math.cos(time * 0.3) * 30;
    const dragonAlpha = 0.08 + Math.sin(time) * 0.02;

    ctx.fillStyle = `rgba(20, 10, 5, ${dragonAlpha})`;
    ctx.save();
    ctx.translate(dragonX, dragonY);
    ctx.scale(1.5, 1.5);
    
    // Simple dragon head silhouette
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(30, -20, 60, 0);
    ctx.quadraticCurveTo(80, 10, 70, 30);
    ctx.quadraticCurveTo(40, 40, 20, 30);
    ctx.quadraticCurveTo(-10, 35, -20, 20);
    ctx.quadraticCurveTo(-25, 5, 0, 0);
    ctx.fill();
    
    // Wing hint
    ctx.beginPath();
    ctx.moveTo(30, 15);
    ctx.quadraticCurveTo(100, -30, 150, 10);
    ctx.quadraticCurveTo(100, 20, 40, 25);
    ctx.fill();
    
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════
// MATRIX RAIN - Cascading code columns
// ═══════════════════════════════════════════════════════════════
class MatrixRainRenderer {
  columns: Array<{
    x: number;
    chars: Array<{ y: number; char: string; bright: boolean }>;
    speed: number;
  }> = [];
  charSet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  init(canvas: HTMLCanvasElement) {
    const columnWidth = 20;
    const numColumns = Math.ceil(canvas.width / columnWidth);
    
    for (let i = 0; i < numColumns; i++) {
      const column: typeof this.columns[0] = {
        x: i * columnWidth,
        chars: [],
        speed: 2 + Math.random() * 4
      };
      
      // Initial characters
      const numChars = Math.floor(Math.random() * 20) + 5;
      let startY = -Math.random() * canvas.height;
      
      for (let j = 0; j < numChars; j++) {
        column.chars.push({
          y: startY + j * 20,
          char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
          bright: j === numChars - 1
        });
      }
      
      this.columns.push(column);
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    this.columns.forEach(column => {
      column.chars.forEach((char, i) => {
        char.y += column.speed;
        
        // Randomly change character
        if (Math.random() > 0.95) {
          char.char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        }

        // Calculate fade based on position in trail
        const fadeIndex = column.chars.length - 1 - i;
        const alpha = char.bright ? 1 : Math.max(0, 0.8 - fadeIndex * 0.08);

        if (alpha > 0 && char.y > 0 && char.y < canvas.height) {
          ctx.font = '16px monospace';
          
          if (char.bright) {
            // Bright leading character with glow
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#ffffff';
          } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(0, 255, 70, ${alpha})`;
          }
          
          ctx.fillText(char.char, column.x, char.y);
        }
      });

      // Reset column when it goes off screen
      if (column.chars[0] && column.chars[0].y > canvas.height + 100) {
        const numChars = Math.floor(Math.random() * 20) + 5;
        column.chars = [];
        
        for (let j = 0; j < numChars; j++) {
          column.chars.push({
            y: -numChars * 20 + j * 20,
            char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
            bright: j === numChars - 1
          });
        }
        column.speed = 2 + Math.random() * 4;
      }
    });

    ctx.shadowBlur = 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// CYBERPUNK CITY - Neon rain with hologram glitches
// ═══════════════════════════════════════════════════════════════
class CyberpunkRenderer {
  raindrops: Array<{ x: number; y: number; length: number; speed: number }> = [];
  neonSigns: Array<{ x: number; y: number; width: number; color: string; flicker: number }> = [];
  glitchTimer: number = 0;

  init(canvas: HTMLCanvasElement) {
    // Rain
    for (let i = 0; i < 200; i++) {
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 10 + Math.random() * 20,
        speed: 8 + Math.random() * 8
      });
    }
    // Neon signs
    const colors = ['#ff00ff', '#00ffff', '#ff0066', '#00ff66'];
    for (let i = 0; i < 6; i++) {
      this.neonSigns.push({
        x: Math.random() * canvas.width,
        y: 50 + Math.random() * 200,
        width: 80 + Math.random() * 120,
        color: colors[Math.floor(Math.random() * colors.length)],
        flicker: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Neon glow signs
    this.neonSigns.forEach(sign => {
      sign.flicker += 0.1;
      const flickerAlpha = 0.3 + Math.sin(sign.flicker) * 0.1 + (Math.random() > 0.95 ? -0.2 : 0);
      
      // Neon glow
      ctx.shadowColor = sign.color;
      ctx.shadowBlur = 30;
      ctx.fillStyle = sign.color.replace(')', `, ${flickerAlpha})`).replace('rgb', 'rgba').replace('#', 'rgba(');
      
      // Convert hex to rgba for glow
      const r = parseInt(sign.color.slice(1, 3), 16);
      const g = parseInt(sign.color.slice(3, 5), 16);
      const b = parseInt(sign.color.slice(5, 7), 16);
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${flickerAlpha})`;
      ctx.fillRect(sign.x, sign.y, sign.width, 8);
      ctx.fillRect(sign.x, sign.y + 15, sign.width * 0.7, 6);
    });
    ctx.shadowBlur = 0;

    // Rain with neon reflection
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width;
      }

      // Rain streak with cyan tint
      const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });

    // Glitch effect
    this.glitchTimer++;
    if (this.glitchTimer > 100 && Math.random() > 0.97) {
      const glitchY = Math.random() * canvas.height;
      const glitchHeight = 2 + Math.random() * 10;
      
      // RGB shift glitch
      ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
      ctx.fillRect(0, glitchY, canvas.width, glitchHeight);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fillRect(5, glitchY + 2, canvas.width, glitchHeight);
      
      this.glitchTimer = 0;
    }

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < canvas.height; y += 2) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// NUCLEAR WASTELAND - Fallout style with radiation
// ═══════════════════════════════════════════════════════════════
class NuclearWastelandRenderer {
  ashParticles: Array<{ x: number; y: number; size: number; drift: number }> = [];
  radiationPulse: number = 0;
  warningFlash: number = 0;

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 100; i++) {
      this.ashParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        drift: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Radiation pulse from edges
    this.radiationPulse += 0.02;
    const pulseIntensity = 0.05 + Math.sin(this.radiationPulse) * 0.03;
    
    const radGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    radGrad.addColorStop(0, 'transparent');
    radGrad.addColorStop(0.7, `rgba(180, 180, 0, ${pulseIntensity})`);
    radGrad.addColorStop(1, `rgba(120, 120, 0, ${pulseIntensity * 1.5})`);
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hazard stripes at bottom
    const stripeHeight = 40;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, canvas.height - stripeHeight, canvas.width, stripeHeight);
    ctx.clip();
    
    const stripeWidth = 30;
    for (let x = -stripeWidth + (time * 20) % (stripeWidth * 2); x < canvas.width + stripeWidth; x += stripeWidth * 2) {
      ctx.fillStyle = 'rgba(200, 180, 0, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - stripeHeight);
      ctx.lineTo(x + stripeWidth, canvas.height - stripeHeight);
      ctx.lineTo(x + stripeWidth * 2, canvas.height);
      ctx.lineTo(x + stripeWidth, canvas.height);
      ctx.fill();
    }
    ctx.restore();

    // Floating ash/debris
    this.ashParticles.forEach(ash => {
      ash.drift += 0.01;
      ash.y += 0.3;
      ash.x += Math.sin(ash.drift) * 0.5;
      
      if (ash.y > canvas.height) {
        ash.y = -10;
        ash.x = Math.random() * canvas.width;
      }

      ctx.fillStyle = 'rgba(80, 70, 60, 0.4)';
      ctx.beginPath();
      ctx.arc(ash.x, ash.y, ash.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Warning flash (occasional)
    if (Math.random() > 0.995) {
      this.warningFlash = 10;
    }
    if (this.warningFlash > 0) {
      ctx.fillStyle = `rgba(255, 200, 0, ${this.warningFlash * 0.01})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.warningFlash--;
    }

    // Radiation symbol hint
    ctx.strokeStyle = 'rgba(200, 180, 0, 0.08)';
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(canvas.width * 0.8, canvas.height * 0.2);
    ctx.rotate(time * 0.2);
    
    // Draw radiation trefoil
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(0, 30, 20, 0, Math.PI * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════
// ENCHANTED FOREST - Fireflies with glowing mushrooms
// ═══════════════════════════════════════════════════════════════
class EnchantedForestRenderer {
  fireflies: Array<{
    x: number; y: number;
    targetX: number; targetY: number;
    glowPhase: number;
    size: number;
  }> = [];
  mushrooms: Array<{
    x: number; y: number;
    size: number;
    hue: number;
    glowPhase: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    // Fireflies
    for (let i = 0; i < 25; i++) {
      this.fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        glowPhase: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 2
      });
    }
    // Glowing mushrooms at bottom
    for (let i = 0; i < 8; i++) {
      this.mushrooms.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 30 - Math.random() * 50,
        size: 15 + Math.random() * 20,
        hue: Math.random() > 0.5 ? 280 : 140, // Purple or green
        glowPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Magical mist at bottom
    const mistGrad = ctx.createLinearGradient(0, canvas.height - 200, 0, canvas.height);
    mistGrad.addColorStop(0, 'transparent');
    mistGrad.addColorStop(0.5, 'rgba(100, 50, 150, 0.15)');
    mistGrad.addColorStop(1, 'rgba(80, 40, 120, 0.25)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, canvas.height - 200, canvas.width, 200);

    // Glowing mushrooms
    this.mushrooms.forEach(mush => {
      mush.glowPhase += 0.03;
      const glow = 0.3 + Math.sin(mush.glowPhase) * 0.15;

      // Mushroom glow
      const glowGrad = ctx.createRadialGradient(mush.x, mush.y - mush.size * 0.5, 0, mush.x, mush.y - mush.size * 0.5, mush.size * 2);
      glowGrad.addColorStop(0, `hsla(${mush.hue}, 70%, 60%, ${glow})`);
      glowGrad.addColorStop(0.5, `hsla(${mush.hue}, 60%, 40%, ${glow * 0.3})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(mush.x, mush.y - mush.size * 0.5, mush.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Mushroom cap
      ctx.fillStyle = `hsla(${mush.hue}, 50%, 40%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(mush.x, mush.y - mush.size * 0.3, mush.size, mush.size * 0.5, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.fillStyle = 'rgba(200, 180, 160, 0.7)';
      ctx.fillRect(mush.x - mush.size * 0.2, mush.y - mush.size * 0.3, mush.size * 0.4, mush.size * 0.5);

      // Spots on cap
      ctx.fillStyle = `hsla(${mush.hue}, 40%, 70%, 0.6)`;
      for (let s = 0; s < 3; s++) {
        const spotX = mush.x - mush.size * 0.5 + s * mush.size * 0.4;
        const spotY = mush.y - mush.size * 0.5;
        ctx.beginPath();
        ctx.arc(spotX, spotY, mush.size * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Fireflies
    this.fireflies.forEach(fly => {
      // Move towards target
      fly.x += (fly.targetX - fly.x) * 0.01;
      fly.y += (fly.targetY - fly.y) * 0.01;
      
      // New target when close
      if (Math.abs(fly.x - fly.targetX) < 20 && Math.abs(fly.y - fly.targetY) < 20) {
        fly.targetX = Math.random() * canvas.width;
        fly.targetY = Math.random() * canvas.height;
      }

      fly.glowPhase += 0.08;
      const glowIntensity = Math.max(0, Math.sin(fly.glowPhase));

      if (glowIntensity > 0.1) {
        // Glow
        const flyGlow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 8);
        flyGlow.addColorStop(0, `rgba(180, 255, 100, ${glowIntensity * 0.8})`);
        flyGlow.addColorStop(0.3, `rgba(150, 255, 50, ${glowIntensity * 0.3})`);
        flyGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = flyGlow;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(220, 255, 180, ${glowIntensity})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// ROSE GARDEN - Falling petals with heart bokeh
// ═══════════════════════════════════════════════════════════════
class RoseGardenRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number;
    rotSpeed: number;
    size: number;
    drift: number;
    vy: number;
  }> = [];
  hearts: Array<{
    x: number; y: number;
    size: number;
    alpha: number;
    pulse: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    // Petals
    for (let i = 0; i < 30; i++) {
      this.petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: 8 + Math.random() * 8,
        drift: Math.random() * Math.PI * 2,
        vy: 0.5 + Math.random() * 1
      });
    }
    // Heart bokeh
    for (let i = 0; i < 15; i++) {
      this.hearts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 20 + Math.random() * 40,
        alpha: 0.05 + Math.random() * 0.1,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Heart bokeh (background)
    this.hearts.forEach(heart => {
      heart.pulse += 0.02;
      const pulseScale = 1 + Math.sin(heart.pulse) * 0.1;
      const alpha = heart.alpha * (0.8 + Math.sin(heart.pulse) * 0.2);

      ctx.save();
      ctx.translate(heart.x, heart.y);
      ctx.scale(pulseScale, pulseScale);

      // Draw heart shape
      ctx.fillStyle = `rgba(255, 100, 150, ${alpha})`;
      ctx.beginPath();
      const s = heart.size;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.2, 0, s);
      ctx.bezierCurveTo(s, s * 0.2, s * 0.5, -s * 0.3, 0, s * 0.3);
      ctx.fill();

      ctx.restore();
    });

    // Falling petals
    this.petals.forEach(petal => {
      petal.y += petal.vy;
      petal.rotation += petal.rotSpeed;
      petal.drift += 0.02;
      petal.x += Math.sin(petal.drift) * 0.8;

      if (petal.y > canvas.height + 20) {
        petal.y = -20;
        petal.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      // Petal shape
      const gradient = ctx.createLinearGradient(-petal.size, 0, petal.size, 0);
      gradient.addColorStop(0, 'rgba(255, 180, 200, 0.9)');
      gradient.addColorStop(0.5, 'rgba(255, 150, 180, 0.95)');
      gradient.addColorStop(1, 'rgba(255, 120, 160, 0.9)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Petal vein
      ctx.strokeStyle = 'rgba(200, 100, 130, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-petal.size * 0.7, 0);
      ctx.lineTo(petal.size * 0.7, 0);
      ctx.stroke();

      ctx.restore();
    });

    // Soft pink overlay
    const softGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    softGlow.addColorStop(0, 'rgba(255, 200, 220, 0.05)');
    softGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = softGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════
// SAKURA BLOOM - Cherry blossom storm
// ═══════════════════════════════════════════════════════════════
class SakuraBloomRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number;
    size: number;
    speed: number;
    sway: number;
    swaySpeed: number;
  }> = [];
  branches: Array<{ x: number; y: number; angle: number }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 50; i++) {
      this.petals.push({
        x: Math.random() * canvas.width * 1.2,
        y: -20 - Math.random() * 200,
        rotation: Math.random() * Math.PI * 2,
        size: 6 + Math.random() * 6,
        speed: 1 + Math.random() * 2,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.02
      });
    }
    // Branch silhouettes
    for (let i = 0; i < 3; i++) {
      this.branches.push({
        x: Math.random() * canvas.width,
        y: -50,
        angle: Math.PI / 4 + Math.random() * 0.5
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Branch silhouettes
    this.branches.forEach(branch => {
      ctx.strokeStyle = 'rgba(60, 40, 50, 0.15)';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      ctx.save();
      ctx.translate(branch.x, branch.y);
      ctx.rotate(branch.angle);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(50, 80, 150, 120);
      ctx.stroke();
      
      // Sub-branches
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(60, 50);
      ctx.quadraticCurveTo(80, 90, 120, 100);
      ctx.stroke();
      
      ctx.restore();
    });

    // Sakura petals
    this.petals.forEach(petal => {
      petal.y += petal.speed;
      petal.sway += petal.swaySpeed;
      petal.x += Math.sin(petal.sway) * 2;
      petal.rotation += 0.02;

      if (petal.y > canvas.height + 20) {
        petal.y = -20;
        petal.x = Math.random() * canvas.width * 1.2;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      // Sakura petal (5-petal flower shape simplified to single petal)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
      grad.addColorStop(0, 'rgba(255, 220, 230, 0.95)');
      grad.addColorStop(0.7, 'rgba(255, 180, 200, 0.9)');
      grad.addColorStop(1, 'rgba(255, 150, 180, 0.8)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      
      // Sakura petal shape with notch
      ctx.moveTo(0, -petal.size);
      ctx.quadraticCurveTo(petal.size * 0.8, -petal.size * 0.5, petal.size, 0);
      ctx.quadraticCurveTo(petal.size * 0.5, petal.size * 0.3, 0, petal.size * 0.2);
      ctx.quadraticCurveTo(-petal.size * 0.5, petal.size * 0.3, -petal.size, 0);
      ctx.quadraticCurveTo(-petal.size * 0.8, -petal.size * 0.5, 0, -petal.size);
      ctx.fill();

      ctx.restore();
    });

    // Soft ambient light
    const ambient = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.3, 0,
      canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.6
    );
    ambient.addColorStop(0, 'rgba(255, 240, 245, 0.08)');
    ambient.addColorStop(1, 'transparent');
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERIC AMBIENT RENDERER (fallback)
// ═══════════════════════════════════════════════════════════════
class AmbientRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
  }> = [];

  init(canvas: HTMLCanvasElement, count: number = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 4,
        alpha: 0.2 + Math.random() * 0.3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb } = rc;

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha})`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

type RendererInstance = GrimoireRenderer | GhostlyRenderer | DragonFireRenderer | 
  MatrixRainRenderer | CyberpunkRenderer | NuclearWastelandRenderer | 
  EnchantedForestRenderer | RoseGardenRenderer | SakuraBloomRenderer | AmbientRenderer;

export function ThemeEffectsCanvas({ subTheme, reducedMotion }: ThemeEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<RendererInstance | null>(null);
  const animationRef = useRef<number>(0);

  const getRenderer = useCallback((rendererType: string, canvas: HTMLCanvasElement): RendererInstance => {
    let renderer: RendererInstance;
    
    switch (rendererType) {
      case 'grimoire':
        renderer = new GrimoireRenderer();
        break;
      case 'ghostlyApparitions':
        renderer = new GhostlyRenderer();
        break;
      case 'dragonFire':
        renderer = new DragonFireRenderer();
        break;
      case 'matrixRain':
        renderer = new MatrixRainRenderer();
        break;
      case 'cyberpunkCity':
        renderer = new CyberpunkRenderer();
        break;
      case 'nuclearWasteland':
        renderer = new NuclearWastelandRenderer();
        break;
      case 'enchantedForest':
        renderer = new EnchantedForestRenderer();
        break;
      case 'roseGarden':
        renderer = new RoseGardenRenderer();
        break;
      case 'sakuraBloom':
        renderer = new SakuraBloomRenderer();
        break;
      default:
        renderer = new AmbientRenderer();
    }
    
    renderer.init(canvas);
    return renderer;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rendererRef.current = getRenderer(subTheme.effects.renderer, canvas);
    };

    resize();
    window.addEventListener('resize', resize);

    const primaryHsl = parseHsl(subTheme.primary);
    const accentHsl = parseHsl(subTheme.accent);
    const secondaryHsl = parseHsl(subTheme.secondary);

    const primaryRgb = hslToRgb(primaryHsl.h, primaryHsl.s, primaryHsl.l);
    const accentRgb = hslToRgb(accentHsl.h, accentHsl.s, accentHsl.l);
    const secondaryRgb = hslToRgb(secondaryHsl.h, secondaryHsl.s, secondaryHsl.l);

    const animate = () => {
      time += 0.016 * subTheme.effects.ambientSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render atmospheric effects first
      const { atmosphere } = subTheme.effects;
      
      // Vignette
      if (atmosphere.vignette) {
        const vHsl = parseHsl(atmosphere.vignette.color);
        const vRgb = hslToRgb(vHsl.h, vHsl.s, vHsl.l);
        const vignetteGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.9
        );
        vignetteGrad.addColorStop(0, 'transparent');
        vignetteGrad.addColorStop(1, `rgba(${vRgb[0]}, ${vRgb[1]}, ${vRgb[2]}, ${atmosphere.vignette.intensity})`);
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Ambient glow orbs
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const angle = (i / orbCount) * Math.PI * 2 + time * 0.3;
        const radius = 200 + i * 100;
        const x = canvas.width * 0.5 + Math.sin(angle) * (canvas.width * 0.3);
        const y = canvas.height * 0.5 + Math.cos(angle * 0.7) * (canvas.height * 0.25);
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
        const rgb = i % 2 === 0 ? primaryRgb : accentRgb;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * pulse);
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${subTheme.effects.glowIntensity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${subTheme.effects.glowIntensity * 0.15})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main renderer
      if (rendererRef.current) {
        rendererRef.current.render({
          ctx,
          canvas,
          time,
          primaryRgb,
          accentRgb,
          secondaryRgb,
          effects: subTheme.effects
        });
      }

      // Film grain
      if (atmosphere.grain) {
        const grainIntensity = atmosphere.grain.intensity;
        for (let i = 0; i < 500; i++) {
          const gx = Math.random() * canvas.width;
          const gy = Math.random() * canvas.height;
          const brightness = Math.random() > 0.5 ? 255 : 0;
          ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${grainIntensity * Math.random()})`;
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // Scanlines
      if (atmosphere.scanlines) {
        const slHsl = parseHsl(atmosphere.scanlines.color);
        const slRgb = hslToRgb(slHsl.h, slHsl.s, slHsl.l);
        ctx.fillStyle = `rgba(${slRgb[0]}, ${slRgb[1]}, ${slRgb[2]}, ${atmosphere.scanlines.opacity})`;
        for (let y = 0; y < canvas.height; y += atmosphere.scanlines.spacing) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [subTheme, reducedMotion, getRenderer]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 opacity-80 transition-opacity duration-1000"
    />
  );
}
