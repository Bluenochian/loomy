import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeEffects } from '@/components/themes/ThemeEffects';
import { ThemedLogo } from '@/components/themes/ThemedLogo';
import { Sparkles, BookOpen, Wand2, Palette, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [showAuth, setShowAuth] = useState(false);

  const themeId = settings.selectedSubTheme || 'default';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show onboarding form
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Ambient background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container max-w-3xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-bold gradient-text">LOOMY</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance">
              Let's Weave Your Story
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Tell us about the world you want to create. The more detail you provide, 
              the richer your story foundation will be.
            </p>
          </div>

          {/* Onboarding Form */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-elevated animate-slide-up">
            <OnboardingForm />
          </div>
        </div>
      </div>
    );
  }

  // Show landing/auth page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Theme Effects Background */}
      <ThemeEffects themeId={themeId} />
      
      {/* Language Selector - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <LanguageSelector variant="compact" />
      </div>

      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Hero content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
          <div className="max-w-xl">
            {/* Logo - Uses themed logo */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <ThemedLogo size="lg" />
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {t('welcome.headline1')}
              <br />
              <span className="gradient-text">{t('welcome.headline2')}</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {t('welcome.description')}
            </p>

            {/* Features */}
            <div className="grid gap-4 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('welcome.feature1.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('welcome.feature1.desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('welcome.feature2.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('welcome.feature2.desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wand2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('welcome.feature3.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('welcome.feature3.desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA for mobile */}
            <div className="lg:hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => setShowAuth(true)}
              >
                {t('welcome.startWriting')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Auth form (desktop) */}
        <div className="hidden lg:flex w-[480px] items-center justify-center p-8 border-l border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold mb-2">
                {authMode === 'signup' ? t('welcome.createAccount') : t('welcome.signIn')}
              </h2>
              <p className="text-muted-foreground">
                {authMode === 'signup' 
                  ? t('welcome.beginJourney')
                  : t('welcome.continueStory')}
              </p>
            </div>
            <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} />
          </div>
        </div>
      </div>

      {/* Mobile auth modal */}
      {showAuth && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-bold">
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </h2>
              <button 
                onClick={() => setShowAuth(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} />
          </div>
        </div>
      )}
    </div>
  );
}
