// Historical Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// ANCIENT ROME - Marble pillars, blue sky, and sun rays
// ═══════════════════════════════════════════════════════════════════════════
export class AncientRomeRenderer extends BaseRenderer {
  pillars: Array<{ x: number; height: number; width: number }> = [];
  birds: Array<{ x: number; y: number; vx: number; wingPhase: number }> = [];
  dustMotes: Array<{ x: number; y: number; size: number; alpha: number; phase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Marble pillars at edges
    const pillarPositions = [0.02, 0.08, 0.88, 0.94];
    pillarPositions.forEach(pos => {
      this.pillars.push({
        x: pos * canvas.width,
        height: canvas.height * (0.6 + Math.random() * 0.3),
        width: 30 + Math.random() * 20
      });
    });

    // Birds in sky
    for (let i = 0; i < 6; i++) {
      this.birds.push({
        x: Math.random() * canvas.width,
        y: canvas.height * (0.1 + Math.random() * 0.25),
        vx: 0.5 + Math.random() * 1,
        wingPhase: Math.random() * Math.PI * 2
      });
    }

    // Floating dust motes
    for (let i = 0; i < 40; i++) {
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

    // Blue sky gradient at top
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
    skyGrad.addColorStop(0, `rgba(120, 180, 230, 0.15)`);
    skyGrad.addColorStop(0.5, `rgba(160, 200, 240, 0.08)`);
    skyGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun with rays
    const sunX = canvas.width * 0.7;
    const sunY = canvas.height * 0.12;
    
    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 180);
    sunGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 150, 0.35)`);
    sunGlow.addColorStop(0.4, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, 0.12)`);
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Sun disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 180, 0.5)`;
    ctx.fill();

    // Sun rays (god rays effect)
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.05;
      const rayLength = 200 + Math.sin(time * 2 + i) * 50;
      
      const rayGrad = ctx.createLinearGradient(
        sunX, sunY,
        sunX + Math.cos(angle) * rayLength,
        sunY + Math.sin(angle) * rayLength
      );
      rayGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 150, 0.12)`);
      rayGrad.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = 15 + Math.sin(time + i * 0.5) * 5;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(
        sunX + Math.cos(angle) * rayLength,
        sunY + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }
    ctx.restore();

    // Marble pillars
    this.pillars.forEach(pillar => {
      // Pillar shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(pillar.x + 5, canvas.height - pillar.height, pillar.width * 0.3, pillar.height);

      // Pillar body
      const pillarGrad = ctx.createLinearGradient(pillar.x, 0, pillar.x + pillar.width, 0);
      pillarGrad.addColorStop(0, 'rgba(220, 215, 200, 0.25)');
      pillarGrad.addColorStop(0.3, 'rgba(245, 240, 230, 0.3)');
      pillarGrad.addColorStop(0.7, 'rgba(240, 235, 225, 0.28)');
      pillarGrad.addColorStop(1, 'rgba(200, 195, 185, 0.2)');
      
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(pillar.x, canvas.height - pillar.height, pillar.width, pillar.height);

      // Pillar fluting (vertical grooves)
      ctx.strokeStyle = 'rgba(180, 175, 165, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const grooveX = pillar.x + (pillar.width / 5) * (i + 1);
        ctx.beginPath();
        ctx.moveTo(grooveX, canvas.height - pillar.height + 20);
        ctx.lineTo(grooveX, canvas.height - 10);
        ctx.stroke();
      }

      // Capital (top decoration)
      ctx.fillStyle = 'rgba(230, 225, 215, 0.3)';
      ctx.fillRect(pillar.x - 5, canvas.height - pillar.height, pillar.width + 10, 15);
      ctx.fillRect(pillar.x - 8, canvas.height - pillar.height - 5, pillar.width + 16, 8);

      // Base
      ctx.fillRect(pillar.x - 5, canvas.height - 15, pillar.width + 10, 15);
    });

    // Flying birds
    this.birds.forEach(bird => {
      bird.wingPhase += 0.2;
      bird.x += bird.vx;
      bird.y += Math.sin(time + bird.x * 0.01) * 0.3;

      if (bird.x > canvas.width + 30) {
        bird.x = -30;
        bird.y = canvas.height * (0.1 + Math.random() * 0.25);
      }

      const wingFlap = Math.sin(bird.wingPhase) * 0.6;

      ctx.save();
      ctx.translate(bird.x, bird.y);
      
      // Simple bird silhouette
      ctx.strokeStyle = 'rgba(40, 40, 50, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Left wing
      ctx.moveTo(-12, 0);
      ctx.quadraticCurveTo(-6, -8 * wingFlap, 0, 0);
      // Right wing
      ctx.quadraticCurveTo(6, -8 * wingFlap, 12, 0);
      ctx.stroke();
      
      ctx.restore();
    });

    // Floating dust motes in sunlight
    this.dustMotes.forEach(dust => {
      dust.phase += 0.015;
      dust.x += Math.sin(dust.phase) * 0.4;
      dust.y += Math.cos(dust.phase * 0.7) * 0.2 - 0.1;

      if (dust.y < -10) {
        dust.y = canvas.height + 10;
        dust.x = Math.random() * canvas.width;
      }

      const glow = ctx.createRadialGradient(dust.x, dust.y, 0, dust.x, dust.y, dust.size * 4);
      glow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 180, ${dust.alpha})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, dust.size * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANCIENT EGYPT - Pyramid silhouette with desert sun
// ═══════════════════════════════════════════════════════════════════════════
export class AncientEgyptRenderer extends BaseRenderer {
  sandParticles: Array<{ x: number; y: number; size: number; speed: number }> = [];
  heatWaveOffset = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 50; i++) {
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

    // Golden desert sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 150, 0.12)`);
    skyGrad.addColorStop(0.4, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.8}, 100, 0.08)`);
    skyGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scorching sun
    const sunX = canvas.width * 0.75;
    const sunY = canvas.height * 0.15;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 200);
    sunGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 120, 0.4)`);
    sunGlow.addColorStop(0.3, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.8}, 80, 0.15)`);
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
    ctx.fill();

    // Sun disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 180, 0.55)`;
    ctx.fill();

    // Pyramid silhouette
    const pyramidBaseY = canvas.height * 0.85;
    const pyramidHeight = canvas.height * 0.45;
    const pyramidWidth = canvas.width * 0.35;
    const pyramidX = canvas.width * 0.35;

    // Main pyramid
    ctx.beginPath();
    ctx.moveTo(pyramidX, pyramidBaseY);
    ctx.lineTo(pyramidX + pyramidWidth / 2, pyramidBaseY - pyramidHeight);
    ctx.lineTo(pyramidX + pyramidWidth, pyramidBaseY);
    ctx.closePath();
    
    const pyramidGrad = ctx.createLinearGradient(pyramidX, pyramidBaseY, pyramidX + pyramidWidth, pyramidBaseY - pyramidHeight);
    pyramidGrad.addColorStop(0, `rgba(${primaryRgb[0] * 0.6}, ${primaryRgb[1] * 0.5}, 60, 0.35)`);
    pyramidGrad.addColorStop(0.5, `rgba(${primaryRgb[0] * 0.8}, ${primaryRgb[1] * 0.7}, 80, 0.3)`);
    pyramidGrad.addColorStop(1, `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.4}, 40, 0.4)`);
    ctx.fillStyle = pyramidGrad;
    ctx.fill();

    // Pyramid edge highlight
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 150, 0.2)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pyramidX + pyramidWidth / 2, pyramidBaseY - pyramidHeight);
    ctx.lineTo(pyramidX + pyramidWidth, pyramidBaseY);
    ctx.stroke();

    // Smaller pyramid in distance
    const pyramid2X = canvas.width * 0.7;
    const pyramid2Height = pyramidHeight * 0.5;
    const pyramid2Width = pyramidWidth * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(pyramid2X, pyramidBaseY);
    ctx.lineTo(pyramid2X + pyramid2Width / 2, pyramidBaseY - pyramid2Height);
    ctx.lineTo(pyramid2X + pyramid2Width, pyramidBaseY);
    ctx.closePath();
    ctx.fillStyle = `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.4}, 50, 0.2)`;
    ctx.fill();

    // Heat shimmer effect
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let y = canvas.height * 0.6; y < canvas.height; y += 25) {
      const wave = Math.sin(y * 0.02 + this.heatWaveOffset) * 8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= canvas.width; x += 20) {
        const distort = Math.sin(x * 0.02 + y * 0.01 + this.heatWaveOffset) * 4;
        ctx.lineTo(x, y + distort);
      }
      ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 100, 0.4)`;
      ctx.lineWidth = 15;
      ctx.stroke();
    }
    ctx.restore();

    // Sand desert at bottom
    const sandGrad = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    sandGrad.addColorStop(0, 'transparent');
    sandGrad.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.8}, 100, 0.1)`);
    sandGrad.addColorStop(1, `rgba(${primaryRgb[0] * 0.8}, ${primaryRgb[1] * 0.7}, 80, 0.15)`);
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    // Blowing sand
    this.sandParticles.forEach(sand => {
      sand.x += sand.speed;
      sand.y += Math.sin(time * 3 + sand.x * 0.01) * 0.4;

      if (sand.x > canvas.width + 10) {
        sand.x = -10;
        sand.y = canvas.height * 0.6 + Math.random() * canvas.height * 0.4;
      }

      ctx.beginPath();
      ctx.arc(sand.x, sand.y, sand.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.8}, 100, 0.3)`;
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIEVAL CASTLE - Stone walls with torchlight
// ═══════════════════════════════════════════════════════════════════════════
export class MedievalCastleRenderer extends BaseRenderer {
  torches: Array<{
    x: number; y: number;
    flickerPhase: number;
    flickerSpeed: number;
  }> = [];
  embers: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Torches on sides
    const torchPositions = [
      { x: 0.05, y: 0.3 }, { x: 0.05, y: 0.65 },
      { x: 0.95, y: 0.35 }, { x: 0.95, y: 0.7 }
    ];

    torchPositions.forEach(pos => {
      this.torches.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.1 + Math.random() * 0.05
      });
    });
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Stone wall texture overlay
    const stoneGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    stoneGrad.addColorStop(0, 'rgba(60, 55, 50, 0.05)');
    stoneGrad.addColorStop(1, 'rgba(40, 35, 30, 0.12)');
    ctx.fillStyle = stoneGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render torches
    this.torches.forEach(torch => {
      torch.flickerPhase += torch.flickerSpeed;
      const flicker = 0.6 + Math.sin(torch.flickerPhase) * 0.2 +
                      Math.sin(torch.flickerPhase * 2.3) * 0.15 +
                      Math.random() * 0.05;

      // Torch glow
      const glow = ctx.createRadialGradient(
        torch.x, torch.y, 0,
        torch.x, torch.y, 180
      );
      glow.addColorStop(0, `rgba(255, 150, 50, ${0.15 * flicker})`);
      glow.addColorStop(0.4, `rgba(255, 100, 30, ${0.06 * flicker})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Torch bracket
      ctx.fillStyle = 'rgba(60, 50, 40, 0.4)';
      ctx.fillRect(torch.x - 3, torch.y, 6, 30);

      // Flame
      const flameHeight = 25 * flicker;
      const flameGrad = ctx.createLinearGradient(torch.x, torch.y, torch.x, torch.y - flameHeight);
      flameGrad.addColorStop(0, 'rgba(255, 200, 80, 0.8)');
      flameGrad.addColorStop(0.5, 'rgba(255, 140, 40, 0.6)');
      flameGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');

      ctx.beginPath();
      ctx.moveTo(torch.x, torch.y);
      ctx.quadraticCurveTo(torch.x - 10, torch.y - flameHeight * 0.5, torch.x, torch.y - flameHeight);
      ctx.quadraticCurveTo(torch.x + 10, torch.y - flameHeight * 0.5, torch.x, torch.y);
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Spawn embers
      if (Math.random() > 0.9) {
        this.embers.push({
          x: torch.x,
          y: torch.y - flameHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: -1 - Math.random() * 2,
          life: 60 + Math.random() * 40
        });
      }
    });

    // Render embers
    this.embers = this.embers.filter(ember => {
      ember.x += ember.vx;
      ember.y += ember.vy;
      ember.life--;

      const lifeRatio = ember.life / 100;

      if (lifeRatio > 0) {
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, 2 * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 80, ${lifeRatio})`;
        ctx.fill();
      }

      return ember.life > 0;
    });

    // Stone archway hint
    ctx.strokeStyle = 'rgba(80, 75, 70, 0.08)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height + 100, canvas.width * 0.35, Math.PI, 0);
    ctx.stroke();

    // Heavy vignette for dungeon feel
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
