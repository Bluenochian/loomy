// Dystopia Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// FALLOUT WASTELAND - Vault-Tec style with pip-boy green, radiation signs
// ═══════════════════════════════════════════════════════════════════════════
export class NuclearWastelandRenderer extends BaseRenderer {
  debris: Array<{ x: number; y: number; size: number; rotation: number; type: number }> = [];
  radParticles: Array<{ x: number; y: number; speed: number; size: number }> = [];
  scanlineOffset = 0;
  warningFlash = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Debris/rubble scattered
    for (let i = 0; i < 25; i++) {
      this.debris.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 20 - Math.random() * 100,
        size: 5 + Math.random() * 15,
        rotation: Math.random() * Math.PI * 2,
        type: Math.floor(Math.random() * 3)
      });
    }

    // Radiation particles floating up
    for (let i = 0; i < 40; i++) {
      this.radParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.8,
        size: 1 + Math.random() * 3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    this.scanlineOffset = (this.scanlineOffset + 1) % 4;
    this.warningFlash = Math.sin(time * 2);

    // Pip-boy green tint overlay
    const pipboyGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    pipboyGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 50, 0.06)`);
    pipboyGlow.addColorStop(0.6, `rgba(${primaryRgb[0] * 0.8}, ${primaryRgb[1] * 0.6}, 30, 0.04)`);
    pipboyGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = pipboyGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hazard stripes at corners
    this.drawHazardStripes(ctx, 0, canvas.height - 40, 150, 40, primaryRgb);
    this.drawHazardStripes(ctx, canvas.width - 150, canvas.height - 40, 150, 40, primaryRgb);

    // Radiation warning symbol (center top, subtle)
    this.drawRadSymbol(ctx, canvas.width / 2, canvas.height * 0.15, 60, primaryRgb, 0.08 + this.warningFlash * 0.03);

    // Dust/wasteland haze
    const dustGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 250);
    dustGrad.addColorStop(0, `rgba(80, 70, 50, 0.18)`);
    dustGrad.addColorStop(0.5, `rgba(60, 55, 40, 0.08)`);
    dustGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = dustGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground debris
    this.debris.forEach(d => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);
      ctx.fillStyle = `rgba(60, 55, 45, 0.4)`;
      
      if (d.type === 0) {
        // Rock
        ctx.beginPath();
        ctx.moveTo(-d.size / 2, d.size / 3);
        ctx.lineTo(0, -d.size / 2);
        ctx.lineTo(d.size / 2, d.size / 4);
        ctx.lineTo(d.size / 3, d.size / 2);
        ctx.lineTo(-d.size / 3, d.size / 2);
        ctx.closePath();
        ctx.fill();
      } else if (d.type === 1) {
        // Metal scrap
        ctx.fillRect(-d.size / 2, -d.size / 4, d.size, d.size / 2);
      } else {
        // Rubble pile
        ctx.beginPath();
        ctx.arc(0, 0, d.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Floating radiation particles (glowing green)
    this.radParticles.forEach(p => {
      p.y -= p.speed;
      p.x += Math.sin(time * 2 + p.y * 0.02) * 0.5;

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }

      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 80, 0.5)`);
      glow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 50, 0.2)`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // CRT scanlines effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = this.scanlineOffset; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.75
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private drawHazardStripes(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, rgb: [number, number, number]) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    const stripeWidth = 15;
    for (let i = -height; i < width + height; i += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + height);
      ctx.lineTo(x + i + stripeWidth, y + height);
      ctx.lineTo(x + i + stripeWidth + height, y);
      ctx.lineTo(x + i + height, y);
      ctx.closePath();
      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, 0)`;
      ctx.fill();
    }
    ctx.restore();
  }

  private drawRadSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rgb: [number, number, number], alpha: number) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    
    // Three fan blades
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.15);
      ctx.arc(0, 0, size, -Math.PI / 3, -Math.PI / 6);
      ctx.lineTo(0, -size * 0.15);
      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, 0)`;
      ctx.fill();
      ctx.restore();
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, 0)`;
    ctx.fill();
    
    // Inner circle (cutout)
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RUST BELT - Industrial decay with sparks
// ═══════════════════════════════════════════════════════════════════════════
export class RustBeltRenderer extends BaseRenderer {
  sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];
  rustParticles: Array<{ x: number; y: number; size: number; alpha: number }> = [];
  sparkSource = { x: 0, y: 0, active: false };

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 40; i++) {
      this.rustParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 4,
        alpha: 0.1 + Math.random() * 0.2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Industrial haze
    const hazeGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    hazeGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.8}, ${primaryRgb[2] * 0.5}, 0.05)`);
    hazeGrad.addColorStop(1, `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.4}, ${primaryRgb[2] * 0.3}, 0.1)`);
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rust/dust particles floating
    this.rustParticles.forEach(rust => {
      rust.y += Math.sin(time + rust.x * 0.01) * 0.3;
      rust.x += Math.cos(time * 0.5 + rust.y * 0.01) * 0.2;

      ctx.beginPath();
      ctx.arc(rust.x, rust.y, rust.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.6}, ${primaryRgb[2] * 0.3}, ${rust.alpha})`;
      ctx.fill();
    });

    // Spark shower from random points
    if (Math.random() > 0.97) {
      this.sparkSource = {
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: Math.random() * canvas.height * 0.5,
        active: true
      };
    }

    if (this.sparkSource.active && Math.random() > 0.3) {
      for (let i = 0; i < 5; i++) {
        this.sparks.push({
          x: this.sparkSource.x,
          y: this.sparkSource.y,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 4,
          life: 0,
          maxLife: 40 + Math.random() * 40
        });
      }
    }

    if (Math.random() > 0.95) {
      this.sparkSource.active = false;
    }

    // Render sparks
    this.sparks = this.sparks.filter(spark => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.15; // Gravity
      spark.life++;

      const lifeRatio = 1 - spark.life / spark.maxLife;

      if (lifeRatio > 0) {
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 2 * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${lifeRatio})`;
        ctx.fill();

        // Spark trail
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(spark.x - spark.vx * 2, spark.y - spark.vy * 2);
        ctx.strokeStyle = `rgba(255, 150, 50, ${lifeRatio * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      return spark.life < spark.maxLife;
    });

    // Steam vent effect
    for (let i = 0; i < 3; i++) {
      const ventX = canvas.width * (0.2 + i * 0.3);
      if (Math.sin(time * 2 + i * 2) > 0.7) {
        const steamGrad = ctx.createLinearGradient(ventX, canvas.height, ventX, canvas.height - 150);
        steamGrad.addColorStop(0, 'rgba(200, 200, 200, 0.1)');
        steamGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = steamGrad;
        ctx.beginPath();
        ctx.moveTo(ventX - 20, canvas.height);
        ctx.quadraticCurveTo(ventX + Math.sin(time * 5) * 20, canvas.height - 100, ventX + 10, canvas.height - 150);
        ctx.quadraticCurveTo(ventX + 30, canvas.height - 80, ventX + 20, canvas.height);
        ctx.fill();
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOXIC SWAMP - Acid bubbles and toxic fumes
// ═══════════════════════════════════════════════════════════════════════════
export class ToxicSwampRenderer extends BaseRenderer {
  bubbles: Array<{ x: number; y: number; size: number; speed: number; wobble: number }> = [];
  fumes: Array<{ x: number; y: number; size: number; alpha: number; vx: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 30; i++) {
      this.bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: 5 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1.5,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Toxic water surface at bottom
    const waterGrad = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    waterGrad.addColorStop(0, 'transparent');
    waterGrad.addColorStop(0.3, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 0, 0.15)`);
    waterGrad.addColorStop(1, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 0, 0.25)`);
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Animated toxic surface
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    for (let x = 0; x <= canvas.width; x += 20) {
      const wave = Math.sin(x * 0.02 + time * 2) * 8 + Math.sin(x * 0.05 + time * 3) * 4;
      ctx.lineTo(x, canvas.height - 60 + wave);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 30, 0.2)`;
    ctx.fill();

    // Rising toxic fumes
    if (Math.random() > 0.85) {
      this.fumes.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 50,
        size: 40 + Math.random() * 60,
        alpha: 0.15,
        vx: (Math.random() - 0.5) * 0.5
      });
    }

    this.fumes = this.fumes.filter(fume => {
      fume.y -= 0.5;
      fume.x += fume.vx;
      fume.size *= 1.01;
      fume.alpha *= 0.995;

      if (fume.alpha > 0.01) {
        const grad = ctx.createRadialGradient(fume.x, fume.y, 0, fume.x, fume.y, fume.size);
        grad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 50, ${fume.alpha})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fume.x, fume.y, fume.size, 0, Math.PI * 2);
        ctx.fill();
      }

      return fume.alpha > 0.01 && fume.y > -fume.size;
    });

    // Acid bubbles
    this.bubbles.forEach(bubble => {
      bubble.wobble += 0.05;
      bubble.x += Math.sin(bubble.wobble) * 0.5;
      bubble.y -= bubble.speed;

      if (bubble.y < canvas.height - 100) {
        // Pop effect
        bubble.y = canvas.height + 20;
        bubble.x = Math.random() * canvas.width;
      }

      // Bubble
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, 0.5)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      const innerGlow = ctx.createRadialGradient(bubble.x, bubble.y, 0, bubble.x, bubble.y, bubble.size);
      innerGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, 0.15)`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 255, 150, 0.4)`;
      ctx.fill();
    });

    // Warning glow
    const warningGlow = 0.3 + Math.sin(time * 3) * 0.15;
    const warnGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height, 0,
      canvas.width / 2, canvas.height, canvas.height * 0.5
    );
    warnGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 0, ${warningGlow * 0.15})`);
    warnGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = warnGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BUNKER EMERGENCY - Red emergency lights
// ═══════════════════════════════════════════════════════════════════════════
export class BunkerEmergencyRenderer extends BaseRenderer {
  lightPhase = 0;
  drips: Array<{ x: number; y: number; speed: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 10; i++) {
      this.drips.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, accentRgb } = rc;

    this.lightPhase += 0.05;

    // Emergency red light pulse
    const pulse = Math.sin(this.lightPhase) > 0 ? Math.sin(this.lightPhase) : 0;
    
    // Red emergency glow from corners
    const corners = [
      { x: 0, y: 0 },
      { x: canvas.width, y: 0 },
      { x: 0, y: canvas.height },
      { x: canvas.width, y: canvas.height }
    ];

    corners.forEach((corner, i) => {
      const glow = ctx.createRadialGradient(corner.x, corner.y, 0, corner.x, corner.y, 300);
      glow.addColorStop(0, `rgba(${accentRgb[0]}, 0, 0, ${0.15 * pulse})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Pipe drips
    this.drips.forEach(drip => {
      drip.y += drip.speed;
      
      if (drip.y > canvas.height) {
        drip.y = 0;
        drip.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(drip.x, drip.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 120, 140, 0.5)';
      ctx.fill();

      // Drip trail
      ctx.beginPath();
      ctx.moveTo(drip.x, drip.y);
      ctx.lineTo(drip.x, drip.y - 10);
      ctx.strokeStyle = 'rgba(100, 120, 140, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Vent mist
    const ventX = canvas.width * 0.1;
    const mistGrad = ctx.createLinearGradient(ventX, 0, ventX + 100, 100);
    mistGrad.addColorStop(0, 'rgba(150, 160, 170, 0.1)');
    mistGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.moveTo(ventX, 0);
    ctx.lineTo(ventX + 80, 100);
    ctx.lineTo(ventX + 20, 80);
    ctx.lineTo(ventX - 20, 0);
    ctx.fill();

    // Heavy vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SURVEILLANCE - Big Brother watching
// ═══════════════════════════════════════════════════════════════════════════
export class SurveillanceRenderer extends BaseRenderer {
  searchLightAngle = 0;
  staticIntensity = 0;
  eyePosition = { x: 0, y: 0 };

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
    this.eyePosition = { x: canvas.width / 2, y: canvas.height * 0.3 };
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, accentRgb } = rc;

    this.searchLightAngle += 0.01;

    // Static noise bursts
    if (Math.random() > 0.95) {
      this.staticIntensity = 0.1 + Math.random() * 0.1;
    }
    this.staticIntensity *= 0.95;

    if (this.staticIntensity > 0.01) {
      const imageData = ctx.createImageData(canvas.width / 8, canvas.height / 8);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 255;
        imageData.data[i] = noise;
        imageData.data[i + 1] = noise;
        imageData.data[i + 2] = noise;
        imageData.data[i + 3] = this.staticIntensity * 255;
      }
      ctx.save();
      ctx.scale(8, 8);
      ctx.putImageData(imageData, 0, 0);
      ctx.restore();
    }

    // Search light sweep
    ctx.save();
    ctx.translate(canvas.width / 2, 0);
    ctx.rotate(Math.sin(this.searchLightAngle) * 0.5);
    
    const lightGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    lightGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)');
    lightGrad.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-100, canvas.height);
    ctx.lineTo(100, canvas.height);
    ctx.closePath();
    ctx.fillStyle = lightGrad;
    ctx.fill();
    ctx.restore();

    // The watching eye
    const eyeSize = 80;
    const pupilOffset = Math.sin(time * 0.5) * 10;

    // Eye glow
    const eyeGlow = ctx.createRadialGradient(
      this.eyePosition.x, this.eyePosition.y, 0,
      this.eyePosition.x, this.eyePosition.y, eyeSize * 2
    );
    eyeGlow.addColorStop(0, `rgba(${accentRgb[0]}, 0, 0, 0.1)`);
    eyeGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(this.eyePosition.x, this.eyePosition.y, eyeSize * 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye white
    ctx.beginPath();
    ctx.ellipse(this.eyePosition.x, this.eyePosition.y, eyeSize, eyeSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 200, 200, 0.15)';
    ctx.fill();

    // Iris
    ctx.beginPath();
    ctx.arc(this.eyePosition.x + pupilOffset, this.eyePosition.y, eyeSize * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1] * 0.3}, ${accentRgb[2] * 0.3}, 0.3)`;
    ctx.fill();

    // Pupil
    ctx.beginPath();
    ctx.arc(this.eyePosition.x + pupilOffset, this.eyePosition.y, eyeSize * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fill();

    // Heavy dark vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
