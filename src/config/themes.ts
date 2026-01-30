// Comprehensive theme configuration with immersive sub-themes
// Each sub-theme has truly unique visual identity

export interface SubTheme {
  id: string;
  nameKey: string;
  description: string;
  primary: string;
  accent: string;
  secondary: string;
  background: string;
  preview: string;
  logoFont: string;
  logoIcon: string;
  effects: {
    style: string;
    renderer: string; // Unique renderer per sub-theme
    glowIntensity: number;
    ambientSpeed: number;
    overlays: string[];
    atmosphere: {
      fog?: { color: string; density: number; speed: number };
      vignette?: { color: string; intensity: number };
      grain?: { intensity: number; animated: boolean };
      scanlines?: { color: string; spacing: number; opacity: number };
      colorShift?: { hue: number; saturation: number };
    };
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
  // ═══════════════════════════════════════════════════════════════
  // DEFAULT - Clean, Professional
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'default',
    nameKey: 'theme.default',
    description: 'Clean and professional',
    icon: '✨',
    subThemes: [
      {
        id: 'default-amber',
        nameKey: 'subtheme.classicAmber',
        description: 'Warm amber glow with floating dust motes',
        primary: '38 85% 55%',
        accent: '35 90% 50%',
        secondary: '30 70% 45%',
        background: '30 20% 8%',
        preview: 'from-amber-500/30 to-orange-500/30',
        logoFont: 'Playfair Display',
        logoIcon: 'feather',
        effects: {
          style: 'warm',
          renderer: 'dustMotes',
          glowIntensity: 0.25,
          ambientSpeed: 0.3,
          overlays: ['warmGradient'],
          atmosphere: {
            vignette: { color: '30 50% 10%', intensity: 0.3 }
          }
        }
      },
      {
        id: 'default-midnight',
        nameKey: 'subtheme.midnightBlue',
        description: 'Calm starfield with gentle nebula',
        primary: '220 70% 50%',
        accent: '200 80% 55%',
        secondary: '230 60% 40%',
        background: '230 30% 8%',
        preview: 'from-blue-600/30 to-indigo-600/30',
        logoFont: 'Crimson Text',
        logoIcon: 'moon',
        effects: {
          style: 'calm',
          renderer: 'starfield',
          glowIntensity: 0.2,
          ambientSpeed: 0.15,
          overlays: ['nebula'],
          atmosphere: {
            vignette: { color: '230 60% 5%', intensity: 0.4 }
          }
        }
      },
      {
        id: 'default-forest',
        nameKey: 'subtheme.forestGreen',
        description: 'Gentle falling leaves with forest mist',
        primary: '140 50% 40%',
        accent: '160 60% 45%',
        secondary: '120 40% 35%',
        background: '140 25% 8%',
        preview: 'from-green-600/30 to-emerald-700/30',
        logoFont: 'Merriweather',
        logoIcon: 'tree-deciduous',
        effects: {
          style: 'natural',
          renderer: 'fallingLeaves',
          glowIntensity: 0.2,
          ambientSpeed: 0.25,
          overlays: ['forestMist'],
          atmosphere: {
            fog: { color: '140 30% 60%', density: 0.15, speed: 0.1 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // FANTASY - Magical & Mystical
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'fantasy',
    nameKey: 'theme.fantasy',
    description: 'Magical realms and mystical wonders',
    icon: '🧙',
    subThemes: [
      {
        id: 'fantasy-royal',
        nameKey: 'subtheme.royalGlitter',
        description: 'Purple majesty with golden sparkles and floating crowns',
        primary: '280 70% 50%',
        accent: '45 90% 55%',
        secondary: '300 60% 45%',
        background: '280 40% 8%',
        preview: 'from-purple-600/30 to-yellow-500/30',
        logoFont: 'Cinzel Decorative',
        logoIcon: 'crown',
        effects: {
          style: 'royal',
          renderer: 'royalSparkles',
          glowIntensity: 0.4,
          ambientSpeed: 0.25,
          overlays: ['goldenDust', 'royalBanner'],
          atmosphere: {
            vignette: { color: '280 60% 10%', intensity: 0.35 }
          }
        }
      },
      {
        id: 'fantasy-snow',
        nameKey: 'subtheme.snowyPlains',
        description: 'Frozen tundra with gently falling snowflakes and ice crystals',
        primary: '200 80% 75%',
        accent: '210 90% 85%',
        secondary: '190 70% 60%',
        background: '210 30% 12%',
        preview: 'from-cyan-200/30 to-blue-100/30',
        logoFont: 'Cormorant Garamond',
        logoIcon: 'snowflake',
        effects: {
          style: 'frozen',
          renderer: 'snowfall',
          glowIntensity: 0.35,
          ambientSpeed: 0.15,
          overlays: ['iceCrystals', 'frostBorder'],
          atmosphere: {
            fog: { color: '200 50% 90%', density: 0.2, speed: 0.05 }
          }
        }
      },
      {
        id: 'fantasy-dragon',
        nameKey: 'subtheme.dragonFire',
        description: 'Fierce flames with rising embers and dragon silhouettes',
        primary: '15 90% 50%',
        accent: '35 95% 55%',
        secondary: '0 80% 45%',
        background: '15 40% 6%',
        preview: 'from-orange-600/30 to-red-600/30',
        logoFont: 'Pirata One',
        logoIcon: 'flame',
        effects: {
          style: 'fiery',
          renderer: 'dragonFire',
          glowIntensity: 0.5,
          ambientSpeed: 0.6,
          overlays: ['heatDistortion', 'emberGlow'],
          atmosphere: {
            vignette: { color: '0 80% 10%', intensity: 0.5 }
          }
        }
      },
      {
        id: 'fantasy-enchanted',
        nameKey: 'subtheme.enchantedForest',
        description: 'Mystical woods with pulsing fireflies and glowing mushrooms',
        primary: '140 60% 40%',
        accent: '280 50% 60%',
        secondary: '160 50% 35%',
        background: '150 40% 6%',
        preview: 'from-green-600/30 to-purple-500/30',
        logoFont: 'Tangerine',
        logoIcon: 'sparkles',
        effects: {
          style: 'enchanted',
          renderer: 'enchantedForest',
          glowIntensity: 0.35,
          ambientSpeed: 0.2,
          overlays: ['magicMist', 'glowingFlora'],
          atmosphere: {
            fog: { color: '280 40% 30%', density: 0.25, speed: 0.08 }
          }
        }
      },
      {
        id: 'fantasy-potion',
        nameKey: 'subtheme.potionWorkshop',
        description: 'Bubbling cauldrons with colorful smoke and floating ingredients',
        primary: '280 70% 55%',
        accent: '120 80% 50%',
        secondary: '320 60% 50%',
        background: '280 35% 8%',
        preview: 'from-violet-600/30 to-green-500/30',
        logoFont: 'Mystery Quest',
        logoIcon: 'flask-conical',
        effects: {
          style: 'alchemical',
          renderer: 'potionBrew',
          glowIntensity: 0.4,
          ambientSpeed: 0.35,
          overlays: ['bubbles', 'colorfulSmoke'],
          atmosphere: {
            fog: { color: '280 60% 40%', density: 0.3, speed: 0.15 }
          }
        }
      },
      {
        id: 'fantasy-celestial',
        nameKey: 'subtheme.celestial',
        description: 'Cosmic magic with constellations and stardust trails',
        primary: '260 80% 65%',
        accent: '45 90% 70%',
        secondary: '280 70% 55%',
        background: '260 50% 5%',
        preview: 'from-purple-500/30 to-yellow-400/30',
        logoFont: 'Almendra Display',
        logoIcon: 'star',
        effects: {
          style: 'cosmic',
          renderer: 'celestialMagic',
          glowIntensity: 0.45,
          ambientSpeed: 0.12,
          overlays: ['constellations', 'shootingStars'],
          atmosphere: {
            vignette: { color: '260 70% 3%', intensity: 0.5 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // HORROR - Dark & Terrifying
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'horror',
    nameKey: 'theme.horror',
    description: 'Dark and terrifying nightmares',
    icon: '👻',
    subThemes: [
      {
        id: 'horror-grimoire',
        nameKey: 'subtheme.grimoire',
        description: 'Dark rituals with flickering candles, blood drips, and ancient runes',
        primary: '0 70% 35%',
        accent: '350 80% 40%',
        secondary: '10 60% 25%',
        background: '0 50% 4%',
        preview: 'from-red-900/40 to-red-700/40',
        logoFont: 'Nosifer',
        logoIcon: 'book-open',
        effects: {
          style: 'occult',
          renderer: 'grimoire',
          glowIntensity: 0.35,
          ambientSpeed: 0.1,
          overlays: ['floatingCandles', 'bloodDrip', 'runeCircle'],
          atmosphere: {
            vignette: { color: '0 80% 5%', intensity: 0.6 },
            grain: { intensity: 0.08, animated: true }
          }
        }
      },
      {
        id: 'horror-ghost',
        nameKey: 'subtheme.ghostly',
        description: 'Pale mists with drifting apparitions and flickering lights',
        primary: '210 20% 70%',
        accent: '200 30% 80%',
        secondary: '220 15% 60%',
        background: '220 15% 8%',
        preview: 'from-slate-400/30 to-blue-200/30',
        logoFont: 'Eater',
        logoIcon: 'ghost',
        effects: {
          style: 'spectral',
          renderer: 'ghostlyApparitions',
          glowIntensity: 0.25,
          ambientSpeed: 0.08,
          overlays: ['driftingMist', 'flickerLights', 'ghostFaces'],
          atmosphere: {
            fog: { color: '210 20% 80%', density: 0.4, speed: 0.05 },
            grain: { intensity: 0.05, animated: true }
          }
        }
      },
      {
        id: 'horror-forest',
        nameKey: 'subtheme.darkForest',
        description: 'Twisted trees with lurking shadows and glowing eyes',
        primary: '150 30% 15%',
        accent: '120 40% 25%',
        secondary: '160 25% 10%',
        background: '140 30% 3%',
        preview: 'from-green-950/40 to-gray-900/40',
        logoFont: 'Creepster',
        logoIcon: 'tree-pine',
        effects: {
          style: 'wilderness',
          renderer: 'darkForest',
          glowIntensity: 0.15,
          ambientSpeed: 0.06,
          overlays: ['twistedTrees', 'glowingEyes', 'creepingMist'],
          atmosphere: {
            fog: { color: '140 20% 10%', density: 0.5, speed: 0.03 },
            vignette: { color: '0 0% 0%', intensity: 0.7 }
          }
        }
      },
      {
        id: 'horror-vampire',
        nameKey: 'subtheme.vampire',
        description: 'Gothic elegance with flying bats and blood moon',
        primary: '350 80% 35%',
        accent: '0 70% 45%',
        secondary: '340 70% 25%',
        background: '350 40% 4%',
        preview: 'from-red-800/40 to-rose-900/40',
        logoFont: 'UnifrakturMaguntia',
        logoIcon: 'bat',
        effects: {
          style: 'gothic',
          renderer: 'vampireNight',
          glowIntensity: 0.3,
          ambientSpeed: 0.2,
          overlays: ['flyingBats', 'bloodMoon', 'gothicArches'],
          atmosphere: {
            vignette: { color: '350 70% 5%', intensity: 0.55 }
          }
        }
      },
      {
        id: 'horror-cosmic',
        nameKey: 'subtheme.cosmicHorror',
        description: 'Eldritch void with writhing tentacles and maddening eyes',
        primary: '260 40% 20%',
        accent: '280 50% 35%',
        secondary: '240 35% 15%',
        background: '260 40% 3%',
        preview: 'from-purple-950/40 to-indigo-950/40',
        logoFont: 'Butcherman',
        logoIcon: 'eye',
        effects: {
          style: 'eldritch',
          renderer: 'cosmicHorror',
          glowIntensity: 0.4,
          ambientSpeed: 0.08,
          overlays: ['voidPulse', 'tentacles', 'eldritchEyes'],
          atmosphere: {
            vignette: { color: '260 50% 2%', intensity: 0.8 },
            colorShift: { hue: 15, saturation: -10 }
          }
        }
      },
      {
        id: 'horror-asylum',
        nameKey: 'subtheme.asylum',
        description: 'Flickering fluorescent lights with static and institutional dread',
        primary: '60 10% 50%',
        accent: '0 0% 70%',
        secondary: '40 5% 40%',
        background: '60 5% 8%',
        preview: 'from-stone-500/40 to-gray-600/40',
        logoFont: 'Special Elite',
        logoIcon: 'activity',
        effects: {
          style: 'institutional',
          renderer: 'asylum',
          glowIntensity: 0.2,
          ambientSpeed: 0.4,
          overlays: ['flickerFluorescent', 'staticNoise', 'doorShadow'],
          atmosphere: {
            grain: { intensity: 0.12, animated: true },
            scanlines: { color: '60 10% 60%', spacing: 3, opacity: 0.08 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SCI-FI - Futuristic Technology
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'scifi',
    nameKey: 'theme.scifi',
    description: 'Futuristic technology and space',
    icon: '🚀',
    subThemes: [
      {
        id: 'scifi-cyberpunk',
        nameKey: 'subtheme.cyberpunk',
        description: 'Neon-soaked rain with holographic ads and glitch effects',
        primary: '320 90% 55%',
        accent: '180 100% 50%',
        secondary: '280 80% 50%',
        background: '280 50% 4%',
        preview: 'from-pink-500/30 to-cyan-500/30',
        logoFont: 'Orbitron',
        logoIcon: 'cpu',
        effects: {
          style: 'cyberpunk',
          renderer: 'cyberpunkCity',
          glowIntensity: 0.55,
          ambientSpeed: 0.6,
          overlays: ['neonRain', 'hologramAds', 'glitchBars'],
          atmosphere: {
            scanlines: { color: '180 100% 50%', spacing: 2, opacity: 0.05 }
          }
        }
      },
      {
        id: 'scifi-space',
        nameKey: 'subtheme.deepSpace',
        description: 'Vast cosmic expanse with nebulae and distant galaxies',
        primary: '240 60% 25%',
        accent: '270 70% 50%',
        secondary: '220 50% 30%',
        background: '240 50% 3%',
        preview: 'from-indigo-900/30 to-purple-600/30',
        logoFont: 'Exo 2',
        logoIcon: 'orbit',
        effects: {
          style: 'space',
          renderer: 'deepSpace',
          glowIntensity: 0.3,
          ambientSpeed: 0.05,
          overlays: ['nebulaCloud', 'distantStars', 'galaxySpiral'],
          atmosphere: {
            vignette: { color: '240 60% 2%', intensity: 0.6 }
          }
        }
      },
      {
        id: 'scifi-matrix',
        nameKey: 'subtheme.matrix',
        description: 'Cascading digital rain of green code',
        primary: '120 100% 40%',
        accent: '140 90% 50%',
        secondary: '100 80% 35%',
        background: '120 80% 2%',
        preview: 'from-green-600/30 to-green-400/30',
        logoFont: 'Share Tech Mono',
        logoIcon: 'binary',
        effects: {
          style: 'matrix',
          renderer: 'matrixRain',
          glowIntensity: 0.4,
          ambientSpeed: 1.0,
          overlays: ['codeColumns', 'terminalGlow'],
          atmosphere: {
            vignette: { color: '120 100% 2%', intensity: 0.5 },
            scanlines: { color: '120 100% 40%', spacing: 3, opacity: 0.03 }
          }
        }
      },
      {
        id: 'scifi-hologram',
        nameKey: 'subtheme.hologram',
        description: 'Blue holographic projections with data streams',
        primary: '200 90% 55%',
        accent: '220 85% 60%',
        secondary: '190 80% 50%',
        background: '210 50% 5%',
        preview: 'from-blue-500/30 to-cyan-400/30',
        logoFont: 'Rajdhani',
        logoIcon: 'scan',
        effects: {
          style: 'holographic',
          renderer: 'hologramDisplay',
          glowIntensity: 0.45,
          ambientSpeed: 0.3,
          overlays: ['holoGrid', 'dataStream', 'scanWave'],
          atmosphere: {
            scanlines: { color: '200 90% 60%', spacing: 4, opacity: 0.06 }
          }
        }
      },
      {
        id: 'scifi-alien',
        nameKey: 'subtheme.alienWorld',
        description: 'Exotic bioluminescent planet with floating spores',
        primary: '160 70% 45%',
        accent: '280 60% 55%',
        secondary: '140 60% 40%',
        background: '170 50% 4%',
        preview: 'from-teal-500/30 to-purple-500/30',
        logoFont: 'Audiowide',
        logoIcon: 'atom',
        effects: {
          style: 'alien',
          renderer: 'alienBiome',
          glowIntensity: 0.45,
          ambientSpeed: 0.2,
          overlays: ['bioSpores', 'alienPlants', 'pulsatingOrbs'],
          atmosphere: {
            fog: { color: '160 60% 40%', density: 0.2, speed: 0.1 }
          }
        }
      },
      {
        id: 'scifi-quantum',
        nameKey: 'subtheme.quantum',
        description: 'Particle physics with energy waves and atomic orbits',
        primary: '200 90% 55%',
        accent: '40 95% 60%',
        secondary: '220 80% 50%',
        background: '210 60% 4%',
        preview: 'from-blue-500/30 to-yellow-500/30',
        logoFont: 'Electrolize',
        logoIcon: 'zap',
        effects: {
          style: 'quantum',
          renderer: 'quantumField',
          glowIntensity: 0.5,
          ambientSpeed: 0.7,
          overlays: ['particleTrails', 'waveFunction', 'atomicOrbit'],
          atmosphere: {}
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // DYSTOPIA - Post-Apocalyptic Worlds
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'dystopia',
    nameKey: 'theme.dystopia',
    description: 'Post-apocalyptic wastelands',
    icon: '☢️',
    subThemes: [
      {
        id: 'dystopia-fallout',
        nameKey: 'subtheme.fallout',
        description: 'Nuclear wasteland with radiation glow and warning signs',
        primary: '50 90% 50%',
        accent: '45 100% 45%',
        secondary: '55 85% 40%',
        background: '45 30% 5%',
        preview: 'from-yellow-500/40 to-amber-600/40',
        logoFont: 'Bungee',
        logoIcon: 'radiation',
        effects: {
          style: 'nuclear',
          renderer: 'nuclearWasteland',
          glowIntensity: 0.4,
          ambientSpeed: 0.15,
          overlays: ['radiationPulse', 'ashFall', 'warningFlash'],
          atmosphere: {
            fog: { color: '50 60% 30%', density: 0.35, speed: 0.08 },
            grain: { intensity: 0.1, animated: true },
            colorShift: { hue: 10, saturation: -20 }
          }
        }
      },
      {
        id: 'dystopia-rust',
        nameKey: 'subtheme.rustBelt',
        description: 'Decaying industrial zones with rust and sparks',
        primary: '20 70% 40%',
        accent: '30 80% 50%',
        secondary: '15 60% 35%',
        background: '20 40% 5%',
        preview: 'from-orange-700/40 to-amber-800/40',
        logoFont: 'Russo One',
        logoIcon: 'factory',
        effects: {
          style: 'industrial',
          renderer: 'rustBelt',
          glowIntensity: 0.25,
          ambientSpeed: 0.2,
          overlays: ['sparkShower', 'rustParticles', 'steamVent'],
          atmosphere: {
            fog: { color: '20 50% 20%', density: 0.3, speed: 0.1 },
            grain: { intensity: 0.08, animated: false }
          }
        }
      },
      {
        id: 'dystopia-toxic',
        nameKey: 'subtheme.toxicSwamp',
        description: 'Poisoned wetlands with green mist and bubbling acid',
        primary: '90 70% 40%',
        accent: '120 60% 35%',
        secondary: '80 65% 30%',
        background: '90 50% 4%',
        preview: 'from-lime-600/40 to-green-800/40',
        logoFont: 'Bangers',
        logoIcon: 'biohazard',
        effects: {
          style: 'toxic',
          renderer: 'toxicSwamp',
          glowIntensity: 0.35,
          ambientSpeed: 0.12,
          overlays: ['acidBubbles', 'toxicMist', 'warningGlow'],
          atmosphere: {
            fog: { color: '90 60% 35%', density: 0.4, speed: 0.06 },
            vignette: { color: '90 70% 10%', intensity: 0.5 }
          }
        }
      },
      {
        id: 'dystopia-bunker',
        nameKey: 'subtheme.undergroundBunker',
        description: 'Cold concrete bunker with emergency lights',
        primary: '200 20% 45%',
        accent: '0 70% 50%',
        secondary: '210 15% 40%',
        background: '200 10% 8%',
        preview: 'from-slate-500/40 to-red-600/40',
        logoFont: 'Black Ops One',
        logoIcon: 'shield-alert',
        effects: {
          style: 'bunker',
          renderer: 'bunkerEmergency',
          glowIntensity: 0.3,
          ambientSpeed: 0.25,
          overlays: ['emergencyLight', 'pipeDrip', 'ventMist'],
          atmosphere: {
            vignette: { color: '0 0% 0%', intensity: 0.6 }
          }
        }
      },
      {
        id: 'dystopia-surveillance',
        nameKey: 'subtheme.bigBrother',
        description: 'Authoritarian regime with watching eyes and propaganda',
        primary: '0 0% 85%',
        accent: '0 80% 50%',
        secondary: '0 0% 60%',
        background: '0 0% 6%',
        preview: 'from-gray-400/40 to-red-600/40',
        logoFont: 'Anton',
        logoIcon: 'eye',
        effects: {
          style: 'authoritarian',
          renderer: 'surveillance',
          glowIntensity: 0.2,
          ambientSpeed: 0.15,
          overlays: ['searchLight', 'staticBurst', 'watchingEye'],
          atmosphere: {
            grain: { intensity: 0.15, animated: true },
            vignette: { color: '0 0% 0%', intensity: 0.7 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // UTOPIA - Perfect Futures
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'utopia',
    nameKey: 'theme.utopia',
    description: 'Perfect harmonious futures',
    icon: '🌸',
    subThemes: [
      {
        id: 'utopia-solarpunk',
        nameKey: 'subtheme.solarpunk',
        description: 'Green technology with solar panels and floating gardens',
        primary: '140 70% 45%',
        accent: '45 90% 55%',
        secondary: '160 65% 40%',
        background: '140 40% 6%',
        preview: 'from-green-500/30 to-yellow-400/30',
        logoFont: 'Comfortaa',
        logoIcon: 'sun',
        effects: {
          style: 'solarpunk',
          renderer: 'solarGarden',
          glowIntensity: 0.35,
          ambientSpeed: 0.2,
          overlays: ['floatingSeeds', 'solarFlare', 'vineGrow'],
          atmosphere: {
            fog: { color: '140 50% 70%', density: 0.1, speed: 0.05 }
          }
        }
      },
      {
        id: 'utopia-crystal',
        nameKey: 'subtheme.crystalCity',
        description: 'Gleaming crystal spires with prismatic light',
        primary: '280 60% 70%',
        accent: '200 70% 65%',
        secondary: '320 55% 65%',
        background: '280 30% 8%',
        preview: 'from-purple-400/30 to-cyan-300/30',
        logoFont: 'Poiret One',
        logoIcon: 'gem',
        effects: {
          style: 'crystalline',
          renderer: 'crystalCity',
          glowIntensity: 0.5,
          ambientSpeed: 0.15,
          overlays: ['prismLight', 'crystalGrow', 'rainbowRefract'],
          atmosphere: {}
        }
      },
      {
        id: 'utopia-cloud',
        nameKey: 'subtheme.cloudKingdom',
        description: 'Floating islands among soft clouds',
        primary: '210 70% 75%',
        accent: '35 80% 70%',
        secondary: '200 65% 70%',
        background: '210 40% 12%',
        preview: 'from-blue-300/30 to-amber-200/30',
        logoFont: 'Quicksand',
        logoIcon: 'cloud',
        effects: {
          style: 'ethereal',
          renderer: 'cloudKingdom',
          glowIntensity: 0.3,
          ambientSpeed: 0.1,
          overlays: ['floatingClouds', 'goldenRays', 'driftingIslands'],
          atmosphere: {
            fog: { color: '210 60% 85%', density: 0.25, speed: 0.03 }
          }
        }
      },
      {
        id: 'utopia-underwater',
        nameKey: 'subtheme.underwaterCity',
        description: 'Bioluminescent underwater metropolis',
        primary: '190 80% 50%',
        accent: '160 70% 55%',
        secondary: '200 75% 45%',
        background: '200 60% 5%',
        preview: 'from-cyan-500/30 to-teal-400/30',
        logoFont: 'Satisfy',
        logoIcon: 'waves',
        effects: {
          style: 'aquatic',
          renderer: 'underwaterCity',
          glowIntensity: 0.4,
          ambientSpeed: 0.15,
          overlays: ['bubbleStream', 'bioGlow', 'fishSchool', 'lightRays'],
          atmosphere: {
            fog: { color: '190 70% 40%', density: 0.3, speed: 0.08 }
          }
        }
      },
      {
        id: 'utopia-harmony',
        nameKey: 'subtheme.harmonyGarden',
        description: 'Zen garden with cherry blossoms and koi ponds',
        primary: '350 60% 70%',
        accent: '140 50% 55%',
        secondary: '30 70% 60%',
        background: '30 20% 8%',
        preview: 'from-pink-300/30 to-green-400/30',
        logoFont: 'Noto Serif JP',
        logoIcon: 'flower-2',
        effects: {
          style: 'zen',
          renderer: 'zenGarden',
          glowIntensity: 0.25,
          ambientSpeed: 0.1,
          overlays: ['sakuraPetals', 'koiSwim', 'ripples'],
          atmosphere: {
            fog: { color: '350 40% 80%', density: 0.15, speed: 0.02 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // STEAMPUNK - Victorian Technology
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'steampunk',
    nameKey: 'theme.steampunk',
    description: 'Victorian-era technology',
    icon: '⚙️',
    subThemes: [
      {
        id: 'steampunk-clockwork',
        nameKey: 'subtheme.clockworkCity',
        description: 'Rotating gears and brass mechanisms',
        primary: '35 70% 50%',
        accent: '40 80% 55%',
        secondary: '30 65% 45%',
        background: '35 40% 6%',
        preview: 'from-amber-600/30 to-yellow-700/30',
        logoFont: 'IM Fell English',
        logoIcon: 'cog',
        effects: {
          style: 'clockwork',
          renderer: 'clockworkMechanism',
          glowIntensity: 0.3,
          ambientSpeed: 0.2,
          overlays: ['rotatingGears', 'brassShine', 'steamPuff'],
          atmosphere: {
            fog: { color: '35 40% 40%', density: 0.2, speed: 0.1 }
          }
        }
      },
      {
        id: 'steampunk-airship',
        nameKey: 'subtheme.airshipFleet',
        description: 'Sky filled with airships and clouds',
        primary: '200 50% 55%',
        accent: '35 70% 50%',
        secondary: '210 45% 50%',
        background: '200 30% 8%',
        preview: 'from-blue-400/30 to-amber-500/30',
        logoFont: 'Marcellus',
        logoIcon: 'ship',
        effects: {
          style: 'aeronautical',
          renderer: 'airshipSky',
          glowIntensity: 0.25,
          ambientSpeed: 0.15,
          overlays: ['floatingAirships', 'propellerSpin', 'cloudDrift'],
          atmosphere: {
            fog: { color: '200 40% 70%', density: 0.15, speed: 0.05 }
          }
        }
      },
      {
        id: 'steampunk-laboratory',
        nameKey: 'subtheme.madScientist',
        description: 'Tesla coils and electrical experiments',
        primary: '45 80% 55%',
        accent: '200 90% 60%',
        secondary: '40 75% 50%',
        background: '45 30% 5%',
        preview: 'from-yellow-500/30 to-blue-500/30',
        logoFont: 'Vollkorn',
        logoIcon: 'lightbulb',
        effects: {
          style: 'electric',
          renderer: 'teslaLab',
          glowIntensity: 0.5,
          ambientSpeed: 0.4,
          overlays: ['electricArc', 'teslaCoil', 'sparkBurst'],
          atmosphere: {}
        }
      },
      {
        id: 'steampunk-victorian',
        nameKey: 'subtheme.victorianStreet',
        description: 'Foggy London streets with gas lamps',
        primary: '35 40% 50%',
        accent: '45 50% 55%',
        secondary: '30 35% 45%',
        background: '35 20% 6%',
        preview: 'from-amber-700/30 to-stone-600/30',
        logoFont: 'Libre Baskerville',
        logoIcon: 'lamp',
        effects: {
          style: 'victorian',
          renderer: 'victorianFog',
          glowIntensity: 0.2,
          ambientSpeed: 0.08,
          overlays: ['gasLamp', 'thickFog', 'cobblestone'],
          atmosphere: {
            fog: { color: '35 30% 50%', density: 0.5, speed: 0.04 },
            grain: { intensity: 0.06, animated: false }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ROMANCE - Love & Passion
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'romance',
    nameKey: 'theme.romance',
    description: 'Love and passion',
    icon: '💕',
    subThemes: [
      {
        id: 'romance-rose',
        nameKey: 'subtheme.roseGarden',
        description: 'Soft pink petals drifting with heart bokeh',
        primary: '340 75% 65%',
        accent: '350 80% 70%',
        secondary: '330 70% 60%',
        background: '340 40% 8%',
        preview: 'from-pink-400/30 to-rose-500/30',
        logoFont: 'Great Vibes',
        logoIcon: 'heart',
        effects: {
          style: 'romantic',
          renderer: 'roseGarden',
          glowIntensity: 0.35,
          ambientSpeed: 0.2,
          overlays: ['fallingPetals', 'heartBokeh', 'softGlow'],
          atmosphere: {
            vignette: { color: '340 60% 20%', intensity: 0.3 }
          }
        }
      },
      {
        id: 'romance-starlit',
        nameKey: 'subtheme.starlitNight',
        description: 'Romantic starry sky with shooting stars',
        primary: '280 50% 55%',
        accent: '45 70% 65%',
        secondary: '260 45% 50%',
        background: '260 40% 6%',
        preview: 'from-purple-400/30 to-yellow-400/30',
        logoFont: 'Dancing Script',
        logoIcon: 'sparkle',
        effects: {
          style: 'dreamy',
          renderer: 'starlitNight',
          glowIntensity: 0.3,
          ambientSpeed: 0.12,
          overlays: ['twinklingStars', 'shootingStar', 'moonGlow'],
          atmosphere: {
            vignette: { color: '260 50% 5%', intensity: 0.4 }
          }
        }
      },
      {
        id: 'romance-sunset',
        nameKey: 'subtheme.beachSunset',
        description: 'Golden hour beach with palm silhouettes',
        primary: '25 90% 55%',
        accent: '340 70% 60%',
        secondary: '15 85% 50%',
        background: '25 50% 8%',
        preview: 'from-orange-400/30 to-pink-400/30',
        logoFont: 'Pacifico',
        logoIcon: 'sunset',
        effects: {
          style: 'tropical',
          renderer: 'beachSunset',
          glowIntensity: 0.4,
          ambientSpeed: 0.08,
          overlays: ['sunRays', 'palmSilhouette', 'waveShimmer'],
          atmosphere: {
            vignette: { color: '25 70% 15%', intensity: 0.35 }
          }
        }
      },
      {
        id: 'romance-sakura',
        nameKey: 'subtheme.cherryBlossom',
        description: 'Japanese spring with sakura petals',
        primary: '350 65% 75%',
        accent: '340 55% 80%',
        secondary: '355 60% 70%',
        background: '350 30% 8%',
        preview: 'from-pink-300/30 to-rose-300/30',
        logoFont: 'Kaushan Script',
        logoIcon: 'flower',
        effects: {
          style: 'spring',
          renderer: 'sakuraBloom',
          glowIntensity: 0.3,
          ambientSpeed: 0.18,
          overlays: ['sakuraPetals', 'branchSilhouette', 'softBreeze'],
          atmosphere: {
            fog: { color: '350 50% 85%', density: 0.1, speed: 0.03 }
          }
        }
      },
      {
        id: 'romance-candle',
        nameKey: 'subtheme.candlelit',
        description: 'Warm candlelight dinner ambiance',
        primary: '35 85% 55%',
        accent: '25 90% 50%',
        secondary: '40 80% 45%',
        background: '30 40% 5%',
        preview: 'from-amber-400/30 to-orange-500/30',
        logoFont: 'Cormorant Upright',
        logoIcon: 'flame',
        effects: {
          style: 'intimate',
          renderer: 'candlelitDinner',
          glowIntensity: 0.4,
          ambientSpeed: 0.15,
          overlays: ['flickeringCandles', 'wineGlass', 'warmAmbient'],
          atmosphere: {
            vignette: { color: '30 60% 8%', intensity: 0.5 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // THRILLER - Suspense & Tension
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'thriller',
    nameKey: 'theme.thriller',
    description: 'Suspense and tension',
    icon: '🔍',
    subThemes: [
      {
        id: 'thriller-noir',
        nameKey: 'subtheme.noirDetective',
        description: 'Black and white with rain and venetian shadows',
        primary: '0 0% 90%',
        accent: '0 0% 70%',
        secondary: '0 0% 80%',
        background: '0 0% 5%',
        preview: 'from-gray-300/30 to-gray-600/30',
        logoFont: 'Permanent Marker',
        logoIcon: 'search',
        effects: {
          style: 'noir',
          renderer: 'noirCity',
          glowIntensity: 0.15,
          ambientSpeed: 0.6,
          overlays: ['heavyRain', 'venetianBlinds', 'cigaretteSmoke'],
          atmosphere: {
            grain: { intensity: 0.1, animated: true },
            colorShift: { hue: 0, saturation: -100 }
          }
        }
      },
      {
        id: 'thriller-conspiracy',
        nameKey: 'subtheme.conspiracy',
        description: 'Red strings, cork boards, and scattered documents',
        primary: '0 70% 45%',
        accent: '45 80% 50%',
        secondary: '30 60% 40%',
        background: '30 30% 6%',
        preview: 'from-red-600/30 to-amber-600/30',
        logoFont: 'Cutive Mono',
        logoIcon: 'link',
        effects: {
          style: 'paranoid',
          renderer: 'conspiracyBoard',
          glowIntensity: 0.25,
          ambientSpeed: 0.1,
          overlays: ['redStrings', 'floatingPhotos', 'typewriterKey'],
          atmosphere: {
            vignette: { color: '30 40% 10%', intensity: 0.5 },
            grain: { intensity: 0.08, animated: false }
          }
        }
      },
      {
        id: 'thriller-heist',
        nameKey: 'subtheme.heist',
        description: 'Gold vault with laser grids and sophistication',
        primary: '45 90% 50%',
        accent: '0 80% 50%',
        secondary: '40 85% 45%',
        background: '45 30% 5%',
        preview: 'from-yellow-500/30 to-red-500/30',
        logoFont: 'Bebas Neue',
        logoIcon: 'lock',
        effects: {
          style: 'sleek',
          renderer: 'heistVault',
          glowIntensity: 0.35,
          ambientSpeed: 0.25,
          overlays: ['laserGrid', 'goldReflection', 'alarmPulse'],
          atmosphere: {}
        }
      },
      {
        id: 'thriller-spy',
        nameKey: 'subtheme.spy',
        description: 'Cold war tech with radar sweeps and encrypted data',
        primary: '200 60% 45%',
        accent: '180 70% 50%',
        secondary: '210 55% 40%',
        background: '200 40% 5%',
        preview: 'from-blue-500/30 to-cyan-500/30',
        logoFont: 'Roboto Mono',
        logoIcon: 'radar',
        effects: {
          style: 'covert',
          renderer: 'spyTech',
          glowIntensity: 0.3,
          ambientSpeed: 0.35,
          overlays: ['radarSweep', 'encryptedText', 'thermalScan'],
          atmosphere: {
            scanlines: { color: '200 60% 50%', spacing: 4, opacity: 0.04 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // MYSTERY - Enigmatic Puzzles
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'mystery',
    nameKey: 'theme.mystery',
    description: 'Enigmatic and puzzling',
    icon: '🔮',
    subThemes: [
      {
        id: 'mystery-victorian',
        nameKey: 'subtheme.victorianFog',
        description: 'Sepia London with gas lamps and thick fog',
        primary: '35 40% 50%',
        accent: '45 50% 55%',
        secondary: '30 35% 45%',
        background: '35 25% 6%',
        preview: 'from-amber-700/30 to-stone-600/30',
        logoFont: 'EB Garamond',
        logoIcon: 'lamp-desk',
        effects: {
          style: 'victorian',
          renderer: 'victorianMystery',
          glowIntensity: 0.2,
          ambientSpeed: 0.08,
          overlays: ['gasLampGlow', 'thickFog', 'carriageShadow'],
          atmosphere: {
            fog: { color: '35 30% 50%', density: 0.45, speed: 0.04 },
            colorShift: { hue: 20, saturation: -30 }
          }
        }
      },
      {
        id: 'mystery-library',
        nameKey: 'subtheme.midnightLibrary',
        description: 'Dusty tomes with floating pages and lamp light',
        primary: '30 50% 40%',
        accent: '45 60% 50%',
        secondary: '25 45% 35%',
        background: '30 35% 5%',
        preview: 'from-amber-800/30 to-yellow-700/30',
        logoFont: 'Spectral',
        logoIcon: 'book-marked',
        effects: {
          style: 'scholarly',
          renderer: 'mysteryLibrary',
          glowIntensity: 0.25,
          ambientSpeed: 0.1,
          overlays: ['floatingPages', 'dustMotes', 'candleFlicker'],
          atmosphere: {
            vignette: { color: '30 50% 8%', intensity: 0.5 }
          }
        }
      },
      {
        id: 'mystery-crime',
        nameKey: 'subtheme.crimeScene',
        description: 'Yellow tape and flashlight beams in darkness',
        primary: '55 90% 50%',
        accent: '0 0% 80%',
        secondary: '50 85% 45%',
        background: '55 20% 5%',
        preview: 'from-yellow-500/30 to-gray-400/30',
        logoFont: 'Oswald',
        logoIcon: 'flashlight',
        effects: {
          style: 'forensic',
          renderer: 'crimeScene',
          glowIntensity: 0.35,
          ambientSpeed: 0.2,
          overlays: ['flashlightBeam', 'policeTape', 'cameraFlash'],
          atmosphere: {
            vignette: { color: '0 0% 0%', intensity: 0.7 }
          }
        }
      },
      {
        id: 'mystery-ruins',
        nameKey: 'subtheme.ancientRuins',
        description: 'Archaeological site with torchlight and sand',
        primary: '40 60% 50%',
        accent: '30 70% 55%',
        secondary: '35 55% 45%',
        background: '40 40% 5%',
        preview: 'from-amber-600/30 to-yellow-600/30',
        logoFont: 'Uncial Antiqua',
        logoIcon: 'landmark',
        effects: {
          style: 'archaeological',
          renderer: 'ancientRuins',
          glowIntensity: 0.3,
          ambientSpeed: 0.15,
          overlays: ['torchFlicker', 'sandDrift', 'hieroglyphs'],
          atmosphere: {
            fog: { color: '40 50% 40%', density: 0.2, speed: 0.05 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ADVENTURE - Epic Journeys
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'adventure',
    nameKey: 'theme.adventure',
    description: 'Epic journeys and exploration',
    icon: '⚔️',
    subThemes: [
      {
        id: 'adventure-jungle',
        nameKey: 'subtheme.jungleExpedition',
        description: 'Dense rainforest with exotic wildlife',
        primary: '140 70% 35%',
        accent: '100 60% 45%',
        secondary: '150 65% 30%',
        background: '140 50% 5%',
        preview: 'from-green-700/30 to-lime-600/30',
        logoFont: 'Amatic SC',
        logoIcon: 'palmtree',
        effects: {
          style: 'tropical',
          renderer: 'jungleExpedition',
          glowIntensity: 0.25,
          ambientSpeed: 0.2,
          overlays: ['fallingLeaves', 'parrotFlight', 'vineDrip'],
          atmosphere: {
            fog: { color: '140 50% 40%', density: 0.25, speed: 0.08 }
          }
        }
      },
      {
        id: 'adventure-desert',
        nameKey: 'subtheme.desertSands',
        description: 'Golden dunes with heat shimmer and scorching sun',
        primary: '40 70% 55%',
        accent: '30 80% 50%',
        secondary: '45 65% 50%',
        background: '40 45% 6%',
        preview: 'from-yellow-600/30 to-orange-500/30',
        logoFont: 'Philosopher',
        logoIcon: 'mountain-snow',
        effects: {
          style: 'arid',
          renderer: 'desertExpanse',
          glowIntensity: 0.4,
          ambientSpeed: 0.3,
          overlays: ['sandstorm', 'heatWave', 'camelShadow'],
          atmosphere: {
            fog: { color: '40 60% 60%', density: 0.15, speed: 0.1 }
          }
        }
      },
      {
        id: 'adventure-ocean',
        nameKey: 'subtheme.oceanVoyage',
        description: 'Vast seas with waves and nautical maps',
        primary: '200 70% 45%',
        accent: '180 60% 50%',
        secondary: '210 65% 40%',
        background: '200 50% 5%',
        preview: 'from-blue-500/30 to-cyan-500/30',
        logoFont: 'Lora',
        logoIcon: 'anchor',
        effects: {
          style: 'nautical',
          renderer: 'oceanVoyage',
          glowIntensity: 0.3,
          ambientSpeed: 0.25,
          overlays: ['waveMotion', 'seagullFlight', 'compassSpin'],
          atmosphere: {
            fog: { color: '200 50% 70%', density: 0.15, speed: 0.06 }
          }
        }
      },
      {
        id: 'adventure-mountain',
        nameKey: 'subtheme.mountainPeak',
        description: 'Snowy summits with eagles soaring',
        primary: '210 50% 60%',
        accent: '200 40% 70%',
        secondary: '220 45% 55%',
        background: '210 35% 8%',
        preview: 'from-blue-400/30 to-slate-400/30',
        logoFont: 'Arvo',
        logoIcon: 'mountain',
        effects: {
          style: 'alpine',
          renderer: 'mountainPeak',
          glowIntensity: 0.25,
          ambientSpeed: 0.15,
          overlays: ['snowfall', 'eagleSoar', 'windStreaks'],
          atmosphere: {
            fog: { color: '210 40% 80%', density: 0.2, speed: 0.04 }
          }
        }
      },
      {
        id: 'adventure-treasure',
        nameKey: 'subtheme.treasureCave',
        description: 'Glittering gold and precious gems in a cave',
        primary: '45 90% 50%',
        accent: '340 70% 55%',
        secondary: '40 85% 45%',
        background: '45 40% 4%',
        preview: 'from-yellow-500/30 to-pink-500/30',
        logoFont: 'Rye',
        logoIcon: 'coins',
        effects: {
          style: 'treasure',
          renderer: 'treasureCave',
          glowIntensity: 0.5,
          ambientSpeed: 0.2,
          overlays: ['goldSparkle', 'gemGlow', 'torchFlame'],
          atmosphere: {
            vignette: { color: '45 50% 5%', intensity: 0.6 }
          }
        }
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // HISTORICAL - Period Pieces
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'historical',
    nameKey: 'theme.historical',
    description: 'Historical periods and eras',
    icon: '🏛️',
    subThemes: [
      {
        id: 'historical-medieval',
        nameKey: 'subtheme.medieval',
        description: 'Stone castles with torchlight and banners',
        primary: '30 50% 45%',
        accent: '0 60% 40%',
        secondary: '25 45% 40%',
        background: '30 30% 6%',
        preview: 'from-amber-700/30 to-red-700/30',
        logoFont: 'MedievalSharp',
        logoIcon: 'castle',
        effects: {
          style: 'medieval',
          renderer: 'medievalCastle',
          glowIntensity: 0.3,
          ambientSpeed: 0.12,
          overlays: ['torchFlame', 'bannerWave', 'stoneDust'],
          atmosphere: {
            vignette: { color: '30 40% 8%', intensity: 0.5 }
          }
        }
      },
      {
        id: 'historical-ancient',
        nameKey: 'subtheme.ancientRome',
        description: 'Marble columns with laurel wreaths and gold',
        primary: '40 50% 55%',
        accent: '30 70% 50%',
        secondary: '35 45% 50%',
        background: '40 25% 8%',
        preview: 'from-amber-500/30 to-yellow-600/30',
        logoFont: 'Caesar Dressing',
        logoIcon: 'columns',
        effects: {
          style: 'classical',
          renderer: 'ancientRome',
          glowIntensity: 0.25,
          ambientSpeed: 0.1,
          overlays: ['marbleShine', 'laurelFloat', 'columnShadow'],
          atmosphere: {
            fog: { color: '40 30% 70%', density: 0.1, speed: 0.03 }
          }
        }
      },
      {
        id: 'historical-viking',
        nameKey: 'subtheme.vikingNorse',
        description: 'Nordic runes with aurora and snow',
        primary: '200 50% 50%',
        accent: '140 60% 45%',
        secondary: '210 45% 45%',
        background: '200 35% 5%',
        preview: 'from-blue-500/30 to-green-500/30',
        logoFont: 'Germania One',
        logoIcon: 'axe',
        effects: {
          style: 'norse',
          renderer: 'vikingNorse',
          glowIntensity: 0.35,
          ambientSpeed: 0.15,
          overlays: ['auroraBorealis', 'runeGlow', 'snowDrift'],
          atmosphere: {
            fog: { color: '200 40% 60%', density: 0.2, speed: 0.06 }
          }
        }
      },
      {
        id: 'historical-egyptian',
        nameKey: 'subtheme.ancientEgypt',
        description: 'Pyramids with hieroglyphs and desert gold',
        primary: '45 75% 50%',
        accent: '35 85% 45%',
        secondary: '50 70% 45%',
        background: '45 40% 5%',
        preview: 'from-yellow-600/30 to-amber-700/30',
        logoFont: 'Papyrus',
        logoIcon: 'pyramid',
        effects: {
          style: 'egyptian',
          renderer: 'ancientEgypt',
          glowIntensity: 0.35,
          ambientSpeed: 0.1,
          overlays: ['sandDrift', 'hieroglyphGlow', 'scarabFlight'],
          atmosphere: {
            fog: { color: '45 50% 50%', density: 0.15, speed: 0.08 }
          }
        }
      },
      {
        id: 'historical-samurai',
        nameKey: 'subtheme.feudalJapan',
        description: 'Cherry blossoms with katanas and temple bells',
        primary: '350 50% 55%',
        accent: '0 60% 45%',
        secondary: '340 45% 50%',
        background: '350 30% 6%',
        preview: 'from-pink-500/30 to-red-600/30',
        logoFont: 'Shippori Mincho',
        logoIcon: 'swords',
        effects: {
          style: 'samurai',
          renderer: 'feudalJapan',
          glowIntensity: 0.3,
          ambientSpeed: 0.15,
          overlays: ['sakuraStorm', 'katanaGlint', 'templeGong'],
          atmosphere: {
            fog: { color: '350 40% 70%', density: 0.15, speed: 0.05 }
          }
        }
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
