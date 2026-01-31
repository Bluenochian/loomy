// Sci-Fi Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// CYBERPUNK CITY - Neon rain with holographic ads
// ═══════════════════════════════════════════════════════════════════════════
export class CyberpunkCityRenderer extends BaseRenderer {
  raindrops: Array<{
    x: number; y: number;
    length: number;
    speed: number;
    color: string;
    alpha: number;
  }> = [];
  holoAds: Array<{ x: number; y: number; width: number; height: number; hue: number; glitchPhase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 300; i++) {
      const colorChoice = Math.random();
      let color = '0, 255, 255';
      if (colorChoice > 0.7) color = '255, 0, 200';
      else if (colorChoice > 0.5) color = '255, 100, 255';
      
      this.raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 15 + Math.random() * 45,
        speed: 8 + Math.random() * 15,
        color,
        alpha: 0.1 + Math.random() * 0.25
      });
    }

    // Holographic ad panels
    for (let i = 0; i < 4; i++) {
      this.holoAds.push({
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: Math.random() * canvas.height * 0.4 + canvas.height * 0.1,
        width: 80 + Math.random() * 120,
        height: 40 + Math.random() * 60,
        hue: Math.random() * 360,
        glitchPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb, time } = rc;

    // Neon ambient from bottom
    const bottomGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 350);
    bottomGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.12)`);
    bottomGlow.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.04)`);
    bottomGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top accent glow
    const topGlow = ctx.createLinearGradient(0, 0, 0, 250);
    topGlow.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.08)`);
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, canvas.width, 250);

    // Holographic ads - no glitch/flickering
    this.holoAds.forEach(ad => {
      ctx.save();
      ctx.translate(ad.x, ad.y);
      
      // Hologram base
      ctx.fillStyle = `hsla(${ad.hue}, 80%, 50%, 0.08)`;
      ctx.fillRect(0, 0, ad.width, ad.height);
      
      // Scanlines on hologram
      ctx.fillStyle = `hsla(${ad.hue}, 80%, 70%, 0.05)`;
      for (let y = 0; y < ad.height; y += 4) {
        ctx.fillRect(0, y, ad.width, 1);
      }
      
      // Border glow
      ctx.strokeStyle = `hsla(${ad.hue}, 90%, 60%, 0.3)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, ad.width, ad.height);
      
      // Abstract text lines (static, no glitch)
      ctx.fillStyle = `hsla(${ad.hue}, 70%, 70%, 0.2)`;
      for (let i = 0; i < 3; i++) {
        const lineWidth = 20 + Math.random() * (ad.width - 40);
        ctx.fillRect(10, 10 + i * 12, lineWidth, 6);
      }
      
      ctx.restore();
    });

    // Neon rain (steady, no flickering)
    this.raindrops.forEach(drop => {
      drop.y += drop.speed;
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width;
      }

      const grad = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
      grad.addColorStop(0, `rgba(${drop.color}, 0)`);
      grad.addColorStop(0.2, `rgba(${drop.color}, ${drop.alpha})`);
      grad.addColorStop(1, `rgba(${drop.color}, 0.02)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x, drop.y + drop.length);
      ctx.stroke();
    });

    // Subtle scanlines overlay (static, not distracting)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.012)';
    for (let y = 0; y < canvas.height; y += 2) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MATRIX RAIN - Premium cascading code
// ═══════════════════════════════════════════════════════════════════════════
export class MatrixRainRenderer extends BaseRenderer {
  columns: Array<{
    x: number;
    chars: Array<{ y: number; char: string; speed: number }>;
    speed: number;
    depth: number;
  }> = [];
  charSet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>{}[]|/@#$%&=+*';

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    const columnWidth = 18;
    const numColumns = Math.ceil(canvas.width / columnWidth) + 5;

    for (let i = 0; i < numColumns; i++) {
      const depth = 0.4 + Math.random() * 0.6;
      const chars: Array<{ y: number; char: string; speed: number }> = [];
      const charCount = Math.floor(10 + Math.random() * 25);
      const startY = -Math.random() * canvas.height * 2;

      for (let j = 0; j < charCount; j++) {
        chars.push({
          y: startY + j * 20,
          char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
          speed: 1 + Math.random() * 0.4
        });
      }

      this.columns.push({
        x: i * columnWidth + (Math.random() - 0.5) * 6,
        chars,
        speed: (3 + Math.random() * 5) * depth,
        depth
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb } = rc;
    const [pr, pg, pb] = primaryRgb;

    // Subtle center glow
    const centerGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.5
    );
    centerGlow.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.04)`);
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.columns.forEach(column => {
      const fontSize = Math.floor(12 * column.depth + 6);
      ctx.font = `${fontSize}px 'Courier New', monospace`;

      column.chars.forEach((charObj, i) => {
        charObj.y += column.speed * charObj.speed;

        // Random character mutation
        if (Math.random() > 0.97) {
          charObj.char = this.charSet[Math.floor(Math.random() * this.charSet.length)];
        }

        const isHead = i === column.chars.length - 1;
        const distFromHead = column.chars.length - 1 - i;
        const fade = Math.max(0, 1 - distFromHead * 0.04);

        if (charObj.y >= -20 && charObj.y <= canvas.height + 20 && fade > 0.03) {
          if (isHead) {
            // Bright glowing head
            ctx.save();
            ctx.shadowColor = `rgb(${pr}, ${pg}, ${pb})`;
            ctx.shadowBlur = 18 * column.depth;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * column.depth})`;
            ctx.fillText(charObj.char, column.x, charObj.y);
            ctx.restore();
          } else {
            // Fading trail
            const brightness = Math.min(255, pg + distFromHead * 6);
            ctx.fillStyle = `rgba(${Math.floor(pr * 0.2)}, ${brightness}, ${Math.floor(pb * 0.4)}, ${fade * column.depth * 0.75})`;
            ctx.fillText(charObj.char, column.x, charObj.y);
          }
        }
      });

      // Reset when off screen
      const firstChar = column.chars[0];
      if (firstChar && firstChar.y > canvas.height + 250) {
        const charCount = Math.floor(10 + Math.random() * 25);
        column.chars = [];
        for (let j = 0; j < charCount; j++) {
          column.chars.push({
            y: -charCount * 20 + j * 20,
            char: this.charSet[Math.floor(Math.random() * this.charSet.length)],
            speed: 1 + Math.random() * 0.4
          });
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEEP SPACE - Nebulae and galaxies
// ═══════════════════════════════════════════════════════════════════════════
export class DeepSpaceRenderer extends BaseRenderer {
  stars: Array<{ x: number; y: number; size: number; alpha: number; twinklePhase: number }> = [];
  nebulaParticles: Array<{ x: number; y: number; size: number; hue: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.3 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.6,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Nebula cloud particles
    for (let i = 0; i < 30; i++) {
      this.nebulaParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 100 + Math.random() * 200,
        hue: 240 + Math.random() * 60,
        alpha: 0.02 + Math.random() * 0.03
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Nebula clouds
    this.nebulaParticles.forEach(particle => {
      const glow = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );
      glow.addColorStop(0, `hsla(${particle.hue}, 60%, 40%, ${particle.alpha})`);
      glow.addColorStop(0.5, `hsla(${particle.hue + 20}, 50%, 30%, ${particle.alpha * 0.5})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Galaxy spiral hint
    ctx.save();
    ctx.translate(canvas.width * 0.7, canvas.height * 0.4);
    ctx.rotate(time * 0.02);
    for (let arm = 0; arm < 2; arm++) {
      ctx.rotate(Math.PI);
      for (let i = 0; i < 50; i++) {
        const angle = i * 0.15;
        const radius = i * 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, 1 + i * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${0.1 - i * 0.002})`;
        ctx.fill();
      }
    }
    ctx.restore();

    // Stars
    this.stars.forEach(star => {
      star.twinklePhase += 0.02;
      const twinkle = 0.6 + Math.sin(star.twinklePhase) * 0.4;
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
      ctx.fill();

      if (star.size > 1.2) {
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
        glow.addColorStop(0, `rgba(255, 255, 255, ${star.alpha * twinkle * 0.3})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(star.x - star.size * 3, star.y - star.size * 3, star.size * 6, star.size * 6);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOLOGRAM DISPLAY - Blue holo projections with data
// ═══════════════════════════════════════════════════════════════════════════
export class HologramDisplayRenderer extends BaseRenderer {
  dataStreams: Array<{ x: number; chars: string[]; speed: number; offset: number }> = [];
  scanWave = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 15; i++) {
      const chars: string[] = [];
      for (let j = 0; j < 30; j++) {
        chars.push(Math.random() > 0.5 ? '1' : '0');
      }
      this.dataStreams.push({
        x: Math.random() * canvas.width,
        chars,
        speed: 1 + Math.random() * 2,
        offset: Math.random() * 1000
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    this.scanWave += 0.02;

    // Holographic grid floor
    ctx.save();
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.08)`;
    ctx.lineWidth = 1;
    
    // Perspective grid
    const horizon = canvas.height * 0.5;
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height);
      ctx.lineTo(canvas.width / 2, horizon);
      ctx.stroke();
    }
    for (let y = 0; y < 10; y++) {
      const yPos = horizon + (canvas.height - horizon) * (y / 10) * (y / 10);
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(canvas.width, yPos);
      ctx.stroke();
    }
    ctx.restore();

    // Data streams
    ctx.font = '10px monospace';
    this.dataStreams.forEach(stream => {
      stream.offset += stream.speed;
      
      stream.chars.forEach((char, i) => {
        const y = ((stream.offset + i * 15) % (canvas.height + 100)) - 50;
        const alpha = 0.1 + Math.sin(y * 0.02 + time) * 0.05;
        ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${alpha})`;
        ctx.fillText(char, stream.x, y);
      });

      // Randomly mutate characters
      if (Math.random() > 0.95) {
        const idx = Math.floor(Math.random() * stream.chars.length);
        stream.chars[idx] = Math.random() > 0.5 ? '1' : '0';
      }
    });

    // Scan wave
    const scanY = (Math.sin(this.scanWave) * 0.5 + 0.5) * canvas.height;
    const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
    scanGrad.addColorStop(0, 'transparent');
    scanGrad.addColorStop(0.5, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.15)`);
    scanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 30, canvas.width, 60);

    // Corner HUD elements
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.2)`;
    ctx.lineWidth = 1;
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(20, 20);
    ctx.lineTo(50, 20);
    ctx.stroke();
    
    // Top right corner
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, 50);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 50, 20);
    ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ALIEN BIOME - Bioluminescent spores
// ═══════════════════════════════════════════════════════════════════════════
export class AlienBiomeRenderer extends BaseRenderer {
  spores: Array<{
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    hue: number;
    pulsePhase: number;
  }> = [];
  tendrils: Array<{ x: number; height: number; swayPhase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 60; i++) {
      this.spores.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.3 - Math.random() * 0.5,
        size: 2 + Math.random() * 6,
        hue: Math.random() > 0.5 ? 160 : 280,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Alien plant tendrils at bottom
    for (let i = 0; i < 12; i++) {
      this.tendrils.push({
        x: Math.random() * canvas.width,
        height: 100 + Math.random() * 200,
        swayPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, primaryRgb, accentRgb, time } = rc;

    // Alien atmosphere
    const atmoGrad = ctx.createLinearGradient(0, canvas.height, 0, 0);
    atmoGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`);
    atmoGrad.addColorStop(0.5, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.03)`);
    atmoGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = atmoGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Plant tendrils
    this.tendrils.forEach(tendril => {
      tendril.swayPhase += 0.015;
      
      ctx.save();
      ctx.translate(tendril.x, canvas.height);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      for (let y = 0; y < tendril.height; y += 10) {
        const sway = Math.sin(tendril.swayPhase + y * 0.02) * (y * 0.1);
        ctx.lineTo(sway, -y);
      }
      
      ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.15)`;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Glowing tip
      const tipX = Math.sin(tendril.swayPhase + tendril.height * 0.02) * (tendril.height * 0.1);
      const tipGlow = ctx.createRadialGradient(tipX, -tendril.height, 0, tipX, -tendril.height, 20);
      tipGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.4)`);
      tipGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = tipGlow;
      ctx.beginPath();
      ctx.arc(tipX, -tendril.height, 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });

    // Floating spores
    this.spores.forEach(spore => {
      spore.pulsePhase += 0.03;
      spore.x += spore.vx;
      spore.y += spore.vy;

      if (spore.y < -20) {
        spore.y = canvas.height + 20;
        spore.x = Math.random() * canvas.width;
      }
      if (spore.x < -20) spore.x = canvas.width + 20;
      if (spore.x > canvas.width + 20) spore.x = -20;

      const pulse = 0.5 + Math.sin(spore.pulsePhase) * 0.5;
      
      const glow = ctx.createRadialGradient(spore.x, spore.y, 0, spore.x, spore.y, spore.size * 4);
      glow.addColorStop(0, `hsla(${spore.hue}, 80%, 60%, ${0.6 * pulse})`);
      glow.addColorStop(0.5, `hsla(${spore.hue}, 70%, 50%, ${0.2 * pulse})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(spore.x, spore.y, spore.size * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(spore.x, spore.y, spore.size * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${spore.hue}, 80%, 80%, ${pulse})`;
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUANTUM FIELD - Energy particles and wave functions
// ═══════════════════════════════════════════════════════════════════════════
export class QuantumFieldRenderer extends BaseRenderer {
  particles: Array<{
    x: number; y: number;
    vx: number; vy: number;
    trail: Array<{ x: number; y: number }>;
    hue: number;
  }> = [];
  wavePhase = 0;

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        trail: [],
        hue: Math.random() > 0.5 ? 200 : 40
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    this.wavePhase += 0.03;

    // Wave function visualization
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    for (let x = 0; x <= canvas.width; x += 5) {
      const y = canvas.height / 2 + 
                Math.sin(x * 0.02 + this.wavePhase) * 30 +
                Math.sin(x * 0.01 - this.wavePhase * 0.7) * 20;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Probability cloud
    const cloudGrad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, 200
    );
    cloudGrad.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${0.1 + Math.sin(this.wavePhase) * 0.05})`);
    cloudGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cloudGrad;
    ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 200, 400, 400);

    // Particles with trails
    this.particles.forEach(particle => {
      // Store trail position
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 20) particle.trail.shift();

      // Quantum-like random movement changes
      if (Math.random() > 0.95) {
        particle.vx = (Math.random() - 0.5) * 4;
        particle.vy = (Math.random() - 0.5) * 4;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      // Draw trail
      if (particle.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        particle.trail.forEach((pos, i) => {
          ctx.lineTo(pos.x, pos.y);
        });
        ctx.strokeStyle = `hsla(${particle.hue}, 80%, 60%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Particle
      const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 15);
      glow.addColorStop(0, `hsla(${particle.hue}, 90%, 70%, 0.8)`);
      glow.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, 0.3)`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    });

    // Atomic orbit hint
    ctx.save();
    ctx.translate(canvas.width * 0.75, canvas.height * 0.3);
    ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.1)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
