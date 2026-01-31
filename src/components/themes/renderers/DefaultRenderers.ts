// Default Theme Renderers: Dust Motes, Starfield, Falling Leaves
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// DUST MOTES - Gentle floating particles with warm glow (Classic Amber)
// ═══════════════════════════════════════════════════════════════════════════
export class DustMotesRenderer extends BaseRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    alpha: number;
    phase: number;
  }> = [];

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
    const { ctx, canvas, primaryRgb } = rc;

    // Warm ambient light from imaginary window
    const warmGlow = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.2, 0,
      canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.6
    );
    warmGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`);
    warmGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Light rays effect
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.1 + i * 50);
      ctx.lineTo(canvas.width * 0.6, canvas.height * 0.3 + i * 80);
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.35 + i * 80);
      ctx.lineTo(0, canvas.height * 0.15 + i * 50);
      ctx.closePath();
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`;
      ctx.fill();
    }
    ctx.restore();

    this.particles.forEach(p => {
      p.phase += 0.02;
      p.x += p.vx + Math.sin(p.phase) * 0.3;
      p.y += p.vy;

      // Wrap around
      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;

      // Golden dust mote with glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha})`);
      glow.addColorStop(0.4, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${p.alpha * 0.4})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STARFIELD - Twinkling stars with nebula (Midnight Blue)
// ═══════════════════════════════════════════════════════════════════════════
export class StarfieldRenderer extends BaseRenderer {
  stars: Array<{
    x: number; y: number;
    size: number;
    baseAlpha: number;
    twinkleSpeed: number;
    twinklePhase: number;
    color: string;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 250; i++) {
      const colorChoice = Math.random();
      let color = '255, 255, 255';
      if (colorChoice > 0.9) color = '200, 220, 255'; // Blue tint
      else if (colorChoice > 0.8) color = '255, 240, 200'; // Warm tint

      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.3 + Math.random() * 2.5,
        baseAlpha: 0.3 + Math.random() * 0.6,
        twinkleSpeed: 0.01 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        color
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb } = rc;

    // Nebula clouds
    const nebula1 = ctx.createRadialGradient(
      canvas.width * 0.25, canvas.height * 0.3, 0,
      canvas.width * 0.25, canvas.height * 0.3, canvas.width * 0.45
    );
    nebula1.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.06)`);
    nebula1.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.02)`);
    nebula1.addColorStop(1, 'transparent');
    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nebula2 = ctx.createRadialGradient(
      canvas.width * 0.75, canvas.height * 0.65, 0,
      canvas.width * 0.75, canvas.height * 0.65, canvas.width * 0.4
    );
    nebula2.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.05)`);
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
      ctx.fillStyle = `rgba(${star.color}, ${alpha})`;
      ctx.fill();

      // Cross sparkle for larger stars
      if (star.size > 1.5 && twinkle > 0.7) {
        ctx.save();
        ctx.strokeStyle = `rgba(${star.color}, ${alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        const sparkleSize = star.size * 4 * twinkle;
        ctx.beginPath();
        ctx.moveTo(star.x - sparkleSize, star.y);
        ctx.lineTo(star.x + sparkleSize, star.y);
        ctx.moveTo(star.x, star.y - sparkleSize);
        ctx.lineTo(star.x, star.y + sparkleSize);
        ctx.stroke();
        ctx.restore();
      }

      // Glow for medium stars
      if (star.size > 1) {
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
        glow.addColorStop(0, `rgba(${star.color}, ${alpha * 0.25})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(star.x - star.size * 4, star.y - star.size * 4, star.size * 8, star.size * 8);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FALLING LEAVES - Autumn leaves with forest mist (Forest Green)
// ═══════════════════════════════════════════════════════════════════════════
export class FallingLeavesRenderer extends BaseRenderer {
  leaves: Array<{
    x: number; y: number;
    rotation: number;
    rotSpeed: number;
    size: number;
    swayPhase: number;
    swayAmplitude: number;
    speed: number;
    hue: number;
    leafType: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 35; i++) {
      this.leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        size: 10 + Math.random() * 15,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmplitude: 1 + Math.random() * 2,
        speed: 0.4 + Math.random() * 0.8,
        hue: 25 + Math.random() * 40, // Orange to yellow-brown
        leafType: Math.floor(Math.random() * 3)
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;

    // Forest mist from bottom
    const mist = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 400);
    mist.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.12)`);
    mist.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    mist.addColorStop(1, 'transparent');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dappled light effect
    for (let i = 0; i < 8; i++) {
      const x = (canvas.width * 0.1) + (i * canvas.width * 0.12);
      const y = canvas.height * 0.2 + Math.sin(rc.time + i) * 20;
      const lightGlow = ctx.createRadialGradient(x, y, 0, x, y, 80);
      lightGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
      lightGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGlow;
      ctx.beginPath();
      ctx.arc(x, y, 80, 0, Math.PI * 2);
      ctx.fill();
    }

    this.leaves.forEach(leaf => {
      leaf.swayPhase += 0.02;
      leaf.rotation += leaf.rotSpeed;
      leaf.x += Math.sin(leaf.swayPhase) * leaf.swayAmplitude;
      leaf.y += leaf.speed;

      if (leaf.y > canvas.height + 40) {
        leaf.y = -40;
        leaf.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.scale(leaf.size / 18, leaf.size / 18);

      // Draw leaf based on type
      ctx.beginPath();
      if (leaf.leafType === 0) {
        // Maple-style leaf
        ctx.moveTo(0, -12);
        ctx.quadraticCurveTo(10, -8, 8, 0);
        ctx.quadraticCurveTo(12, 2, 10, 6);
        ctx.quadraticCurveTo(5, 4, 0, 12);
        ctx.quadraticCurveTo(-5, 4, -10, 6);
        ctx.quadraticCurveTo(-12, 2, -8, 0);
        ctx.quadraticCurveTo(-10, -8, 0, -12);
      } else if (leaf.leafType === 1) {
        // Oak-style leaf
        ctx.moveTo(0, -10);
        ctx.bezierCurveTo(6, -6, 8, -2, 6, 4);
        ctx.bezierCurveTo(4, 8, 0, 12, 0, 12);
        ctx.bezierCurveTo(0, 12, -4, 8, -6, 4);
        ctx.bezierCurveTo(-8, -2, -6, -6, 0, -10);
      } else {
        // Simple oval leaf
        ctx.ellipse(0, 0, 5, 10, 0, 0, Math.PI * 2);
      }

      ctx.fillStyle = `hsla(${leaf.hue}, 55%, 38%, 0.75)`;
      ctx.fill();

      // Leaf vein
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 10);
      ctx.strokeStyle = `hsla(${leaf.hue - 5}, 40%, 28%, 0.5)`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    });
  }
}
