import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast({
          title: t('auth.accountCreated'),
          description: t('auth.checkEmail'),
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/projects');
      }
    } catch (error) {
      toast({
        title: t('auth.failed'),
        description: error instanceof Error ? error.message : t('auth.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-sm font-medium text-foreground/80">
            {t('auth.displayName')}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('auth.yourName')}
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
          {t('auth.email')}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
          {t('auth.password')}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="hero"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')}
          </>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {mode === 'signup' 
            ? t('auth.haveAccount')
            : t('auth.noAccount')}
        </button>
      </div>
    </form>
  );
}
