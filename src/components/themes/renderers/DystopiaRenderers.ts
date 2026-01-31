// Dystopia Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// FALLOUT WASTELAND - Vault Door Interior looking out to wasteland sky
// ═══════════════════════════════════════════════════════════════════════════
export class NuclearWastelandRenderer extends BaseRenderer {
  dustParticles: Array<{ x: number; y: number; speed: number; size: number; alpha: number }> = [];
  vaultDoorAngle = 0;
  lightFlicker = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Floating dust in the vault
    for (let i = 0; i < 50; i++) {
      this.dustParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.1 + Math.random() * 0.3,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.3
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;
    
    // Pip-Boy green/amber palette
    const pipGreen = { r: 80, g: 200, b: 120 };
    const pipAmber = { r: 255, g: 180, b: 50 };
    
    this.lightFlicker = 0.85 + Math.sin(time * 8) * 0.05 + Math.random() * 0.1;

    // === WASTELAND SKY (visible through door opening) ===
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const doorRadius = Math.min(canvas.width, canvas.height) * 0.35;
    
    // Draw the circular opening first (wasteland visible through)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, doorRadius, 0, Math.PI * 2);
    ctx.clip();
    
    // Wasteland sky gradient - amber/orange haze
    const skyGrad = ctx.createLinearGradient(0, centerY - doorRadius, 0, centerY + doorRadius);
    skyGrad.addColorStop(0, 'rgba(180, 120, 60, 0.4)');
    skyGrad.addColorStop(0.4, 'rgba(200, 150, 80, 0.3)');
    skyGrad.addColorStop(0.7, 'rgba(150, 100, 50, 0.35)');
    skyGrad.addColorStop(1, 'rgba(80, 60, 40, 0.5)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Distant wasteland silhouette (ruined buildings)
    ctx.fillStyle = 'rgba(40, 30, 20, 0.6)';
    const baseY = centerY + doorRadius * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX - doorRadius, baseY);
    // Ruined cityscape silhouette
    let x = centerX - doorRadius;
    while (x < centerX + doorRadius) {
      const buildingHeight = 20 + Math.random() * 60;
      const buildingWidth = 15 + Math.random() * 30;
      ctx.lineTo(x, baseY - buildingHeight);
      ctx.lineTo(x + buildingWidth * 0.3, baseY - buildingHeight - 10);
      ctx.lineTo(x + buildingWidth * 0.5, baseY - buildingHeight + 5);
      ctx.lineTo(x + buildingWidth, baseY - buildingHeight * 0.7);
      x += buildingWidth;
    }
    ctx.lineTo(centerX + doorRadius, baseY);
    ctx.lineTo(centerX + doorRadius, centerY + doorRadius);
    ctx.lineTo(centerX - doorRadius, centerY + doorRadius);
    ctx.closePath();
    ctx.fill();
    
    // Sun/radiation glow in sky
    const sunGrad = ctx.createRadialGradient(
      centerX + doorRadius * 0.3, centerY - doorRadius * 0.3, 0,
      centerX + doorRadius * 0.3, centerY - doorRadius * 0.3, doorRadius * 0.5
    );
    sunGrad.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    sunGrad.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();

    // === VAULT DOOR FRAME ===
    // Thick metallic door frame
    ctx.strokeStyle = 'rgba(60, 70, 80, 0.9)';
    ctx.lineWidth = doorRadius * 0.15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, doorRadius + doorRadius * 0.07, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner door edge - metallic highlight
    ctx.strokeStyle = 'rgba(100, 110, 120, 0.6)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, doorRadius - 4, 0, Math.PI * 2);
    ctx.stroke();
    
    // Vault door gear teeth around edge
    const teethCount = 24;
    ctx.fillStyle = 'rgba(70, 80, 90, 0.8)';
    for (let i = 0; i < teethCount; i++) {
      const angle = (i / teethCount) * Math.PI * 2;
      const toothX = centerX + Math.cos(angle) * (doorRadius + doorRadius * 0.12);
      const toothY = centerY + Math.sin(angle) * (doorRadius + doorRadius * 0.12);
      ctx.save();
      ctx.translate(toothX, toothY);
      ctx.rotate(angle);
      ctx.fillRect(-8, -12, 16, 24);
      ctx.restore();
    }
    
    // Vault number on door frame (subtle)
    ctx.save();
    ctx.font = `bold ${doorRadius * 0.15}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${pipAmber.r}, ${pipAmber.g}, ${pipAmber.b}, ${0.4 * this.lightFlicker})`;
    ctx.shadowColor = `rgba(${pipAmber.r}, ${pipAmber.g}, ${pipAmber.b}, 0.5)`;
    ctx.shadowBlur = 10;
    ctx.fillText('111', centerX, centerY - doorRadius - doorRadius * 0.18);
    ctx.restore();

    // === VAULT INTERIOR ELEMENTS ===
    // Dark vault walls around the door
    const wallGrad = ctx.createRadialGradient(centerX, centerY, doorRadius * 1.2, centerX, centerY, canvas.width);
    wallGrad.addColorStop(0, 'rgba(30, 35, 40, 0.7)');
    wallGrad.addColorStop(0.5, 'rgba(20, 25, 30, 0.85)');
    wallGrad.addColorStop(1, 'rgba(15, 18, 22, 0.95)');
    
    // Create a mask for the walls (outside the door)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.arc(centerX, centerY, doorRadius + doorRadius * 0.15, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Pip-Boy terminal glow (bottom left corner)
    const termX = canvas.width * 0.12;
    const termY = canvas.height * 0.75;
    const termGrad = ctx.createRadialGradient(termX, termY, 0, termX, termY, 150);
    termGrad.addColorStop(0, `rgba(${pipGreen.r}, ${pipGreen.g}, ${pipGreen.b}, ${0.15 * this.lightFlicker})`);
    termGrad.addColorStop(0.5, `rgba(${pipGreen.r}, ${pipGreen.g}, ${pipGreen.b}, ${0.05 * this.lightFlicker})`);
    termGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = termGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Emergency light glow (top corners)
    const emergencyAlpha = 0.1 + Math.sin(time * 2) * 0.05;
    [[canvas.width * 0.1, canvas.height * 0.1], [canvas.width * 0.9, canvas.height * 0.1]].forEach(([lx, ly]) => {
      const lightGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 100);
      lightGrad.addColorStop(0, `rgba(${pipAmber.r}, ${pipAmber.g}, 0, ${emergencyAlpha})`);
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // === DUST PARTICLES ===
    this.dustParticles.forEach(p => {
      p.y -= p.speed;
      p.x += Math.sin(time + p.y * 0.01) * 0.3;
      
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 160, 140, ${p.alpha * this.lightFlicker})`;
      ctx.fill();
    });

    // === CRT SCANLINES ===
    ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
    for (let y = 0; y < canvas.height; y += 2) {
      ctx.fillRect(0, y, canvas.width, 1);
    }

    // === VIGNETTE ===
    const vignette = ctx.createRadialGradient(
      centerX, centerY, doorRadius * 0.8,
      centerX, centerY, canvas.width * 0.8
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
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
