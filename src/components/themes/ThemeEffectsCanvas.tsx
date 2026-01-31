import { useEffect, useRef, useCallback } from 'react';
import { SubTheme } from '@/config/themes';
import { parseHsl, hslToRgb, RenderContext } from './renderers/BaseRenderer';
import * as Renderers from './renderers';

interface ThemeEffectsCanvasProps {
  subTheme: SubTheme;
  reducedMotion: boolean;
}

// Renderer map - maps renderer names to their classes
const RENDERER_MAP: Record<string, new () => any> = {
  // Default
  dustMotes: Renderers.DustMotesRenderer,
  starfield: Renderers.StarfieldRenderer,
  fallingLeaves: Renderers.FallingLeavesRenderer,
  // Fantasy
  royalSparkles: Renderers.RoyalSparklesRenderer,
  snowfall: Renderers.SnowfallRenderer,
  dragonFire: Renderers.DragonFireRenderer,
  enchantedForest: Renderers.EnchantedForestRenderer,
  potionBrew: Renderers.PotionBrewRenderer,
  celestialMagic: Renderers.CelestialMagicRenderer,
  // Horror
  grimoire: Renderers.GrimoireRenderer,
  ghostlyApparitions: Renderers.GhostlyApparitionsRenderer,
  darkForest: Renderers.DarkForestRenderer,
  vampireNight: Renderers.VampireNightRenderer,
  cosmicHorror: Renderers.CosmicHorrorRenderer,
  asylum: Renderers.AsylumRenderer,
  // Sci-Fi
  cyberpunkCity: Renderers.CyberpunkCityRenderer,
  matrixRain: Renderers.MatrixRainRenderer,
  deepSpace: Renderers.DeepSpaceRenderer,
  hologramDisplay: Renderers.HologramDisplayRenderer,
  alienBiome: Renderers.AlienBiomeRenderer,
  quantumField: Renderers.QuantumFieldRenderer,
  // Dystopia
  nuclearWasteland: Renderers.NuclearWastelandRenderer,
  rustBelt: Renderers.RustBeltRenderer,
  toxicSwamp: Renderers.ToxicSwampRenderer,
  bunkerEmergency: Renderers.BunkerEmergencyRenderer,
  surveillance: Renderers.SurveillanceRenderer,
  // Utopia
  solarGarden: Renderers.SolarGardenRenderer,
  crystalCity: Renderers.CrystalCityRenderer,
  underwaterCity: Renderers.UnderwaterCityRenderer,
  zenGarden: Renderers.ZenGardenRenderer,
  cloudKingdom: Renderers.SolarGardenRenderer, // Reuse with different colors
  // Steampunk
  clockworkMechanism: Renderers.ClockworkMechanismRenderer,
  airshipSky: Renderers.SolarGardenRenderer,
  teslaLab: Renderers.QuantumFieldRenderer,
  victorianFog: Renderers.DustMotesRenderer,
  // Romance
  roseGarden: Renderers.RoseGardenRenderer,
  starlitNight: Renderers.CelestialMagicRenderer,
  beachSunset: Renderers.DesertExpanseRenderer,
  sakuraBloom: Renderers.SakuraBloomRenderer,
  candlelitDinner: Renderers.CandlelitDinnerRenderer,
  // Thriller
  noirCity: Renderers.NoirCityRenderer,
  conspiracyBoard: Renderers.MysteryLibraryRenderer,
  heistVault: Renderers.HeistVaultRenderer,
  spyTech: Renderers.SpyTechRenderer,
  // Mystery
  victorianMystery: Renderers.DustMotesRenderer,
  mysteryLibrary: Renderers.MysteryLibraryRenderer,
  crimeScene: Renderers.NoirCityRenderer,
  ancientRuins: Renderers.DesertExpanseRenderer,
  // Adventure
  jungleExpedition: Renderers.FallingLeavesRenderer,
  desertExpanse: Renderers.DesertExpanseRenderer,
  oceanVoyage: Renderers.OceanVoyageRenderer,
  mountainPeak: Renderers.SnowfallRenderer,
  treasureCave: Renderers.HeistVaultRenderer,
  // Historical
  medievalCastle: Renderers.MedievalCastleRenderer,
  ancientRome: Renderers.AncientRomeRenderer,
  vikingNorse: Renderers.VikingNorseRenderer,
  ancientEgypt: Renderers.AncientEgyptRenderer,
  feudalJapan: Renderers.FeudalJapanRenderer,
};

export function ThemeEffectsCanvas({ subTheme, reducedMotion }: ThemeEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rendererRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const lastRendererType = useRef<string>('');

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !rendererRef.current) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    const time = timestamp / 1000;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parse colors
    const primary = parseHsl(subTheme.primary);
    const accent = parseHsl(subTheme.accent);
    const secondary = parseHsl(subTheme.secondary);

    const primaryRgb = hslToRgb(primary.h, primary.s, primary.l);
    const accentRgb = hslToRgb(accent.h, accent.s, accent.l);
    const secondaryRgb = hslToRgb(secondary.h, secondary.s, secondary.l);

    const rc: RenderContext = {
      ctx,
      canvas,
      time,
      deltaTime,
      primaryRgb,
      accentRgb,
      secondaryRgb,
    };

    // Render
    rendererRef.current.render(rc);

    animationRef.current = requestAnimationFrame(animate);
  }, [subTheme]);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get renderer for this theme
    const rendererName = subTheme.effects.renderer;
    
    // Only create new renderer if type changed
    if (lastRendererType.current !== rendererName) {
      const RendererClass = RENDERER_MAP[rendererName] || Renderers.DustMotesRenderer;
      rendererRef.current = new RendererClass();
      lastRendererType.current = rendererName;
    }

    // Initialize renderer
    const primary = parseHsl(subTheme.primary);
    const primaryRgb = hslToRgb(primary.h, primary.s, primary.l);
    rendererRef.current.init(canvas, primaryRgb);

    // Start animation
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [subTheme, reducedMotion, animate]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}
