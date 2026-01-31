// Utopia, Steampunk, Romance Theme Renderers
import { BaseRenderer, RenderContext } from './BaseRenderer';

// ═══════════════════════════════════════════════════════════════════════════
// SOLAR GARDEN - Floating seeds and solar flares
// ═══════════════════════════════════════════════════════════════════════════
export class SolarGardenRenderer extends BaseRenderer {
  seeds: Array<{ x: number; y: number; vx: number; vy: number; rotation: number; size: number }> = [];
  sunRays: Array<{ angle: number; length: number; width: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 40; i++) {
      this.seeds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.2 - Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        size: 3 + Math.random() * 5
      });
    }

    for (let i = 0; i < 8; i++) {
      this.sunRays.push({
        angle: (i / 8) * Math.PI * 2,
        length: 200 + Math.random() * 150,
        width: 30 + Math.random() * 40
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Sun in corner
    const sunX = canvas.width * 0.85;
    const sunY = canvas.height * 0.15;

    // Sun rays
    this.sunRays.forEach((ray, i) => {
      const animAngle = ray.angle + time * 0.1;
      const pulse = 0.8 + Math.sin(time * 2 + i) * 0.2;
      
      ctx.save();
      ctx.translate(sunX, sunY);
      ctx.rotate(animAngle);
      
      const rayGrad = ctx.createLinearGradient(0, 0, ray.length * pulse, 0);
      rayGrad.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, 100, 0.15)`);
      rayGrad.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.moveTo(30, -ray.width / 2);
      ctx.lineTo(ray.length * pulse, 0);
      ctx.lineTo(30, ray.width / 2);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();
      ctx.restore();
    });

    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 150);
    sunGlow.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, 100, 0.3)`);
    sunGlow.addColorStop(0.5, `rgba(${accentRgb[0]}, ${accentRgb[1]}, 50, 0.1)`);
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 150, 0, Math.PI * 2);
    ctx.fill();

    // Sun disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, 150, 0.5)`;
    ctx.fill();

    // Floating seeds (dandelion-like)
    this.seeds.forEach(seed => {
      seed.rotation += 0.02;
      seed.x += seed.vx + Math.sin(time + seed.y * 0.01) * 0.3;
      seed.y += seed.vy;

      if (seed.y < -30) {
        seed.y = canvas.height + 30;
        seed.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(seed.x, seed.y);
      ctx.rotate(seed.rotation);

      // Seed body
      ctx.beginPath();
      ctx.ellipse(0, 0, seed.size * 0.3, seed.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.4)`;
      ctx.fill();

      // Fluff
      ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * seed.size * 2, Math.sin(angle) * seed.size * 2);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Green ambient from bottom
    const greenGlow = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - 300);
    greenGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`);
    greenGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = greenGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CRYSTAL CITY - Prismatic light refractions
// ═══════════════════════════════════════════════════════════════════════════
export class CrystalCityRenderer extends BaseRenderer {
  crystals: Array<{ x: number; y: number; size: number; rotation: number; hue: number }> = [];
  prismRays: Array<{ x: number; y: number; angle: number; hue: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 15; i++) {
      this.crystals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30 + Math.random() * 50,
        rotation: Math.random() * Math.PI,
        hue: Math.random() * 360
      });
    }

    for (let i = 0; i < 20; i++) {
      this.prismRays.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: Math.random() * Math.PI * 2,
        hue: i * 18 // Rainbow spread
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb } = rc;

    // Rainbow prism rays
    this.prismRays.forEach(ray => {
      const length = 100 + Math.sin(time + ray.x * 0.01) * 50;
      
      ctx.save();
      ctx.translate(ray.x, ray.y);
      ctx.rotate(ray.angle + time * 0.2);
      
      const rayGrad = ctx.createLinearGradient(0, 0, length, 0);
      rayGrad.addColorStop(0, `hsla(${ray.hue}, 80%, 60%, 0.15)`);
      rayGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, -3, length, 6);
      ctx.restore();
    });

    // Crystal formations
    this.crystals.forEach(crystal => {
      ctx.save();
      ctx.translate(crystal.x, crystal.y);
      ctx.rotate(crystal.rotation + Math.sin(time * 0.5) * 0.1);

      // Crystal shape (hexagonal prism)
      const points = 6;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = crystal.size * (0.8 + Math.sin(angle * 3) * 0.2);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Crystal fill with gradient
      const crystalGrad = ctx.createLinearGradient(-crystal.size, -crystal.size, crystal.size, crystal.size);
      crystalGrad.addColorStop(0, `hsla(${crystal.hue}, 60%, 70%, 0.1)`);
      crystalGrad.addColorStop(0.5, `hsla(${crystal.hue + 30}, 70%, 80%, 0.15)`);
      crystalGrad.addColorStop(1, `hsla(${crystal.hue + 60}, 60%, 70%, 0.1)`);
      ctx.fillStyle = crystalGrad;
      ctx.fill();

      // Crystal edges
      ctx.strokeStyle = `hsla(${crystal.hue}, 80%, 80%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner facets
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const angle = (i / 3) * Math.PI * 2 + crystal.rotation;
        ctx.lineTo(Math.cos(angle) * crystal.size, Math.sin(angle) * crystal.size);
        ctx.strokeStyle = `hsla(${crystal.hue + i * 40}, 70%, 70%, 0.2)`;
        ctx.stroke();
      }

      ctx.restore();
    });

    // Sparkle overlay
    for (let i = 0; i < 10; i++) {
      const sparkX = (Math.sin(time * 3 + i * 100) * 0.5 + 0.5) * canvas.width;
      const sparkY = (Math.cos(time * 2 + i * 50) * 0.5 + 0.5) * canvas.height;
      const sparkAlpha = Math.sin(time * 5 + i) * 0.5 + 0.5;
      
      if (sparkAlpha > 0.7) {
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha * 0.5})`;
        ctx.fill();
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNDERWATER CITY - Bubbles and bioluminescence
// ═══════════════════════════════════════════════════════════════════════════
export class UnderwaterCityRenderer extends BaseRenderer {
  bubbles: Array<{ x: number; y: number; size: number; speed: number; wobble: number }> = [];
  fish: Array<{ x: number; y: number; speed: number; size: number; hue: number }> = [];
  lightRays: Array<{ x: number; width: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 50; i++) {
      this.bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * canvas.height,
        size: 2 + Math.random() * 8,
        speed: 0.5 + Math.random() * 1.5,
        wobble: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 8; i++) {
      this.fish.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        size: 5 + Math.random() * 10,
        hue: 160 + Math.random() * 60
      });
    }

    for (let i = 0; i < 5; i++) {
      this.lightRays.push({
        x: Math.random() * canvas.width,
        width: 50 + Math.random() * 100,
        alpha: 0.03 + Math.random() * 0.04
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Light rays from surface
    this.lightRays.forEach(ray => {
      const rayGrad = ctx.createLinearGradient(ray.x, 0, ray.x, canvas.height);
      rayGrad.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${ray.alpha})`);
      rayGrad.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.moveTo(ray.x - ray.width / 2, 0);
      ctx.lineTo(ray.x - ray.width, canvas.height);
      ctx.lineTo(ray.x + ray.width, canvas.height);
      ctx.lineTo(ray.x + ray.width / 2, 0);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();
    });

    // Bioluminescent glow
    const bioGlow = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.6, 0,
      canvas.width * 0.3, canvas.height * 0.6, 200
    );
    bioGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.1)`);
    bioGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = bioGlow;
    ctx.beginPath();
    ctx.arc(canvas.width * 0.3, canvas.height * 0.6, 200, 0, Math.PI * 2);
    ctx.fill();

    // Swimming fish
    this.fish.forEach(fish => {
      fish.x += fish.speed;
      fish.y += Math.sin(time + fish.x * 0.02) * 0.5;

      if (fish.x > canvas.width + 20) {
        fish.x = -20;
        fish.y = Math.random() * canvas.height;
      }

      ctx.save();
      ctx.translate(fish.x, fish.y);

      // Fish body
      ctx.beginPath();
      ctx.ellipse(0, 0, fish.size * 1.5, fish.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${fish.hue}, 70%, 60%, 0.4)`;
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(-fish.size * 1.2, 0);
      ctx.lineTo(-fish.size * 2, -fish.size * 0.5);
      ctx.lineTo(-fish.size * 2, fish.size * 0.5);
      ctx.closePath();
      ctx.fill();

      // Bioluminescent spot
      const spotGlow = ctx.createRadialGradient(fish.size * 0.3, 0, 0, fish.size * 0.3, 0, fish.size);
      spotGlow.addColorStop(0, `hsla(${fish.hue}, 80%, 70%, 0.6)`);
      spotGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGlow;
      ctx.beginPath();
      ctx.arc(fish.size * 0.3, 0, fish.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Bubbles
    this.bubbles.forEach(bubble => {
      bubble.wobble += 0.03;
      bubble.x += Math.sin(bubble.wobble) * 0.5;
      bubble.y -= bubble.speed;

      if (bubble.y < -20) {
        bubble.y = canvas.height + 20;
        bubble.x = Math.random() * canvas.width;
      }

      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ZEN GARDEN - Sakura petals and koi
// ═══════════════════════════════════════════════════════════════════════════
export class ZenGardenRenderer extends BaseRenderer {
  petals: Array<{
    x: number; y: number;
    rotation: number; rotSpeed: number;
    size: number;
    swayPhase: number;
    speed: number;
  }> = [];
  ripples: Array<{ x: number; y: number; radius: number; alpha: number }> = [];
  koi: Array<{ x: number; y: number; angle: number; speed: number; tailPhase: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    for (let i = 0; i < 30; i++) {
      this.petals.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        size: 6 + Math.random() * 8,
        swayPhase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.6
      });
    }

    for (let i = 0; i < 3; i++) {
      this.koi.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.7 + Math.random() * canvas.height * 0.2,
        angle: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        tailPhase: Math.random() * Math.PI * 2
      });
    }
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Water surface at bottom
    const waterGrad = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
    waterGrad.addColorStop(0, 'transparent');
    waterGrad.addColorStop(0.3, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.05)`);
    waterGrad.addColorStop(1, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.1)`);
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

    // Koi fish
    this.koi.forEach(koi => {
      koi.tailPhase += 0.1;
      
      // Change direction occasionally
      if (Math.random() > 0.99) {
        koi.angle += (Math.random() - 0.5) * 0.5;
      }

      koi.x += Math.cos(koi.angle) * koi.speed;
      koi.y += Math.sin(koi.angle) * koi.speed * 0.3;

      // Wrap around
      if (koi.x < -30) koi.x = canvas.width + 30;
      if (koi.x > canvas.width + 30) koi.x = -30;
      if (koi.y < canvas.height * 0.65) koi.y = canvas.height * 0.65;
      if (koi.y > canvas.height - 20) koi.y = canvas.height - 20;

      ctx.save();
      ctx.translate(koi.x, koi.y);
      ctx.rotate(koi.angle);

      // Koi body
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 150, 100, 0.4)';
      ctx.fill();

      // White patches
      ctx.beginPath();
      ctx.ellipse(-5, -2, 6, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();

      // Tail with animation
      const tailSway = Math.sin(koi.tailPhase) * 5;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.quadraticCurveTo(-25, tailSway, -30, 0);
      ctx.quadraticCurveTo(-25, -tailSway, -15, 0);
      ctx.fillStyle = 'rgba(255, 150, 100, 0.3)';
      ctx.fill();

      ctx.restore();

      // Create ripples occasionally
      if (Math.random() > 0.98) {
        this.ripples.push({
          x: koi.x,
          y: koi.y,
          radius: 5,
          alpha: 0.3
        });
      }
    });

    // Ripples
    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += 0.5;
      ripple.alpha -= 0.005;

      if (ripple.alpha > 0) {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      return ripple.alpha > 0;
    });

    // Falling sakura petals
    this.petals.forEach(petal => {
      petal.swayPhase += 0.02;
      petal.rotation += petal.rotSpeed;
      petal.x += Math.sin(petal.swayPhase) * 1.5;
      petal.y += petal.speed;

      if (petal.y > canvas.height + 20) {
        petal.y = -20;
        petal.x = Math.random() * canvas.width;
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

    // Soft pink ambient
    const pinkGlow = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.3, 0,
      canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.5
    );
    pinkGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.05)`);
    pinkGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOCKWORK MECHANISM - Rotating gears
// ═══════════════════════════════════════════════════════════════════════════
export class ClockworkMechanismRenderer extends BaseRenderer {
  gears: Array<{
    x: number; y: number;
    radius: number;
    teeth: number;
    rotation: number;
    speed: number;
    direction: number;
  }> = [];
  steamPuffs: Array<{ x: number; y: number; size: number; alpha: number }> = [];

  init(canvas: HTMLCanvasElement) {
    if (this.initialized) return;
    this.initialized = true;

    // Create interconnected gears
    const gearPositions = [
      { x: 0.2, y: 0.3, r: 60, t: 12 },
      { x: 0.35, y: 0.35, r: 40, t: 8 },
      { x: 0.8, y: 0.7, r: 80, t: 16 },
      { x: 0.65, y: 0.6, r: 35, t: 7 },
      { x: 0.15, y: 0.75, r: 50, t: 10 },
      { x: 0.5, y: 0.2, r: 45, t: 9 },
    ];

    gearPositions.forEach((pos, i) => {
      this.gears.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        radius: pos.r,
        teeth: pos.t,
        rotation: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.01,
        direction: i % 2 === 0 ? 1 : -1
      });
    });
  }

  render(rc: RenderContext) {
    const { ctx, canvas, time, primaryRgb, accentRgb } = rc;

    // Brass ambient
    const brassGlow = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.5
    );
    brassGlow.addColorStop(0, `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.06)`);
    brassGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = brassGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Steam puffs
    if (Math.random() > 0.95) {
      this.steamPuffs.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        size: 20 + Math.random() * 30,
        alpha: 0.15
      });
    }

    this.steamPuffs = this.steamPuffs.filter(puff => {
      puff.y -= 0.5;
      puff.size *= 1.01;
      puff.alpha *= 0.995;

      if (puff.alpha > 0.01) {
        const grad = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, puff.size);
        grad.addColorStop(0, `rgba(200, 200, 200, ${puff.alpha})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.size, 0, Math.PI * 2);
        ctx.fill();
      }

      return puff.alpha > 0.01;
    });

    // Draw gears
    this.gears.forEach(gear => {
      gear.rotation += gear.speed * gear.direction;

      ctx.save();
      ctx.translate(gear.x, gear.y);
      ctx.rotate(gear.rotation);

      // Gear body
      ctx.beginPath();
      ctx.arc(0, 0, gear.radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.15)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.3)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Teeth
      for (let i = 0; i < gear.teeth; i++) {
        const angle = (i / gear.teeth) * Math.PI * 2;
        const toothWidth = (Math.PI * 2 / gear.teeth) * 0.4;
        
        ctx.beginPath();
        ctx.arc(0, 0, gear.radius, angle - toothWidth, angle + toothWidth);
        ctx.arc(0, 0, gear.radius * 1.15, angle + toothWidth, angle - toothWidth, true);
        ctx.closePath();
        ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.2)`;
        ctx.fill();
        ctx.stroke();
      }

      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, gear.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${primaryRgb[0] * 0.8}, ${primaryRgb[1] * 0.8}, ${primaryRgb[2] * 0.8}, 0.2)`;
      ctx.fill();
      ctx.stroke();

      // Center hole
      ctx.beginPath();
      ctx.arc(0, 0, gear.radius * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
      ctx.fill();

      // Spokes
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * gear.radius * 0.15, Math.sin(angle) * gear.radius * 0.15);
        ctx.lineTo(Math.cos(angle) * gear.radius * 0.75, Math.sin(angle) * gear.radius * 0.75);
        ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.25)`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.restore();
    });
  }
}
