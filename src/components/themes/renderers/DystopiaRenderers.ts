// Dystopia Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// NUCLEAR WASTELAND - Radiation and falling ash
// ═══════════════════════════════════════════════════════════════════════════
export class NuclearWastelandRenderer extends BaseRenderer {
  ashParticles: Array<{ x: number; y: number; size: number; speed: number; drift: number }> = [];
  radiationPulse = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 80; i++) {
      this.ashParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.8,
        drift: (Math.random() - 0.5) * 0.3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    this.radiationPulse += 0.02;
    const pulse = 0.5 + Math.sin(this.radiationPulse) * 0.3;

    // Sickly yellow-green radiation glow
    const radGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    );
    radGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 0, ${0.08 * pulse})`);
    radGlow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.7}, 0, ${0.04 * pulse})`);
    radGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hazard stripes at bottom
    const stripeHeight = 30;
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let x = -stripeHeight; x < canvas.width + stripeHeight; x += stripeHeight * 2) {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height);
      ctx.lineTo(x + stripeHeight, canvas.height);
      ctx.lineTo(x + stripeHeight * 2, canvas.height - stripeHeight);
      ctx.lineTo(x + stripeHeight, canvas.height - stripeHeight);
      ctx.closePath();
      ctx.fillStyle = `rgb(${primaryRgb[0]}, ${primaryRgb[1]}, 0)`;
      ctx.fill();
    }
    ctx.restore();

    // Falling ash
    this.ashParticles.forEach(ash => {
      ash.y += ash.speed;
      ash.x += ash.drift + Math.sin(ash.y * 0.01) * 0.2;

      if (ash.y > canvas.height + 10) {
        ash.y = -10;
        ash.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(ash.x, ash.y, ash.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80, 70, 60, ${0.3 + Math.random() * 0.2})`;
      ctx.fill();
    });

    // Occasional warning flash
    if (Math.sin(this.radiationPulse * 3) > 0.95) {
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Dust/fog layer
    const dustGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    dustGrad.addColorStop(0, `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.5}, 30, 0.15)`);
    dustGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = dustGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
