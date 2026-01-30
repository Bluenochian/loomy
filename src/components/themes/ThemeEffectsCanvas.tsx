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
// GRIMOIRE - REAL FLOATING CANDLES WITH REALISTIC FLAMES
// Reference: grimoire.lovable.app - Deep atmospheric glow, flickering candles
// ═══════════════════════════════════════════════════════════════════════════
class GrimoireRenderer {
  candles: Array<{
    x: number;
    y: number;
    height: number;
    width: number;
    flamePhase: number;
    flameSpeed: number;
    flickerIntensity: number;
    glowRadius: number;
    floatPhase: number;
    floatAmplitude: number;
  }> = [];
  bloodDrops: Array<{ x: number; y: number; vy: number; size: number; alpha: number; trail: number[] }> = [];
  runeSymbols: Array<{ x: number; y: number; char: string; alpha: number; pulse: number; size: number }> = [];
  ritualCircle: { rotation: number; pulse: number } = { rotation: 0, pulse: 0 };

  init(canvas: HTMLCanvasElement) {
    // Position candles like the reference - scattered around edges with depth
    const candlePositions = [
      { x: 0.08, y: 0.35, scale: 1.2 },
      { x: 0.05, y: 0.65, scale: 0.9 },
      { x: 0.12, y: 0.85, scale: 1.0 },
      { x: 0.92, y: 0.30, scale: 1.1 },
      { x: 0.88, y: 0.55, scale: 0.85 },
      { x: 0.95, y: 0.78, scale: 1.0 },
      { x: 0.15, y: 0.15, scale: 0.7 },
      { x: 0.85, y: 0.12, scale: 0.75 },
    ];

    candlePositions.forEach(pos => {
      this.candles.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        height: (60 + Math.random() * 40) * pos.scale,
        width: (14 + Math.random() * 8) * pos.scale,
        flamePhase: Math.random() * Math.PI * 2,
        flameSpeed: 0.08 + Math.random() * 0.04,
        flickerIntensity: 0.6 + Math.random() * 0.4,
        glowRadius: (120 + Math.random() * 60) * pos.scale,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmplitude: 3 + Math.random() * 5,
      });
    });

    // Ancient runic symbols floating in darkness
    const runeChars = '᚛᚜ᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓ';
    for (let i = 0; i < 25; i++) {
      this.runeSymbols.push({
        x: 0.2 * canvas.width + Math.random() * 0.6 * canvas.width,
        y: Math.random() * canvas.height,
        char: runeChars[Math.floor(Math.random() * runeChars.length)],
        alpha: 0.03 + Math.random() * 0.08,
        pulse: Math.random() * Math.PI * 2,
        size: 20 + Math.random() * 30,
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Deep atmospheric darkness gradient
    const darkGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    darkGrad.addColorStop(0, 'rgba(20, 5, 10, 0)');
    darkGrad.addColorStop(0.5, 'rgba(15, 3, 8, 0.3)');
    darkGrad.addColorStop(1, 'rgba(8, 2, 5, 0.7)');
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle ritual circle in center
    this.ritualCircle.rotation += 0.001;
    this.ritualCircle.pulse += 0.015;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(this.ritualCircle.rotation);
    
    const circleRadius = Math.min(canvas.width, canvas.height) * 0.25;
    const circleAlpha = 0.04 + Math.sin(this.ritualCircle.pulse) * 0.02;
    
    ctx.strokeStyle = `rgba(120, 30, 30, ${circleAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Pentagram hint
    ctx.strokeStyle = `rgba(100, 20, 20, ${circleAlpha * 0.7})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const angle1 = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const angle2 = ((i + 2) * 4 * Math.PI) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle1) * circleRadius * 0.65, Math.sin(angle1) * circleRadius * 0.65);
      ctx.lineTo(Math.cos(angle2) * circleRadius * 0.65, Math.sin(angle2) * circleRadius * 0.65);
      ctx.stroke();
    }
    ctx.restore();

    // Floating runes
    this.runeSymbols.forEach(rune => {
      rune.pulse += 0.01;
      const alpha = rune.alpha * (0.6 + Math.sin(rune.pulse) * 0.4);
      ctx.font = `${rune.size}px serif`;
      ctx.fillStyle = `rgba(100, 30, 30, ${alpha})`;
      ctx.fillText(rune.char, rune.x, rune.y);
    });

    // Render each candle with REAL flame effect
    this.candles.forEach(candle => {
      // Gentle floating motion
      candle.floatPhase += 0.008;
      const floatY = Math.sin(candle.floatPhase) * candle.floatAmplitude;
      const floatX = Math.cos(candle.floatPhase * 0.6) * candle.floatAmplitude * 0.5;
      
      const cx = candle.x + floatX;
      const cy = candle.y + floatY;

      // ═══ LARGE ATMOSPHERIC GLOW ═══
      // This creates the deep, blurred glow like in the reference
      const glowLayers = [
        { radius: candle.glowRadius * 1.5, alpha: 0.08, color: [255, 180, 100] },
        { radius: candle.glowRadius * 1.2, alpha: 0.12, color: [255, 150, 60] },
        { radius: candle.glowRadius * 0.9, alpha: 0.18, color: [255, 120, 40] },
        { radius: candle.glowRadius * 0.6, alpha: 0.25, color: [255, 100, 30] },
      ];

      const flickerMod = 0.85 + Math.sin(candle.flamePhase * 3) * 0.15 * candle.flickerIntensity;

      glowLayers.forEach(layer => {
        const glow = ctx.createRadialGradient(
          cx, cy - candle.height * 0.3, 0,
          cx, cy - candle.height * 0.3, layer.radius * flickerMod
        );
        glow.addColorStop(0, `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.alpha * flickerMod})`);
        glow.addColorStop(0.4, `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.alpha * 0.4 * flickerMod})`);
        glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy - candle.height * 0.3, layer.radius * flickerMod, 0, Math.PI * 2);
        ctx.fill();
      });

      // ═══ CANDLE BODY ═══
      // Cream/ivory colored with wax texture
      const bodyGrad = ctx.createLinearGradient(cx - candle.width / 2, cy, cx + candle.width / 2, cy);
      bodyGrad.addColorStop(0, 'rgba(230, 210, 180, 0.95)');
      bodyGrad.addColorStop(0.3, 'rgba(245, 235, 210, 0.98)');
      bodyGrad.addColorStop(0.7, 'rgba(240, 225, 195, 0.98)');
      bodyGrad.addColorStop(1, 'rgba(210, 190, 160, 0.9)');
      
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(cx - candle.width / 2, cy, candle.width, candle.height, [2, 2, 4, 4]);
      ctx.fill();

      // Wax drip detail
      ctx.fillStyle = 'rgba(235, 220, 195, 0.8)';
      for (let d = 0; d < 2; d++) {
        const dx = cx - candle.width * 0.3 + d * candle.width * 0.5;
        const dripHeight = 8 + Math.sin(candle.floatPhase + d * 2) * 3;
        ctx.beginPath();
        ctx.ellipse(dx, cy + 3, candle.width * 0.15, dripHeight, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══ FLAME - Multiple layers for realistic look ═══
      candle.flamePhase += candle.flameSpeed;
      
      const baseFlameHeight = candle.height * 0.45;
      const flameFlicker = Math.sin(candle.flamePhase) * 0.12 + 
                          Math.sin(candle.flamePhase * 2.7) * 0.08 +
                          Math.sin(candle.flamePhase * 5.3) * 0.05;
      const flameHeight = baseFlameHeight * (1 + flameFlicker);
      const flameWidth = candle.width * 0.55 * (1 + flameFlicker * 0.5);
      
      const flameX = cx + Math.sin(candle.flamePhase * 1.5) * 2;
      const flameY = cy - 2;

      // Outer flame (yellow-orange)
      const outerFlame = ctx.createLinearGradient(flameX, flameY, flameX, flameY - flameHeight);
      outerFlame.addColorStop(0, 'rgba(255, 200, 80, 0.95)');
      outerFlame.addColorStop(0.3, 'rgba(255, 150, 50, 0.9)');
      outerFlame.addColorStop(0.6, 'rgba(255, 100, 30, 0.75)');
      outerFlame.addColorStop(0.85, 'rgba(255, 60, 10, 0.4)');
      outerFlame.addColorStop(1, 'rgba(255, 40, 0, 0)');
      
      ctx.fillStyle = outerFlame;
      ctx.beginPath();
      ctx.moveTo(flameX - flameWidth, flameY);
      ctx.quadraticCurveTo(
        flameX - flameWidth * 0.7, 
        flameY - flameHeight * 0.4,
        flameX + Math.sin(candle.flamePhase * 2) * 3, 
        flameY - flameHeight
      );
      ctx.quadraticCurveTo(
        flameX + flameWidth * 0.7, 
        flameY - flameHeight * 0.4,
        flameX + flameWidth, 
        flameY
      );
      ctx.closePath();
      ctx.fill();

      // Inner flame (white-yellow core)
      const innerHeight = flameHeight * 0.5;
      const innerWidth = flameWidth * 0.5;
      const innerFlame = ctx.createLinearGradient(flameX, flameY, flameX, flameY - innerHeight);
      innerFlame.addColorStop(0, 'rgba(255, 255, 240, 1)');
      innerFlame.addColorStop(0.4, 'rgba(255, 250, 200, 0.95)');
      innerFlame.addColorStop(0.7, 'rgba(255, 220, 150, 0.7)');
      innerFlame.addColorStop(1, 'rgba(255, 180, 100, 0)');
      
      ctx.fillStyle = innerFlame;
      ctx.beginPath();
      ctx.ellipse(flameX, flameY - innerHeight * 0.4, innerWidth, innerHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Brightest core
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.ellipse(flameX, flameY - 4, innerWidth * 0.4, innerHeight * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Occasional blood drip spawn
      if (Math.random() > 0.997) {
        this.bloodDrops.push({
          x: cx + (Math.random() - 0.5) * candle.width,
          y: cy + candle.height,
          vy: 0.3,
          size: 2 + Math.random() * 2,
          alpha: 0.7,
          trail: []
        });
      }
    });

    // Render blood drips with trails
    this.bloodDrops = this.bloodDrops.filter(drop => {
      drop.trail.push(drop.y);
      if (drop.trail.length > 8) drop.trail.shift();

      drop.y += drop.vy;
      drop.vy += 0.02;
      drop.alpha -= 0.003;

      // Trail
      drop.trail.forEach((ty, i) => {
        const trailAlpha = (i / drop.trail.length) * drop.alpha * 0.5;
        ctx.fillStyle = `rgba(100, 15, 15, ${trailAlpha})`;
        ctx.beginPath();
        ctx.arc(drop.x, ty, drop.size * (0.3 + i * 0.1), 0, Math.PI * 2);
        ctx.fill();
      });

      // Main drop
      ctx.fillStyle = `rgba(120, 20, 20, ${drop.alpha})`;
      ctx.beginPath();
      ctx.ellipse(drop.x, drop.y, drop.size, drop.size * 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.fillStyle = `rgba(180, 50, 50, ${drop.alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(drop.x - drop.size * 0.3, drop.y - drop.size * 0.5, drop.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      return drop.alpha > 0 && drop.y < canvas.height + 20;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MATRIX RAIN - Premium cascading code with depth and blur
// Reference: androidport.lovable.app - Dense code rain with bright leads
// ═══════════════════════════════════════════════════════════════════════════
class MatrixRainRenderer {
  columns: Array<{
    x: number;
    chars: Array<{ y: number; char: string; age: number }>;
    speed: number;
    opacity: number;
    depth: number;
  }> = [];
  charSet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\@#$%&*';

  init(canvas: HTMLCanvasElement) {
    const columnWidth = 18;
    const numColumns = Math.ceil(canvas.width / columnWidth);
    
    for (let i = 0; i < numColumns; i++) {
      const depth = 0.3 + Math.random() * 0.7; // 0.3-1.0 for parallax
      const column = {
        x: i * columnWidth + (Math.random() - 0.5) * 5,
        chars: [] as Array<{ y: number; char: string; age: number }>,
        speed: (1.5 + Math.random() * 3) * depth,
        opacity: 0.3 + depth * 0.7,
        depth
      };

      // Initial characters
      const numChars = Math.floor(5 + Math.random() * 25);
      let startY = -Math.random() * canvas.height * 1.5;
      
      for (let j = 0; j < numChars; j++) {
        column.chars.push({
          y: startY + j * 18,
          char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
          age: j
        });
      }
      
      this.columns.push(column);
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Deep green ambient
    const ambient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    ambient.addColorStop(0, 'rgba(0, 30, 10, 0.1)');
    ambient.addColorStop(1, 'rgba(0, 15, 5, 0.3)');
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort columns by depth for proper layering
    const sortedColumns = [...this.columns].sort((a, b) => a.depth - b.depth);

    sortedColumns.forEach(column => {
      const fontSize = Math.floor(14 * column.depth + 6);
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
      
      column.chars.forEach((char, i) => {
        char.y += column.speed;
        
        // Random character change
        if (Math.random() > 0.97) {
          char.char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        }

        // Calculate fade based on position in trail
        const isHead = i === column.chars.length - 1;
        const tailPosition = column.chars.length - 1 - i;
        const fadeMultiplier = Math.max(0, 1 - tailPosition * 0.06);
        
        if (char.y > 0 && char.y < canvas.height && fadeMultiplier > 0) {
          if (isHead) {
            // Bright white head with glow
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 20 * column.depth;
            ctx.fillStyle = `rgba(255, 255, 255, ${column.opacity})`;
            ctx.fillText(char.char, column.x, char.y);
            
            // Extra glow layer
            ctx.shadowBlur = 35 * column.depth;
            ctx.fillStyle = `rgba(200, 255, 220, ${column.opacity * 0.8})`;
            ctx.fillText(char.char, column.x, char.y);
            ctx.shadowBlur = 0;
          } else {
            // Trailing green characters with depth-based opacity
            const alpha = fadeMultiplier * column.opacity;
            const brightness = 180 + tailPosition * 3;
            ctx.fillStyle = `rgba(0, ${Math.min(255, brightness)}, ${70 + tailPosition * 2}, ${alpha})`;
            ctx.fillText(char.char, column.x, char.y);
          }
        }
      });

      // Reset column when off screen
      if (column.chars.length > 0 && column.chars[0].y > canvas.height + 50) {
        const numChars = Math.floor(5 + Math.random() * 25);
        column.chars = [];
        
        for (let j = 0; j < numChars; j++) {
          column.chars.push({
            y: -numChars * 18 + j * 18,
            char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
            age: j
          });
        }
        column.speed = (1.5 + Math.random() * 3) * column.depth;
      }
    });

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CYBERPUNK CITY - Neon rain with holographic glitches
// ═══════════════════════════════════════════════════════════════════════════
class CyberpunkRenderer {
  raindrops: Array<{ x: number; y: number; length: number; speed: number; color: string }> = [];
  neonSigns: Array<{ x: number; y: number; width: number; height: number; color: string; flicker: number }> = [];
  glitchBars: Array<{ y: number; height: number; offset: number; life: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Dense rain
    for (let i = 0; i < 400; i++) {
      const colors = ['rgba(0, 255, 255, 0.6)', 'rgba(255, 0, 255, 0.4)', 'rgba(255, 100, 255, 0.3)'];
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 15 + Math.random() * 35,
        speed: 12 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Neon signs scattered
    const signColors = ['#ff00ff', '#00ffff', '#ff0088', '#00ff88', '#ffff00'];
    for (let i = 0; i < 8; i++) {
      this.neonSigns.push({
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: 30 + Math.random() * canvas.height * 0.4,
        width: 60 + Math.random() * 150,
        height: 8 + Math.random() * 20,
        color: signColors[Math.floor(Math.random() * signColors.length)],
        flicker: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Dark city gradient
    const cityGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    cityGrad.addColorStop(0, 'rgba(20, 0, 40, 0.3)');
    cityGrad.addColorStop(1, 'rgba(10, 0, 20, 0.5)');
    ctx.fillStyle = cityGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon signs with glow
    this.neonSigns.forEach(sign => {
      sign.flicker += 0.08;
      const flicker = 0.6 + Math.sin(sign.flicker) * 0.2 + 
                     (Math.random() > 0.95 ? -0.3 : 0);
      
      // Parse hex to rgb
      const r = parseInt(sign.color.slice(1, 3), 16);
      const g = parseInt(sign.color.slice(3, 5), 16);
      const b = parseInt(sign.color.slice(5, 7), 16);

      // Large glow
      ctx.shadowColor = sign.color;
      ctx.shadowBlur = 40;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${flicker * 0.4})`;
      ctx.fillRect(sign.x - 10, sign.y - 5, sign.width + 20, sign.height + 10);
      
      // Core neon
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${flicker * 0.8})`;
      ctx.fillRect(sign.x, sign.y, sign.width, sign.height);
      
      // Bright center
      ctx.shadowBlur = 5;
      ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.6})`;
      ctx.fillRect(sign.x + 2, sign.y + 2, sign.width - 4, sign.height - 4);
      
      ctx.shadowBlur = 0;
    });

    // Rain with reflections
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width;
      }

      const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      gradient.addColorStop(0.3, drop.color);
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });

    // Glitch effect
    if (Math.random() > 0.97) {
      for (let i = 0; i < 3; i++) {
        this.glitchBars.push({
          y: Math.random() * canvas.height,
          height: 2 + Math.random() * 15,
          offset: (Math.random() - 0.5) * 30,
          life: 5 + Math.random() * 10
        });
      }
    }

    this.glitchBars = this.glitchBars.filter(bar => {
      bar.life--;
      
      // RGB split
      ctx.fillStyle = 'rgba(255, 0, 255, 0.15)';
      ctx.fillRect(bar.offset, bar.y, canvas.width, bar.height);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
      ctx.fillRect(-bar.offset, bar.y + 2, canvas.width, bar.height);
      
      return bar.life > 0;
    });

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < canvas.height; y += 2) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GHOSTLY APPARITIONS - Ethereal spirits with cold mist
// ═══════════════════════════════════════════════════════════════════════════
class GhostlyRenderer {
  ghosts: Array<{
    x: number; y: number;
    scale: number;
    baseAlpha: number;
    driftPhase: number;
    driftSpeed: number;
    flickerPhase: number;
  }> = [];
  mistLayers: Array<{ y: number; speed: number; opacity: number; offset: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Ethereal apparitions
    for (let i = 0; i < 4; i++) {
      this.ghosts.push({
        x: 0.15 * canvas.width + Math.random() * 0.7 * canvas.width,
        y: 0.2 * canvas.height + Math.random() * 0.5 * canvas.height,
        scale: 0.4 + Math.random() * 0.6,
        baseAlpha: 0.08 + Math.random() * 0.12,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.003 + Math.random() * 0.005,
        flickerPhase: Math.random() * Math.PI * 2,
      });
    }

    // Layered mist
    for (let i = 0; i < 5; i++) {
      this.mistLayers.push({
        y: canvas.height * (0.4 + i * 0.12),
        speed: 0.1 + Math.random() * 0.2,
        opacity: 0.08 + Math.random() * 0.08,
        offset: Math.random() * 1000
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Cold color wash
    const coldGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    coldGrad.addColorStop(0, 'rgba(180, 200, 220, 0.03)');
    coldGrad.addColorStop(1, 'rgba(100, 120, 140, 0.08)');
    ctx.fillStyle = coldGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rolling mist layers
    this.mistLayers.forEach(layer => {
      const waveOffset = Math.sin(time * layer.speed + layer.offset) * 30;
      
      const mistGrad = ctx.createLinearGradient(0, layer.y - 80, 0, layer.y + 80);
      mistGrad.addColorStop(0, 'transparent');
      mistGrad.addColorStop(0.3, `rgba(180, 190, 200, ${layer.opacity * 0.5})`);
      mistGrad.addColorStop(0.5, `rgba(200, 210, 220, ${layer.opacity})`);
      mistGrad.addColorStop(0.7, `rgba(180, 190, 200, ${layer.opacity * 0.5})`);
      mistGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, layer.y - 80 + waveOffset, canvas.width, 160);
    });

    // Ghost apparitions
    this.ghosts.forEach(ghost => {
      ghost.driftPhase += ghost.driftSpeed;
      ghost.flickerPhase += 0.02;
      
      const gx = ghost.x + Math.sin(ghost.driftPhase) * 40;
      const gy = ghost.y + Math.cos(ghost.driftPhase * 0.6) * 25;
      const flicker = ghost.baseAlpha * (0.5 + Math.sin(ghost.flickerPhase * 2) * 0.5);

      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(ghost.scale, ghost.scale);

      // Outer ethereal glow
      const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
      outerGlow.addColorStop(0, `rgba(220, 230, 240, ${flicker * 0.6})`);
      outerGlow.addColorStop(0.4, `rgba(200, 210, 220, ${flicker * 0.3})`);
      outerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 2);
      ctx.fill();

      // Ghost body shape
      const bodyGrad = ctx.createLinearGradient(0, -70, 0, 100);
      bodyGrad.addColorStop(0, `rgba(230, 235, 240, ${flicker})`);
      bodyGrad.addColorStop(0.5, `rgba(210, 220, 230, ${flicker * 0.7})`);
      bodyGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, -20, 35, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wispy trailing form
      ctx.beginPath();
      ctx.moveTo(-25, 30);
      const wispOffset = Math.sin(ghost.flickerPhase * 1.5) * 15;
      ctx.quadraticCurveTo(-35 + wispOffset, 70, -10 + wispOffset * 0.5, 100);
      ctx.lineTo(10 - wispOffset * 0.5, 100);
      ctx.quadraticCurveTo(35 - wispOffset, 70, 25, 30);
      ctx.fill();

      // Hollow eyes
      ctx.fillStyle = `rgba(30, 40, 50, ${flicker * 2})`;
      ctx.beginPath();
      ctx.ellipse(-14, -30, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(14, -30, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Occasional flicker
    if (Math.random() > 0.995) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON FIRE - Intense flames with embers and heat distortion
// ═══════════════════════════════════════════════════════════════════════════
class DragonFireRenderer {
  embers: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    life: number;
    maxLife: number;
  }> = [];
  heatWaves: Array<{ y: number; phase: number; amplitude: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Heat wave layers
    for (let i = 0; i < 5; i++) {
      this.heatWaves.push({
        y: canvas.height - 150 - i * 50,
        phase: Math.random() * Math.PI * 2,
        amplitude: 5 + i * 3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Warm ambient glow from bottom
    const heatGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 400);
    heatGrad.addColorStop(0, 'rgba(255, 80, 20, 0.3)');
    heatGrad.addColorStop(0.5, 'rgba(255, 120, 40, 0.15)');
    heatGrad.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, canvas.height - 400, canvas.width, 400);

    // Layered fire at bottom
    for (let layer = 0; layer < 4; layer++) {
      const layerY = canvas.height - 20 - layer * 35;
      const alpha = 0.4 - layer * 0.08;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let x = 0; x <= canvas.width; x += 15) {
        const noise1 = Math.sin(x * 0.015 + time * 4 + layer) * 40;
        const noise2 = Math.sin(x * 0.03 + time * 6 + layer * 2) * 20;
        const noise3 = Math.sin(x * 0.008 + time * 2) * 30;
        const y = layerY + noise1 + noise2 + noise3;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const flameGrad = ctx.createLinearGradient(0, layerY - 60, 0, canvas.height);
      if (layer === 0) {
        flameGrad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
        flameGrad.addColorStop(0.3, `rgba(255, 200, 80, ${alpha})`);
      } else {
        flameGrad.addColorStop(0, `rgba(255, 180, 50, ${alpha})`);
        flameGrad.addColorStop(0.3, `rgba(255, 120, 30, ${alpha})`);
      }
      flameGrad.addColorStop(0.7, `rgba(200, 60, 10, ${alpha})`);
      flameGrad.addColorStop(1, `rgba(100, 20, 0, ${alpha * 0.5})`);
      
      ctx.fillStyle = flameGrad;
      ctx.fill();
    }

    // Spawn embers
    if (Math.random() > 0.6) {
      this.embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 80,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -3 - Math.random() * 4,
        size: 2 + Math.random() * 5,
        life: 0,
        maxLife: 120 + Math.random() * 80
      });
    }

    // Render embers with glow trails
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx + Math.sin(ember.life * 0.05) * 0.8;
      ember.y += ember.vy;
      ember.vy *= 0.995;
      ember.life++;

      const lifeRatio = 1 - ember.life / ember.maxLife;
      
      // Ember glow
      const glowSize = ember.size * 4 * lifeRatio;
      const glowGrad = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, glowSize);
      glowGrad.addColorStop(0, `rgba(255, 220, 120, ${lifeRatio * 0.8})`);
      glowGrad.addColorStop(0.4, `rgba(255, 160, 60, ${lifeRatio * 0.4})`);
      glowGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(255, 255, 220, ${lifeRatio})`;
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size * 0.5 * lifeRatio, 0, Math.PI * 2);
      ctx.fill();

      return ember.life < ember.maxLife;
    });

    // Dragon silhouette hint
    const dragonAlpha = 0.05 + Math.sin(time * 0.5) * 0.02;
    ctx.fillStyle = `rgba(30, 10, 5, ${dragonAlpha})`;
    ctx.save();
    ctx.translate(canvas.width * 0.75, canvas.height * 0.25);
    ctx.scale(2, 2);
    
    // Dragon head silhouette
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(40, -25, 80, 0);
    ctx.quadraticCurveTo(95, 15, 85, 35);
    ctx.quadraticCurveTo(50, 50, 25, 35);
    ctx.quadraticCurveTo(-15, 45, -25, 25);
    ctx.quadraticCurveTo(-30, 5, 0, 0);
    ctx.fill();
    
    // Wing
    ctx.beginPath();
    ctx.moveTo(35, 20);
    ctx.quadraticCurveTo(120, -40, 180, 15);
    ctx.quadraticCurveTo(120, 25, 45, 30);
    ctx.fill();
    
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NUCLEAR WASTELAND - Fallout-style radiation and ash
// ═══════════════════════════════════════════════════════════════════════════
class NuclearWastelandRenderer {
  ashParticles: Array<{ x: number; y: number; size: number; drift: number; alpha: number }> = [];
  radiationPulse: number = 0;
  warningFlash: number = 0;
  hazardOffset: number = 0;

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 150; i++) {
      this.ashParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 4,
        drift: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.4
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Sickly yellow-green radiation glow
    this.radiationPulse += 0.015;
    const pulse = 0.5 + Math.sin(this.radiationPulse) * 0.3;
    
    const radGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.1,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.9
    );
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radGrad.addColorStop(0.5, `rgba(120, 110, 20, ${0.03 * pulse})`);
    radGrad.addColorStop(0.8, `rgba(180, 160, 30, ${0.08 * pulse})`);
    radGrad.addColorStop(1, `rgba(100, 90, 10, ${0.15 * pulse})`);
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hazard stripes at bottom
    this.hazardOffset = (this.hazardOffset + 0.5) % 60;
    const stripeHeight = 50;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, canvas.height - stripeHeight, canvas.width, stripeHeight);
    ctx.clip();
    
    for (let x = -60 + this.hazardOffset; x < canvas.width + 60; x += 60) {
      ctx.fillStyle = 'rgba(200, 180, 20, 0.12)';
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - stripeHeight);
      ctx.lineTo(x + 30, canvas.height - stripeHeight);
      ctx.lineTo(x + 60, canvas.height);
      ctx.lineTo(x + 30, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Floating ash debris
    this.ashParticles.forEach(ash => {
      ash.drift += 0.008;
      ash.y += 0.4;
      ash.x += Math.sin(ash.drift) * 0.6;
      
      if (ash.y > canvas.height + 10) {
        ash.y = -10;
        ash.x = Math.random() * canvas.width;
      }

      ctx.fillStyle = `rgba(60, 55, 45, ${ash.alpha})`;
      ctx.beginPath();
      ctx.arc(ash.x, ash.y, ash.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Geiger counter flash
    if (Math.random() > 0.993) {
      this.warningFlash = 8;
    }
    if (this.warningFlash > 0) {
      ctx.fillStyle = `rgba(255, 230, 100, ${this.warningFlash * 0.015})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.warningFlash--;
    }

    // Radiation trefoil symbol
    ctx.save();
    ctx.translate(canvas.width * 0.85, canvas.height * 0.15);
    ctx.rotate(time * 0.1);
    
    ctx.strokeStyle = `rgba(180, 160, 30, ${0.06 + Math.sin(this.radiationPulse * 2) * 0.03})`;
    ctx.lineWidth = 4;
    
    // Draw trefoil
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(0, 35, 25, -0.4, 1.2);
      ctx.stroke();
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENCHANTED FOREST - Magical fireflies and glowing mushrooms
// ═══════════════════════════════════════════════════════════════════════════
class EnchantedForestRenderer {
  fireflies: Array<{
    x: number; y: number;
    targetX: number; targetY: number;
    glowPhase: number;
    size: number;
    hue: number;
  }> = [];
  mushrooms: Array<{
    x: number; y: number;
    size: number;
    hue: number;
    glowPhase: number;
  }> = [];
  magicParticles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    hue: number;
    life: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    // Fireflies
    for (let i = 0; i < 30; i++) {
      this.fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.8,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height * 0.8,
        glowPhase: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 3,
        hue: Math.random() > 0.7 ? 280 : 80 // Purple or gold
      });
    }

    // Glowing mushrooms
    for (let i = 0; i < 10; i++) {
      this.mushrooms.push({
        x: 50 + Math.random() * (canvas.width - 100),
        y: canvas.height - 50 - Math.random() * 100,
        size: 20 + Math.random() * 30,
        hue: Math.random() > 0.5 ? 280 : 140,
        glowPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Mystical forest fog
    const fogGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    fogGrad.addColorStop(0, 'rgba(50, 30, 80, 0.35)');
    fogGrad.addColorStop(0.5, 'rgba(60, 40, 90, 0.2)');
    fogGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, canvas.height - 300, canvas.width, 300);

    // Glowing mushrooms
    this.mushrooms.forEach(mush => {
      mush.glowPhase += 0.02;
      const glow = 0.4 + Math.sin(mush.glowPhase) * 0.2;

      // Mushroom glow
      const glowGrad = ctx.createRadialGradient(
        mush.x, mush.y - mush.size * 0.3, 0,
        mush.x, mush.y - mush.size * 0.3, mush.size * 3
      );
      glowGrad.addColorStop(0, `hsla(${mush.hue}, 70%, 60%, ${glow})`);
      glowGrad.addColorStop(0.5, `hsla(${mush.hue}, 60%, 40%, ${glow * 0.3})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(mush.x, mush.y - mush.size * 0.3, mush.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Mushroom cap
      ctx.fillStyle = `hsla(${mush.hue}, 50%, 35%, 0.9)`;
      ctx.beginPath();
      ctx.ellipse(mush.x, mush.y - mush.size * 0.3, mush.size, mush.size * 0.5, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Cap spots
      ctx.fillStyle = `hsla(${mush.hue}, 40%, 60%, ${glow})`;
      for (let s = 0; s < 4; s++) {
        const angle = (s / 4) * Math.PI - Math.PI * 0.5;
        const sx = mush.x + Math.cos(angle) * mush.size * 0.5;
        const sy = mush.y - mush.size * 0.4 + Math.sin(angle) * mush.size * 0.15;
        ctx.beginPath();
        ctx.arc(sx, sy, mush.size * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stem
      ctx.fillStyle = 'rgba(200, 190, 170, 0.85)';
      ctx.fillRect(mush.x - mush.size * 0.15, mush.y - mush.size * 0.3, mush.size * 0.3, mush.size * 0.6);
    });

    // Fireflies
    this.fireflies.forEach(fly => {
      // Gentle movement toward target
      fly.x += (fly.targetX - fly.x) * 0.008;
      fly.y += (fly.targetY - fly.y) * 0.008;
      
      // New target when close
      if (Math.abs(fly.x - fly.targetX) < 30 && Math.abs(fly.y - fly.targetY) < 30) {
        fly.targetX = Math.random() * canvas.width;
        fly.targetY = Math.random() * canvas.height * 0.8;
      }

      fly.glowPhase += 0.06;
      const intensity = Math.max(0, Math.sin(fly.glowPhase));

      if (intensity > 0.1) {
        // Large soft glow
        const glowGrad = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 12);
        glowGrad.addColorStop(0, `hsla(${fly.hue}, 80%, 70%, ${intensity * 0.6})`);
        glowGrad.addColorStop(0.4, `hsla(${fly.hue}, 70%, 50%, ${intensity * 0.2})`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 12, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `hsla(${fly.hue}, 60%, 90%, ${intensity})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn magic particles occasionally
      if (intensity > 0.8 && Math.random() > 0.95) {
        this.magicParticles.push({
          x: fly.x,
          y: fly.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 1 + Math.random() * 2,
          hue: fly.hue,
          life: 30 + Math.random() * 30
        });
      }
    });

    // Magic sparkles
    this.magicParticles = this.magicParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      const alpha = p.life / 60;
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();

      return p.life > 0;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEEP SPACE - Cosmic nebulae and distant stars
// ═══════════════════════════════════════════════════════════════════════════
class DeepSpaceRenderer {
  stars: Array<{ x: number; y: number; size: number; twinkle: number; brightness: number }> = [];
  nebulaClouds: Array<{ x: number; y: number; radius: number; hue: number; alpha: number }> = [];
  shootingStars: Array<{ x: number; y: number; vx: number; vy: number; length: number; life: number }> = [];

  init(canvas: HTMLCanvasElement) {
    // Background stars
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        brightness: 0.3 + Math.random() * 0.7
      });
    }

    // Nebula clouds
    for (let i = 0; i < 5; i++) {
      this.nebulaClouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 150 + Math.random() * 250,
        hue: 220 + Math.random() * 80, // Blues to purples
        alpha: 0.08 + Math.random() * 0.12
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Deep space darkness
    const spaceGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    spaceGrad.addColorStop(0, 'rgba(15, 10, 35, 0.2)');
    spaceGrad.addColorStop(1, 'rgba(5, 3, 15, 0.4)');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula clouds
    this.nebulaClouds.forEach(cloud => {
      const cloudGrad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
      cloudGrad.addColorStop(0, `hsla(${cloud.hue}, 60%, 50%, ${cloud.alpha})`);
      cloudGrad.addColorStop(0.4, `hsla(${cloud.hue + 20}, 50%, 40%, ${cloud.alpha * 0.5})`);
      cloudGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = cloudGrad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Twinkling stars
    this.stars.forEach(star => {
      star.twinkle += 0.02;
      const twinkleBrightness = star.brightness * (0.7 + Math.sin(star.twinkle) * 0.3);
      
      // Star glow
      const starGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
      starGlow.addColorStop(0, `rgba(255, 255, 255, ${twinkleBrightness})`);
      starGlow.addColorStop(0.5, `rgba(200, 220, 255, ${twinkleBrightness * 0.3})`);
      starGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = starGlow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Star core
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkleBrightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Occasional shooting star
    if (Math.random() > 0.997) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height * 0.5;
      this.shootingStars.push({
        x: startX,
        y: startY,
        vx: 8 + Math.random() * 8,
        vy: 4 + Math.random() * 4,
        length: 80 + Math.random() * 60,
        life: 40
      });
    }

    this.shootingStars = this.shootingStars.filter(ss => {
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life--;

      const alpha = ss.life / 40;
      
      // Trail gradient
      const trailGrad = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - ss.vx * (ss.length / ss.vx), ss.y - ss.vy * (ss.length / ss.vx)
      );
      trailGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      trailGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.vx * (ss.length / ss.vx), ss.y - ss.vy * (ss.length / ss.vx));
      ctx.stroke();

      return ss.life > 0;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VAMPIRE NIGHT - Gothic with flying bats and blood moon
// ═══════════════════════════════════════════════════════════════════════════
class VampireNightRenderer {
  bats: Array<{
    x: number; y: number;
    vx: number; vy: number;
    wingPhase: number;
    size: number;
  }> = [];
  bloodMoonPhase: number = 0;

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 12; i++) {
      this.bats.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 2,
        wingPhase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 12
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    this.bloodMoonPhase += 0.005;

    // Blood moon
    const moonX = canvas.width * 0.75;
    const moonY = canvas.height * 0.2;
    const moonRadius = 60;
    const moonGlow = 0.4 + Math.sin(this.bloodMoonPhase) * 0.1;

    // Moon glow
    const moonGlowGrad = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 4);
    moonGlowGrad.addColorStop(0, `rgba(180, 50, 50, ${moonGlow})`);
    moonGlowGrad.addColorStop(0.3, `rgba(140, 30, 30, ${moonGlow * 0.4})`);
    moonGlowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlowGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonBodyGrad = ctx.createRadialGradient(moonX - 10, moonY - 10, 0, moonX, moonY, moonRadius);
    moonBodyGrad.addColorStop(0, 'rgba(200, 80, 80, 0.9)');
    moonBodyGrad.addColorStop(0.5, 'rgba(160, 50, 50, 0.85)');
    moonBodyGrad.addColorStop(1, 'rgba(120, 30, 30, 0.8)');
    ctx.fillStyle = moonBodyGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Flying bats
    this.bats.forEach(bat => {
      bat.x += bat.vx;
      bat.y += bat.vy + Math.sin(bat.wingPhase) * 0.5;
      bat.wingPhase += 0.3;

      // Wrap around
      if (bat.x < -50) bat.x = canvas.width + 50;
      if (bat.x > canvas.width + 50) bat.x = -50;
      if (bat.y < -50) bat.y = canvas.height * 0.6;
      if (bat.y > canvas.height * 0.7) bat.y = -50;

      // Random direction change
      if (Math.random() > 0.99) {
        bat.vx = (Math.random() - 0.5) * 3;
        bat.vy = (Math.random() - 0.5) * 2;
      }

      ctx.save();
      ctx.translate(bat.x, bat.y);

      ctx.fillStyle = 'rgba(20, 10, 15, 0.85)';
      
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, bat.size * 0.4, bat.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings
      const wingFlap = Math.sin(bat.wingPhase) * 0.5;
      
      // Left wing
      ctx.beginPath();
      ctx.moveTo(-bat.size * 0.3, 0);
      ctx.quadraticCurveTo(-bat.size, bat.size * wingFlap, -bat.size * 1.2, bat.size * 0.2);
      ctx.quadraticCurveTo(-bat.size * 0.8, bat.size * 0.1, -bat.size * 0.5, bat.size * 0.3);
      ctx.quadraticCurveTo(-bat.size * 0.3, bat.size * 0.15, -bat.size * 0.3, 0);
      ctx.fill();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(bat.size * 0.3, 0);
      ctx.quadraticCurveTo(bat.size, bat.size * wingFlap, bat.size * 1.2, bat.size * 0.2);
      ctx.quadraticCurveTo(bat.size * 0.8, bat.size * 0.1, bat.size * 0.5, bat.size * 0.3);
      ctx.quadraticCurveTo(bat.size * 0.3, bat.size * 0.15, bat.size * 0.3, 0);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.moveTo(-bat.size * 0.15, -bat.size * 0.2);
      ctx.lineTo(-bat.size * 0.2, -bat.size * 0.5);
      ctx.lineTo(0, -bat.size * 0.25);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bat.size * 0.15, -bat.size * 0.2);
      ctx.lineTo(bat.size * 0.2, -bat.size * 0.5);
      ctx.lineTo(0, -bat.size * 0.25);
      ctx.fill();

      ctx.restore();
    });

    // Red fog at bottom
    const fogGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 200);
    fogGrad.addColorStop(0, 'rgba(60, 20, 25, 0.4)');
    fogGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SAKURA BLOOM - Cherry blossoms with branch silhouettes
// ═══════════════════════════════════════════════════════════════════════════
class SakuraBloomRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number;
    rotSpeed: number;
    size: number;
    swayPhase: number;
    swaySpeed: number;
    fallSpeed: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 60; i++) {
      this.petals.push({
        x: Math.random() * canvas.width * 1.2 - canvas.width * 0.1,
        y: -20 - Math.random() * canvas.height * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: 6 + Math.random() * 8,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
        fallSpeed: 0.8 + Math.random() * 1.5
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Soft pink ambient
    const pinkGrad = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.2, 0,
      canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.8
    );
    pinkGrad.addColorStop(0, 'rgba(255, 220, 230, 0.1)');
    pinkGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = pinkGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Branch silhouettes
    ctx.strokeStyle = 'rgba(50, 30, 40, 0.15)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Draw decorative branches
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.quadraticCurveTo(150, 100, 250, 60);
    ctx.stroke();
    
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(100, 85);
    ctx.quadraticCurveTo(130, 120, 180, 110);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width, 150);
    ctx.quadraticCurveTo(canvas.width - 200, 120, canvas.width - 300, 180);
    ctx.stroke();

    // Falling petals
    this.petals.forEach(petal => {
      petal.y += petal.fallSpeed;
      petal.swayPhase += petal.swaySpeed;
      petal.x += Math.sin(petal.swayPhase) * 1.5;
      petal.rotation += petal.rotSpeed;

      if (petal.y > canvas.height + 30) {
        petal.y = -30;
        petal.x = Math.random() * canvas.width * 1.2 - canvas.width * 0.1;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      // Sakura petal shape
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
      grad.addColorStop(0, 'rgba(255, 230, 240, 0.95)');
      grad.addColorStop(0.5, 'rgba(255, 200, 220, 0.9)');
      grad.addColorStop(1, 'rgba(255, 170, 195, 0.85)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      // Heart-shaped notched petal
      ctx.moveTo(0, -petal.size);
      ctx.bezierCurveTo(petal.size * 0.8, -petal.size * 0.5, petal.size, petal.size * 0.2, 0, petal.size * 0.4);
      ctx.bezierCurveTo(-petal.size, petal.size * 0.2, -petal.size * 0.8, -petal.size * 0.5, 0, -petal.size);
      ctx.fill();

      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AMBIENT FALLBACK - Generic particle system
// ═══════════════════════════════════════════════════════════════════════════
class AmbientRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 3 + Math.random() * 6,
        alpha: 0.15 + Math.random() * 0.25
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      grad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha})`);
      grad.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha * 0.3})`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

type RendererInstance = GrimoireRenderer | MatrixRainRenderer | CyberpunkRenderer | 
  GhostlyRenderer | DragonFireRenderer | NuclearWastelandRenderer | 
  EnchantedForestRenderer | DeepSpaceRenderer | VampireNightRenderer | 
  SakuraBloomRenderer | AmbientRenderer;

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
      case 'matrixRain':
        renderer = new MatrixRainRenderer();
        break;
      case 'cyberpunkCity':
        renderer = new CyberpunkRenderer();
        break;
      case 'ghostlyApparitions':
        renderer = new GhostlyRenderer();
        break;
      case 'dragonFire':
        renderer = new DragonFireRenderer();
        break;
      case 'nuclearWasteland':
        renderer = new NuclearWastelandRenderer();
        break;
      case 'enchantedForest':
        renderer = new EnchantedForestRenderer();
        break;
      case 'deepSpace':
        renderer = new DeepSpaceRenderer();
        break;
      case 'vampireNight':
        renderer = new VampireNightRenderer();
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

      // Render atmospheric base
      const { atmosphere } = subTheme.effects;
      
      // Vignette (deep darkness at edges)
      if (atmosphere.vignette) {
        const vHsl = parseHsl(atmosphere.vignette.color);
        const vRgb = hslToRgb(vHsl.h, vHsl.s, vHsl.l);
        const vignetteGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.15,
          canvas.width / 2, canvas.height / 2, canvas.width * 1.0
        );
        vignetteGrad.addColorStop(0, 'transparent');
        vignetteGrad.addColorStop(0.6, `rgba(${vRgb[0]}, ${vRgb[1]}, ${vRgb[2]}, ${atmosphere.vignette.intensity * 0.5})`);
        vignetteGrad.addColorStop(1, `rgba(${vRgb[0]}, ${vRgb[1]}, ${vRgb[2]}, ${atmosphere.vignette.intensity})`);
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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

      // Film grain overlay
      if (atmosphere.grain) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const intensity = atmosphere.grain.intensity * 50;
        
        for (let i = 0; i < data.length; i += 16) {
          const noise = (Math.random() - 0.5) * intensity;
          data[i] += noise;
          data[i + 1] += noise;
          data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Scanlines
      if (atmosphere.scanlines) {
        ctx.fillStyle = `rgba(0, 0, 0, ${atmosphere.scanlines.opacity})`;
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
      className="absolute inset-0 transition-opacity duration-1000"
      style={{ opacity: 0.9 }}
    />
  );
}
