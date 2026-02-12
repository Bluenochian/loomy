import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GENRE_OPTIONS, LANGUAGE_OPTIONS } from '@/types/story';
import { Loader2, Sparkles, X, Feather, Globe, Palette, Pen, Eye, Users, BookOpen, Gauge, AlertTriangle, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';

// Writing style options - Expanded for professional authors
const WRITING_STYLE_OPTIONS = [
  'Descriptive', 'Action-Packed', 'Dialogue-Heavy', 'Introspective',
  'Poetic', 'Cinematic', 'Minimalist', 'Immersive', 'Atmospheric',
  'Punchy', 'Lyrical', 'Sparse', 'Rich Prose', 'Stream of Consciousness',
  'Epistolary', 'Journal Style', 'Documentary', 'Satirical'
];

// POV options - Expanded for professional authors
const POV_OPTIONS = [
  { value: 'first', label: 'First Person (I/Me)' },
  { value: 'first-unreliable', label: 'First Person Unreliable' },
  { value: 'third-limited', label: 'Third Person Limited' },
  { value: 'third-deep', label: 'Third Person Deep' },
  { value: 'third-omniscient', label: 'Third Person Omniscient' },
  { value: 'third-objective', label: 'Third Person Objective' },
  { value: 'second', label: 'Second Person (You)' },
  { value: 'multiple', label: 'Multiple POV' },
  { value: 'alternating', label: 'Alternating POV' },
  { value: 'epistolary', label: 'Epistolary/Documents' },
];

// Target audience options - Expanded
const AUDIENCE_OPTIONS = [
  { value: 'middle-grade', label: 'Middle Grade (8-12)' },
  { value: 'young-adult', label: 'Young Adult (13-18)' },
  { value: 'new-adult', label: 'New Adult (18-25)' },
  { value: 'adult', label: 'Adult General' },
  { value: 'adult-literary', label: 'Adult Literary' },
  { value: 'adult-commercial', label: 'Adult Commercial' },
  { value: 'mature', label: 'Mature (18+)' },
  { value: 'crossover', label: 'Crossover/All Ages' },
];

// Pacing options
const PACING_OPTIONS = [
  { value: 'slow', icon: '🐢', label: 'Slow & Contemplative' },
  { value: 'slow-burn', icon: '🕯️', label: 'Slow Burn' },
  { value: 'medium', icon: '🦊', label: 'Balanced' },
  { value: 'fast', icon: '🐆', label: 'Fast-Paced' },
  { value: 'breakneck', icon: '⚡', label: 'Breakneck' },
  { value: 'variable', icon: '🌊', label: 'Variable/Dynamic' },
];

// Content warning options - Expanded
const CONTENT_WARNING_OPTIONS = [
  'Violence', 'Gore', 'Death', 'Trauma', 'Abuse',
  'Mental Health', 'Substance Use', 'Strong Language', 'Sexual Content',
  'Self-Harm', 'Suicide', 'War', 'Torture', 'Child Endangerment',
  'Body Horror', 'Medical Procedures', 'Grief', 'Eating Disorders'
];

// Theme influence options - Expanded for deeper storytelling
const THEME_INFLUENCE_OPTIONS = [
  'Redemption', 'Coming of Age', 'Good vs Evil', 'Love Conquers All',
  'Power Corrupts', 'Identity', 'Survival', 'Sacrifice',
  'Revenge', 'Hope', 'Betrayal', 'Freedom', 'Justice',
  'Found Family', 'Loss & Grief', 'Moral Ambiguity', 'Class Struggle',
  'Nature vs Technology', 'Fate vs Free Will', 'Isolation', 'Legacy',
  'Truth & Deception', 'Memory', 'Time', 'War & Peace', 'Humanity'
];

export function OnboardingForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  
  // Core fields
  const [concept, setConcept] = useState('');
  const [genreInfluences, setGenreInfluences] = useState<string[]>([]);
  const [language, setLanguage] = useState('English');
  const [toneValue, setToneValue] = useState([0.5]);
  
  // Enhanced fields
  const [writingStyles, setWritingStyles] = useState<string[]>([]);
  const [pov, setPov] = useState('third-limited');
  const [targetAudience, setTargetAudience] = useState('adult');
  const [chapterLength, setChapterLength] = useState([2500]);
  const [pacing, setPacing] = useState('medium');
  const [contentWarnings, setContentWarnings] = useState<string[]>([]);
  const [themeInfluences, setThemeInfluences] = useState<string[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    { id: 'concept', label: t('onboarding.concept'), icon: Feather },
    { id: 'style', label: t('onboarding.writingStyle'), icon: Pen },
    { id: 'settings', label: t('onboarding.settings'), icon: Gauge },
  ];

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    setArray(array.includes(item) ? array.filter(i => i !== item) : [...array, item]);
  };

  const getChapterLengthLabel = (value: number) => {
    if (value < 1500) return t('onboarding.chapterShort');
    if (value < 3000) return t('onboarding.chapterMedium');
    if (value < 5000) return t('onboarding.chapterLong');
    return t('onboarding.chapterEpic');
  };

  const handleSubmit = async () => {
    if (!concept.trim()) {
      toast({
        title: 'Story concept required',
        description: 'Please describe your story idea',
        variant: 'destructive',
      });
      setCurrentStep(0);
      return;
    }

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to create a story',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Build narrative rules object
      const narrativeRules = {
        pov,
        targetAudience,
        chapterLength: chapterLength[0],
        pacing,
        writingStyles,
        contentWarnings,
        themeInfluences,
      };

      // Build theme profile with selected visual theme
      const themeProfile = {
        subThemeId: settings.selectedSubTheme,
      };

      // Create the project with all enhanced fields
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: 'Untitled Story',
          concept: concept.trim(),
          language,
          tone_value: toneValue[0],
          genre_influences: genreInfluences,
          narrative_rules: narrativeRules,
          theme_profile: themeProfile,
          status: 'draft',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create initial story overview
      await supabase
        .from('story_overviews')
        .insert({
          project_id: project.id,
        });

      // Create initial outline with pacing
      await supabase
        .from('outlines')
        .insert({
          project_id: project.id,
          structure: { acts: [] },
          arcs: [],
          conflicts: [],
        });

      toast({
        title: 'Story created!',
        description: 'Generating your story world...',
      });

      // Navigate to the project and trigger AI generation
      navigate(`/project/${project.id}?generate=true`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error creating story',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return concept.trim().length > 0;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                    : isCompleted
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                <span className="text-sm font-medium sm:hidden">{index + 1}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Story Concept */}
        {currentStep === 0 && (
          <div className="space-y-8 animate-fade-in">
            {/* Story Concept */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Feather className="h-5 w-5 text-primary" />
                <Label htmlFor="concept" className="text-lg font-display font-medium">
                  {t('onboarding.concept')}
                </Label>
              </div>
              <Textarea
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={t('onboarding.conceptPlaceholder')}
                className="min-h-[180px] bg-secondary/30 border-border/50 focus:border-primary/50 text-base leading-relaxed resize-none"
                required
              />
              <p className="text-sm text-muted-foreground">
                {t('onboarding.conceptDesc')}
              </p>
            </div>

            {/* Genre Influences */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.genreInfluences')}
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    ({t('onboarding.optional')})
                  </span>
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.genreInfluencesDesc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <Badge
                    key={genre}
                    variant={genreInfluences.includes(genre) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 ${
                      genreInfluences.includes(genre)
                        ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30'
                        : 'hover:bg-secondary hover:border-primary/30'
                    }`}
                    onClick={() => toggleArrayItem(genreInfluences, setGenreInfluences, genre)}
                  >
                    {genre}
                    {genreInfluences.includes(genre) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Theme Influences */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.themeInfluences')}
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    ({t('onboarding.optional')})
                  </span>
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.themeInfluencesDesc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {THEME_INFLUENCE_OPTIONS.map((theme) => (
                  <Badge
                    key={theme}
                    variant={themeInfluences.includes(theme) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 ${
                      themeInfluences.includes(theme)
                        ? 'bg-accent/30 text-accent-foreground border-accent/50 hover:bg-accent/40'
                        : 'hover:bg-secondary hover:border-accent/30'
                    }`}
                    onClick={() => toggleArrayItem(themeInfluences, setThemeInfluences, theme)}
                  >
                    {theme}
                    {themeInfluences.includes(theme) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Writing Style */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fade-in">
            {/* Writing Styles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pen className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.writingStyle')}
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    ({t('onboarding.optional')})
                  </span>
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.writingStyleDesc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {WRITING_STYLE_OPTIONS.map((style) => (
                  <Badge
                    key={style}
                    variant={writingStyles.includes(style) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 ${
                      writingStyles.includes(style)
                        ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30'
                        : 'hover:bg-secondary hover:border-primary/30'
                    }`}
                    onClick={() => toggleArrayItem(writingStyles, setWritingStyles, style)}
                  >
                    {style}
                    {writingStyles.includes(style) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* POV Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.pov')}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.povDesc')}
              </p>
              <Select value={pov} onValueChange={setPov}>
                <SelectTrigger className="w-full max-w-sm bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POV_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pacing */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.pacing')}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.pacingDesc')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PACING_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={pacing === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer py-3 px-4 justify-center text-sm transition-all duration-200 ${
                      pacing === option.value
                        ? 'bg-primary/20 text-primary border-primary/50 hover:bg-primary/30'
                        : 'hover:bg-secondary hover:border-primary/30'
                    }`}
                    onClick={() => setPacing(option.value)}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Story Settings */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            {/* Target Audience */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.targetAudience')}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.targetAudienceDesc')}
              </p>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="w-full max-w-sm bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Length */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.chapterLength')}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.chapterLengthDesc')}
              </p>
              <div className="space-y-3">
                <Slider
                  value={chapterLength}
                  onValueChange={setChapterLength}
                  max={7000}
                  min={800}
                  step={100}
                  className="py-4"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    ~{chapterLength[0].toLocaleString()} {t('onboarding.words')}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {getChapterLengthLabel(chapterLength[0])}
                  </span>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.language')}
                </Label>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full max-w-xs bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tone Slider */}
            <div className="space-y-4">
              <Label className="text-lg font-display font-medium">
                {t('onboarding.tone')}
              </Label>
              <div className="space-y-3">
                <Slider
                  value={toneValue}
                  onValueChange={setToneValue}
                  max={1}
                  min={0}
                  step={0.1}
                  className="py-4"
                />
                <div className="flex justify-between text-sm">
                  <span className={`transition-colors ${toneValue[0] < 0.3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    ☀️ Hopeful
                  </span>
                  <span className={`transition-colors ${toneValue[0] >= 0.3 && toneValue[0] <= 0.7 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    ⚖️ Balanced
                  </span>
                  <span className={`transition-colors ${toneValue[0] > 0.7 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    🌑 Dark
                  </span>
                </div>
              </div>
            </div>

            {/* Content Warnings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <Label className="text-lg font-display font-medium">
                  {t('onboarding.contentWarnings')}
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    ({t('onboarding.optional')})
                  </span>
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.contentWarningsDesc')}
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_WARNING_OPTIONS.map((warning) => (
                  <Badge
                    key={warning}
                    variant={contentWarnings.includes(warning) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 ${
                      contentWarnings.includes(warning)
                        ? 'bg-destructive/20 text-destructive border-destructive/50 hover:bg-destructive/30'
                        : 'hover:bg-secondary hover:border-primary/30'
                    }`}
                    onClick={() => toggleArrayItem(contentWarnings, setContentWarnings, warning)}
                  >
                    {warning}
                    {contentWarnings.includes(warning) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-border/50">
        <div className="flex items-center gap-2">
          {currentStep === 0 ? (
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/projects'}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('onboarding.backToProjects')}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
          )}
        </div>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="hero"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="gap-2"
          >
            {t('onboarding.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="hero"
            size="lg"
            onClick={handleSubmit}
            disabled={isCreating || !concept.trim()}
            className="gap-2 min-w-[200px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('onboarding.weaving')}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {t('onboarding.beginWeaving')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

