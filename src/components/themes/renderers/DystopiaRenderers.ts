// Dystopia Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// FALLOUT WASTELAND - Vault-Tec Pip-Boy aesthetic with radiation and wasteland
// ═══════════════════════════════════════════════════════════════════════════
export class NuclearWastelandRenderer extends BaseRenderer {
  debris: Array<{ x: number; y: number; size: number; rotation: number; type: number }> = [];
  ashParticles: Array<{ x: number; y: number; speed: number; size: number; sway: number }> = [];
  vaultBoyGlow = 0;
  geiger = { tick: 0, intensity: 0 };

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Scattered wasteland debris at bottom
    for (let i = 0; i < 30; i++) {
      this.debris.push({
        x: Math.random() * canvas.width,
        y: canvas.height - 30 - Math.random() * 120,
        size: 8 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        type: Math.floor(Math.random() * 4)
      });
    }

    // Ash/dust particles floating
    for (let i = 0; i < 60; i++) {
      this.ashParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.2 + Math.random() * 0.6,
        size: 1 + Math.random() * 3,
        sway: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Pip-Boy amber/green color
    const pipboyR = 80;
    const pipboyG = 200;
    const pipboyB = 120;
    
    this.vaultBoyGlow = 0.5 + Math.sin(time * 0.5) * 0.1;
    this.geiger.tick++;
    
    // Random geiger crackle
    if (Math.random() > 0.97) {
      this.geiger.intensity = 0.8;
    }
    this.geiger.intensity *= 0.95;

    // Wasteland gradient - sepia/brown tones
    const wastelandGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    wastelandGrad.addColorStop(0, 'rgba(60, 40, 20, 0.15)');
    wastelandGrad.addColorStop(0.5, 'rgba(80, 60, 30, 0.1)');
    wastelandGrad.addColorStop(1, 'rgba(50, 35, 15, 0.2)');
    ctx.fillStyle = wastelandGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pip-Boy screen overlay glow
    const pipboyGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    pipboyGrad.addColorStop(0, `rgba(${pipboyR}, ${pipboyG}, ${pipboyB}, ${0.04 * this.vaultBoyGlow})`);
    pipboyGrad.addColorStop(0.5, `rgba(${pipboyR}, ${pipboyG}, ${pipboyB}, ${0.02 * this.vaultBoyGlow})`);
    pipboyGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = pipboyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Radiation warning symbol (top corners, subtle)
    this.drawRadSymbol(ctx, 80, 80, 40, [pipboyR, pipboyG, pipboyB], 0.08 + this.geiger.intensity * 0.1);
    this.drawRadSymbol(ctx, canvas.width - 80, 80, 40, [pipboyR, pipboyG, pipboyB], 0.08 + this.geiger.intensity * 0.1);

    // Ground with cracked earth texture suggestion
    const groundGrad = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
    groundGrad.addColorStop(0, 'transparent');
    groundGrad.addColorStop(0.3, 'rgba(60, 45, 25, 0.15)');
    groundGrad.addColorStop(1, 'rgba(40, 30, 15, 0.3)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

    // Debris silhouettes
    ctx.fillStyle = 'rgba(30, 25, 15, 0.4)';
    this.debris.forEach(d => {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);
      
      if (d.type === 0) {
        // Rusted car hull
        ctx.beginPath();
        ctx.moveTo(-d.size, d.size * 0.3);
        ctx.lineTo(-d.size * 0.8, -d.size * 0.2);
        ctx.lineTo(d.size * 0.8, -d.size * 0.2);
        ctx.lineTo(d.size, d.size * 0.3);
        ctx.closePath();
        ctx.fill();
      } else if (d.type === 1) {
        // Broken sign post
        ctx.fillRect(-d.size * 0.1, -d.size, d.size * 0.2, d.size * 1.5);
        ctx.fillRect(-d.size * 0.4, -d.size * 1.2, d.size * 0.8, d.size * 0.3);
      } else if (d.type === 2) {
        // Rock pile
        ctx.beginPath();
        ctx.arc(0, 0, d.size * 0.5, 0, Math.PI * 2);
        ctx.arc(-d.size * 0.3, d.size * 0.2, d.size * 0.3, 0, Math.PI * 2);
        ctx.arc(d.size * 0.25, d.size * 0.15, d.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Barrel
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size * 0.3, d.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Floating ash particles
    this.ashParticles.forEach(p => {
      p.sway += 0.02;
      p.x += Math.sin(p.sway) * 0.4;
      p.y -= p.speed;

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }

      const ashAlpha = 0.3 + Math.sin(time + p.x * 0.01) * 0.1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 140, 120, ${ashAlpha})`;
      ctx.fill();
    });

    // Subtle CRT scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }

    // Vignette - dark and oppressive
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.75
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Geiger crackle flash
    if (this.geiger.intensity > 0.1) {
      ctx.fillStyle = `rgba(${pipboyR}, ${pipboyG}, ${pipboyB}, ${this.geiger.intensity * 0.05})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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
      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      ctx.fill();
      ctx.restore();
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
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

    corners.forEach((corner) => {
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
      ctx.lineTo(drip.x, drip.y - 15);
      ctx.strokeStyle = 'rgba(100, 120, 140, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Concrete texture suggestion
    ctx.fillStyle = 'rgba(80, 80, 80, 0.03)';
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvas.width;
      const y = (Math.cos(i * 67.89) * 0.5 + 0.5) * canvas.height;
      ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SURVEILLANCE / BIG BROTHER - Watching eyes and propaganda
// ═══════════════════════════════════════════════════════════════════════════
export class SurveillanceRenderer extends BaseRenderer {
  searchlightAngle = 0;
  staticNoise: Array<{ x: number; y: number; alpha: number }> = [];
  eyePosition = { x: 0, y: 0 };

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 100; i++) {
      this.staticNoise.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        alpha: Math.random() * 0.3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, accentRgb } = rc;

    this.searchlightAngle += 0.01;

    // Dark oppressive overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sweeping searchlight
    const lightX = canvas.width / 2 + Math.cos(this.searchlightAngle) * canvas.width * 0.4;
    const lightGrad = ctx.createRadialGradient(lightX, 0, 0, lightX, 0, canvas.height);
    lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    lightGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    lightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(lightX, 0);
    ctx.lineTo(lightX - 150, canvas.height);
    ctx.lineTo(lightX + 150, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Static noise effect
    this.staticNoise.forEach(noise => {
      noise.x = Math.random() * canvas.width;
      noise.y = Math.random() * canvas.height;
      noise.alpha = Math.random() * 0.15;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${noise.alpha})`;
      ctx.fillRect(noise.x, noise.y, 2, 2);
    });

    // Watching eye symbol (center, very subtle)
    this.eyePosition.x = canvas.width / 2 + Math.sin(time * 0.5) * 50;
    this.eyePosition.y = canvas.height * 0.15;
    
    const eyeSize = 60;
    ctx.save();
    ctx.translate(this.eyePosition.x, this.eyePosition.y);
    ctx.globalAlpha = 0.1;
    
    // Eye outline
    ctx.beginPath();
    ctx.ellipse(0, 0, eyeSize, eyeSize * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Iris
    ctx.beginPath();
    ctx.arc(Math.sin(time) * 10, 0, eyeSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]})`;
    ctx.fill();
    
    // Pupil
    ctx.beginPath();
    ctx.arc(Math.sin(time) * 10, 0, eyeSize * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fill();
    
    ctx.restore();

    // Heavy vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.15,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.65
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
  }
}
