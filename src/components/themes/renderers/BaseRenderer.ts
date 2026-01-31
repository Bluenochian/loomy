// Base types and utilities for all theme renderers

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  time: number;
  deltaTime: number;
  primaryRgb: [number, number, number];
  accentRgb: [number, number, number];
  secondaryRgb: [number, number, number];
}

// Parse HSL string to object
export const parseHsl = (hslString: string) => {
  const parts = hslString.split(' ').map(p => parseFloat(p));
  return { h: parts[0] || 0, s: parts[1] || 0, l: parts[2] || 0 };
};

// Convert HSL to RGB
export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
};

export abstract class BaseRenderer {
  protected initialized = false;
  
  abstract init(canvas: HTMLCanvasElement, primaryRgb?: [number, number, number]): void;
  abstract render(rc: RenderContext): void;
  
  reset() {
    this.initialized = false;
  }
}
