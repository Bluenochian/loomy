 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { useAuth } from '@/context/AuthContext';
 import { useSettings } from '@/context/SettingsContext';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Slider } from '@/components/ui/slider';
 import { Switch } from '@/components/ui/switch';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Separator } from '@/components/ui/separator';
 import { User, Palette, Brain, Shield, LogOut, Trash2 } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import i18n from '@/lib/i18n';
 
 const LANGUAGES = [
   { code: 'en', name: 'English', flag: '🇺🇸' },
   { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
   { code: 'es', name: 'Español', flag: '🇪🇸' },
   { code: 'fr', name: 'Français', flag: '🇫🇷' },
   { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
   { code: 'it', name: 'Italiano', flag: '🇮🇹' },
   { code: 'pt', name: 'Português', flag: '🇧🇷' },
   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
   { code: 'zh', name: '中文', flag: '🇨🇳' },
   { code: 'ja', name: '日本語', flag: '🇯🇵' },
 ];
 
 export function UserProfileHub() {
   const { t } = useTranslation();
   const { user, signOut } = useAuth();
   const { settings, updateSetting } = useSettings();
   const { toast } = useToast();
   const [open, setOpen] = useState(false);
   const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
   const [bio, setBio] = useState('');
 
   const handleLanguageChange = (lang: string) => {
     i18n.changeLanguage(lang);
     localStorage.setItem('loomy-language', lang);
   };
 
   const handleLogout = async () => {
     await signOut();
     setOpen(false);
   };
 
   const initials = displayName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U';
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
           <Avatar className="h-9 w-9">
             <AvatarImage src={user?.user_metadata?.avatar_url} />
             <AvatarFallback className="bg-primary/20 text-primary font-medium">{initials}</AvatarFallback>
           </Avatar>
         </Button>
       </DialogTrigger>
       <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <User className="h-5 w-5" /> {t('profile.title')}
           </DialogTitle>
         </DialogHeader>
         
         <Tabs defaultValue="account" className="mt-4">
           <TabsList className="grid w-full grid-cols-4">
             <TabsTrigger value="account">{t('profile.account')}</TabsTrigger>
             <TabsTrigger value="preferences">{t('profile.preferences')}</TabsTrigger>
             <TabsTrigger value="ai">{t('profile.aiSettings')}</TabsTrigger>
             <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
           </TabsList>
           
           {/* Account Tab */}
           <TabsContent value="account" className="space-y-4 mt-4">
             <div className="flex items-center gap-4">
               <Avatar className="h-20 w-20">
                 <AvatarImage src={user?.user_metadata?.avatar_url} />
                 <AvatarFallback className="text-2xl bg-primary/20 text-primary">{initials}</AvatarFallback>
               </Avatar>
               <div className="flex-1">
                 <Label>{t('profile.name')}</Label>
                 <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" />
               </div>
             </div>
             <div>
               <Label>{t('profile.bio')}</Label>
               <textarea 
                 value={bio} 
                 onChange={(e) => setBio(e.target.value)}
                 placeholder={t('profile.bioPlaceholder')}
                 className="w-full mt-1 p-3 rounded-md border border-border bg-background min-h-[100px] resize-none"
               />
             </div>
             <p className="text-sm text-muted-foreground">{user?.email}</p>
           </TabsContent>
           
           {/* Preferences Tab */}
           <TabsContent value="preferences" className="space-y-6 mt-4">
             <div className="flex items-center gap-2 mb-2">
               <Palette className="h-4 w-4 text-primary" />
               <span className="font-medium">{t('profile.preferences')}</span>
             </div>
             
             <div>
               <Label>{t('profile.language')}</Label>
               <Select value={i18n.language} onValueChange={handleLanguageChange}>
                 <SelectTrigger className="mt-1">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {LANGUAGES.map(lang => (
                     <SelectItem key={lang.code} value={lang.code}>
                       {lang.flag} {lang.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             
             <Separator />
             
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div>
                   <Label>{t('profile.particles')}</Label>
                   <p className="text-xs text-muted-foreground">Animated background effects</p>
                 </div>
                 <Switch checked={settings.particles} onCheckedChange={(v) => updateSetting('particles', v)} />
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <Label>{t('profile.animations')}</Label>
                   <p className="text-xs text-muted-foreground">UI transitions</p>
                 </div>
                 <Switch checked={settings.animations} onCheckedChange={(v) => updateSetting('animations', v)} />
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <Label>{t('profile.glassSidebar')}</Label>
                   <p className="text-xs text-muted-foreground">Frosted glass effect</p>
                 </div>
                 <Switch checked={settings.glassSidebar} onCheckedChange={(v) => updateSetting('glassSidebar', v)} />
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <Label>{t('profile.compactMode')}</Label>
                   <p className="text-xs text-muted-foreground">Reduce spacing</p>
                 </div>
                 <Switch checked={settings.compactMode} onCheckedChange={(v) => updateSetting('compactMode', v)} />
               </div>
             </div>
             
             <Separator />
             
             <div>
               <Label>{t('profile.fontSize')}: {settings.fontSize}px</Label>
               <Slider value={[settings.fontSize]} onValueChange={([v]) => updateSetting('fontSize', v)} min={12} max={28} step={1} className="mt-2" />
             </div>
           </TabsContent>
           
           {/* AI Tab */}
           <TabsContent value="ai" className="space-y-6 mt-4">
             <div className="flex items-center gap-2 mb-2">
               <Brain className="h-4 w-4 text-primary" />
               <span className="font-medium">{t('profile.aiSettings')}</span>
             </div>
             
             <div>
               <Label>{t('profile.creativityLevel')}: {settings.aiTemperature < 0.5 ? t('profile.creativityLow') : settings.aiTemperature > 0.8 ? t('profile.creativityHigh') : t('profile.creativityMed')}</Label>
               <Slider value={[settings.aiTemperature]} onValueChange={([v]) => updateSetting('aiTemperature', v)} min={0.1} max={1} step={0.05} className="mt-2" />
             </div>
             
             <Separator />
             
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <Label>{t('settings.useLore')}</Label>
                 <Switch checked={settings.aiUseLore} onCheckedChange={(v) => updateSetting('aiUseLore', v)} />
               </div>
               <div className="flex items-center justify-between">
                 <Label>{t('settings.useOutline')}</Label>
                 <Switch checked={settings.aiUseOutline} onCheckedChange={(v) => updateSetting('aiUseOutline', v)} />
               </div>
               <div className="flex items-center justify-between">
                 <Label>{t('settings.useStoryMap')}</Label>
                 <Switch checked={settings.aiUseStoryMap} onCheckedChange={(v) => updateSetting('aiUseStoryMap', v)} />
               </div>
               <div className="flex items-center justify-between">
                 <Label>{t('settings.useCharacters')}</Label>
                 <Switch checked={settings.aiUseCharacters} onCheckedChange={(v) => updateSetting('aiUseCharacters', v)} />
               </div>
             </div>
           </TabsContent>
           
           {/* Security Tab */}
           <TabsContent value="security" className="space-y-6 mt-4">
             <div className="flex items-center gap-2 mb-2">
               <Shield className="h-4 w-4 text-primary" />
               <span className="font-medium">{t('profile.security')}</span>
             </div>
             
             <Button variant="outline" className="w-full justify-start gap-2">
               {t('profile.changePassword')}
             </Button>
             
             <Separator />
             
             <Button variant="outline" onClick={handleLogout} className="w-full justify-start gap-2 text-orange-500 hover:text-orange-600">
               <LogOut className="h-4 w-4" />
               {t('profile.logout')}
             </Button>
             
             <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
               <div className="flex items-center gap-2 text-destructive mb-2">
                 <Trash2 className="h-4 w-4" />
                 <span className="font-medium">{t('profile.deleteAccount')}</span>
               </div>
               <p className="text-xs text-muted-foreground mb-3">{t('profile.deleteAccountWarning')}</p>
               <Button variant="destructive" size="sm">{t('common.delete')}</Button>
             </div>
           </TabsContent>
         </Tabs>
       </DialogContent>
     </Dialog>
   );
 }