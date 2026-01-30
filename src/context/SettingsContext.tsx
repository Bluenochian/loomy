import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface AppSettings {
  // Display
  particles: boolean;
  animations: boolean;
  reducedMotion: boolean;
  compactMode: boolean;
  showWordCount: boolean;
  
  // Editor
  fontSize: number;
  lineHeight: number;
  fontFamily: 'serif' | 'sans' | 'mono';
  autosaveInterval: number;
  spellcheck: boolean;
  
  // AI
  aiEnabled: boolean;
  aiAutoSuggest: boolean;
  aiUseLore: boolean;
  aiUseOutline: boolean;
  aiUseStoryMap: boolean;
  aiUseCharacters: boolean;
  aiTemperature: number;
  aiModel: string;
  
  // Privacy
  analyticsEnabled: boolean;
  crashReports: boolean;
  
  // Notifications
  notifyOnSave: boolean;
  notifyOnAIComplete: boolean;
  soundEnabled: boolean;
  
  // Advanced
  debugMode: boolean;
  experimentalFeatures: boolean;
  autoBackup: boolean;
  backupInterval: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  // Display
  particles: false,
  animations: true,
  reducedMotion: false,
  compactMode: false,
  showWordCount: true,
  
  // Editor
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  autosaveInterval: 30,
  spellcheck: true,
  
  // AI
  aiEnabled: true,
  aiAutoSuggest: false,
  aiUseLore: true,
  aiUseOutline: true,
  aiUseStoryMap: true,
  aiUseCharacters: true,
  aiTemperature: 0.85,
  aiModel: 'google/gemini-3-flash-preview',
  
  // Privacy
  analyticsEnabled: true,
  crashReports: true,
  
  // Notifications
  notifyOnSave: false,
  notifyOnAIComplete: true,
  soundEnabled: false,
  
  // Advanced
  debugMode: false,
  experimentalFeatures: false,
  autoBackup: true,
  backupInterval: 300,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('app-settings');
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
