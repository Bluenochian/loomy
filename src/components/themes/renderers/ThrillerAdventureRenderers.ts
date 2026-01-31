// Thriller, Mystery, Adventure, Historical Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// NOIR CITY - Heavy rain and venetian shadows
// ═══════════════════════════════════════════════════════════════════════════
export class NoirCityRenderer extends BaseRenderer {
  raindrops: Array<{ x: number; y: number; length: number; speed: number }> = [];
  blindsShadow: Array<{ y: number; width: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 400; i++) {
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 15 + Math.random() * 25,
        speed: 15 + Math.random() * 10
      });
    }

    // Venetian blind shadows
    for (let y = 0; y < canvas.height; y += 40) {
      this.blindsShadow.push({
        y,
        width: 20 + Math.random() * 10
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Venetian blind shadows (diagonal)
    ctx.save();
    ctx.rotate(-0.3);
    this.blindsShadow.forEach((blind, i) => {
      const offset = Math.sin(time * 0.5) * 5;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.sin(time + i) * 0.05})`;
      ctx.fillRect(-50, blind.y + offset, canvas.width + 100, blind.width);
    });
    ctx.restore();

    // Heavy rain
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      drop.x -= drop.speed * 0.2;

      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width + canvas.width * 0.2;
      }

      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.length * 0.2, drop.y + drop.length);
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Smoke wisps
    const smokeX = canvas.width * 0.8;
    const smokeY = canvas.height * 0.6;
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time * 2 + i) * 20;
      const smokeGrad = ctx.createRadialGradient(
        smokeX + offset, smokeY - i * 30, 0,
        smokeX + offset, smokeY - i * 30, 40 + i * 20
      );
      smokeGrad.addColorStop(0, `rgba(150, 150, 150, ${0.08 - i * 0.02})`);
      smokeGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(smokeX + offset, smokeY - i * 30, 40 + i * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Film grain
    const imageData = ctx.createImageData(canvas.width / 4, canvas.height / 4);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 30;
      imageData.data[i] = noise;
      imageData.data[i + 1] = noise;
      imageData.data[i + 2] = noise;
      imageData.data[i + 3] = 15;
    }
    ctx.save();
    ctx.scale(4, 4);
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEIST VAULT - Laser grids and gold reflections
// ═══════════════════════════════════════════════════════════════════════════
export class HeistVaultRenderer extends BaseRenderer {
  laserBeams: Array<{ x1: number; y1: number; x2: number; y2: number; phase: number }> = [];
  goldSparkles: Array<{ x: number; y: number; phase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Diagonal laser grid
    for (let i = 0; i < 8; i++) {
      this.laserBeams.push({
        x1: Math.random() * canvas.width * 0.3,
        y1: 0,
        x2: canvas.width * 0.3 + Math.random() * canvas.width * 0.7,
        y2: canvas.height,
        phase: Math.random() * Math.PI * 2
      });
      this.laserBeams.push({
        x1: 0,
        y1: Math.random() * canvas.height,
        x2: canvas.width,
        y2: Math.random() * canvas.height,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 30; i++) {
      this.goldSparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Gold ambient from vault
    const goldGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 0.6, 0,
      canvas.width / 2, canvas.height * 0.6, canvas.width * 0.5
    );
    goldGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 50, 0.1)`);
    goldGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Laser beams
    this.laserBeams.forEach(laser => {
      laser.phase += 0.02;
      const intensity = 0.5 + Math.sin(laser.phase) * 0.3;
      
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(laser.x2, laser.y2);
      ctx.strokeStyle = `rgba(${accentRgb[0]}, 0, 0, ${0.3 * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Laser glow
      ctx.strokeStyle = `rgba(${accentRgb[0]}, 50, 50, ${0.1 * intensity})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    // Gold sparkles
    this.goldSparkles.forEach(sparkle => {
      sparkle.phase += 0.05;
      const brightness = Math.max(0, Math.sin(sparkle.phase));
      
      if (brightness > 0.7) {
        ctx.beginPath();
        ctx.arc(sparkle.x, sparkle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, ${brightness})`;
        ctx.fill();

        // Star sparkle
        ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, ${brightness * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(sparkle.x - 5, sparkle.y);
        ctx.lineTo(sparkle.x + 5, sparkle.y);
        ctx.moveTo(sparkle.x, sparkle.y - 5);
        ctx.lineTo(sparkle.x, sparkle.y + 5);
        ctx.stroke();
      }
    });

    // Alarm pulse
    const alarmPulse = Math.sin(time * 4);
    if (alarmPulse > 0.8) {
      ctx.fillStyle = `rgba(${accentRgb[0]}, 0, 0, ${(alarmPulse - 0.8) * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPY TECH - Radar sweeps and encrypted data
// ═══════════════════════════════════════════════════════════════════════════
export class SpyTechRenderer extends BaseRenderer {
  radarAngle = 0;
  dataChars: Array<{ x: number; y: number; char: string; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    const chars = 'ABCDEF0123456789█▓▒░';
    for (let i = 0; i < 100; i++) {
      this.dataChars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: chars[Math.floor(Math.random() * chars.length)],
        alpha: 0
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    this.radarAngle += 0.02;

    // Radar sweep
    const radarX = canvas.width * 0.5;
    const radarY = canvas.height * 0.5;
    const radarRadius = Math.min(canvas.width, canvas.height) * 0.35;

    // Radar circles
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.15)`;
    ctx.lineWidth = 1;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(radarX, radarY, radarRadius * (r / 3), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(radarX - radarRadius, radarY);
    ctx.lineTo(radarX + radarRadius, radarY);
    ctx.moveTo(radarX, radarY - radarRadius);
    ctx.lineTo(radarX, radarY + radarRadius);
    ctx.stroke();

    // Radar sweep
    ctx.save();
    ctx.translate(radarX, radarY);
    ctx.rotate(this.radarAngle);
    
    const sweepGrad = ctx.createLinearGradient(0, 0, radarRadius, 0);
    sweepGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.3)`);
    sweepGrad.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius, -0.3, 0);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    
    // Sweep line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radarRadius, 0);
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Encrypted data characters
    ctx.font = '10px monospace';
    this.dataChars.forEach(dc => {
      // Characters reveal when radar passes over them
      const charAngle = Math.atan2(dc.y - radarY, dc.x - radarX);
      const normalizedCharAngle = (charAngle + Math.PI * 2) % (Math.PI * 2);
      const normalizedRadarAngle = (this.radarAngle + Math.PI * 2) % (Math.PI * 2);
      const angleDiff = Math.abs(normalizedCharAngle - normalizedRadarAngle);
      
      if (angleDiff < 0.3 || angleDiff > Math.PI * 2 - 0.3) {
        dc.alpha = 0.6;
      } else {
        dc.alpha *= 0.95;
      }

      if (dc.alpha > 0.05) {
        ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${dc.alpha})`;
        ctx.fillText(dc.char, dc.x, dc.y);
      }

      // Occasionally change character
      if (Math.random() > 0.99) {
        const chars = 'ABCDEF0123456789█▓▒░';
        dc.char = chars[Math.floor(Math.random() * chars.length)];
      }
    });

    // Scanlines
    ctx.fillStyle = `rgba(0, 0, 0, 0.02)`;
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MYSTERY LIBRARY - Floating pages and dust
// ═══════════════════════════════════════════════════════════════════════════
export class MysteryLibraryRenderer extends BaseRenderer {
  pages: Array<{ x: number; y: number; rotation: number; rotSpeed: number; vx: number; vy: number }> = [];
  dustMotes: Array<{ x: number; y: number; size: number; alpha: number; phase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 12; i++) {
      this.pages.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.3
      });
    }

    for (let i = 0; i < 50; i++) {
      this.dustMotes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Warm lamp light from corner
    const lampGlow = ctx.createRadialGradient(
      canvas.width * 0.85, canvas.height * 0.15, 0,
      canvas.width * 0.85, canvas.height * 0.15, 300
    );
    lampGlow.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, 100, 0.15)`);
    lampGlow.addColorStop(0.5, `rgba(${accentRgb[0]}, ${accentRgb[1]}, 80, 0.05)`);
    lampGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, canvas.height * 0.15, 300, 0, Math.PI * 2);
    ctx.fill();

    // Candle flicker
    const flickerIntensity = 0.8 + Math.sin(time * 8) * 0.1 + Math.sin(time * 13) * 0.1;
    const candleGlow = ctx.createRadialGradient(
      canvas.width * 0.85, canvas.height * 0.15, 0,
      canvas.width * 0.85, canvas.height * 0.15, 100
    );
    candleGlow.addColorStop(0, `rgba(255, 200, 100, ${0.3 * flickerIntensity})`);
    candleGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = candleGlow;
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, canvas.height * 0.15, 100, 0, Math.PI * 2);
    ctx.fill();

    // Dust motes
    this.dustMotes.forEach(dust => {
      dust.phase += 0.015;
      dust.x += Math.sin(dust.phase) * 0.3;
      dust.y += Math.cos(dust.phase * 0.7) * 0.2;

      const glow = ctx.createRadialGradient(dust.x, dust.y, 0, dust.x, dust.y, dust.size * 3);
      glow.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, 150, ${dust.alpha})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, dust.size * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Floating pages
    this.pages.forEach(page => {
      page.rotation += page.rotSpeed;
      page.x += page.vx;
      page.y += page.vy;

      if (page.y < -50) {
        page.y = canvas.height + 50;
        page.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(page.x, page.y);
      ctx.rotate(page.rotation);

      // Page with perspective
      ctx.fillStyle = `rgba(240, 235, 220, 0.15)`;
      ctx.fillRect(-15, -20, 30, 40);
      
      // Text lines on page
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.2)`;
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(-12, -15 + i * 8, 20 + Math.random() * 4, 2);
      }

      ctx.restore();
    });

    // Dark vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DESERT EXPANSE - Heat shimmer and sand
// ═══════════════════════════════════════════════════════════════════════════
export class DesertExpanseRenderer extends BaseRenderer {
  sandParticles: Array<{ x: number; y: number; size: number; speed: number }> = [];
  heatWaveOffset = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 60; i++) {
      this.sandParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 2,
        speed: 1 + Math.random() * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    this.heatWaveOffset += 0.03;

    // Scorching sun
    const sunX = canvas.width * 0.75;
    const sunY = canvas.height * 0.12;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 200);
    sunGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 150, 0.4)`);
    sunGlow.addColorStop(0.3, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, 0.15)`);
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
    ctx.fill();

    // Sun disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 200, 0.6)`;
    ctx.fill();

    // Heat shimmer effect (distortion waves)
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let y = canvas.height * 0.5; y < canvas.height; y += 30) {
      const wave = Math.sin(y * 0.02 + this.heatWaveOffset) * 10;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= canvas.width; x += 20) {
        const distort = Math.sin(x * 0.02 + y * 0.01 + this.heatWaveOffset) * 5;
        ctx.lineTo(x, y + distort);
      }
      ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, 0.3)`;
      ctx.lineWidth = 20;
      ctx.stroke();
    }
    ctx.restore();

    // Blowing sand
    this.sandParticles.forEach(sand => {
      sand.x += sand.speed;
      sand.y += Math.sin(time + sand.x * 0.01) * 0.5;

      if (sand.x > canvas.width + 10) {
        sand.x = -10;
        sand.y = Math.random() * canvas.height;
      }

      ctx.beginPath();
      ctx.arc(sand.x, sand.y, sand.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.8}, 100, 0.4)`;
      ctx.fill();
    });

    // Sand dune gradient at bottom
    const duneGrad = ctx.createLinearGradient(0, canvas.height - 150, 0, canvas.height);
    duneGrad.addColorStop(0, 'transparent');
    duneGrad.addColorStop(1, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.7}, 80, 0.2)`);
    ctx.fillStyle = duneGrad;
    ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// OCEAN VOYAGE - Waves and seagulls
// ═══════════════════════════════════════════════════════════════════════════
export class OceanVoyageRenderer extends BaseRenderer {
  waves: Array<{ y: number; amplitude: number; frequency: number; phase: number }> = [];
  seagulls: Array<{ x: number; y: number; wingPhase: number; speed: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 5; i++) {
      this.waves.push({
        y: canvas.height * (0.6 + i * 0.08),
        amplitude: 10 + i * 5,
        frequency: 0.02 - i * 0.003,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 5; i++) {
      this.seagulls.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.2 + Math.random() * canvas.height * 0.2,
        wingPhase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
    skyGrad.addColorStop(0, `rgba(${primaryRgb[0] * 0.8}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`);
    skyGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

    // Animated waves
    this.waves.forEach((wave, i) => {
      wave.phase += 0.02;
      
      ctx.beginPath();
      ctx.moveTo(0, wave.y);
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${0.1 - i * 0.015})`;
      ctx.fill();
    });

    // Wave foam highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    this.waves.slice(0, 2).forEach(wave => {
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = wave.y + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Seagulls
    this.seagulls.forEach(gull => {
      gull.wingPhase += 0.15;
      gull.x += gull.speed;
      gull.y += Math.sin(gull.x * 0.01) * 0.3;

      if (gull.x > canvas.width + 30) {
        gull.x = -30;
        gull.y = canvas.height * 0.2 + Math.random() * canvas.height * 0.2;
      }

      const wingUp = Math.sin(gull.wingPhase) * 8;
      
      ctx.save();
      ctx.translate(gull.x, gull.y);
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      // Wings
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.quadraticCurveTo(-6, wingUp, 0, 0);
      ctx.quadraticCurveTo(6, wingUp, 12, 0);
      ctx.stroke();
      
      ctx.restore();
    });

    // Compass rose hint in corner
    ctx.save();
    ctx.translate(canvas.width - 60, canvas.height - 60);
    ctx.rotate(time * 0.02);
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.15)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, 25);
    ctx.moveTo(-25, 0);
    ctx.lineTo(25, 0);
    ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-5, 0);
      ctx.lineTo(0, -10);
      ctx.lineTo(5, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`;
      ctx.fill();
    }
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOUNTAIN PEAK - Majestic mountains with snow and eagles
// ═══════════════════════════════════════════════════════════════════════════
export class MountainPeakRenderer extends BaseRenderer {
  snowflakes: Array<{ x: number; y: number; size: number; speed: number; drift: number }> = [];
  eagles: Array<{ x: number; y: number; wingPhase: number; size: number; speed: number }> = [];
  mountains: Array<{ points: Array<{ x: number; y: number }>; layer: number }> = [];
  windStreaks: Array<{ x: number; y: number; length: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Create mountain silhouettes - multiple layers for depth
    // Back layer - distant mountains
    this.mountains.push({
      layer: 0,
      points: this.generateMountainRange(canvas, 0.55, 0.75, 0.15)
    });
    
    // Middle layer
    this.mountains.push({
      layer: 1,
      points: this.generateMountainRange(canvas, 0.6, 0.85, 0.25)
    });
    
    // Front layer - closest mountains
    this.mountains.push({
      layer: 2,
      points: this.generateMountainRange(canvas, 0.68, 1.0, 0.35)
    });

    // Snowflakes
    for (let i = 0; i < 80; i++) {
      this.snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5,
        drift: (Math.random() - 0.5) * 0.5
      });
    }

    // Eagles soaring
    for (let i = 0; i < 3; i++) {
      this.eagles.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.15 + Math.random() * canvas.height * 0.25,
        wingPhase: Math.random() * Math.PI * 2,
        size: 15 + Math.random() * 10,
        speed: 0.3 + Math.random() * 0.5
      });
    }

    // Wind streaks
    for (let i = 0; i < 10; i++) {
      this.windStreaks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        length: 50 + Math.random() * 100,
        alpha: 0.05 + Math.random() * 0.1
      });
    }
  }

  generateMountainRange(canvas: HTMLCanvasElement, minHeight: number, maxHeight: number, jaggedness: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    let x = -50;
    
    while (x < canvas.width + 50) {
      // Create peaks and valleys
      const isPeak = Math.random() > 0.6;
      const heightPercent = isPeak 
        ? minHeight + Math.random() * (maxHeight - minHeight) * 0.4
        : minHeight + Math.random() * (maxHeight - minHeight);
      
      const y = canvas.height * (1 - heightPercent);
      points.push({ x, y });
      
      // Add sub-peaks for jagged look
      if (isPeak && jaggedness > 0.2) {
        const peakX = x + 20 + Math.random() * 40;
        const peakY = y - (20 + Math.random() * 60) * jaggedness;
        points.push({ x: peakX, y: peakY });
      }
      
      x += 40 + Math.random() * 80;
    }
    
    return points;
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Sky gradient - cold blue
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGrad.addColorStop(0, `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.6}, ${primaryRgb[2]}, 0.15)`);
    skyGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // Draw mountains back to front
    this.mountains.forEach((mountain, layerIndex) => {
      const layerAlpha = 0.15 + layerIndex * 0.15;
      const layerBrightness = 60 - layerIndex * 15;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      mountain.points.forEach((point, i) => {
        if (i === 0) {
          ctx.lineTo(point.x, point.y);
        } else {
          // Smooth curves between points
          const prevPoint = mountain.points[i - 1];
          const cpX = (prevPoint.x + point.x) / 2;
          const cpY = Math.min(prevPoint.y, point.y) - 10;
          ctx.quadraticCurveTo(cpX, cpY, point.x, point.y);
        }
      });
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      
      // Mountain fill with gradient
      const mountainGrad = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height);
      mountainGrad.addColorStop(0, `rgba(${layerBrightness + 40}, ${layerBrightness + 50}, ${layerBrightness + 70}, ${layerAlpha})`);
      mountainGrad.addColorStop(0.3, `rgba(${layerBrightness + 20}, ${layerBrightness + 30}, ${layerBrightness + 50}, ${layerAlpha})`);
      mountainGrad.addColorStop(1, `rgba(${layerBrightness}, ${layerBrightness + 10}, ${layerBrightness + 30}, ${layerAlpha})`);
      ctx.fillStyle = mountainGrad;
      ctx.fill();

      // Snow caps on peaks (front layer only)
      if (layerIndex === 2) {
        mountain.points.forEach((point, i) => {
          if (i > 0 && i < mountain.points.length - 1) {
            const prevPoint = mountain.points[i - 1];
            const nextPoint = mountain.points[i + 1];
            // Check if this is a peak (lower y = higher on screen)
            if (point.y < prevPoint.y && point.y < nextPoint.y) {
              // Draw snow cap
              ctx.beginPath();
              ctx.moveTo(point.x - 25, point.y + 30);
              ctx.lineTo(point.x, point.y);
              ctx.lineTo(point.x + 25, point.y + 35);
              ctx.closePath();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.fill();
            }
          }
        });
      }
    });

    // Wind streaks
    this.windStreaks.forEach(streak => {
      streak.x += 2;
      if (streak.x > canvas.width + streak.length) {
        streak.x = -streak.length;
        streak.y = Math.random() * canvas.height * 0.4;
      }

      const grad = ctx.createLinearGradient(streak.x, streak.y, streak.x + streak.length, streak.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${streak.alpha})`);
      grad.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x + streak.length, streak.y);
      ctx.stroke();
    });

    // Snowflakes
    this.snowflakes.forEach(snow => {
      snow.y += snow.speed;
      snow.x += snow.drift + Math.sin(time + snow.y * 0.01) * 0.3;

      if (snow.y > canvas.height + 10) {
        snow.y = -10;
        snow.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + snow.size * 0.1})`;
      ctx.fill();
    });

    // Soaring eagles
    this.eagles.forEach(eagle => {
      eagle.wingPhase += 0.03;
      eagle.x += eagle.speed;
      eagle.y += Math.sin(time * 0.5 + eagle.x * 0.005) * 0.5;

      if (eagle.x > canvas.width + 50) {
        eagle.x = -50;
        eagle.y = canvas.height * 0.15 + Math.random() * canvas.height * 0.25;
      }

      const wingUp = Math.sin(eagle.wingPhase) * eagle.size * 0.4;
      
      ctx.save();
      ctx.translate(eagle.x, eagle.y);
      ctx.strokeStyle = 'rgba(40, 35, 30, 0.6)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      // Eagle wings - V shape
      ctx.beginPath();
      ctx.moveTo(-eagle.size, wingUp);
      ctx.quadraticCurveTo(-eagle.size * 0.3, wingUp * 0.5, 0, 0);
      ctx.quadraticCurveTo(eagle.size * 0.3, wingUp * 0.5, eagle.size, wingUp);
      ctx.stroke();
      
      ctx.restore();
    });

    // Atmospheric fog at base
    const fogGrad = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    fogGrad.addColorStop(0, 'transparent');
    fogGrad.addColorStop(1, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.15)`);
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIKING NORSE - Aurora and runes
// ═══════════════════════════════════════════════════════════════════════════
export class VikingNorseRenderer extends BaseRenderer {
  auroraWaves: Array<{ y: number; amplitude: number; phase: number; hue: number }> = [];
  snowflakes: Array<{ x: number; y: number; size: number; speed: number }> = [];
  runes: Array<{ x: number; y: number; char: string; alpha: number; phase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 4; i++) {
      this.auroraWaves.push({
        y: canvas.height * (0.15 + i * 0.1),
        amplitude: 30 + i * 10,
        phase: Math.random() * Math.PI * 2,
        hue: 120 + i * 40
      });
    }

    for (let i = 0; i < 50; i++) {
      this.snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.8
      });
    }

    const runeChars = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    for (let i = 0; i < 15; i++) {
      this.runes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        char: runeChars[Math.floor(Math.random() * runeChars.length)],
        alpha: 0,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Aurora borealis
    this.auroraWaves.forEach(wave => {
      wave.phase += 0.01;
      
      ctx.beginPath();
      ctx.moveTo(0, wave.y);
      for (let x = 0; x <= canvas.width; x += 15) {
        const y = wave.y + Math.sin(x * 0.008 + wave.phase) * wave.amplitude +
                  Math.sin(x * 0.015 + wave.phase * 1.5) * wave.amplitude * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      
      const auroraGrad = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude * 2);
      auroraGrad.addColorStop(0, 'transparent');
      auroraGrad.addColorStop(0.5, `hsla(${wave.hue}, 70%, 50%, 0.08)`);
      auroraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auroraGrad;
      ctx.fill();
    });

    // Glowing runes
    this.runes.forEach(rune => {
      rune.phase += 0.01;
      rune.alpha = Math.max(0, Math.sin(rune.phase) * 0.4);

      if (rune.alpha > 0.05) {
        ctx.font = '24px serif';
        
        // Rune glow
        ctx.save();
        ctx.shadowColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${rune.alpha})`;
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${rune.alpha})`;
        ctx.fillText(rune.char, rune.x, rune.y);
        ctx.restore();
      }
    });

    // Snowfall
    this.snowflakes.forEach(flake => {
      flake.y += flake.speed;
      flake.x += Math.sin(time + flake.y * 0.01) * 0.3;

      if (flake.y > canvas.height + 10) {
        flake.y = -10;
        flake.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FEUDAL JAPAN - Sakura storm and katana glints
// ═══════════════════════════════════════════════════════════════════════════
export class FeudalJapanRenderer extends BaseRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number; rotSpeed: number;
    vx: number; vy: number;
    size: number;
  }> = [];
  katanaGlints: Array<{ x: number; y: number; angle: number; life: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 50; i++) {
      this.petals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        vx: 1 + Math.random() * 2,
        vy: 0.5 + Math.random() * 1,
        size: 5 + Math.random() * 8
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Soft pink ambient
    const pinkGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    );
    pinkGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.06)`);
    pinkGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sakura petal storm
    this.petals.forEach(petal => {
      petal.rotation += petal.rotSpeed;
      petal.x += petal.vx;
      petal.y += petal.vy + Math.sin(time * 2 + petal.x * 0.01) * 0.5;

      if (petal.x > canvas.width + 20) {
        petal.x = -20;
        petal.y = Math.random() * canvas.height;
      }
      if (petal.y > canvas.height + 20) {
        petal.y = -20;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.rotation);

      // Petal shape
      ctx.beginPath();
      ctx.moveTo(0, -petal.size / 2);
      ctx.quadraticCurveTo(petal.size / 2, 0, 0, petal.size / 2);
      ctx.quadraticCurveTo(-petal.size / 2, 0, 0, -petal.size / 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.6)`;
      ctx.fill();

      ctx.restore();
    });

    // Occasional katana glint
    if (Math.random() > 0.98) {
      this.katanaGlints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5 + canvas.height * 0.25,
        angle: Math.random() * Math.PI,
        life: 1
      });
    }

    this.katanaGlints = this.katanaGlints.filter(glint => {
      glint.life -= 0.03;

      if (glint.life > 0) {
        ctx.save();
        ctx.translate(glint.x, glint.y);
        ctx.rotate(glint.angle);
        
        const glintGrad = ctx.createLinearGradient(-100, 0, 100, 0);
        glintGrad.addColorStop(0, 'transparent');
        glintGrad.addColorStop(0.5, `rgba(255, 255, 255, ${glint.life * 0.8})`);
        glintGrad.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = glintGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-100, 0);
        ctx.lineTo(100, 0);
        ctx.stroke();
        
        ctx.restore();
      }

      return glint.life > 0;
    });

    // Temple gong ripples
    const gongPulse = Math.sin(time * 0.5);
    if (gongPulse > 0.95) {
      const ripple = ctx.createRadialGradient(
        canvas.width * 0.9, canvas.height * 0.8, 0,
        canvas.width * 0.9, canvas.height * 0.8, 100
      );
      ripple.addColorStop(0, 'transparent');
      ripple.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, ${(gongPulse - 0.95) * 4})`);
      ripple.addColorStop(1, 'transparent');
      ctx.fillStyle = ripple;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.9, canvas.height * 0.8, 100, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
