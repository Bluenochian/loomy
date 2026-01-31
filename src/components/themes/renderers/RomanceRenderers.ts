// Romance Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// CANDLELIT DINNER - Romantic candles with rose petals (NO blood/runes)
// ═══════════════════════════════════════════════════════════════════════════
export class CandlelitDinnerRenderer extends BaseRenderer {
  candles: Array<{
    x: number; y: number;
    scale: number;
    flickerPhase: number;
    flickerSpeed: number;
    waxDrips: Array<{ y: number; speed: number; size: number }>;
  }> = [];
  rosePetals: Array<{
    x: number; y: number;
    rotation: number;
    rotSpeed: number;
    vx: number; vy: number;
    size: number;
    hue: number;
  }> = [];
  sparkles: Array<{ x: number; y: number; phase: number; size: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Candle positions around edges
    const positions = [
      { x: 0.06, y: 0.25, s: 0.85 }, { x: 0.08, y: 0.65, s: 0.75 },
      { x: 0.92, y: 0.22, s: 0.8 }, { x: 0.94, y: 0.58, s: 0.85 },
      { x: 0.10, y: 0.85, s: 0.7 }, { x: 0.90, y: 0.88, s: 0.65 }
    ];

    positions.forEach(pos => {
      this.candles.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        scale: pos.s,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.08 + Math.random() * 0.06,
        waxDrips: []
      });
    });

    // Rose petals floating
    for (let i = 0; i < 25; i++) {
      this.rosePetals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.2 + Math.random() * 0.4,
        size: 8 + Math.random() * 12,
        hue: 340 + Math.random() * 30 // Red to pink
      });
    }

    // Romantic sparkles
    for (let i = 0; i < 30; i++) {
      this.sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        phase: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb, time } = rc;

    // Warm romantic glow from center
    const warmGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    );
    warmGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.6}, ${primaryRgb[2] * 0.6}, 0.08)`);
    warmGlow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.4}, ${primaryRgb[2] * 0.4}, 0.04)`);
    warmGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render candles with realistic flames (no blood)
    this.candles.forEach(candle => {
      candle.flickerPhase += candle.flickerSpeed;
      const flicker = 0.6 + Math.sin(candle.flickerPhase) * 0.2 + 
                      Math.sin(candle.flickerPhase * 2.7) * 0.15 +
                      Math.random() * 0.05;

      // Candle glow - warm romantic amber
      const glow = ctx.createRadialGradient(
        candle.x, candle.y - 20, 0,
        candle.x, candle.y - 20, 160 * candle.scale
      );
      glow.addColorStop(0, `rgba(255, 180, 100, ${0.12 * flicker * candle.scale})`);
      glow.addColorStop(0.4, `rgba(255, 140, 80, ${0.05 * flicker * candle.scale})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Candle body - cream colored
      ctx.fillStyle = 'rgba(255, 250, 240, 0.25)';
      ctx.fillRect(candle.x - 6 * candle.scale, candle.y, 12 * candle.scale, 50 * candle.scale);

      // Flame
      ctx.save();
      ctx.translate(candle.x, candle.y - 10);
      const flameHeight = 20 * candle.scale * flicker;
      
      // Outer flame - warm orange
      const flameGrad = ctx.createLinearGradient(0, 0, 0, -flameHeight);
      flameGrad.addColorStop(0, 'rgba(255, 210, 120, 0.85)');
      flameGrad.addColorStop(0.5, 'rgba(255, 160, 70, 0.65)');
      flameGrad.addColorStop(1, 'rgba(255, 120, 40, 0)');
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-7 * candle.scale, -flameHeight * 0.5, 0, -flameHeight);
      ctx.quadraticCurveTo(7 * candle.scale, -flameHeight * 0.5, 0, 0);
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Inner flame (blue core)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-3 * candle.scale, -flameHeight * 0.3, 0, -flameHeight * 0.4);
      ctx.quadraticCurveTo(3 * candle.scale, -flameHeight * 0.3, 0, 0);
      ctx.fillStyle = 'rgba(120, 180, 255, 0.35)';
      ctx.fill();
      ctx.restore();

      // Wax drips
      if (Math.random() > 0.995) {
        candle.waxDrips.push({
          y: candle.y,
          speed: 0.3 + Math.random() * 0.5,
          size: 2 + Math.random() * 3
        });
      }

      candle.waxDrips = candle.waxDrips.filter(drip => {
        drip.y += drip.speed;
        drip.speed *= 0.98;
        
        ctx.beginPath();
        ctx.arc(candle.x + (Math.random() - 0.5) * 4, drip.y, drip.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 250, 230, 0.35)';
        ctx.fill();

        return drip.y < candle.y + 60 * candle.scale;
      });
    });

    // Falling rose petals
    this.rosePetals.forEach(petal => {
      petal.rotation += petal.rotSpeed;
      petal.x += petal.vx + Math.sin(time + petal.y * 0.02) * 0.3;
      petal.y += petal.vy;

      if (petal.y > canvas.height + 30) {
        petal.y = -30;
        petal.x = Math.random() * canvas.width;
      }
      if (petal.x < -30) petal.x = canvas.width + 30;
      if (petal.x > canvas.width + 30) petal.x = -30;

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      // Rose petal shape
      ctx.beginPath();
      ctx.moveTo(0, -petal.size / 2);
      ctx.bezierCurveTo(
        petal.size / 2, -petal.size / 3,
        petal.size / 2, petal.size / 3,
        0, petal.size / 2
      );
      ctx.bezierCurveTo(
        -petal.size / 2, petal.size / 3,
        -petal.size / 2, -petal.size / 3,
        0, -petal.size / 2
      );
      
      ctx.fillStyle = `hsla(${petal.hue}, 70%, 55%, 0.6)`;
      ctx.fill();

      // Subtle vein
      ctx.strokeStyle = `hsla(${petal.hue}, 60%, 40%, 0.3)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -petal.size / 3);
      ctx.lineTo(0, petal.size / 3);
      ctx.stroke();

      ctx.restore();
    });

    // Romantic sparkles
    this.sparkles.forEach(sparkle => {
      sparkle.phase += 0.04;
      const twinkle = Math.max(0, Math.sin(sparkle.phase));
      
      if (twinkle > 0.5) {
        const glow = ctx.createRadialGradient(
          sparkle.x, sparkle.y, 0,
          sparkle.x, sparkle.y, sparkle.size * 8
        );
        glow.addColorStop(0, `rgba(255, 200, 220, ${twinkle * 0.6})`);
        glow.addColorStop(0.5, `rgba(255, 180, 200, ${twinkle * 0.2})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core sparkle
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, sparkle.size * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.9})`;
        ctx.fill();
      }
    });

    // Soft vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(20, 0, 10, 0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ROSE GARDEN - Floating rose petals with garden mist
// ═══════════════════════════════════════════════════════════════════════════
export class RoseGardenRenderer extends BaseRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number; rotSpeed: number;
    vx: number; vy: number;
    size: number;
    hue: number;
  }> = [];
  butterflies: Array<{
    x: number; y: number;
    vx: number; vy: number;
    wingPhase: number;
    size: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 40; i++) {
      this.petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.5,
        size: 8 + Math.random() * 14,
        hue: 340 + Math.random() * 40
      });
    }

    for (let i = 0; i < 5; i++) {
      this.butterflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 1,
        wingPhase: Math.random() * Math.PI * 2,
        size: 8 + Math.random() * 6
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Garden mist from bottom
    const mist = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.5);
    mist.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`);
    mist.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    mist.addColorStop(1, 'transparent');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sunlight beams
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(canvas.width * (0.6 + i * 0.12), 0);
      ctx.lineTo(canvas.width * (0.3 + i * 0.15), canvas.height);
      ctx.lineTo(canvas.width * (0.35 + i * 0.15), canvas.height);
      ctx.lineTo(canvas.width * (0.65 + i * 0.12), 0);
      ctx.fillStyle = `rgba(255, 230, 200, 0.8)`;
      ctx.fill();
    }
    ctx.restore();

    // Butterflies
    this.butterflies.forEach(butterfly => {
      butterfly.wingPhase += 0.15;
      butterfly.x += butterfly.vx;
      butterfly.y += butterfly.vy + Math.sin(time * 2 + butterfly.x * 0.01) * 0.5;

      if (Math.random() > 0.98) {
        butterfly.vx = (Math.random() - 0.5) * 2;
        butterfly.vy = (Math.random() - 0.5) * 1;
      }

      if (butterfly.x < -30) butterfly.x = canvas.width + 30;
      if (butterfly.x > canvas.width + 30) butterfly.x = -30;
      if (butterfly.y < -30) butterfly.y = canvas.height * 0.7;
      if (butterfly.y > canvas.height + 30) butterfly.y = -30;

      const wingFlap = Math.sin(butterfly.wingPhase) * 0.5;

      ctx.save();
      ctx.translate(butterfly.x, butterfly.y);

      // Wings
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.5)`;
      
      // Left wing
      ctx.save();
      ctx.scale(1, 0.5 + wingFlap);
      ctx.beginPath();
      ctx.ellipse(-butterfly.size * 0.6, 0, butterfly.size, butterfly.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right wing
      ctx.save();
      ctx.scale(1, 0.5 + wingFlap);
      ctx.beginPath();
      ctx.ellipse(butterfly.size * 0.6, 0, butterfly.size, butterfly.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Body
      ctx.fillStyle = 'rgba(80, 60, 40, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2, butterfly.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Falling petals
    this.petals.forEach(petal => {
      petal.rotation += petal.rotSpeed;
      petal.x += petal.vx + Math.sin(time + petal.y * 0.02) * 0.3;
      petal.y += petal.vy;

      if (petal.y > canvas.height + 30) {
        petal.y = -30;
        petal.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      ctx.beginPath();
      ctx.moveTo(0, -petal.size / 2);
      ctx.bezierCurveTo(
        petal.size / 2, -petal.size / 3,
        petal.size / 2, petal.size / 3,
        0, petal.size / 2
      );
      ctx.bezierCurveTo(
        -petal.size / 2, petal.size / 3,
        -petal.size / 2, -petal.size / 3,
        0, -petal.size / 2
      );
      
      ctx.fillStyle = `hsla(${petal.hue}, 65%, 55%, 0.55)`;
      ctx.fill();

      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SAKURA BLOOM - Japanese cherry blossom with koi hints
// ═══════════════════════════════════════════════════════════════════════════
export class SakuraBloomRenderer extends BaseRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number; rotSpeed: number;
    vx: number; vy: number;
    size: number;
  }> = [];
  ripples: Array<{ x: number; y: number; size: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 50; i++) {
      this.petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        vx: 0.5 + Math.random() * 1.5,
        vy: 0.3 + Math.random() * 0.8,
        size: 6 + Math.random() * 10
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Soft pink ambient
    const pinkGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 0.4, 0,
      canvas.width / 2, canvas.height * 0.4, canvas.width * 0.6
    );
    pinkGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`);
    pinkGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Water at bottom
    const waterGrad = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    waterGrad.addColorStop(0, 'transparent');
    waterGrad.addColorStop(0.3, `rgba(100, 140, 180, 0.08)`);
    waterGrad.addColorStop(1, `rgba(80, 120, 160, 0.12)`);
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    // Water ripples when petals land
    if (Math.random() > 0.97) {
      this.ripples.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 40 + Math.random() * 30,
        size: 5,
        alpha: 0.4
      });
    }

    this.ripples = this.ripples.filter(ripple => {
      ripple.size += 0.8;
      ripple.alpha -= 0.01;

      if (ripple.alpha > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.size, 0, Math.PI * 2);
        ctx.stroke();
      }

      return ripple.alpha > 0;
    });

    // Sakura petals
    this.petals.forEach(petal => {
      petal.rotation += petal.rotSpeed;
      petal.x += petal.vx;
      petal.y += petal.vy + Math.sin(time * 2 + petal.x * 0.01) * 0.4;

      if (petal.x > canvas.width + 20) {
        petal.x = -20;
        petal.y = Math.random() * canvas.height * 0.7;
      }
      if (petal.y > canvas.height - 30) {
        petal.y = -20;
        petal.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      // Sakura petal - rounder and softer
      ctx.beginPath();
      ctx.moveTo(0, -petal.size / 2);
      ctx.quadraticCurveTo(petal.size / 2, 0, 0, petal.size / 2);
      ctx.quadraticCurveTo(-petal.size / 2, 0, 0, -petal.size / 2);
      
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.65)`;
      ctx.fill();

      // Pink center gradient
      ctx.beginPath();
      ctx.arc(0, 0, petal.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.6}, ${primaryRgb[2] * 0.8}, 0.4)`;
      ctx.fill();

      ctx.restore();
    });
  }
}
