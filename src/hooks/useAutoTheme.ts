import { useEffect } from 'react';
import { useStory } from '@/context/StoryContext';

// Genre keywords to theme mapping
const GENRE_KEYWORDS: Record<string, string[]> = {
  fantasy: ['magic', 'wizard', 'dragon', 'kingdom', 'sword', 'quest', 'elf', 'dwarf', 'medieval', 'enchant', 'spell', 'mythical', 'legend', 'throne', 'castle'],
  scifi: ['space', 'robot', 'alien', 'future', 'cyber', 'tech', 'ship', 'planet', 'galaxy', 'ai', 'android', 'laser', 'dystopia', 'utopia', 'colony'],
  thriller: ['murder', 'crime', 'detective', 'spy', 'chase', 'escape', 'danger', 'suspense', 'conspiracy', 'hunt', 'assassin', 'secret', 'agent'],
  romance: ['love', 'heart', 'passion', 'kiss', 'relationship', 'marriage', 'wedding', 'couple', 'romantic', 'affection', 'desire', 'longing'],
  horror: ['ghost', 'demon', 'haunted', 'curse', 'fear', 'terror', 'nightmare', 'blood', 'death', 'evil', 'monster', 'zombie', 'vampire', 'dark'],
  mystery: ['clue', 'investigate', 'secret', 'puzzle', 'detective', 'solve', 'hidden', 'mystery', 'enigma', 'riddle', 'suspect', 'evidence'],
  adventure: ['journey', 'explore', 'treasure', 'expedition', 'discover', 'travel', 'wild', 'nature', 'survival', 'map', 'ancient', 'ruins'],
};

const GENRE_THEMES: Record<string, { primary: string; accent: string }> = {
  default: { primary: '38 85% 55%', accent: '35 90% 50%' },
  fantasy: { primary: '45 80% 50%', accent: '280 60% 50%' },
  scifi: { primary: '190 80% 50%', accent: '260 70% 60%' },
  thriller: { primary: '0 0% 95%', accent: '0 70% 50%' },
  romance: { primary: '340 70% 60%', accent: '320 60% 50%' },
  horror: { primary: '0 60% 45%', accent: '270 50% 40%' },
  mystery: { primary: '230 60% 55%', accent: '180 50% 40%' },
  adventure: { primary: '30 60% 50%', accent: '140 50% 40%' },
};

function detectGenre(text: string): string {
  const lowerText = text.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    scores[genre] = keywords.filter(keyword => lowerText.includes(keyword)).length;
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'default';

  return Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || 'default';
}

export function useAutoTheme() {
  const { currentProject } = useStory();

  useEffect(() => {
    if (!currentProject) return;

    // Check if theme was manually set
    const savedThemeId = currentProject.theme_profile?.themeId;
    if (savedThemeId && savedThemeId !== 'default') return;

    // Detect genre from concept and genre influences
    const conceptText = currentProject.concept || '';
    const genreInfluences = (currentProject.genre_influences || []).join(' ');
    const combinedText = `${conceptText} ${genreInfluences}`;

    const detectedGenre = detectGenre(combinedText);
    const theme = GENRE_THEMES[detectedGenre] || GENRE_THEMES.default;

    // Apply theme to document
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--glow-primary', theme.primary);
    
    // Calculate primary-foreground based on lightness for contrast
    const primaryParts = theme.primary.split(' ').map(p => parseFloat(p));
    const primaryLightness = primaryParts[2] || 50;
    root.style.setProperty('--primary-foreground', primaryLightness > 50 ? '222 25% 8%' : '40 20% 95%');
    
    // Accent foreground
    const accentParts = theme.accent.split(' ').map(p => parseFloat(p));
    const accentLightness = accentParts[2] || 50;
    root.style.setProperty('--accent-foreground', accentLightness > 50 ? '222 25% 8%' : '40 20% 95%');
    
    root.setAttribute('data-theme', detectedGenre);

  }, [currentProject?.id, currentProject?.concept, currentProject?.genre_influences]);
}

export function applyTheme(themeId: string) {
  const theme = GENRE_THEMES[themeId] || GENRE_THEMES.default;
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--ring', theme.primary);
  root.style.setProperty('--glow-primary', theme.primary);
  
  // Calculate foreground colors for contrast
  const primaryParts = theme.primary.split(' ').map(p => parseFloat(p));
  const primaryLightness = primaryParts[2] || 50;
  root.style.setProperty('--primary-foreground', primaryLightness > 50 ? '222 25% 8%' : '40 20% 95%');
  
  const accentParts = theme.accent.split(' ').map(p => parseFloat(p));
  const accentLightness = accentParts[2] || 50;
  root.style.setProperty('--accent-foreground', accentLightness > 50 ? '222 25% 8%' : '40 20% 95%');
  
  root.setAttribute('data-theme', themeId);
}
