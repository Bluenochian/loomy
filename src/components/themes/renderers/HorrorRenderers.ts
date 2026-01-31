// Horror Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// GRIMOIRE - Flickering candles with blood drips and runes
// ═══════════════════════════════════════════════════════════════════════════
export class GrimoireRenderer extends BaseRenderer {
  candles: Array<{
    x: number; y: number;
    scale: number;
    flickerPhase: number;
    flickerSpeed: number;
    waxDrips: Array<{ y: number; speed: number; size: number }>;
  }> = [];
  bloodDrips: Array<{ x: number; y: number; speed: number; length: number }> = [];
  runes: Array<{ x: number; y: number; char: string; alpha: number; phase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    const positions = [
      { x: 0.05, y: 0.25, s: 0.8 }, { x: 0.08, y: 0.65, s: 0.7 },
      { x: 0.92, y: 0.2, s: 0.75 }, { x: 0.95, y: 0.6, s: 0.8 },
      { x: 0.12, y: 0.88, s: 0.65 }, { x: 0.88, y: 0.9, s: 0.6 }
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

    const runeChars = '᛭ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛉ⛧⛤☽☾✧⚝';
    for (let i = 0; i < 20; i++) {
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
    const { ctx, canvas, primaryRgb, time } = rc;

    // Dark vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render candles with realistic flames
    this.candles.forEach(candle => {
      candle.flickerPhase += candle.flickerSpeed;
      const flicker = 0.6 + Math.sin(candle.flickerPhase) * 0.2 + 
                      Math.sin(candle.flickerPhase * 2.7) * 0.15 +
                      Math.random() * 0.05;

      // Candle glow
      const glow = ctx.createRadialGradient(
        candle.x, candle.y - 20, 0,
        candle.x, candle.y - 20, 180 * candle.scale
      );
      glow.addColorStop(0, `rgba(255, 180, 80, ${0.15 * flicker * candle.scale})`);
      glow.addColorStop(0.4, `rgba(255, 120, 50, ${0.06 * flicker * candle.scale})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Candle body
      ctx.fillStyle = 'rgba(180, 160, 140, 0.3)';
      ctx.fillRect(candle.x - 6 * candle.scale, candle.y, 12 * candle.scale, 50 * candle.scale);

      // Flame
      ctx.save();
      ctx.translate(candle.x, candle.y - 10);
      const flameHeight = 20 * candle.scale * flicker;
      
      // Outer flame
      const flameGrad = ctx.createLinearGradient(0, 0, 0, -flameHeight);
      flameGrad.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
      flameGrad.addColorStop(0.5, 'rgba(255, 150, 50, 0.6)');
      flameGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-8 * candle.scale, -flameHeight * 0.5, 0, -flameHeight);
      ctx.quadraticCurveTo(8 * candle.scale, -flameHeight * 0.5, 0, 0);
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Inner flame (blue core)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-3 * candle.scale, -flameHeight * 0.3, 0, -flameHeight * 0.4);
      ctx.quadraticCurveTo(3 * candle.scale, -flameHeight * 0.3, 0, 0);
      ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
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
        ctx.fillStyle = 'rgba(200, 180, 150, 0.4)';
        ctx.fill();

        return drip.y < candle.y + 60 * candle.scale;
      });
    });

    // Blood drips from top
    if (Math.random() > 0.98) {
      this.bloodDrips.push({
        x: Math.random() * canvas.width,
        y: 0,
        speed: 1 + Math.random() * 2,
        length: 30 + Math.random() * 50
      });
    }

    this.bloodDrips = this.bloodDrips.filter(drip => {
      drip.y += drip.speed;
      
      const grad = ctx.createLinearGradient(drip.x, drip.y - drip.length, drip.x, drip.y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(${primaryRgb[0]}, 0, 0, 0.6)`);
      grad.addColorStop(1, `rgba(${primaryRgb[0]}, 0, 0, 0.8)`);
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(drip.x, drip.y - drip.length);
      ctx.lineTo(drip.x, drip.y);
      ctx.stroke();

      // Drop at end
      ctx.beginPath();
      ctx.arc(drip.x, drip.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, 0, 0, 0.8)`;
      ctx.fill();

      return drip.y < canvas.height + drip.length;
    });

    // Floating runes
    this.runes.forEach(rune => {
      rune.phase += 0.015;
      rune.alpha = Math.max(0, Math.sin(rune.phase)) * 0.25;
      rune.y -= 0.2;

      if (rune.y < -30) {
        rune.y = canvas.height + 30;
        rune.x = Math.random() * canvas.width;
      }

      if (rune.alpha > 0.02) {
        ctx.font = '22px serif';
        ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.3}, ${primaryRgb[2] * 0.3}, ${rune.alpha})`;
        ctx.fillText(rune.char, rune.x, rune.y);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GHOSTLY APPARITIONS - Pale mists with drifting ghosts
// ═══════════════════════════════════════════════════════════════════════════
export class GhostlyApparitionsRenderer extends BaseRenderer {
  ghosts: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    phase: number;
    phaseSpeed: number;
  }> = [];
  mistLayers: Array<{ y: number; speed: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 8; i++) {
      this.ghosts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        size: 40 + Math.random() * 60,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.01 + Math.random() * 0.02
      });
    }

    for (let i = 0; i < 5; i++) {
      this.mistLayers.push({
        y: canvas.height * (0.6 + i * 0.1),
        speed: 0.2 + Math.random() * 0.3,
        alpha: 0.05 + Math.random() * 0.05
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Base fog
    const fog = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fog.addColorStop(0, 'rgba(180, 190, 200, 0.02)');
    fog.addColorStop(0.5, 'rgba(180, 190, 200, 0.05)');
    fog.addColorStop(1, 'rgba(180, 190, 200, 0.1)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drifting mist layers
    this.mistLayers.forEach((mist, i) => {
      const xOffset = Math.sin(time * 0.5 + i) * 50;
      const grad = ctx.createLinearGradient(0, mist.y - 100, 0, mist.y + 100);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(200, 210, 220, ${mist.alpha})`);
      grad.addColorStop(1, 'transparent');
      
      ctx.save();
      ctx.translate(xOffset, 0);
      ctx.fillStyle = grad;
      ctx.fillRect(-50, mist.y - 100, canvas.width + 100, 200);
      ctx.restore();
    });

    // Ghost apparitions
    this.ghosts.forEach(ghost => {
      ghost.phase += ghost.phaseSpeed;
      ghost.x += ghost.vx + Math.sin(ghost.phase) * 0.5;
      ghost.y += ghost.vy + Math.cos(ghost.phase * 0.7) * 0.3;

      if (Math.random() > 0.99) {
        ghost.vx = (Math.random() - 0.5) * 0.3;
        ghost.vy = (Math.random() - 0.5) * 0.2;
      }

      // Wrap
      if (ghost.x < -ghost.size) ghost.x = canvas.width + ghost.size;
      if (ghost.x > canvas.width + ghost.size) ghost.x = -ghost.size;
      if (ghost.y < -ghost.size) ghost.y = canvas.height + ghost.size;
      if (ghost.y > canvas.height + ghost.size) ghost.y = -ghost.size;

      const visibility = 0.4 + Math.sin(ghost.phase) * 0.3;
      
      // Ghost body
      const ghostGrad = ctx.createRadialGradient(
        ghost.x, ghost.y - ghost.size * 0.2, 0,
        ghost.x, ghost.y + ghost.size * 0.3, ghost.size
      );
      ghostGrad.addColorStop(0, `rgba(220, 230, 240, ${0.15 * visibility})`);
      ghostGrad.addColorStop(0.5, `rgba(200, 210, 220, ${0.08 * visibility})`);
      ghostGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(ghost.x - ghost.size * 0.5, ghost.y + ghost.size * 0.4);
      ctx.quadraticCurveTo(ghost.x - ghost.size * 0.6, ghost.y - ghost.size * 0.3, ghost.x, ghost.y - ghost.size * 0.5);
      ctx.quadraticCurveTo(ghost.x + ghost.size * 0.6, ghost.y - ghost.size * 0.3, ghost.x + ghost.size * 0.5, ghost.y + ghost.size * 0.4);
      ctx.quadraticCurveTo(ghost.x + ghost.size * 0.3, ghost.y + ghost.size * 0.2, ghost.x, ghost.y + ghost.size * 0.5);
      ctx.quadraticCurveTo(ghost.x - ghost.size * 0.3, ghost.y + ghost.size * 0.2, ghost.x - ghost.size * 0.5, ghost.y + ghost.size * 0.4);
      ctx.fillStyle = ghostGrad;
      ctx.fill();

      // Eyes (dark voids)
      if (visibility > 0.4) {
        ctx.fillStyle = `rgba(20, 30, 40, ${(visibility - 0.3) * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(ghost.x - ghost.size * 0.15, ghost.y - ghost.size * 0.15, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(ghost.x + ghost.size * 0.15, ghost.y - ghost.size * 0.15, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Flickering lights
    if (Math.random() > 0.97) {
      const flashX = Math.random() * canvas.width;
      const flashY = Math.random() * canvas.height;
      const flash = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, 100);
      flash.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      flash.addColorStop(1, 'transparent');
      ctx.fillStyle = flash;
      ctx.fillRect(flashX - 100, flashY - 100, 200, 200);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DARK FOREST - Glowing eyes and creeping shadows
// ═══════════════════════════════════════════════════════════════════════════
export class DarkForestRenderer extends BaseRenderer {
  eyes: Array<{ x: number; y: number; blinkPhase: number; size: number }> = [];
  treeShadows: Array<{ x: number; sway: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 15; i++) {
      this.eyes.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.3 + Math.random() * canvas.height * 0.5,
        blinkPhase: Math.random() * Math.PI * 2,
        size: 2 + Math.random() * 4
      });
    }

    for (let i = 0; i < 8; i++) {
      this.treeShadows.push({
        x: i * (canvas.width / 7) - 50 + Math.random() * 100,
        sway: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Dense fog at bottom
    const fog = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.4);
    fog.addColorStop(0, 'rgba(20, 30, 20, 0.4)');
    fog.addColorStop(0.5, 'rgba(15, 25, 15, 0.2)');
    fog.addColorStop(1, 'transparent');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tree shadows
    this.treeShadows.forEach((tree, i) => {
      tree.sway += 0.005;
      const swayOffset = Math.sin(tree.sway) * 5;
      
      ctx.save();
      ctx.translate(tree.x + swayOffset, canvas.height);
      
      // Tree trunk shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-15, -canvas.height * 0.6);
      ctx.lineTo(15, -canvas.height * 0.6);
      ctx.lineTo(20, 0);
      ctx.fill();

      // Branches
      for (let b = 0; b < 4; b++) {
        const branchY = -canvas.height * (0.3 + b * 0.1);
        const branchLen = 40 + b * 20;
        ctx.beginPath();
        ctx.moveTo(0, branchY);
        ctx.lineTo(-branchLen + swayOffset * 2, branchY - 30);
        ctx.lineTo(-branchLen + 10 + swayOffset * 2, branchY - 25);
        ctx.lineTo(0, branchY + 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, branchY);
        ctx.lineTo(branchLen + swayOffset * 2, branchY - 20);
        ctx.lineTo(branchLen - 10 + swayOffset * 2, branchY - 15);
        ctx.lineTo(0, branchY + 5);
        ctx.fill();
      }
      ctx.restore();
    });

    // Glowing eyes
    this.eyes.forEach(eye => {
      eye.blinkPhase += 0.02;
      const blink = Math.sin(eye.blinkPhase);
      
      // Random blink
      if (blink < -0.8) return;
      
      const openness = Math.max(0, blink * 0.5 + 0.5);
      
      // Left eye
      const eyeGlow = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, eye.size * 4);
      eyeGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 50, ${0.8 * openness})`);
      eyeGlow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, 30, ${0.3 * openness})`);
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eye.size * 4, 0, Math.PI * 2);
      ctx.fill();

      // Eye core
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, eye.size, eye.size * openness * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 100, ${openness})`;
      ctx.fill();

      // Right eye
      const rightX = eye.x + eye.size * 6;
      ctx.beginPath();
      ctx.ellipse(rightX, eye.y, eye.size, eye.size * openness * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 100, ${openness})`;
      ctx.fill();
    });

    // Creeping mist animation
    for (let i = 0; i < 3; i++) {
      const mistY = canvas.height - 50 - i * 40;
      const mistOffset = Math.sin(time * 0.3 + i) * 30;
      const mistGrad = ctx.createLinearGradient(0, mistY - 40, 0, mistY + 40);
      mistGrad.addColorStop(0, 'transparent');
      mistGrad.addColorStop(0.5, `rgba(30, 50, 30, ${0.08 - i * 0.02})`);
      mistGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(mistOffset - 50, mistY - 40, canvas.width + 100, 80);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VAMPIRE NIGHT - Blood moon and flying bats
// ═══════════════════════════════════════════════════════════════════════════
export class VampireNightRenderer extends BaseRenderer {
  bats: Array<{
    x: number; y: number;
    speed: number;
    wingPhase: number;
    size: number;
    layer: number;
  }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 20; i++) {
      this.bats.push({
        x: Math.random() * canvas.width * 1.5,
        y: Math.random() * canvas.height * 0.6,
        speed: 1 + Math.random() * 3,
        wingPhase: Math.random() * Math.PI * 2,
        size: 6 + Math.random() * 12,
        layer: Math.floor(Math.random() * 3)
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, time } = rc;

    // Blood moon
    const moonX = canvas.width * 0.8;
    const moonY = canvas.height * 0.15;
    const moonRadius = 50;

    // Moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 5);
    moonGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.2}, ${primaryRgb[2] * 0.2}, 0.4)`);
    moonGlow.addColorStop(0.3, `rgba(${primaryRgb[0]}, 0, 0, 0.15)`);
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moon disc
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    const moonFill = ctx.createRadialGradient(moonX - 10, moonY - 10, 0, moonX, moonY, moonRadius);
    moonFill.addColorStop(0, `rgba(255, 180, 150, 0.5)`);
    moonFill.addColorStop(0.7, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.4}, ${primaryRgb[2] * 0.3}, 0.6)`);
    moonFill.addColorStop(1, `rgba(${primaryRgb[0]}, ${primaryRgb[1] * 0.3}, ${primaryRgb[2] * 0.2}, 0.7)`);
    ctx.fillStyle = moonFill;
    ctx.fill();

    // Moon craters
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(moonX - 15, moonY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 20, moonY + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX - 5, moonY + 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // Bats (sorted by layer for depth)
    const sortedBats = [...this.bats].sort((a, b) => a.layer - b.layer);
    
    sortedBats.forEach(bat => {
      bat.wingPhase += 0.15 + bat.layer * 0.05;
      bat.x -= bat.speed;
      bat.y += Math.sin(bat.wingPhase * 0.3 + bat.x * 0.01) * 0.5;

      if (bat.x < -50) {
        bat.x = canvas.width + 50 + Math.random() * 100;
        bat.y = Math.random() * canvas.height * 0.5;
      }

      const wingUp = Math.sin(bat.wingPhase) * 0.6;
      const opacity = 0.4 + bat.layer * 0.2;
      const scale = (0.6 + bat.layer * 0.2) * bat.size / 12;

      ctx.save();
      ctx.translate(bat.x, bat.y);
      ctx.scale(scale, scale);

      ctx.fillStyle = `rgba(20, 10, 15, ${opacity})`;
      
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(0, -8, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Ears
      ctx.beginPath();
      ctx.moveTo(-3, -10);
      ctx.lineTo(-5, -16);
      ctx.lineTo(-1, -12);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3, -10);
      ctx.lineTo(5, -16);
      ctx.lineTo(1, -12);
      ctx.fill();

      // Wings
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.quadraticCurveTo(-20, -12 + wingUp * 15, -25, 0 + wingUp * 8);
      ctx.quadraticCurveTo(-18, 6, -4, 4);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(4, -2);
      ctx.quadraticCurveTo(20, -12 + wingUp * 15, 25, 0 + wingUp * 8);
      ctx.quadraticCurveTo(18, 6, 4, 4);
      ctx.fill();

      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC HORROR - Eldritch tentacles and void
// ═══════════════════════════════════════════════════════════════════════════
export class CosmicHorrorRenderer extends BaseRenderer {
  tentacles: Array<{ x: number; segments: Array<{ angle: number; length: number }>; phase: number }> = [];
  eyes: Array<{ x: number; y: number; size: number; pupilAngle: number; blinkPhase: number }> = [];
  voidPulse = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Tentacles from edges
    for (let i = 0; i < 6; i++) {
      const segments: Array<{ angle: number; length: number }> = [];
      for (let j = 0; j < 8; j++) {
        segments.push({
          angle: (Math.random() - 0.5) * 0.3,
          length: 30 + Math.random() * 20
        });
      }
      this.tentacles.push({
        x: Math.random() * canvas.width,
        segments,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Floating eyes
    for (let i = 0; i < 8; i++) {
      this.eyes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 15 + Math.random() * 25,
        pupilAngle: Math.random() * Math.PI * 2,
        blinkPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    this.voidPulse += 0.02;
    const pulse = 0.5 + Math.sin(this.voidPulse) * 0.3;

    // Void center
    const voidGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.4
    );
    voidGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${0.15 * pulse})`);
    voidGrad.addColorStop(0.5, `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.5}, ${primaryRgb[2] * 0.5}, ${0.08 * pulse})`);
    voidGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = voidGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tentacles
    this.tentacles.forEach((tentacle, ti) => {
      tentacle.phase += 0.015;
      
      ctx.save();
      const startY = ti % 2 === 0 ? 0 : canvas.height;
      ctx.translate(tentacle.x, startY);
      
      let currentAngle = ti % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
      
      tentacle.segments.forEach((seg, si) => {
        const waveOffset = Math.sin(tentacle.phase + si * 0.5) * 0.15;
        currentAngle += seg.angle + waveOffset;
        
        const thickness = (tentacle.segments.length - si) * 3;
        const nextX = Math.cos(currentAngle) * seg.length;
        const nextY = Math.sin(currentAngle) * seg.length;
        
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${0.15 - si * 0.015})`;
        ctx.moveTo(0, 0);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
        
        ctx.translate(nextX, nextY);
      });
      
      ctx.restore();
    });

    // Eyes
    this.eyes.forEach(eye => {
      eye.blinkPhase += 0.01;
      eye.pupilAngle += 0.005;
      
      const blink = Math.sin(eye.blinkPhase);
      if (blink < -0.9) return; // Blink
      
      const openness = Math.min(1, (blink + 1) * 0.5);
      
      // Outer glow
      const eyeGlow = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, eye.size * 2);
      eyeGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${0.2 * openness})`);
      eyeGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eye.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye white (yellowish)
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, eye.size, eye.size * openness * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 250, 200, 0.8)';
      ctx.fill();
      
      // Iris
      const irisSize = eye.size * 0.6;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, irisSize, 0, Math.PI * 2);
      const irisGrad = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, irisSize);
      irisGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.9)`);
      irisGrad.addColorStop(1, `rgba(${primaryRgb[0] * 0.5}, ${primaryRgb[1] * 0.5}, ${primaryRgb[2] * 0.5}, 0.9)`);
      ctx.fillStyle = irisGrad;
      ctx.fill();
      
      // Pupil (slit)
      ctx.save();
      ctx.translate(eye.x, eye.y);
      ctx.rotate(eye.pupilAngle);
      ctx.beginPath();
      ctx.ellipse(0, 0, eye.size * 0.1, eye.size * 0.4 * openness, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fill();
      ctx.restore();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ASYLUM - Flickering fluorescent and static
// ═══════════════════════════════════════════════════════════════════════════
export class AsylumRenderer extends BaseRenderer {
  flickerState = 1;
  staticNoise: ImageData | null = null;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time } = rc;

    // Flickering fluorescent effect
    if (Math.random() > 0.95) {
      this.flickerState = Math.random() > 0.3 ? 1 : 0.3;
    }
    if (Math.random() > 0.98) {
      this.flickerState = Math.random() * 0.5;
    }

    // Sickly green-yellow light
    const lightGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    lightGrad.addColorStop(0, `rgba(200, 220, 180, ${0.08 * this.flickerState})`);
    lightGrad.addColorStop(0.5, `rgba(180, 200, 160, ${0.04 * this.flickerState})`);
    lightGrad.addColorStop(1, 'rgba(100, 120, 80, 0.02)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Static noise overlay
    const imageData = ctx.createImageData(canvas.width / 4, canvas.height / 4);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 255;
      imageData.data[i] = noise;
      imageData.data[i + 1] = noise;
      imageData.data[i + 2] = noise;
      imageData.data[i + 3] = 8; // Very subtle
    }
    
    ctx.save();
    ctx.scale(4, 4);
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }

    // Occasional intense flicker
    if (this.flickerState < 0.5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.5 - this.flickerState) * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Door shadow in corner
    const shadowGrad = ctx.createLinearGradient(0, canvas.height, canvas.width * 0.3, canvas.height * 0.7);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, canvas.height * 0.5, canvas.width * 0.4, canvas.height * 0.5);
  }
}
