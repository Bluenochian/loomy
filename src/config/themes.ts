// Comprehensive theme configuration with sub-themes

export interface SubTheme {
  id: string;
  nameKey: string;
  description: string;
  primary: string;
  accent: string;
  secondary: string;
  preview: string;
  effects: {
    style: string;
    particleType: string;
    glowIntensity: number;
    particleSpeed: number;
    particleCount: number;
    specialEffects: string[];
  };
}

export interface MainTheme {
  id: string;
  nameKey: string;
  description: string;
  icon: string;
  subThemes: SubTheme[];
}

export const THEME_CONFIG: MainTheme[] = [
  {
    id: 'default',
    nameKey: 'theme.default',
    description: 'Classic warm tones',
    icon: '✨',
    subThemes: [
      {
        id: 'default-amber',
        nameKey: 'subtheme.classicAmber',
        description: 'Warm amber glow, cozy and inviting',
        primary: '38 85% 55%',
        accent: '35 90% 50%',
        secondary: '30 70% 45%',
        preview: 'from-amber-500/30 to-orange-500/30',
        effects: { style: 'warm', particleType: 'dust', glowIntensity: 0.25, particleSpeed: 0.4, particleCount: 20, specialEffects: ['warmGlow', 'dustMotes'] }
      },
      {
        id: 'default-midnight',
        nameKey: 'subtheme.midnightBlue',
        description: 'Calm deep blue, professional elegance',
        primary: '220 70% 50%',
        accent: '200 80% 55%',
        secondary: '230 60% 40%',
        preview: 'from-blue-600/30 to-indigo-600/30',
        effects: { style: 'calm', particleType: 'stars', glowIntensity: 0.2, particleSpeed: 0.2, particleCount: 40, specialEffects: ['starField', 'gentleWaves'] }
      },
      {
        id: 'default-forest',
        nameKey: 'subtheme.forestGreen',
        description: 'Natural earthy greens, grounding feel',
        primary: '140 50% 40%',
        accent: '160 60% 45%',
        secondary: '120 40% 35%',
        preview: 'from-green-600/30 to-emerald-700/30',
        effects: { style: 'natural', particleType: 'leaves', glowIntensity: 0.2, particleSpeed: 0.3, particleCount: 25, specialEffects: ['fallingLeaves', 'forestMist'] }
      }
    ]
  },
  {
    id: 'fantasy',
    nameKey: 'theme.fantasy',
    description: 'Magical and mystical',
    icon: '🧙',
    subThemes: [
      {
        id: 'fantasy-royal',
        nameKey: 'subtheme.royalGlitter',
        description: 'Purple majesty with golden sparkles',
        primary: '280 70% 50%',
        accent: '45 90% 55%',
        secondary: '300 60% 45%',
        preview: 'from-purple-600/30 to-yellow-500/30',
        effects: { style: 'royal', particleType: 'sparkles', glowIntensity: 0.4, particleSpeed: 0.3, particleCount: 50, specialEffects: ['goldenSparkles', 'royalGlow', 'crownShimmer'] }
      },
      {
        id: 'fantasy-snow',
        nameKey: 'subtheme.snowyPlains',
        description: 'Frozen tundra with ice crystals',
        primary: '200 80% 75%',
        accent: '210 90% 85%',
        secondary: '190 70% 60%',
        preview: 'from-cyan-200/30 to-blue-100/30',
        effects: { style: 'frozen', particleType: 'snowflakes', glowIntensity: 0.35, particleSpeed: 0.2, particleCount: 60, specialEffects: ['snowfall', 'iceCrystals', 'frostBreath'] }
      },
      {
        id: 'fantasy-dragon',
        nameKey: 'subtheme.dragonFire',
        description: 'Fierce flames and ember glow',
        primary: '15 90% 50%',
        accent: '35 95% 55%',
        secondary: '0 80% 45%',
        preview: 'from-orange-600/30 to-red-600/30',
        effects: { style: 'fiery', particleType: 'embers', glowIntensity: 0.5, particleSpeed: 0.6, particleCount: 45, specialEffects: ['risingEmbers', 'fireGlow', 'heatWave'] }
      },
      {
        id: 'fantasy-enchanted',
        nameKey: 'subtheme.enchantedForest',
        description: 'Mystical woods with fairy lights',
        primary: '140 60% 40%',
        accent: '280 50% 60%',
        secondary: '160 50% 35%',
        preview: 'from-green-600/30 to-purple-500/30',
        effects: { style: 'enchanted', particleType: 'fireflies', glowIntensity: 0.35, particleSpeed: 0.25, particleCount: 40, specialEffects: ['fireflies', 'magicMist', 'glowingMushrooms'] }
      },
      {
        id: 'fantasy-potion',
        nameKey: 'subtheme.potionWorkshop',
        description: 'Bubbling cauldrons and colorful elixirs',
        primary: '280 70% 55%',
        accent: '120 80% 50%',
        secondary: '320 60% 50%',
        preview: 'from-violet-600/30 to-green-500/30',
        effects: { style: 'alchemical', particleType: 'bubbles', glowIntensity: 0.4, particleSpeed: 0.35, particleCount: 35, specialEffects: ['risingBubbles', 'colorfulSmoke', 'potionGlow'] }
      },
      {
        id: 'fantasy-celestial',
        nameKey: 'subtheme.celestial',
        description: 'Cosmic magic and starry wonder',
        primary: '260 80% 65%',
        accent: '45 90% 70%',
        secondary: '280 70% 55%',
        preview: 'from-purple-500/30 to-yellow-400/30',
        effects: { style: 'cosmic', particleType: 'stardust', glowIntensity: 0.45, particleSpeed: 0.2, particleCount: 70, specialEffects: ['cosmicDust', 'constellations', 'celestialGlow'] }
      }
    ]
  },
  {
    id: 'scifi',
    nameKey: 'theme.scifi',
    description: 'Futuristic technology',
    icon: '🚀',
    subThemes: [
      {
        id: 'scifi-cyberpunk',
        nameKey: 'subtheme.cyberpunk',
        description: 'Neon-soaked dystopian streets',
        primary: '320 90% 55%',
        accent: '180 100% 50%',
        secondary: '280 80% 50%',
        preview: 'from-pink-500/30 to-cyan-500/30',
        effects: { style: 'cyberpunk', particleType: 'dataStreams', glowIntensity: 0.55, particleSpeed: 0.8, particleCount: 30, specialEffects: ['neonFlicker', 'rainStreaks', 'glitchEffect', 'hologramWaves'] }
      },
      {
        id: 'scifi-space',
        nameKey: 'subtheme.deepSpace',
        description: 'Vast cosmic expanse with nebulae',
        primary: '240 60% 25%',
        accent: '270 70% 50%',
        secondary: '220 50% 30%',
        preview: 'from-indigo-900/30 to-purple-600/30',
        effects: { style: 'space', particleType: 'stars', glowIntensity: 0.3, particleSpeed: 0.1, particleCount: 100, specialEffects: ['nebulaGlow', 'shootingStars', 'cosmicDrift'] }
      },
      {
        id: 'scifi-matrix',
        nameKey: 'subtheme.matrix',
        description: 'Digital rain of cascading code',
        primary: '120 100% 40%',
        accent: '140 90% 50%',
        secondary: '100 80% 35%',
        preview: 'from-green-600/30 to-green-400/30',
        effects: { style: 'matrix', particleType: 'codeRain', glowIntensity: 0.4, particleSpeed: 1.0, particleCount: 80, specialEffects: ['codeRain', 'terminalGlow', 'digitalPulse'] }
      },
      {
        id: 'scifi-neon',
        nameKey: 'subtheme.neonCity',
        description: 'Bright city lights and reflections',
        primary: '280 90% 60%',
        accent: '180 100% 55%',
        secondary: '320 85% 55%',
        preview: 'from-violet-500/30 to-cyan-400/30',
        effects: { style: 'neon', particleType: 'lightTrails', glowIntensity: 0.6, particleSpeed: 0.7, particleCount: 25, specialEffects: ['neonPulse', 'lightReflections', 'synthwaveLines'] }
      },
      {
        id: 'scifi-alien',
        nameKey: 'subtheme.alienWorld',
        description: 'Exotic bioluminescent planet',
        primary: '160 70% 45%',
        accent: '280 60% 55%',
        secondary: '140 60% 40%',
        preview: 'from-teal-500/30 to-purple-500/30',
        effects: { style: 'alien', particleType: 'spores', glowIntensity: 0.45, particleSpeed: 0.35, particleCount: 40, specialEffects: ['bioGlow', 'alienSpores', 'pulsatingOrbs'] }
      },
      {
        id: 'scifi-quantum',
        nameKey: 'subtheme.quantum',
        description: 'Particle physics and energy waves',
        primary: '200 90% 55%',
        accent: '40 95% 60%',
        secondary: '220 80% 50%',
        preview: 'from-blue-500/30 to-yellow-500/30',
        effects: { style: 'quantum', particleType: 'particles', glowIntensity: 0.5, particleSpeed: 0.9, particleCount: 60, specialEffects: ['quantumWaves', 'particleCollision', 'energyField'] }
      }
    ]
  },
  {
    id: 'horror',
    nameKey: 'theme.horror',
    description: 'Dark and terrifying',
    icon: '👻',
    subThemes: [
      {
        id: 'horror-grimoire',
        nameKey: 'subtheme.grimoire',
        description: 'Dark rituals, blood red, floating candles',
        primary: '0 70% 35%',
        accent: '350 80% 40%',
        secondary: '10 60% 25%',
        preview: 'from-red-900/40 to-red-700/40',
        effects: { style: 'occult', particleType: 'candles', glowIntensity: 0.35, particleSpeed: 0.15, particleCount: 15, specialEffects: ['floatingCandles', 'bloodDrip', 'ritualCircle', 'ancientRunes'] }
      },
      {
        id: 'horror-ghost',
        nameKey: 'subtheme.ghostly',
        description: 'Pale mists and spectral apparitions',
        primary: '210 20% 70%',
        accent: '200 30% 80%',
        secondary: '220 15% 60%',
        preview: 'from-slate-400/30 to-blue-200/30',
        effects: { style: 'spectral', particleType: 'mist', glowIntensity: 0.25, particleSpeed: 0.2, particleCount: 8, specialEffects: ['ghostlyMist', 'apparitions', 'coldBreath', 'flickerLights'] }
      },
      {
        id: 'horror-forest',
        nameKey: 'subtheme.darkForest',
        description: 'Twisted trees and lurking shadows',
        primary: '150 30% 15%',
        accent: '120 40% 25%',
        secondary: '160 25% 10%',
        preview: 'from-green-950/40 to-gray-900/40',
        effects: { style: 'wilderness', particleType: 'shadows', glowIntensity: 0.15, particleSpeed: 0.1, particleCount: 20, specialEffects: ['creepingShadows', 'eyesInDark', 'rustlingLeaves', 'owlEyes'] }
      },
      {
        id: 'horror-vampire',
        nameKey: 'subtheme.vampire',
        description: 'Elegant crimson, gothic architecture',
        primary: '350 80% 35%',
        accent: '0 70% 45%',
        secondary: '340 70% 25%',
        preview: 'from-red-800/40 to-rose-900/40',
        effects: { style: 'gothic', particleType: 'bats', glowIntensity: 0.3, particleSpeed: 0.5, particleCount: 12, specialEffects: ['flyingBats', 'bloodMoon', 'gothicArches', 'velvetDrapes'] }
      },
      {
        id: 'horror-cosmic',
        nameKey: 'subtheme.cosmicHorror',
        description: 'Eldritch abominations, unknowable void',
        primary: '260 40% 20%',
        accent: '280 50% 35%',
        secondary: '240 35% 15%',
        preview: 'from-purple-950/40 to-indigo-950/40',
        effects: { style: 'eldritch', particleType: 'tentacles', glowIntensity: 0.4, particleSpeed: 0.15, particleCount: 10, specialEffects: ['writingTentacles', 'voidPulse', 'madnessFlicker', 'cosmicEyes'] }
      },
      {
        id: 'horror-asylum',
        nameKey: 'subtheme.asylum',
        description: 'Flickering lights, institutional dread',
        primary: '60 10% 50%',
        accent: '0 0% 70%',
        secondary: '40 5% 40%',
        preview: 'from-stone-500/40 to-gray-600/40',
        effects: { style: 'institutional', particleType: 'static', glowIntensity: 0.2, particleSpeed: 0.6, particleCount: 30, specialEffects: ['flickerLights', 'staticNoise', 'wheelchairShadow', 'documentScatter'] }
      }
    ]
  },
  {
    id: 'thriller',
    nameKey: 'theme.thriller',
    description: 'Suspense and tension',
    icon: '🔍',
    subThemes: [
      {
        id: 'thriller-noir',
        nameKey: 'subtheme.noirDetective',
        description: 'Black and white, rain-soaked streets',
        primary: '0 0% 90%',
        accent: '0 0% 70%',
        secondary: '0 0% 80%',
        preview: 'from-gray-300/30 to-gray-600/30',
        effects: { style: 'noir', particleType: 'rain', glowIntensity: 0.15, particleSpeed: 0.8, particleCount: 100, specialEffects: ['heavyRain', 'filmGrain', 'venetianShadows', 'smokeWisps'] }
      },
      {
        id: 'thriller-conspiracy',
        nameKey: 'subtheme.conspiracy',
        description: 'Red strings, cork boards, secrets',
        primary: '0 70% 45%',
        accent: '45 80% 50%',
        secondary: '30 60% 40%',
        preview: 'from-red-600/30 to-amber-600/30',
        effects: { style: 'paranoid', particleType: 'papers', glowIntensity: 0.25, particleSpeed: 0.4, particleCount: 20, specialEffects: ['redStrings', 'floatingDocs', 'surveillanceGrid', 'newspaperClips'] }
      },
      {
        id: 'thriller-heist',
        nameKey: 'subtheme.heist',
        description: 'Gold vaults, laser grids, sophistication',
        primary: '45 90% 50%',
        accent: '0 80% 50%',
        secondary: '40 85% 45%',
        preview: 'from-yellow-500/30 to-red-500/30',
        effects: { style: 'sleek', particleType: 'lasers', glowIntensity: 0.35, particleSpeed: 0.5, particleCount: 15, specialEffects: ['laserGrid', 'goldShimmer', 'vaultDoor', 'securityScan'] }
      },
      {
        id: 'thriller-spy',
        nameKey: 'subtheme.spy',
        description: 'Cold war tech, blue screens, intel',
        primary: '200 60% 45%',
        accent: '180 70% 50%',
        secondary: '210 55% 40%',
        preview: 'from-blue-500/30 to-cyan-500/30',
        effects: { style: 'covert', particleType: 'data', glowIntensity: 0.3, particleSpeed: 0.6, particleCount: 25, specialEffects: ['radarSweep', 'encryptedText', 'thermalOverlay', 'crosshairs'] }
      }
    ]
  },
  {
    id: 'romance',
    nameKey: 'theme.romance',
    description: 'Love and passion',
    icon: '💕',
    subThemes: [
      {
        id: 'romance-rose',
        nameKey: 'subtheme.roseGarden',
        description: 'Soft pink petals floating gently',
        primary: '340 75% 65%',
        accent: '350 80% 70%',
        secondary: '330 70% 60%',
        preview: 'from-pink-400/30 to-rose-500/30',
        effects: { style: 'romantic', particleType: 'petals', glowIntensity: 0.35, particleSpeed: 0.25, particleCount: 30, specialEffects: ['fallingPetals', 'softGlow', 'heartBokeh', 'roseBlooms'] }
      },
      {
        id: 'romance-starlit',
        nameKey: 'subtheme.starlitNight',
        description: 'Warm starry sky, romantic evening',
        primary: '280 50% 55%',
        accent: '45 70% 65%',
        secondary: '260 45% 50%',
        preview: 'from-purple-400/30 to-yellow-400/30',
        effects: { style: 'dreamy', particleType: 'stars', glowIntensity: 0.3, particleSpeed: 0.15, particleCount: 50, specialEffects: ['twinklingStars', 'moonGlow', 'warmAmbient', 'wishingStar'] }
      },
      {
        id: 'romance-sunset',
        nameKey: 'subtheme.beachSunset',
        description: 'Golden hour on tropical shores',
        primary: '25 90% 55%',
        accent: '340 70% 60%',
        secondary: '15 85% 50%',
        preview: 'from-orange-400/30 to-pink-400/30',
        effects: { style: 'tropical', particleType: 'sandGlitter', glowIntensity: 0.4, particleSpeed: 0.3, particleCount: 35, specialEffects: ['sunRays', 'waveReflection', 'palmSilhouette', 'goldenHour'] }
      },
      {
        id: 'romance-sakura',
        nameKey: 'subtheme.cherryBlossom',
        description: 'Japanese spring, sakura petals',
        primary: '350 65% 75%',
        accent: '340 55% 80%',
        secondary: '355 60% 70%',
        preview: 'from-pink-300/30 to-rose-300/30',
        effects: { style: 'spring', particleType: 'sakura', glowIntensity: 0.3, particleSpeed: 0.2, particleCount: 40, specialEffects: ['sakuraFall', 'springBreeze', 'softPink', 'branchSilhouette'] }
      },
      {
        id: 'romance-candle',
        nameKey: 'subtheme.candlelit',
        description: 'Warm flickering candlelight dinner',
        primary: '35 85% 55%',
        accent: '25 90% 50%',
        secondary: '40 80% 45%',
        preview: 'from-amber-400/30 to-orange-500/30',
        effects: { style: 'intimate', particleType: 'flames', glowIntensity: 0.4, particleSpeed: 0.35, particleCount: 15, specialEffects: ['candleFlicker', 'warmGlow', 'wineReflection', 'intimateShadows'] }
      }
    ]
  },
  {
    id: 'mystery',
    nameKey: 'theme.mystery',
    description: 'Enigmatic and puzzling',
    icon: '🔮',
    subThemes: [
      {
        id: 'mystery-victorian',
        nameKey: 'subtheme.victorianFog',
        description: 'Sepia tones, gas lamps, London fog',
        primary: '35 40% 50%',
        accent: '45 50% 55%',
        secondary: '30 35% 45%',
        preview: 'from-amber-700/30 to-stone-600/30',
        effects: { style: 'victorian', particleType: 'fog', glowIntensity: 0.2, particleSpeed: 0.15, particleCount: 15, specialEffects: ['thickFog', 'gasLamps', 'sepiaFilter', 'cobblestones'] }
      },
      {
        id: 'mystery-library',
        nameKey: 'subtheme.midnightLibrary',
        description: 'Dusty tomes, warm lamp light',
        primary: '30 50% 40%',
        accent: '45 60% 50%',
        secondary: '25 45% 35%',
        preview: 'from-amber-800/30 to-yellow-700/30',
        effects: { style: 'scholarly', particleType: 'dustMotes', glowIntensity: 0.25, particleSpeed: 0.1, particleCount: 30, specialEffects: ['floatingDust', 'lampGlow', 'bookShadows', 'pageFlutter'] }
      },
      {
        id: 'mystery-crime',
        nameKey: 'subtheme.crimeScene',
        description: 'Yellow tape, flashlight beams',
        primary: '55 90% 50%',
        accent: '0 0% 80%',
        secondary: '50 85% 45%',
        preview: 'from-yellow-500/30 to-gray-400/30',
        effects: { style: 'forensic', particleType: 'flashlight', glowIntensity: 0.35, particleSpeed: 0.5, particleCount: 5, specialEffects: ['flashlightBeam', 'policeTape', 'evidenceMarkers', 'cameraFlash'] }
      },
      {
        id: 'mystery-ruins',
        nameKey: 'subtheme.ancientRuins',
        description: 'Archaeological discovery, sand and gold',
        primary: '40 60% 50%',
        accent: '30 70% 55%',
        secondary: '35 55% 45%',
        preview: 'from-amber-600/30 to-yellow-600/30',
        effects: { style: 'archaeological', particleType: 'sand', glowIntensity: 0.3, particleSpeed: 0.25, particleCount: 50, specialEffects: ['sandDrift', 'torchFlicker', 'hieroglyphGlow', 'ancientDust'] }
      }
    ]
  },
  {
    id: 'adventure',
    nameKey: 'theme.adventure',
    description: 'Epic journeys',
    icon: '⚔️',
    subThemes: [
      {
        id: 'adventure-jungle',
        nameKey: 'subtheme.jungleExpedition',
        description: 'Dense rainforest, exotic wildlife',
        primary: '140 70% 35%',
        accent: '100 60% 45%',
        secondary: '150 65% 30%',
        preview: 'from-green-700/30 to-lime-600/30',
        effects: { style: 'tropical', particleType: 'leaves', glowIntensity: 0.25, particleSpeed: 0.3, particleCount: 35, specialEffects: ['fallingLeaves', 'jungleMist', 'fireflySwarm', 'rainDrops'] }
      },
      {
        id: 'adventure-desert',
        nameKey: 'subtheme.desertSands',
        description: 'Golden dunes, scorching sun',
        primary: '40 70% 55%',
        accent: '30 80% 50%',
        secondary: '45 65% 50%',
        preview: 'from-yellow-600/30 to-orange-500/30',
        effects: { style: 'arid', particleType: 'sand', glowIntensity: 0.4, particleSpeed: 0.5, particleCount: 60, specialEffects: ['sandstorm', 'heatWave', 'sunGlare', 'mirage'] }
      },
      {
        id: 'adventure-ocean',
        nameKey: 'subtheme.oceanVoyage',
        description: 'Vast seas, waves and nautical charts',
        primary: '200 70% 45%',
        accent: '180 60% 50%',
        secondary: '210 65% 40%',
        preview: 'from-blue-500/30 to-cyan-500/30',
        effects: { style: 'nautical', particleType: 'bubbles', glowIntensity: 0.3, particleSpeed: 0.35, particleCount: 40, specialEffects: ['waveMotion', 'bubbleRise', 'seaFoam', 'compassRose'] }
      },
      {
        id: 'adventure-mountain',
        nameKey: 'subtheme.mountainPeak',
        description: 'Snowy summits, eagles soaring',
        primary: '210 50% 60%',
        accent: '200 40% 70%',
        secondary: '220 45% 55%',
        preview: 'from-blue-400/30 to-slate-400/30',
        effects: { style: 'alpine', particleType: 'snowflakes', glowIntensity: 0.25, particleSpeed: 0.2, particleCount: 45, specialEffects: ['snowfall', 'windStreaks', 'eagleShadow', 'iceGlint'] }
      },
      {
        id: 'adventure-treasure',
        nameKey: 'subtheme.treasureCave',
        description: 'Glittering gold, precious gems',
        primary: '45 90% 50%',
        accent: '340 70% 55%',
        secondary: '40 85% 45%',
        preview: 'from-yellow-500/30 to-pink-500/30',
        effects: { style: 'treasure', particleType: 'gems', glowIntensity: 0.5, particleSpeed: 0.3, particleCount: 30, specialEffects: ['goldSparkle', 'gemGlow', 'coinShine', 'treasureBeam'] }
      }
    ]
  }
];

export function getThemeById(themeId: string): MainTheme | undefined {
  return THEME_CONFIG.find(t => t.id === themeId);
}

export function getSubThemeById(subThemeId: string): SubTheme | undefined {
  for (const theme of THEME_CONFIG) {
    const subTheme = theme.subThemes.find(s => s.id === subThemeId);
    if (subTheme) return subTheme;
  }
  return undefined;
}

export function getParentTheme(subThemeId: string): MainTheme | undefined {
  for (const theme of THEME_CONFIG) {
    if (theme.subThemes.some(s => s.id === subThemeId)) {
      return theme;
    }
  }
  return undefined;
}
