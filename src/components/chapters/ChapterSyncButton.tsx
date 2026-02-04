import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Sparkles, Users, Globe, BookOpen, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Chapter, Character, LoreEntry, Project, StoryOverview } from '@/types/story';

interface ChapterSyncButtonProps {
  chapter: Chapter;
  project: Project;
  storyOverview: StoryOverview | null;
  characters: Character[];
  loreEntries: LoreEntry[];
  onAddCharacter: (data: Partial<Character>) => Promise<Character | null>;
  onAddLoreEntry: (data: Partial<LoreEntry>) => Promise<LoreEntry | null>;
  onUpdateStoryOverview: (data: Partial<StoryOverview>) => Promise<void>;
}

interface SyncOptions {
  extractCharacters: boolean;
  extractLore: boolean;
  updateSetting: boolean;
  updateThemes: boolean;
}

interface ExtractedData {
  characters: Array<{
    name: string;
    role: string;
    description: string;
    traits: string[];
  }>;
  loreEntries: Array<{
    title: string;
    category: string;
    content: string;
    tags: string[];
  }>;
  settingUpdates: string;
  themeUpdates: string[];
}

// Helper function to record timeline entries
async function recordTimelineEntry(
  projectId: string,
  chapterId: string,
  chapterNumber: number,
  elementType: string,
  elementId: string | null,
  elementName: string,
  changeType: string,
  previousState: any,
  newState: any,
  description: string
) {
  try {
    await supabase.from('element_timeline').insert({
      project_id: projectId,
      chapter_id: chapterId,
      chapter_number: chapterNumber,
      element_type: elementType,
      element_id: elementId,
      element_name: elementName,
      change_type: changeType,
      previous_state: previousState,
      new_state: newState,
      description: description,
    });
  } catch (error) {
    console.error('Failed to record timeline entry:', error);
  }
}

export function ChapterSyncButton({
  chapter,
  project,
  storyOverview,
  characters,
  loreEntries,
  onAddCharacter,
  onAddLoreEntry,
  onUpdateStoryOverview,
}: ChapterSyncButtonProps) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    extractCharacters: true,
    extractLore: true,
    updateSetting: true,
    updateThemes: true,
  });
  const [syncResult, setSyncResult] = useState<{
    charactersAdded: number;
    loreAdded: number;
    settingUpdated: boolean;
    themesUpdated: boolean;
  } | null>(null);

  const handleSync = async () => {
    if (!chapter.content || chapter.content.length < 100) {
      toast({
        title: t('chapters.syncNeedsContent'),
        description: t('chapters.syncNeedsContentDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Get existing character names to avoid duplicates
      const existingCharacterNames = characters.map(c => c.name.toLowerCase());
      const existingLoreTitles = loreEntries.map(l => l.title.toLowerCase());

      // Call AI to extract entities from chapter content
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-writing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'sync-chapter',
          content: chapter.content,
          context: {
            storyTitle: project.title,
            genre: project.inferred_genres?.primary || project.genre_influences?.[0] || 'fiction',
            existingCharacterNames,
            existingLoreTitles,
            chapterTitle: chapter.title,
            chapterNumber: chapter.chapter_number,
            currentSetting: storyOverview?.setting_description,
            currentThemes: storyOverview?.central_themes || [],
            extractCharacters: syncOptions.extractCharacters,
            extractLore: syncOptions.extractLore,
            updateSetting: syncOptions.updateSetting,
            updateThemes: syncOptions.updateThemes,
            language: project.language,
          },
          settings: {
            model: settings.aiModel,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze chapter');
      }

      const data: ExtractedData = await response.json();
      
      let charactersAdded = 0;
      let loreAdded = 0;
      let settingUpdated = false;
      let themesUpdated = false;

      // Add new characters and record timeline entries
      if (syncOptions.extractCharacters && data.characters?.length > 0) {
        for (const char of data.characters) {
          // Skip if character already exists
          if (existingCharacterNames.includes(char.name.toLowerCase())) continue;
          
          const result = await onAddCharacter({
            name: char.name,
            role: char.role as any || 'supporting',
            description: char.description,
            traits: char.traits,
          });
          
          if (result) {
            charactersAdded++;
            // Record timeline entry for new character
            await recordTimelineEntry(
              project.id,
              chapter.id,
              chapter.chapter_number,
              'character',
              result.id,
              char.name,
              'introduced',
              null,
              { role: char.role, description: char.description, traits: char.traits },
              `Character "${char.name}" introduced in Chapter ${chapter.chapter_number}: ${chapter.title}`
            );
          }
        }
      }

      // Add new lore entries and record timeline entries
      if (syncOptions.extractLore && data.loreEntries?.length > 0) {
        for (const lore of data.loreEntries) {
          // Skip if lore already exists
          if (existingLoreTitles.includes(lore.title.toLowerCase())) continue;
          
          const result = await onAddLoreEntry({
            title: lore.title,
            category: lore.category as any || 'general',
            content: lore.content,
            tags: lore.tags,
            is_canon: true,
          });
          
          if (result) {
            loreAdded++;
            // Record timeline entry for new lore
            await recordTimelineEntry(
              project.id,
              chapter.id,
              chapter.chapter_number,
              'lore',
              result.id,
              lore.title,
              'introduced',
              null,
              { category: lore.category, content: lore.content, tags: lore.tags },
              `Lore entry "${lore.title}" discovered in Chapter ${chapter.chapter_number}: ${chapter.title}`
            );
          }
        }
      }

      // Update story setting and record timeline entry
      if (syncOptions.updateSetting && data.settingUpdates) {
        const currentSetting = storyOverview?.setting_description || '';
        const updatedSetting = currentSetting 
          ? `${currentSetting}\n\n${data.settingUpdates}`
          : data.settingUpdates;
        
        await onUpdateStoryOverview({ setting_description: updatedSetting });
        settingUpdated = true;
        
        // Record timeline entry for setting update
        await recordTimelineEntry(
          project.id,
          chapter.id,
          chapter.chapter_number,
          'setting',
          null,
          'Story Setting',
          'updated',
          { description: currentSetting },
          { description: updatedSetting },
          `Setting expanded in Chapter ${chapter.chapter_number}: ${chapter.title}`
        );
      }

      // Update themes and record timeline entries
      if (syncOptions.updateThemes && data.themeUpdates?.length > 0) {
        const currentThemes = storyOverview?.central_themes || [];
        const newThemes = data.themeUpdates.filter(t => !currentThemes.includes(t));
        
        if (newThemes.length > 0) {
          await onUpdateStoryOverview({ 
            central_themes: [...currentThemes, ...newThemes] 
          });
          themesUpdated = true;
          
          // Record timeline entry for each new theme
          for (const theme of newThemes) {
            await recordTimelineEntry(
              project.id,
              chapter.id,
              chapter.chapter_number,
              'theme',
              null,
              theme,
              'introduced',
              null,
              { theme },
              `Theme "${theme}" emerged in Chapter ${chapter.chapter_number}: ${chapter.title}`
            );
          }
        }
      }

      setSyncResult({ charactersAdded, loreAdded, settingUpdated, themesUpdated });

      toast({
        title: t('chapters.syncComplete'),
        description: t('chapters.syncCompleteDesc')
          .replace('{characters}', String(charactersAdded))
          .replace('{lore}', String(loreAdded)),
      });

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: t('chapters.syncFailed'),
        description: t('chapters.syncFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('chapters.syncProject')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('chapters.syncProjectTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('chapters.syncProjectDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sync Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="extractCharacters"
                checked={syncOptions.extractCharacters}
                onCheckedChange={(checked) => 
                  setSyncOptions(prev => ({ ...prev, extractCharacters: !!checked }))
                }
              />
              <Label htmlFor="extractCharacters" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4 text-primary" />
                {t('chapters.syncExtractCharacters')}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="extractLore"
                checked={syncOptions.extractLore}
                onCheckedChange={(checked) => 
                  setSyncOptions(prev => ({ ...prev, extractLore: !!checked }))
                }
              />
              <Label htmlFor="extractLore" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4 text-primary" />
                {t('chapters.syncExtractLore')}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="updateSetting"
                checked={syncOptions.updateSetting}
                onCheckedChange={(checked) => 
                  setSyncOptions(prev => ({ ...prev, updateSetting: !!checked }))
                }
              />
              <Label htmlFor="updateSetting" className="flex items-center gap-2 cursor-pointer">
                <MapPin className="h-4 w-4 text-primary" />
                {t('chapters.syncUpdateSetting')}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="updateThemes"
                checked={syncOptions.updateThemes}
                onCheckedChange={(checked) => 
                  setSyncOptions(prev => ({ ...prev, updateThemes: !!checked }))
                }
              />
              <Label htmlFor="updateThemes" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-4 w-4 text-primary" />
                {t('chapters.syncUpdateThemes')}
              </Label>
            </div>
          </div>

          {/* Results */}
          {syncResult && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <p className="text-sm font-medium text-primary">{t('chapters.syncResults')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {syncResult.charactersAdded > 0 && (
                  <li>✓ {syncResult.charactersAdded} {t('chapters.syncCharactersAdded')}</li>
                )}
                {syncResult.loreAdded > 0 && (
                  <li>✓ {syncResult.loreAdded} {t('chapters.syncLoreAdded')}</li>
                )}
                {syncResult.settingUpdated && (
                  <li>✓ {t('chapters.syncSettingUpdated')}</li>
                )}
                {syncResult.themesUpdated && (
                  <li>✓ {t('chapters.syncThemesUpdated')}</li>
                )}
                {!syncResult.charactersAdded && !syncResult.loreAdded && 
                 !syncResult.settingUpdated && !syncResult.themesUpdated && (
                  <li>{t('chapters.syncNoChanges')}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('chapters.syncing')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('chapters.startSync')}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
