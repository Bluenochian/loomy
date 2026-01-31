import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeEffects } from '@/components/themes/ThemeEffects';
import { ThemedLogo } from '@/components/themes/ThemedLogo';
import { ThemePreviewBadge } from '@/components/welcome/ThemePreviewBadge';
import { Sparkles, BookOpen, Wand2, Palette, ArrowRight, Pen, Stars } from 'lucide-react';
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

  // If user is authenticated, show onboarding form with theme effects
  if (user) {
    return (
      <div className="min-h-screen bg-background overflow-hidden">
        {/* Theme Effects Background - Same as landing page */}
        <ThemeEffects themeId={themeId} />
        
        {/* Language Selector */}
        <div className="fixed top-4 left-4 z-50">
          <LanguageSelector variant="compact" />
        </div>

        {/* Theme Preview Badge */}
        <ThemePreviewBadge />

        {/* Animated ambient background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
            style={{ 
              top: '10%', 
              left: '10%',
              animation: 'float 12s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl"
            style={{ 
              bottom: '10%', 
              right: '15%',
              animation: 'float 15s ease-in-out infinite',
              animationDelay: '-5s'
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-primary/5 via-primary/2 to-transparent rounded-full"
            style={{ animation: 'pulse 8s ease-in-out infinite' }}
          />
        </div>

        <div className="relative z-10 container max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-6">
              <ThemedLogo size="lg" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-balance gradient-text">
              {t('welcome.letsWeave')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t('welcome.tellUs')}
            </p>
          </div>

          {/* Onboarding Form with glass effect */}
          <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-elevated animate-slide-up">
            <OnboardingForm />
          </div>
        </div>
      </div>
    );
  }

  // Show landing/auth page for unauthenticated users
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Theme Effects Background */}
      <ThemeEffects themeId={themeId} />
      
      {/* Language Selector - Top Left */}
      <div className="fixed top-4 left-4 z-50">
        <LanguageSelector variant="compact" />
      </div>

      {/* Theme Preview Badge - Top Right */}
      <ThemePreviewBadge />

      {/* Animated ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orb */}
        <div 
          className="absolute w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl animate-float"
          style={{ 
            top: '20%', 
            left: '15%',
            animation: 'float 8s ease-in-out infinite'
          }}
        />
        {/* Secondary floating orb */}
        <div 
          className="absolute w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl"
          style={{ 
            bottom: '15%', 
            right: '20%',
            animation: 'float 10s ease-in-out infinite',
            animationDelay: '-4s'
          }}
        />
        {/* Center radial glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full"
          style={{ animation: 'pulse 6s ease-in-out infinite' }}
        />
        {/* Moving sparkles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full"
              style={{
                top: `${10 + (i * 7) % 80}%`,
                left: `${5 + (i * 11) % 90}%`,
                animation: `twinkle ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
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
