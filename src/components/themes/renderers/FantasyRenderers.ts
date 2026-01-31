// Fantasy Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// ROYAL SPARKLES - Golden dust and purple majesty
// ═══════════════════════════════════════════════════════════════════════════
export class RoyalSparklesRenderer extends BaseRenderer {
  sparkles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
    phase: number;
    isGold: boolean;
  }> = [];
  crowns: Array<{ x: number; y: number; rotation: number; size: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 80; i++) {
      this.sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4,
        size: 1 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.3
      });
    }

    // Floating crown silhouettes
    for (let i = 0; i < 5; i++) {
      this.crowns.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: (Math.random() - 0.5) * 0.3,
        size: 30 + Math.random() * 40,
        alpha: 0.03 + Math.random() * 0.04
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb } = rc;

    // Royal purple glow
    const royalGlow = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.4, 0,
      canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.6
    );
    royalGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`);
    royalGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = royalGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floating crowns
    this.crowns.forEach(crown => {
      crown.y -= 0.1;
      crown.rotation += 0.002;
      if (crown.y < -crown.size) {
        crown.y = canvas.height + crown.size;
        crown.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(crown.x, crown.y);
      ctx.rotate(crown.rotation);
      ctx.scale(crown.size / 40, crown.size / 40);
      
      ctx.beginPath();
      ctx.moveTo(-20, 10);
      ctx.lineTo(-20, 0);
      ctx.lineTo(-12, -10);
      ctx.lineTo(-12, -5);
      ctx.lineTo(0, -15);
      ctx.lineTo(12, -5);
      ctx.lineTo(12, -10);
      ctx.lineTo(20, 0);
      ctx.lineTo(20, 10);
      ctx.closePath();
      ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${crown.alpha})`;
      ctx.fill();
      ctx.restore();
    });

    // Sparkles
    this.sparkles.forEach(s => {
      s.phase += 0.04;
      s.x += s.vx;
      s.y += s.vy;

      if (s.y < -20) {
        s.y = canvas.height + 20;
        s.x = Math.random() * canvas.width;
      }
      if (s.x < -20) s.x = canvas.width + 20;
      if (s.x > canvas.width + 20) s.x = -20;

      const twinkle = 0.5 + Math.sin(s.phase) * 0.5;
      const rgb = s.isGold ? accentRgb : primaryRgb;
      
      // Star shape
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.phase * 0.5);
      
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s.size * 4);
      glow.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${s.alpha * twinkle})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, s.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // 4-point star
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const innerAngle = angle + Math.PI / 4;
        ctx.lineTo(Math.cos(angle) * s.size * 2, Math.sin(angle) * s.size * 2);
        ctx.lineTo(Math.cos(innerAngle) * s.size * 0.5, Math.sin(innerAngle) * s.size * 0.5);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle * 0.9})`;
      ctx.fill();
      
      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SNOWFALL - Winter wonderland with ice crystals
// ═══════════════════════════════════════════════════════════════════════════
export class SnowfallRenderer extends BaseRenderer {
  flakes: Array<{
    x: number; y: number;
    size: number;
    speed: number;
    swayPhase: number;
    swaySpeed: number;
    alpha: number;
    rotation: number;
    rotSpeed: number;
    isIceCrystal: boolean;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 100; i++) {
      this.flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 5,
        speed: 0.3 + Math.random() * 1.2,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        alpha: 0.4 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        isIceCrystal: Math.random() > 0.85
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Cold ambient from top
    const coldGlow = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    coldGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.06)`);
    coldGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = coldGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frost border effect
    const frostGrad = ctx.createLinearGradient(0, 0, 0, 100);
    frostGrad.addColorStop(0, `rgba(200, 230, 255, 0.08)`);
    frostGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = frostGrad;
    ctx.fillRect(0, 0, canvas.width, 100);

    this.flakes.forEach(flake => {
      flake.swayPhase += flake.swaySpeed;
      flake.rotation += flake.rotSpeed;
      flake.x += Math.sin(flake.swayPhase) * 0.8;
      flake.y += flake.speed;

      if (flake.y > canvas.height + 20) {
        flake.y = -20;
        flake.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(flake.x, flake.y);
      ctx.rotate(flake.rotation);

      if (flake.isIceCrystal && flake.size > 3) {
        // Draw ice crystal (6-pointed)
        ctx.strokeStyle = `rgba(200, 230, 255, ${flake.alpha * 0.8})`;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * flake.size * 2, Math.sin(angle) * flake.size * 2);
          // Branch
          const branchLen = flake.size * 0.8;
          const bx = Math.cos(angle) * flake.size * 1.2;
          const by = Math.sin(angle) * flake.size * 1.2;
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(angle + 0.5) * branchLen, by + Math.sin(angle + 0.5) * branchLen);
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(angle - 0.5) * branchLen, by + Math.sin(angle - 0.5) * branchLen);
          ctx.stroke();
        }
      } else {
        // Simple snowflake
        ctx.beginPath();
        ctx.arc(0, 0, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`;
        ctx.fill();

        // Glow
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, flake.size * 3);
        glow.addColorStop(0, `rgba(200, 220, 255, ${flake.alpha * 0.3})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(-flake.size * 3, -flake.size * 3, flake.size * 6, flake.size * 6);
      }

      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON FIRE - Fierce flames with rising embers
// ═══════════════════════════════════════════════════════════════════════════
export class DragonFireRenderer extends BaseRenderer {
  embers: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    life: number;
    maxLife: number;
  }> = [];
  initialized = false;

  init() {
    this.initialized = true;
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Heat glow from bottom
    const heatGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 450);
    heatGlow.addColorStop(0, `rgba(255, 100, 20, 0.18)`);
    heatGlow.addColorStop(0.4, `rgba(255, 60, 10, 0.08)`);
    heatGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = heatGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated fire line at bottom with multiple layers
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 8) {
        const t = time * (4 + layer * 2);
        const flame = Math.sin(x * 0.015 + t) * (40 - layer * 10) + 
                      Math.sin(x * 0.04 + t * 1.3) * (20 - layer * 5) +
                      Math.sin(x * 0.08 + t * 0.7) * 10;
        ctx.lineTo(x, canvas.height - 30 - layer * 30 - flame);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      const fireGrad = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
      if (layer === 0) {
        fireGrad.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
        fireGrad.addColorStop(0.5, 'rgba(255, 100, 20, 0.25)');
        fireGrad.addColorStop(1, 'rgba(180, 40, 0, 0.15)');
      } else if (layer === 1) {
        fireGrad.addColorStop(0, 'rgba(255, 180, 40, 0.25)');
        fireGrad.addColorStop(1, 'rgba(200, 60, 0, 0.1)');
      } else {
        fireGrad.addColorStop(0, 'rgba(255, 220, 100, 0.15)');
        fireGrad.addColorStop(1, 'rgba(255, 150, 50, 0.05)');
      }
      ctx.fillStyle = fireGrad;
      ctx.fill();
    }

    // Spawn embers
    if (Math.random() > 0.4) {
      this.embers.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 40 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 2,
        vy: -2.5 - Math.random() * 4,
        size: 1 + Math.random() * 5,
        life: 0,
        maxLife: 100 + Math.random() * 100
      });
    }

    // Render embers
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx + Math.sin(ember.life * 0.05) * 0.8;
      ember.y += ember.vy;
      ember.vy *= 0.995;
      ember.life++;

      const lifeRatio = 1 - ember.life / ember.maxLife;

      if (lifeRatio > 0) {
        const glow = ctx.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, ember.size * 5);
        glow.addColorStop(0, `rgba(255, 200, 80, ${lifeRatio * 0.8})`);
        glow.addColorStop(0.3, `rgba(255, 120, 40, ${lifeRatio * 0.4})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 5, 0, Math.PI * 2);
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
// ENCHANTED FOREST - Fireflies and magical mushrooms
// ═══════════════════════════════════════════════════════════════════════════
export class EnchantedForestRenderer extends BaseRenderer {
  fireflies: Array<{
    x: number; y: number;
    vx: number; vy: number;
    glowPhase: number;
    glowSpeed: number;
    size: number;
    color: string;
  }> = [];
  mushrooms: Array<{ x: number; y: number; size: number; hue: number; glowPhase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 50; i++) {
      const isBlue = Math.random() > 0.7;
      this.fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.4,
        glowPhase: Math.random() * Math.PI * 2,
        glowSpeed: 0.02 + Math.random() * 0.04,
        size: 2 + Math.random() * 3,
        color: isBlue ? '100, 180, 255' : '180, 255, 100'
      });
    }

    // Glowing mushrooms at bottom
    for (let i = 0; i < 12; i++) {
      this.mushrooms.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 20 - Math.random() * 80,
        size: 15 + Math.random() * 25,
        hue: Math.random() > 0.5 ? 280 : 140,
        glowPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb, time } = rc;

    // Magic mist
    const mist = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 400);
    mist.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.12)`);
    mist.addColorStop(0.6, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.05)`);
    mist.addColorStop(1, 'transparent');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mushrooms
    this.mushrooms.forEach(shroom => {
      shroom.glowPhase += 0.02;
      const glow = 0.5 + Math.sin(shroom.glowPhase) * 0.3;
      
      // Mushroom glow
      const glowGrad = ctx.createRadialGradient(
        shroom.x, shroom.y - shroom.size * 0.3, 0,
        shroom.x, shroom.y - shroom.size * 0.3, shroom.size * 2
      );
      glowGrad.addColorStop(0, `hsla(${shroom.hue}, 70%, 60%, ${0.15 * glow})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(shroom.x, shroom.y - shroom.size * 0.3, shroom.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.fillStyle = `hsla(${shroom.hue}, 20%, 30%, 0.4)`;
      ctx.fillRect(shroom.x - 3, shroom.y, 6, shroom.size * 0.5);

      // Cap
      ctx.beginPath();
      ctx.ellipse(shroom.x, shroom.y, shroom.size * 0.6, shroom.size * 0.3, 0, Math.PI, 0);
      ctx.fillStyle = `hsla(${shroom.hue}, 60%, 45%, ${0.4 + glow * 0.2})`;
      ctx.fill();
    });

    // Fireflies
    this.fireflies.forEach(fly => {
      fly.glowPhase += fly.glowSpeed;
      fly.x += fly.vx;
      fly.y += fly.vy;

      if (Math.random() > 0.97) {
        fly.vx = (Math.random() - 0.5) * 0.6;
        fly.vy = (Math.random() - 0.5) * 0.4;
      }

      if (fly.x < -20) fly.x = canvas.width + 20;
      if (fly.x > canvas.width + 20) fly.x = -20;
      if (fly.y < -20) fly.y = canvas.height + 20;
      if (fly.y > canvas.height + 20) fly.y = -20;

      const glow = Math.max(0, Math.sin(fly.glowPhase));
      if (glow > 0.05) {
        const grad = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 10);
        grad.addColorStop(0, `rgba(${fly.color}, ${glow * 0.9})`);
        grad.addColorStop(0.3, `rgba(${fly.color}, ${glow * 0.4})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.size * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 220, ${glow})`;
        ctx.fill();
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POTION BREW - Bubbling cauldrons with colorful smoke (OPTIMIZED)
// ═══════════════════════════════════════════════════════════════════════════
export class PotionBrewRenderer extends BaseRenderer {
  bubbles: Array<{
    x: number; y: number;
    size: number;
    speed: number;
    wobblePhase: number;
    hue: number;
    alpha: number;
  }> = [];
  smokeParticles: Array<{
    x: number; y: number;
    size: number;
    speed: number;
    hue: number;
    alpha: number;
    drift: number;
    age: number;
  }> = [];
  
  // Performance: limit max particles
  readonly MAX_SMOKE = 25;
  readonly MAX_BUBBLES = 35;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Spread bubbles across the ENTIRE screen width
    for (let i = 0; i < this.MAX_BUBBLES; i++) {
      this.bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.4 + Math.random() * canvas.height * 0.6,
        size: 3 + Math.random() * 10,
        speed: 0.5 + Math.random() * 1,
        wobblePhase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.5 ? 280 : 120,
        alpha: 0.25 + Math.random() * 0.35
      });
    }

    // Pre-populate some smoke spread across screen
    for (let i = 0; i < 10; i++) {
      this.smokeParticles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.3 + Math.random() * canvas.height * 0.5,
        size: 40 + Math.random() * 60,
        speed: 0.3 + Math.random() * 0.6,
        hue: [280, 120, 320, 180][Math.floor(Math.random() * 4)],
        alpha: 0.03 + Math.random() * 0.05,
        drift: (Math.random() - 0.5) * 0.4,
        age: Math.random() * 100
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb, time } = rc;

    // Ambient glow spread across bottom
    const ambientGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 400);
    ambientGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.12)`);
    ambientGlow.addColorStop(0.5, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.04)`);
    ambientGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spawn smoke from MULTIPLE positions across screen (not just center)
    if (this.smokeParticles.length < this.MAX_SMOKE && Math.random() > 0.85) {
      // Random spawn position across entire bottom
      const spawnX = Math.random() * canvas.width;
      this.smokeParticles.push({
        x: spawnX,
        y: canvas.height - 30 - Math.random() * 50,
        size: 30 + Math.random() * 40,
        speed: 0.3 + Math.random() * 0.5,
        hue: [280, 120, 320, 180][Math.floor(Math.random() * 4)],
        alpha: 0.06 + Math.random() * 0.06,
        drift: (Math.random() - 0.5) * 0.4,
        age: 0
      });
    }

    // Render smoke with age-based cleanup (prevents infinite growth)
    this.smokeParticles = this.smokeParticles.filter(smoke => {
      smoke.y -= smoke.speed;
      smoke.x += smoke.drift + Math.sin(time * 0.5 + smoke.x * 0.01) * 0.3;
      smoke.size += 0.3; // Slower growth
      smoke.alpha *= 0.993; // Faster fade
      smoke.age++;

      // Hard limit on age to prevent memory issues
      if (smoke.age > 300 || smoke.alpha < 0.008) {
        return false;
      }

      if (smoke.alpha > 0.008) {
        const grad = ctx.createRadialGradient(smoke.x, smoke.y, 0, smoke.x, smoke.y, smoke.size);
        grad.addColorStop(0, `hsla(${smoke.hue}, 50%, 50%, ${smoke.alpha})`);
        grad.addColorStop(0.7, `hsla(${smoke.hue}, 40%, 40%, ${smoke.alpha * 0.3})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
        ctx.fill();
      }

      return smoke.y > -smoke.size;
    });

    // Bubbles spread across entire screen
    this.bubbles.forEach(bubble => {
      bubble.wobblePhase += 0.03;
      bubble.x += Math.sin(bubble.wobblePhase) * 0.5;
      bubble.y -= bubble.speed;

      // Reset at random x position when reaching top
      if (bubble.y < canvas.height * 0.2) {
        bubble.y = canvas.height + 10;
        bubble.x = Math.random() * canvas.width;
        bubble.hue = Math.random() > 0.5 ? 280 : 120;
      }

      // Bubble outline
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${bubble.hue}, 70%, 60%, ${bubble.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${bubble.hue}, 60%, 80%, ${bubble.alpha * 0.7})`;
      ctx.fill();

      // Soft inner glow
      const innerGlow = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.size);
      innerGlow.addColorStop(0, `hsla(${bubble.hue}, 70%, 60%, ${bubble.alpha * 0.15})`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CELESTIAL MAGIC - Constellations and stardust
// ═══════════════════════════════════════════════════════════════════════════
export class CelestialMagicRenderer extends BaseRenderer {
  stars: Array<{ x: number; y: number; size: number; alpha: number; phase: number }> = [];
  constellationStars: Array<{ x: number; y: number; connected: number[] }> = [];
  shootingStars: Array<{ x: number; y: number; vx: number; vy: number; length: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Background stars
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Create constellation pattern
    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.4;
    this.constellationStars = [
      { x: centerX - 100, y: centerY - 50, connected: [1, 3] },
      { x: centerX - 40, y: centerY - 80, connected: [2] },
      { x: centerX + 30, y: centerY - 60, connected: [4] },
      { x: centerX - 60, y: centerY + 20, connected: [5] },
      { x: centerX + 80, y: centerY - 20, connected: [5, 6] },
      { x: centerX + 20, y: centerY + 50, connected: [6] },
      { x: centerX + 120, y: centerY + 30, connected: [] }
    ];
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Cosmic glow
    const cosmicGlow = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.4, 0,
      canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.5
    );
    cosmicGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`);
    cosmicGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = cosmicGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background stars
    this.stars.forEach(star => {
      star.phase += 0.02;
      const twinkle = 0.6 + Math.sin(star.phase) * 0.4;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
      ctx.fill();
    });

    // Draw constellation lines
    ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.2)`;
    ctx.lineWidth = 1;
    this.constellationStars.forEach((star, i) => {
      star.connected.forEach(targetIdx => {
        const target = this.constellationStars[targetIdx];
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
    });

    // Draw constellation stars
    const constGlow = 0.7 + Math.sin(time * 2) * 0.3;
    this.constellationStars.forEach(star => {
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 20);
      glow.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${0.4 * constGlow})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * constGlow})`;
      ctx.fill();
    });

    // Shooting stars
    if (Math.random() > 0.995) {
      this.shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: 8 + Math.random() * 6,
        vy: 4 + Math.random() * 3,
        length: 50 + Math.random() * 80,
        alpha: 0.8
      });
    }

    this.shootingStars = this.shootingStars.filter(ss => {
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.alpha -= 0.015;

      if (ss.alpha > 0) {
        const grad = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10)
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
        grad.addColorStop(0.3, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${ss.alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10));
        ctx.stroke();
      }

      return ss.alpha > 0 && ss.x < canvas.width + 100;
    });
  }
}
