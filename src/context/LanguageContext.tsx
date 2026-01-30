import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

// All translation keys used in the app
// Welcome page
export type WelcomeTranslationKey =
  | 'welcome.headline1'
  | 'welcome.headline2'
  | 'welcome.description'
  | 'welcome.feature1.title'
  | 'welcome.feature1.desc'
  | 'welcome.feature2.title'
  | 'welcome.feature2.desc'
  | 'welcome.feature3.title'
  | 'welcome.feature3.desc'
  | 'welcome.startWriting'
  | 'welcome.createAccount'
  | 'welcome.signIn'
  | 'welcome.beginJourney'
  | 'welcome.continueStory'
  | 'welcome.letsWeave'
  | 'welcome.tellUs';

export type TranslationKey = 
  // Welcome (include these so t() can use them)
  | WelcomeTranslationKey
  // Navigation
  | 'nav.dashboard'
  | 'nav.overview'
  | 'nav.outline'
  | 'nav.chapters'
  | 'nav.characters'
  | 'nav.lore'
  | 'nav.map'
  | 'nav.studio'
  | 'nav.settings'
  | 'nav.allProjects'
  | 'nav.collapse'
  // Common
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.loading'
  | 'common.add'
  | 'common.edit'
  | 'common.search'
  | 'common.create'
  | 'common.back'
  // Settings sections
  | 'settings.title'
  | 'settings.storyDetails'
  | 'settings.storyTitle'
  | 'settings.storyLanguage'
  | 'settings.tone'
  | 'settings.themeColors'
  | 'settings.display'
  | 'settings.editor'
  | 'settings.ai'
  | 'settings.language'
  | 'settings.notifications'
  | 'settings.privacy'
  | 'settings.advanced'
  | 'settings.dangerZone'
  | 'settings.particles'
  | 'settings.animations'
  | 'settings.reducedMotion'
  | 'settings.compactMode'
  | 'settings.wordCount'
  | 'settings.fontSize'
  | 'settings.lineHeight'
  | 'settings.fontFamily'
  | 'settings.autosave'
  | 'settings.spellcheck'
  | 'settings.aiEnabled'
  | 'settings.autoSuggest'
  | 'settings.contextSources'
  | 'settings.useLore'
  | 'settings.useOutline'
  | 'settings.useStoryMap'
  | 'settings.useCharacters'
  | 'settings.aiModel'
  | 'settings.creativity'
  | 'settings.uiLanguage'
  | 'settings.notifyOnSave'
  | 'settings.notifyOnAI'
  | 'settings.soundEffects'
  | 'settings.analytics'
  | 'settings.crashReports'
  | 'settings.debugMode'
  | 'settings.experimental'
  | 'settings.autoBackup'
  | 'settings.backupInterval'
  | 'settings.deleteStory'
  | 'settings.resetAll'
  | 'settings.export'
  | 'settings.glassSidebar'
  // Theme names
  | 'theme.default'
  | 'theme.fantasy'
  | 'theme.scifi'
  | 'theme.thriller'
  | 'theme.romance'
  | 'theme.horror'
  | 'theme.mystery'
  | 'theme.adventure'
  | 'theme.dystopia'
  | 'theme.utopia'
  | 'theme.steampunk'
  | 'theme.historical'
  // Sub-theme names
  | 'subtheme.classicAmber'
  | 'subtheme.midnightBlue'
  | 'subtheme.forestGreen'
  | 'subtheme.royalGlitter'
  | 'subtheme.snowyPlains'
  | 'subtheme.dragonFire'
  | 'subtheme.enchantedForest'
  | 'subtheme.potionWorkshop'
  | 'subtheme.celestial'
  | 'subtheme.cyberpunk'
  | 'subtheme.deepSpace'
  | 'subtheme.matrix'
  | 'subtheme.hologram'
  | 'subtheme.alienWorld'
  | 'subtheme.quantum'
  | 'subtheme.grimoire'
  | 'subtheme.ghostly'
  | 'subtheme.darkForest'
  | 'subtheme.vampire'
  | 'subtheme.cosmicHorror'
  | 'subtheme.asylum'
  | 'subtheme.noirDetective'
  | 'subtheme.conspiracy'
  | 'subtheme.heist'
  | 'subtheme.spy'
  | 'subtheme.roseGarden'
  | 'subtheme.starlitNight'
  | 'subtheme.beachSunset'
  | 'subtheme.cherryBlossom'
  | 'subtheme.candlelit'
  | 'subtheme.victorianFog'
  | 'subtheme.midnightLibrary'
  | 'subtheme.crimeScene'
  | 'subtheme.ancientRuins'
  | 'subtheme.jungleExpedition'
  | 'subtheme.desertSands'
  | 'subtheme.oceanVoyage'
  | 'subtheme.mountainPeak'
  | 'subtheme.treasureCave'
  | 'subtheme.fallout'
  | 'subtheme.rustBelt'
  | 'subtheme.toxicSwamp'
  | 'subtheme.undergroundBunker'
  | 'subtheme.bigBrother'
  | 'subtheme.solarpunk'
  | 'subtheme.crystalCity'
  | 'subtheme.cloudKingdom'
  | 'subtheme.underwaterCity'
  | 'subtheme.harmonyGarden'
  | 'subtheme.clockworkCity'
  | 'subtheme.airshipFleet'
  | 'subtheme.madScientist'
  | 'subtheme.victorianStreet'
  | 'subtheme.medieval'
  | 'subtheme.ancientRome'
  | 'subtheme.vikingNorse'
  | 'subtheme.ancientEgypt'
  | 'subtheme.feudalJapan'
  | 'settings.selectStyle'
  // Story Map
  | 'map.title'
  | 'map.addNode'
  | 'map.connect'
  | 'map.aiAnalyze'
  | 'map.aiAutoWire'
  | 'map.resetView'
  | 'map.chapter'
  | 'map.character'
  | 'map.event'
  | 'map.location'
  | 'map.insights'
  | 'map.stats'
  | 'map.nodes'
  | 'map.connections'
  | 'map.selectedNode'
  | 'map.editNode'
  // Chapters
  | 'chapters.title'
  | 'chapters.addChapter'
  | 'chapters.generateDraft'
  | 'chapters.words'
  // Characters
  | 'characters.title'
  | 'characters.addCharacter'
  | 'characters.aiGenerate'
  // Overview
  | 'overview.title'
  | 'overview.narrativeIntent'
  | 'overview.stakes'
  | 'overview.setting'
  | 'overview.timePeriod'
  | 'overview.themes'
  | 'overview.stats'
  // Export
  | 'export.title'
  | 'export.format'
  | 'export.download';

type Translations = Record<Language, Partial<Record<TranslationKey, string>>>;

// Welcome translations shared between all languages
const welcomeTranslationsEn = {
  'welcome.headline1': 'Where Stories',
  'welcome.headline2': 'Come Alive',
  'welcome.description': 'An AI-powered narrative canvas that understands your story, generates rich worlds, and adapts its entire interface to match your vision.',
  'welcome.feature1.title': 'Story-First Intelligence',
  'welcome.feature1.desc': 'AI understands your narrative and generates characters, lore, and plot that feel authentic.',
  'welcome.feature2.title': 'Living Theme System',
  'welcome.feature2.desc': "The interface transforms to match your story's genre and mood.",
  'welcome.feature3.title': 'Guided Creation',
  'welcome.feature3.desc': 'From concept to manuscript, with intelligent assistance at every step.',
  'welcome.startWriting': 'Start Writing',
  'welcome.createAccount': 'Create Your Account',
  'welcome.signIn': 'Welcome Back',
  'welcome.beginJourney': 'Begin your storytelling journey',
  'welcome.continueStory': 'Continue your story',
  'welcome.letsWeave': "Let's Weave Your Story",
  'welcome.tellUs': 'Tell us about the world you want to create.',
};

const translations: Translations = {
  en: {
    ...welcomeTranslationsEn,
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.overview': 'Story Overview',
    'nav.outline': 'Outline',
    'nav.chapters': 'Chapters',
    'nav.characters': 'Characters',
    'nav.lore': 'Lore & World',
    'nav.map': 'Story Map',
    'nav.studio': 'Writing Studio',
    'nav.settings': 'Settings',
    'nav.allProjects': 'All Projects',
    'nav.collapse': 'Collapse',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.create': 'Create',
    'common.back': 'Back',
    // Settings
    'settings.title': 'Settings',
    'settings.storyDetails': 'Story Details',
    'settings.storyTitle': 'Story Title',
    'settings.storyLanguage': 'Story Language',
    'settings.tone': 'Tone',
    'settings.themeColors': 'Theme Colors',
    'settings.display': 'Display',
    'settings.editor': 'Editor',
    'settings.ai': 'AI Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.advanced': 'Advanced',
    'settings.dangerZone': 'Danger Zone',
    'settings.particles': 'Particle Effects',
    'settings.animations': 'Animations',
    'settings.reducedMotion': 'Reduced Motion',
    'settings.compactMode': 'Compact Mode',
    'settings.wordCount': 'Show Word Count',
    'settings.fontSize': 'Font Size',
    'settings.lineHeight': 'Line Height',
    'settings.fontFamily': 'Font Family',
    'settings.autosave': 'Autosave Interval',
    'settings.spellcheck': 'Spellcheck',
    'settings.aiEnabled': 'Enable AI Assistant',
    'settings.autoSuggest': 'Auto-Suggest',
    'settings.contextSources': 'Context Sources',
    'settings.useLore': 'Use Lore Entries',
    'settings.useOutline': 'Use Outline',
    'settings.useStoryMap': 'Use Story Map',
    'settings.useCharacters': 'Use Characters',
    'settings.aiModel': 'AI Model',
    'settings.creativity': 'Creativity',
    'settings.uiLanguage': 'UI Language',
    'settings.notifyOnSave': 'Notify on Save',
    'settings.notifyOnAI': 'Notify on AI Complete',
    'settings.soundEffects': 'Sound Effects',
    'settings.analytics': 'Analytics',
    'settings.crashReports': 'Crash Reports',
    'settings.debugMode': 'Debug Mode',
    'settings.experimental': 'Experimental Features',
    'settings.autoBackup': 'Auto Backup',
    'settings.backupInterval': 'Backup Interval',
    'settings.deleteStory': 'Delete Story',
    'settings.resetAll': 'Reset All Settings',
    'settings.export': 'Export Story',
    'settings.glassSidebar': 'Glass Sidebar',
    // Theme names
    'theme.default': 'Default',
    'theme.fantasy': 'Fantasy',
    'theme.scifi': 'Sci-Fi',
    'theme.thriller': 'Thriller',
    'theme.romance': 'Romance',
    'theme.horror': 'Horror',
    'theme.mystery': 'Mystery',
    'theme.adventure': 'Adventure',
    // Sub-theme names
    'subtheme.classicAmber': 'Classic Amber',
    'subtheme.midnightBlue': 'Midnight Blue',
    'subtheme.forestGreen': 'Forest Green',
    'subtheme.royalGlitter': 'Royal Glitter',
    'subtheme.snowyPlains': 'Snowy Plains',
    'subtheme.dragonFire': 'Dragon Fire',
    'subtheme.enchantedForest': 'Enchanted Forest',
    'subtheme.potionWorkshop': 'Potion Workshop',
    'subtheme.celestial': 'Celestial',
    'subtheme.cyberpunk': 'Cyberpunk',
    'subtheme.deepSpace': 'Deep Space',
    'subtheme.matrix': 'Matrix',
    'subtheme.hologram': 'Hologram',
    'subtheme.alienWorld': 'Alien World',
    'subtheme.quantum': 'Quantum',
    'subtheme.grimoire': 'Grimoire',
    'subtheme.ghostly': 'Ghostly',
    'subtheme.darkForest': 'Dark Forest',
    'subtheme.vampire': 'Vampire',
    'subtheme.cosmicHorror': 'Cosmic Horror',
    'subtheme.asylum': 'Asylum',
    'subtheme.noirDetective': 'Noir Detective',
    'subtheme.conspiracy': 'Conspiracy',
    'subtheme.heist': 'Heist',
    'subtheme.spy': 'Spy',
    'subtheme.roseGarden': 'Rose Garden',
    'subtheme.starlitNight': 'Starlit Night',
    'subtheme.beachSunset': 'Beach Sunset',
    'subtheme.cherryBlossom': 'Cherry Blossom',
    'subtheme.candlelit': 'Candlelit',
    'subtheme.victorianFog': 'Victorian Fog',
    'subtheme.midnightLibrary': 'Midnight Library',
    'subtheme.crimeScene': 'Crime Scene',
    'subtheme.ancientRuins': 'Ancient Ruins',
    'subtheme.jungleExpedition': 'Jungle Expedition',
    'subtheme.desertSands': 'Desert Sands',
    'subtheme.oceanVoyage': 'Ocean Voyage',
    'subtheme.mountainPeak': 'Mountain Peak',
    'subtheme.treasureCave': 'Treasure Cave',
    // New themes
    'theme.dystopia': 'Dystopia',
    'theme.utopia': 'Utopia',
    'theme.steampunk': 'Steampunk',
    'theme.historical': 'Historical',
    'subtheme.fallout': 'Nuclear Fallout',
    'subtheme.rustBelt': 'Rust Belt',
    'subtheme.toxicSwamp': 'Toxic Swamp',
    'subtheme.undergroundBunker': 'Underground Bunker',
    'subtheme.bigBrother': 'Big Brother',
    'subtheme.solarpunk': 'Solarpunk',
    'subtheme.crystalCity': 'Crystal City',
    'subtheme.cloudKingdom': 'Cloud Kingdom',
    'subtheme.underwaterCity': 'Underwater City',
    'subtheme.harmonyGarden': 'Harmony Garden',
    'subtheme.clockworkCity': 'Clockwork City',
    'subtheme.airshipFleet': 'Airship Fleet',
    'subtheme.madScientist': 'Mad Scientist',
    'subtheme.victorianStreet': 'Victorian Street',
    'subtheme.medieval': 'Medieval',
    'subtheme.ancientRome': 'Ancient Rome',
    'subtheme.vikingNorse': 'Viking Norse',
    'subtheme.ancientEgypt': 'Ancient Egypt',
    'subtheme.feudalJapan': 'Feudal Japan',
    'settings.selectStyle': 'Select a style',
    // Story Map
    'map.title': 'Story Map',
    'map.addNode': 'Add Node',
    'map.connect': 'Connect',
    'map.aiAnalyze': 'AI Analyze Map',
    'map.aiAutoWire': 'AI Auto-Wire',
    'map.resetView': 'Reset View',
    'map.chapter': 'Chapter',
    'map.character': 'Character',
    'map.event': 'Event',
    'map.location': 'Location',
    'map.insights': 'AI Insights',
    'map.stats': 'Stats',
    'map.nodes': 'Nodes',
    'map.connections': 'Connections',
    'map.selectedNode': 'Selected Node',
    'map.editNode': 'Edit Node',
    // Chapters
    'chapters.title': 'Chapters',
    'chapters.addChapter': 'Add Chapter',
    'chapters.generateDraft': 'Generate Draft',
    'chapters.words': 'words',
    // Characters
    'characters.title': 'Characters',
    'characters.addCharacter': 'Add Character',
    'characters.aiGenerate': 'AI Generate',
    // Overview
    'overview.title': 'Story Overview',
    'overview.narrativeIntent': 'Narrative Intent',
    'overview.stakes': 'Stakes',
    'overview.setting': 'Setting Description',
    'overview.timePeriod': 'Time Period',
    'overview.themes': 'Central Themes',
    'overview.stats': 'Story Statistics',
    // Export
    'export.title': 'Export Story',
    'export.format': 'Format',
    'export.download': 'Download',
  },
  tr: {
    ...welcomeTranslationsEn, // Fallback to English for welcome
    'nav.overview': 'Hikaye Özeti',
    'nav.outline': 'Taslak',
    'nav.chapters': 'Bölümler',
    'nav.characters': 'Karakterler',
    'nav.lore': 'Gelenek & Dünya',
    'nav.map': 'Hikaye Haritası',
    'nav.studio': 'Yazı Stüdyosu',
    'nav.settings': 'Ayarlar',
    'nav.allProjects': 'Tüm Projeler',
    'nav.collapse': 'Daralt',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.loading': 'Yükleniyor...',
    'common.add': 'Ekle',
    'common.edit': 'Düzenle',
    'common.search': 'Ara',
    'common.create': 'Oluştur',
    'common.back': 'Geri',
    'settings.title': 'Ayarlar',
    'settings.storyDetails': 'Hikaye Detayları',
    'settings.storyTitle': 'Hikaye Başlığı',
    'settings.storyLanguage': 'Hikaye Dili',
    'settings.tone': 'Ton',
    'settings.themeColors': 'Tema Renkleri',
    'settings.display': 'Görünüm',
    'settings.editor': 'Editör',
    'settings.ai': 'Yapay Zeka',
    'settings.language': 'Dil',
    'settings.notifications': 'Bildirimler',
    'settings.privacy': 'Gizlilik',
    'settings.advanced': 'Gelişmiş',
    'settings.dangerZone': 'Tehlikeli Bölge',
    'settings.particles': 'Parçacık Efektleri',
    'settings.animations': 'Animasyonlar',
    'settings.reducedMotion': 'Azaltılmış Hareket',
    'settings.compactMode': 'Kompakt Mod',
    'settings.wordCount': 'Kelime Sayısını Göster',
    'settings.fontSize': 'Yazı Boyutu',
    'settings.lineHeight': 'Satır Yüksekliği',
    'settings.fontFamily': 'Yazı Tipi',
    'settings.autosave': 'Otomatik Kaydetme',
    'settings.spellcheck': 'Yazım Denetimi',
    'settings.aiEnabled': 'Yapay Zeka Asistanı',
    'settings.autoSuggest': 'Otomatik Öneri',
    'settings.contextSources': 'Bağlam Kaynakları',
    'settings.useLore': 'Gelenek Kullan',
    'settings.useOutline': 'Taslak Kullan',
    'settings.useStoryMap': 'Hikaye Haritası Kullan',
    'settings.useCharacters': 'Karakterler Kullan',
    'settings.aiModel': 'Yapay Zeka Modeli',
    'settings.creativity': 'Yaratıcılık',
    'settings.uiLanguage': 'Arayüz Dili',
    'settings.notifyOnSave': 'Kaydetme Bildirimi',
    'settings.notifyOnAI': 'Yapay Zeka Bildirimi',
    'settings.soundEffects': 'Ses Efektleri',
    'settings.analytics': 'Analitik',
    'settings.crashReports': 'Hata Raporları',
    'settings.debugMode': 'Hata Ayıklama',
    'settings.experimental': 'Deneysel Özellikler',
    'settings.autoBackup': 'Otomatik Yedekleme',
    'settings.backupInterval': 'Yedekleme Aralığı',
    'settings.deleteStory': 'Hikayeyi Sil',
    'settings.resetAll': 'Tüm Ayarları Sıfırla',
    'settings.export': 'Hikayeyi Dışa Aktar',
    'settings.glassSidebar': 'Cam Kenar Çubuğu',
    'theme.default': 'Varsayılan',
    'theme.fantasy': 'Fantastik',
    'theme.scifi': 'Bilim Kurgu',
    'theme.thriller': 'Gerilim',
    'theme.romance': 'Romantik',
    'theme.horror': 'Korku',
    'theme.mystery': 'Gizem',
    'theme.adventure': 'Macera',
    // Turkish sub-theme translations
    'subtheme.classicAmber': 'Klasik Amber',
    'subtheme.midnightBlue': 'Gece Mavisi',
    'subtheme.forestGreen': 'Orman Yeşili',
    'subtheme.royalGlitter': 'Kraliyet Işıltısı',
    'subtheme.snowyPlains': 'Karlı Ovalar',
    'subtheme.dragonFire': 'Ejderha Ateşi',
    'subtheme.enchantedForest': 'Büyülü Orman',
    'subtheme.potionWorkshop': 'İksir Atölyesi',
    'subtheme.celestial': 'Göksel',
    'subtheme.cyberpunk': 'Siberpunk',
    'subtheme.deepSpace': 'Derin Uzay',
    'subtheme.matrix': 'Matris',
    'subtheme.hologram': 'Hologram',
    'subtheme.alienWorld': 'Uzaylı Dünyası',
    'subtheme.quantum': 'Kuantum',
    'subtheme.grimoire': 'Büyü Kitabı',
    'subtheme.ghostly': 'Hayaletimsi',
    'subtheme.darkForest': 'Karanlık Orman',
    'subtheme.vampire': 'Vampir',
    'subtheme.cosmicHorror': 'Kozmik Korku',
    'subtheme.asylum': 'Akıl Hastanesi',
    'subtheme.noirDetective': 'Noir Dedektif',
    'subtheme.conspiracy': 'Komplo',
    'subtheme.heist': 'Soygun',
    'subtheme.spy': 'Casus',
    'subtheme.roseGarden': 'Gül Bahçesi',
    'subtheme.starlitNight': 'Yıldızlı Gece',
    'subtheme.beachSunset': 'Sahil Günbatımı',
    'subtheme.cherryBlossom': 'Kiraz Çiçeği',
    'subtheme.candlelit': 'Mum Işığı',
    'subtheme.victorianFog': 'Viktorya Sisi',
    'subtheme.midnightLibrary': 'Gece Kütüphanesi',
    'subtheme.crimeScene': 'Suç Mahalli',
    'subtheme.ancientRuins': 'Antik Kalıntılar',
    'subtheme.jungleExpedition': 'Orman Keşfi',
    'subtheme.desertSands': 'Çöl Kumları',
    'subtheme.oceanVoyage': 'Okyanus Yolculuğu',
    'subtheme.mountainPeak': 'Dağ Zirvesi',
    'subtheme.treasureCave': 'Hazine Mağarası',
    'theme.dystopia': 'Distopya',
    'theme.utopia': 'Ütopya',
    'theme.steampunk': 'Steampunk',
    'theme.historical': 'Tarihi',
    'subtheme.fallout': 'Nükleer Serpinti',
    'subtheme.rustBelt': 'Pas Kuşağı',
    'subtheme.toxicSwamp': 'Zehirli Bataklık',
    'subtheme.undergroundBunker': 'Yeraltı Sığınağı',
    'subtheme.bigBrother': 'Büyük Birader',
    'subtheme.solarpunk': 'Solarpunk',
    'subtheme.crystalCity': 'Kristal Şehir',
    'subtheme.cloudKingdom': 'Bulut Krallığı',
    'subtheme.underwaterCity': 'Sualtı Şehri',
    'subtheme.harmonyGarden': 'Uyum Bahçesi',
    'subtheme.clockworkCity': 'Çark Şehri',
    'subtheme.airshipFleet': 'Hava Gemisi Filosu',
    'subtheme.madScientist': 'Deli Bilim İnsanı',
    'subtheme.victorianStreet': 'Viktorya Sokağı',
    'subtheme.medieval': 'Ortaçağ',
    'subtheme.ancientRome': 'Antik Roma',
    'subtheme.vikingNorse': 'Viking İskandinav',
    'subtheme.ancientEgypt': 'Antik Mısır',
    'subtheme.feudalJapan': 'Feodal Japonya',
    'settings.selectStyle': 'Bir stil seçin',
    'map.title': 'Hikaye Haritası',
    'map.addNode': 'Düğüm Ekle',
    'map.connect': 'Bağla',
    'map.aiAnalyze': 'Yapay Zeka Analizi',
    'map.aiAutoWire': 'Yapay Zeka Bağlantı',
    'map.resetView': 'Görünümü Sıfırla',
    'map.chapter': 'Bölüm',
    'map.character': 'Karakter',
    'map.event': 'Olay',
    'map.location': 'Mekan',
    'map.insights': 'Yapay Zeka İçgörüleri',
    'map.stats': 'İstatistikler',
    'map.nodes': 'Düğümler',
    'map.connections': 'Bağlantılar',
    'map.selectedNode': 'Seçili Düğüm',
    'map.editNode': 'Düğümü Düzenle',
    'chapters.title': 'Bölümler',
    'chapters.addChapter': 'Bölüm Ekle',
    'chapters.generateDraft': 'Taslak Oluştur',
    'chapters.words': 'kelime',
    'characters.title': 'Karakterler',
    'characters.addCharacter': 'Karakter Ekle',
    'characters.aiGenerate': 'Yapay Zeka Oluştur',
    'overview.title': 'Hikaye Özeti',
    'overview.narrativeIntent': 'Anlatı Amacı',
    'overview.stakes': 'Riskler',
    'overview.setting': 'Mekan Açıklaması',
    'overview.timePeriod': 'Zaman Dilimi',
    'overview.themes': 'Ana Temalar',
    'overview.stats': 'Hikaye İstatistikleri',
    'export.title': 'Hikayeyi Dışa Aktar',
    'export.format': 'Format',
    'export.download': 'İndir',
  },
  es: {
    ...welcomeTranslationsEn,
    'nav.overview': 'Vista General',
    'nav.outline': 'Esquema',
    'nav.chapters': 'Capítulos',
    'nav.characters': 'Personajes',
    'nav.lore': 'Trasfondo',
    'nav.map': 'Mapa de Historia',
    'nav.studio': 'Estudio',
    'nav.settings': 'Configuración',
    'nav.allProjects': 'Todos los Proyectos',
    'nav.collapse': 'Contraer',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.loading': 'Cargando...',
    'common.add': 'Añadir',
    'common.edit': 'Editar',
    'common.search': 'Buscar',
    'common.create': 'Crear',
    'common.back': 'Volver',
    'settings.title': 'Configuración',
    'settings.storyDetails': 'Detalles de Historia',
    'settings.storyTitle': 'Título',
    'settings.storyLanguage': 'Idioma de Historia',
    'settings.tone': 'Tono',
    'settings.themeColors': 'Colores del Tema',
    'settings.display': 'Pantalla',
    'settings.editor': 'Editor',
    'settings.ai': 'Inteligencia Artificial',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.privacy': 'Privacidad',
    'settings.advanced': 'Avanzado',
    'settings.dangerZone': 'Zona de Peligro',
    'settings.particles': 'Efectos de Partículas',
    'settings.animations': 'Animaciones',
    'settings.reducedMotion': 'Movimiento Reducido',
    'settings.compactMode': 'Modo Compacto',
    'settings.wordCount': 'Mostrar Palabras',
    'settings.fontSize': 'Tamaño de Fuente',
    'settings.lineHeight': 'Altura de Línea',
    'settings.fontFamily': 'Familia de Fuente',
    'settings.autosave': 'Autoguardado',
    'settings.spellcheck': 'Corrector',
    'settings.aiEnabled': 'Asistente IA',
    'settings.autoSuggest': 'Auto-sugerir',
    'settings.contextSources': 'Fuentes de Contexto',
    'settings.useLore': 'Usar Trasfondo',
    'settings.useOutline': 'Usar Esquema',
    'settings.useStoryMap': 'Usar Mapa',
    'settings.useCharacters': 'Usar Personajes',
    'settings.aiModel': 'Modelo IA',
    'settings.creativity': 'Creatividad',
    'settings.uiLanguage': 'Idioma de Interfaz',
    'settings.notifyOnSave': 'Notificar al Guardar',
    'settings.notifyOnAI': 'Notificar IA',
    'settings.soundEffects': 'Efectos de Sonido',
    'settings.analytics': 'Analíticas',
    'settings.crashReports': 'Informes de Error',
    'settings.debugMode': 'Modo Depuración',
    'settings.experimental': 'Funciones Experimentales',
    'settings.autoBackup': 'Respaldo Automático',
    'settings.backupInterval': 'Intervalo de Respaldo',
    'settings.deleteStory': 'Eliminar Historia',
    'settings.resetAll': 'Restablecer Todo',
    'settings.export': 'Exportar Historia',
    'map.title': 'Mapa de Historia',
    'map.addNode': 'Añadir Nodo',
    'map.connect': 'Conectar',
    'map.aiAnalyze': 'Analizar con IA',
    'map.aiAutoWire': 'Auto-conectar IA',
    'map.resetView': 'Restablecer Vista',
    'map.chapter': 'Capítulo',
    'map.character': 'Personaje',
    'map.event': 'Evento',
    'map.location': 'Ubicación',
    'map.insights': 'Perspectivas IA',
    'map.stats': 'Estadísticas',
    'map.nodes': 'Nodos',
    'map.connections': 'Conexiones',
    'map.selectedNode': 'Nodo Seleccionado',
    'map.editNode': 'Editar Nodo',
    'chapters.title': 'Capítulos',
    'chapters.addChapter': 'Añadir Capítulo',
    'chapters.generateDraft': 'Generar Borrador',
    'chapters.words': 'palabras',
    'characters.title': 'Personajes',
    'characters.addCharacter': 'Añadir Personaje',
    'characters.aiGenerate': 'Generar con IA',
    'overview.title': 'Vista General',
    'overview.narrativeIntent': 'Intención Narrativa',
    'overview.stakes': 'Lo que está en Juego',
    'overview.setting': 'Descripción del Escenario',
    'overview.timePeriod': 'Período de Tiempo',
    'overview.themes': 'Temas Centrales',
    'overview.stats': 'Estadísticas',
    'export.title': 'Exportar Historia',
    'export.format': 'Formato',
    'export.download': 'Descargar',
  },
  fr: {
    ...welcomeTranslationsEn,
    'nav.overview': 'Aperçu',
    'nav.outline': 'Plan',
    'nav.chapters': 'Chapitres',
    'nav.characters': 'Personnages',
    'nav.lore': 'Univers',
    'nav.map': 'Carte Narrative',
    'nav.studio': 'Studio',
    'nav.settings': 'Paramètres',
    'nav.allProjects': 'Tous les Projets',
    'nav.collapse': 'Réduire',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.loading': 'Chargement...',
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
    'common.create': 'Créer',
    'common.back': 'Retour',
    'settings.title': 'Paramètres',
    'settings.storyDetails': "Détails de l'Histoire",
    'settings.storyTitle': 'Titre',
    'settings.storyLanguage': "Langue de l'Histoire",
    'settings.tone': 'Ton',
    'settings.themeColors': 'Couleurs du Thème',
    'settings.display': 'Affichage',
    'settings.editor': 'Éditeur',
    'settings.ai': 'Intelligence Artificielle',
    'settings.language': 'Langue',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Confidentialité',
    'settings.advanced': 'Avancé',
    'settings.dangerZone': 'Zone de Danger',
    'settings.particles': 'Effets de Particules',
    'settings.animations': 'Animations',
    'settings.reducedMotion': 'Mouvement Réduit',
    'settings.compactMode': 'Mode Compact',
    'settings.wordCount': 'Afficher les Mots',
    'settings.fontSize': 'Taille de Police',
    'settings.lineHeight': 'Hauteur de Ligne',
    'settings.fontFamily': 'Police',
    'settings.autosave': 'Sauvegarde Auto',
    'settings.spellcheck': 'Correcteur',
    'settings.aiEnabled': 'Assistant IA',
    'settings.autoSuggest': 'Suggestion Auto',
    'settings.contextSources': 'Sources de Contexte',
    'settings.useLore': 'Utiliser le Lore',
    'settings.useOutline': 'Utiliser le Plan',
    'settings.useStoryMap': 'Utiliser la Carte',
    'settings.useCharacters': 'Utiliser Personnages',
    'settings.aiModel': 'Modèle IA',
    'settings.creativity': 'Créativité',
    'settings.uiLanguage': "Langue de l'Interface",
    'settings.notifyOnSave': 'Notifier Sauvegarde',
    'settings.notifyOnAI': 'Notifier IA',
    'settings.soundEffects': 'Effets Sonores',
    'settings.analytics': 'Analytique',
    'settings.crashReports': "Rapports d'Erreur",
    'settings.debugMode': 'Mode Débogage',
    'settings.experimental': 'Fonctions Expérimentales',
    'settings.autoBackup': 'Sauvegarde Auto',
    'settings.backupInterval': 'Intervalle de Sauvegarde',
    'settings.deleteStory': "Supprimer l'Histoire",
    'settings.resetAll': 'Réinitialiser Tout',
    'settings.export': "Exporter l'Histoire",
    'map.title': 'Carte Narrative',
    'map.addNode': 'Ajouter Nœud',
    'map.connect': 'Connecter',
    'map.aiAnalyze': 'Analyser avec IA',
    'map.aiAutoWire': 'Auto-connecter IA',
    'map.resetView': 'Réinitialiser Vue',
    'map.chapter': 'Chapitre',
    'map.character': 'Personnage',
    'map.event': 'Événement',
    'map.location': 'Lieu',
    'map.insights': 'Aperçus IA',
    'map.stats': 'Statistiques',
    'map.nodes': 'Nœuds',
    'map.connections': 'Connexions',
    'map.selectedNode': 'Nœud Sélectionné',
    'map.editNode': 'Modifier Nœud',
    'chapters.title': 'Chapitres',
    'chapters.addChapter': 'Ajouter Chapitre',
    'chapters.generateDraft': 'Générer Brouillon',
    'chapters.words': 'mots',
    'characters.title': 'Personnages',
    'characters.addCharacter': 'Ajouter Personnage',
    'characters.aiGenerate': 'Générer avec IA',
    'overview.title': 'Aperçu',
    'overview.narrativeIntent': 'Intention Narrative',
    'overview.stakes': 'Enjeux',
    'overview.setting': 'Description du Cadre',
    'overview.timePeriod': 'Période',
    'overview.themes': 'Thèmes Centraux',
    'overview.stats': "Statistiques de l'Histoire",
    'export.title': "Exporter l'Histoire",
    'export.format': 'Format',
    'export.download': 'Télécharger',
  },
  de: {
    ...welcomeTranslationsEn,
    'nav.overview': 'Überblick',
    'nav.outline': 'Gliederung',
    'nav.chapters': 'Kapitel',
    'nav.characters': 'Charaktere',
    'nav.lore': 'Welt',
    'nav.map': 'Story-Karte',
    'nav.studio': 'Schreibstudio',
    'nav.settings': 'Einstellungen',
    'nav.allProjects': 'Alle Projekte',
    'nav.collapse': 'Einklappen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.loading': 'Laden...',
    'common.add': 'Hinzufügen',
    'common.edit': 'Bearbeiten',
    'common.search': 'Suchen',
    'common.create': 'Erstellen',
    'common.back': 'Zurück',
    'settings.title': 'Einstellungen',
    'settings.storyDetails': 'Story-Details',
    'settings.storyTitle': 'Titel',
    'settings.storyLanguage': 'Story-Sprache',
    'settings.tone': 'Ton',
    'settings.themeColors': 'Themenfarben',
    'settings.display': 'Anzeige',
    'settings.editor': 'Editor',
    'settings.ai': 'Künstliche Intelligenz',
    'settings.language': 'Sprache',
    'settings.notifications': 'Benachrichtigungen',
    'settings.privacy': 'Datenschutz',
    'settings.advanced': 'Erweitert',
    'settings.dangerZone': 'Gefahrenzone',
    'settings.particles': 'Partikeleffekte',
    'settings.animations': 'Animationen',
    'settings.reducedMotion': 'Reduzierte Bewegung',
    'settings.compactMode': 'Kompaktmodus',
    'settings.wordCount': 'Wortanzahl anzeigen',
    'settings.fontSize': 'Schriftgröße',
    'settings.lineHeight': 'Zeilenhöhe',
    'settings.fontFamily': 'Schriftart',
    'settings.autosave': 'Autospeichern',
    'settings.spellcheck': 'Rechtschreibung',
    'settings.aiEnabled': 'KI-Assistent',
    'settings.autoSuggest': 'Auto-Vorschläge',
    'settings.contextSources': 'Kontextquellen',
    'settings.useLore': 'Lore verwenden',
    'settings.useOutline': 'Gliederung verwenden',
    'settings.useStoryMap': 'Karte verwenden',
    'settings.useCharacters': 'Charaktere verwenden',
    'settings.aiModel': 'KI-Modell',
    'settings.creativity': 'Kreativität',
    'settings.uiLanguage': 'Oberflächensprache',
    'settings.notifyOnSave': 'Bei Speichern benachrichtigen',
    'settings.notifyOnAI': 'Bei KI benachrichtigen',
    'settings.soundEffects': 'Soundeffekte',
    'settings.analytics': 'Analyse',
    'settings.crashReports': 'Fehlerberichte',
    'settings.debugMode': 'Debug-Modus',
    'settings.experimental': 'Experimentelle Funktionen',
    'settings.autoBackup': 'Auto-Backup',
    'settings.backupInterval': 'Backup-Intervall',
    'settings.deleteStory': 'Story löschen',
    'settings.resetAll': 'Alles zurücksetzen',
    'settings.export': 'Story exportieren',
    'map.title': 'Story-Karte',
    'map.addNode': 'Knoten hinzufügen',
    'map.connect': 'Verbinden',
    'map.aiAnalyze': 'KI-Analyse',
    'map.aiAutoWire': 'KI Auto-Verbinden',
    'map.resetView': 'Ansicht zurücksetzen',
    'map.chapter': 'Kapitel',
    'map.character': 'Charakter',
    'map.event': 'Ereignis',
    'map.location': 'Ort',
    'map.insights': 'KI-Einblicke',
    'map.stats': 'Statistiken',
    'map.nodes': 'Knoten',
    'map.connections': 'Verbindungen',
    'map.selectedNode': 'Ausgewählter Knoten',
    'map.editNode': 'Knoten bearbeiten',
    'chapters.title': 'Kapitel',
    'chapters.addChapter': 'Kapitel hinzufügen',
    'chapters.generateDraft': 'Entwurf generieren',
    'chapters.words': 'Wörter',
    'characters.title': 'Charaktere',
    'characters.addCharacter': 'Charakter hinzufügen',
    'characters.aiGenerate': 'Mit KI generieren',
    'overview.title': 'Story-Überblick',
    'overview.narrativeIntent': 'Erzählabsicht',
    'overview.stakes': 'Was auf dem Spiel steht',
    'overview.setting': 'Settingbeschreibung',
    'overview.timePeriod': 'Zeitraum',
    'overview.themes': 'Zentrale Themen',
    'overview.stats': 'Story-Statistiken',
    'export.title': 'Story exportieren',
    'export.format': 'Format',
    'export.download': 'Herunterladen',
  },
  it: {
    ...welcomeTranslationsEn,
    'nav.overview': 'Panoramica',
    'nav.outline': 'Schema',
    'nav.chapters': 'Capitoli',
    'nav.characters': 'Personaggi',
    'nav.lore': 'Mondo',
    'nav.map': 'Mappa Storia',
    'nav.studio': 'Studio',
    'nav.settings': 'Impostazioni',
    'nav.allProjects': 'Tutti i Progetti',
    'nav.collapse': 'Riduci',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.delete': 'Elimina',
    'common.loading': 'Caricamento...',
    'common.add': 'Aggiungi',
    'common.edit': 'Modifica',
    'common.search': 'Cerca',
    'common.create': 'Crea',
    'common.back': 'Indietro',
    'settings.title': 'Impostazioni',
    'settings.storyDetails': 'Dettagli Storia',
    'settings.storyTitle': 'Titolo',
    'settings.storyLanguage': 'Lingua Storia',
    'settings.tone': 'Tono',
    'settings.themeColors': 'Colori Tema',
    'settings.display': 'Visualizzazione',
    'settings.editor': 'Editor',
    'settings.ai': 'Intelligenza Artificiale',
    'settings.language': 'Lingua',
    'settings.notifications': 'Notifiche',
    'settings.privacy': 'Privacy',
    'settings.advanced': 'Avanzate',
    'settings.dangerZone': 'Zona Pericolosa',
    'settings.particles': 'Effetti Particelle',
    'settings.animations': 'Animazioni',
    'settings.reducedMotion': 'Movimento Ridotto',
    'settings.compactMode': 'Modalità Compatta',
    'settings.wordCount': 'Mostra Parole',
    'settings.fontSize': 'Dimensione Font',
    'settings.lineHeight': 'Altezza Riga',
    'settings.fontFamily': 'Famiglia Font',
    'settings.autosave': 'Salvataggio Auto',
    'settings.spellcheck': 'Controllo Ortografico',
    'settings.aiEnabled': 'Assistente IA',
    'settings.autoSuggest': 'Suggerimenti Auto',
    'settings.contextSources': 'Fonti di Contesto',
    'settings.useLore': 'Usa Lore',
    'settings.useOutline': 'Usa Schema',
    'settings.useStoryMap': 'Usa Mappa',
    'settings.useCharacters': 'Usa Personaggi',
    'settings.aiModel': 'Modello IA',
    'settings.creativity': 'Creatività',
    'settings.uiLanguage': 'Lingua Interfaccia',
    'settings.notifyOnSave': 'Notifica al Salvataggio',
    'settings.notifyOnAI': 'Notifica IA',
    'settings.soundEffects': 'Effetti Sonori',
    'settings.analytics': 'Analisi',
    'settings.crashReports': 'Report Errori',
    'settings.debugMode': 'Modalità Debug',
    'settings.experimental': 'Funzioni Sperimentali',
    'settings.autoBackup': 'Backup Auto',
    'settings.backupInterval': 'Intervallo Backup',
    'settings.deleteStory': 'Elimina Storia',
    'settings.resetAll': 'Ripristina Tutto',
    'settings.export': 'Esporta Storia',
    'map.title': 'Mappa Storia',
    'map.addNode': 'Aggiungi Nodo',
    'map.connect': 'Connetti',
    'map.aiAnalyze': 'Analisi IA',
    'map.aiAutoWire': 'Auto-connetti IA',
    'map.resetView': 'Ripristina Vista',
    'map.chapter': 'Capitolo',
    'map.character': 'Personaggio',
    'map.event': 'Evento',
    'map.location': 'Luogo',
    'map.insights': 'Intuizioni IA',
    'map.stats': 'Statistiche',
    'map.nodes': 'Nodi',
    'map.connections': 'Connessioni',
    'map.selectedNode': 'Nodo Selezionato',
    'map.editNode': 'Modifica Nodo',
    'chapters.title': 'Capitoli',
    'chapters.addChapter': 'Aggiungi Capitolo',
    'chapters.generateDraft': 'Genera Bozza',
    'chapters.words': 'parole',
    'characters.title': 'Personaggi',
    'characters.addCharacter': 'Aggiungi Personaggio',
    'characters.aiGenerate': 'Genera con IA',
    'overview.title': 'Panoramica Storia',
    'overview.narrativeIntent': 'Intento Narrativo',
    'overview.stakes': 'Posta in Gioco',
    'overview.setting': 'Descrizione Ambientazione',
    'overview.timePeriod': 'Periodo Storico',
    'overview.themes': 'Temi Centrali',
    'overview.stats': 'Statistiche Storia',
    'export.title': 'Esporta Storia',
    'export.format': 'Formato',
    'export.download': 'Scarica',
  },
  pt: {
    ...welcomeTranslationsEn,
    'nav.overview': 'Visão Geral',
    'nav.outline': 'Esboço',
    'nav.chapters': 'Capítulos',
    'nav.characters': 'Personagens',
    'nav.lore': 'Mundo',
    'nav.map': 'Mapa da História',
    'nav.studio': 'Estúdio',
    'nav.settings': 'Configurações',
    'nav.allProjects': 'Todos os Projetos',
    'nav.collapse': 'Recolher',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.loading': 'Carregando...',
    'common.add': 'Adicionar',
    'common.edit': 'Editar',
    'common.search': 'Pesquisar',
    'common.create': 'Criar',
    'common.back': 'Voltar',
    'settings.title': 'Configurações',
    'settings.storyDetails': 'Detalhes da História',
    'settings.storyTitle': 'Título',
    'settings.storyLanguage': 'Idioma da História',
    'settings.tone': 'Tom',
    'settings.themeColors': 'Cores do Tema',
    'settings.display': 'Exibição',
    'settings.editor': 'Editor',
    'settings.ai': 'Inteligência Artificial',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificações',
    'settings.privacy': 'Privacidade',
    'settings.advanced': 'Avançado',
    'settings.dangerZone': 'Zona de Perigo',
    'settings.particles': 'Efeitos de Partículas',
    'settings.animations': 'Animações',
    'settings.reducedMotion': 'Movimento Reduzido',
    'settings.compactMode': 'Modo Compacto',
    'settings.wordCount': 'Mostrar Palavras',
    'settings.fontSize': 'Tamanho da Fonte',
    'settings.lineHeight': 'Altura da Linha',
    'settings.fontFamily': 'Família da Fonte',
    'settings.autosave': 'Salvamento Automático',
    'settings.spellcheck': 'Corretor',
    'settings.aiEnabled': 'Assistente de IA',
    'settings.autoSuggest': 'Auto-sugestões',
    'settings.contextSources': 'Fontes de Contexto',
    'settings.useLore': 'Usar Lore',
    'settings.useOutline': 'Usar Esboço',
    'settings.useStoryMap': 'Usar Mapa',
    'settings.useCharacters': 'Usar Personagens',
    'settings.aiModel': 'Modelo de IA',
    'settings.creativity': 'Criatividade',
    'settings.uiLanguage': 'Idioma da Interface',
    'settings.notifyOnSave': 'Notificar ao Salvar',
    'settings.notifyOnAI': 'Notificar IA',
    'settings.soundEffects': 'Efeitos Sonoros',
    'settings.analytics': 'Análises',
    'settings.crashReports': 'Relatórios de Erros',
    'settings.debugMode': 'Modo de Depuração',
    'settings.experimental': 'Recursos Experimentais',
    'settings.autoBackup': 'Backup Automático',
    'settings.backupInterval': 'Intervalo de Backup',
    'settings.deleteStory': 'Excluir História',
    'settings.resetAll': 'Redefinir Tudo',
    'settings.export': 'Exportar História',
    'map.title': 'Mapa da História',
    'map.addNode': 'Adicionar Nó',
    'map.connect': 'Conectar',
    'map.aiAnalyze': 'Análise de IA',
    'map.aiAutoWire': 'Auto-conectar IA',
    'map.resetView': 'Redefinir Vista',
    'map.chapter': 'Capítulo',
    'map.character': 'Personagem',
    'map.event': 'Evento',
    'map.location': 'Local',
    'map.insights': 'Insights de IA',
    'map.stats': 'Estatísticas',
    'map.nodes': 'Nós',
    'map.connections': 'Conexões',
    'map.selectedNode': 'Nó Selecionado',
    'map.editNode': 'Editar Nó',
    'chapters.title': 'Capítulos',
    'chapters.addChapter': 'Adicionar Capítulo',
    'chapters.generateDraft': 'Gerar Rascunho',
    'chapters.words': 'palavras',
    'characters.title': 'Personagens',
    'characters.addCharacter': 'Adicionar Personagem',
    'characters.aiGenerate': 'Gerar com IA',
    'overview.title': 'Visão Geral',
    'overview.narrativeIntent': 'Intenção Narrativa',
    'overview.stakes': 'O que está em Jogo',
    'overview.setting': 'Descrição do Cenário',
    'overview.timePeriod': 'Período',
    'overview.themes': 'Temas Centrais',
    'overview.stats': 'Estatísticas da História',
    'export.title': 'Exportar História',
    'export.format': 'Formato',
    'export.download': 'Baixar',
  },
  ru: {
    ...welcomeTranslationsEn,
    'nav.overview': 'Обзор',
    'nav.outline': 'План',
    'nav.chapters': 'Главы',
    'nav.characters': 'Персонажи',
    'nav.lore': 'Мир',
    'nav.map': 'Карта Истории',
    'nav.studio': 'Студия',
    'nav.settings': 'Настройки',
    'nav.allProjects': 'Все Проекты',
    'nav.collapse': 'Свернуть',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.loading': 'Загрузка...',
    'common.add': 'Добавить',
    'common.edit': 'Редактировать',
    'common.search': 'Поиск',
    'common.create': 'Создать',
    'common.back': 'Назад',
    'settings.title': 'Настройки',
    'settings.storyDetails': 'Детали Истории',
    'settings.storyTitle': 'Название',
    'settings.storyLanguage': 'Язык Истории',
    'settings.tone': 'Тон',
    'settings.themeColors': 'Цвета Темы',
    'settings.display': 'Отображение',
    'settings.editor': 'Редактор',
    'settings.ai': 'Искусственный Интеллект',
    'settings.language': 'Язык',
    'settings.notifications': 'Уведомления',
    'settings.privacy': 'Конфиденциальность',
    'settings.advanced': 'Дополнительно',
    'settings.dangerZone': 'Опасная Зона',
    'settings.particles': 'Эффекты Частиц',
    'settings.animations': 'Анимации',
    'settings.reducedMotion': 'Уменьшенное Движение',
    'settings.compactMode': 'Компактный Режим',
    'settings.wordCount': 'Показать Слова',
    'settings.fontSize': 'Размер Шрифта',
    'settings.lineHeight': 'Высота Строки',
    'settings.fontFamily': 'Семейство Шрифтов',
    'settings.autosave': 'Автосохранение',
    'settings.spellcheck': 'Проверка Орфографии',
    'settings.aiEnabled': 'Ассистент ИИ',
    'settings.autoSuggest': 'Авто-предложения',
    'settings.contextSources': 'Источники Контекста',
    'settings.useLore': 'Использовать Лор',
    'settings.useOutline': 'Использовать План',
    'settings.useStoryMap': 'Использовать Карту',
    'settings.useCharacters': 'Использовать Персонажей',
    'settings.aiModel': 'Модель ИИ',
    'settings.creativity': 'Креативность',
    'settings.uiLanguage': 'Язык Интерфейса',
    'settings.notifyOnSave': 'Уведомлять при Сохранении',
    'settings.notifyOnAI': 'Уведомлять об ИИ',
    'settings.soundEffects': 'Звуковые Эффекты',
    'settings.analytics': 'Аналитика',
    'settings.crashReports': 'Отчёты об Ошибках',
    'settings.debugMode': 'Режим Отладки',
    'settings.experimental': 'Экспериментальные Функции',
    'settings.autoBackup': 'Автоматическое Резервирование',
    'settings.backupInterval': 'Интервал Резервирования',
    'settings.deleteStory': 'Удалить Историю',
    'settings.resetAll': 'Сбросить Всё',
    'settings.export': 'Экспортировать Историю',
    'map.title': 'Карта Истории',
    'map.addNode': 'Добавить Узел',
    'map.connect': 'Соединить',
    'map.aiAnalyze': 'Анализ ИИ',
    'map.aiAutoWire': 'ИИ Авто-соединение',
    'map.resetView': 'Сбросить Вид',
    'map.chapter': 'Глава',
    'map.character': 'Персонаж',
    'map.event': 'Событие',
    'map.location': 'Место',
    'map.insights': 'Выводы ИИ',
    'map.stats': 'Статистика',
    'map.nodes': 'Узлы',
    'map.connections': 'Соединения',
    'map.selectedNode': 'Выбранный Узел',
    'map.editNode': 'Редактировать Узел',
    'chapters.title': 'Главы',
    'chapters.addChapter': 'Добавить Главу',
    'chapters.generateDraft': 'Сгенерировать Черновик',
    'chapters.words': 'слов',
    'characters.title': 'Персонажи',
    'characters.addCharacter': 'Добавить Персонажа',
    'characters.aiGenerate': 'Сгенерировать ИИ',
    'overview.title': 'Обзор Истории',
    'overview.narrativeIntent': 'Нарративное Намерение',
    'overview.stakes': 'Ставки',
    'overview.setting': 'Описание Сеттинга',
    'overview.timePeriod': 'Временной Период',
    'overview.themes': 'Центральные Темы',
    'overview.stats': 'Статистика Истории',
    'export.title': 'Экспортировать Историю',
    'export.format': 'Формат',
    'export.download': 'Скачать',
  },
  zh: {
    ...welcomeTranslationsEn,
    'nav.overview': '故事概述',
    'nav.outline': '大纲',
    'nav.chapters': '章节',
    'nav.characters': '角色',
    'nav.lore': '世界观',
    'nav.map': '故事地图',
    'nav.studio': '写作工作室',
    'nav.settings': '设置',
    'nav.allProjects': '所有项目',
    'nav.collapse': '折叠',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.loading': '加载中...',
    'common.add': '添加',
    'common.edit': '编辑',
    'common.search': '搜索',
    'common.create': '创建',
    'common.back': '返回',
    'settings.title': '设置',
    'settings.storyDetails': '故事详情',
    'settings.storyTitle': '标题',
    'settings.storyLanguage': '故事语言',
    'settings.tone': '基调',
    'settings.themeColors': '主题颜色',
    'settings.display': '显示',
    'settings.editor': '编辑器',
    'settings.ai': '人工智能',
    'settings.language': '语言',
    'settings.notifications': '通知',
    'settings.privacy': '隐私',
    'settings.advanced': '高级',
    'settings.dangerZone': '危险区域',
    'settings.particles': '粒子效果',
    'settings.animations': '动画',
    'settings.reducedMotion': '减少动画',
    'settings.compactMode': '紧凑模式',
    'settings.wordCount': '显示字数',
    'settings.fontSize': '字体大小',
    'settings.lineHeight': '行高',
    'settings.fontFamily': '字体',
    'settings.autosave': '自动保存',
    'settings.spellcheck': '拼写检查',
    'settings.aiEnabled': 'AI助手',
    'settings.autoSuggest': '自动建议',
    'settings.contextSources': '上下文来源',
    'settings.useLore': '使用世界观',
    'settings.useOutline': '使用大纲',
    'settings.useStoryMap': '使用地图',
    'settings.useCharacters': '使用角色',
    'settings.aiModel': 'AI模型',
    'settings.creativity': '创造力',
    'settings.uiLanguage': '界面语言',
    'settings.notifyOnSave': '保存时通知',
    'settings.notifyOnAI': 'AI完成时通知',
    'settings.soundEffects': '音效',
    'settings.analytics': '分析',
    'settings.crashReports': '错误报告',
    'settings.debugMode': '调试模式',
    'settings.experimental': '实验性功能',
    'settings.autoBackup': '自动备份',
    'settings.backupInterval': '备份间隔',
    'settings.deleteStory': '删除故事',
    'settings.resetAll': '重置所有',
    'settings.export': '导出故事',
    'map.title': '故事地图',
    'map.addNode': '添加节点',
    'map.connect': '连接',
    'map.aiAnalyze': 'AI分析',
    'map.aiAutoWire': 'AI自动连接',
    'map.resetView': '重置视图',
    'map.chapter': '章节',
    'map.character': '角色',
    'map.event': '事件',
    'map.location': '地点',
    'map.insights': 'AI洞察',
    'map.stats': '统计',
    'map.nodes': '节点',
    'map.connections': '连接',
    'map.selectedNode': '选中节点',
    'map.editNode': '编辑节点',
    'chapters.title': '章节',
    'chapters.addChapter': '添加章节',
    'chapters.generateDraft': '生成草稿',
    'chapters.words': '字',
    'characters.title': '角色',
    'characters.addCharacter': '添加角色',
    'characters.aiGenerate': 'AI生成',
    'overview.title': '故事概述',
    'overview.narrativeIntent': '叙事意图',
    'overview.stakes': '利害关系',
    'overview.setting': '场景描述',
    'overview.timePeriod': '时间段',
    'overview.themes': '核心主题',
    'overview.stats': '故事统计',
    'export.title': '导出故事',
    'export.format': '格式',
    'export.download': '下载',
  },
  ja: {
    ...welcomeTranslationsEn,
    'nav.overview': '概要',
    'nav.outline': 'アウトライン',
    'nav.chapters': '章',
    'nav.characters': 'キャラクター',
    'nav.lore': '世界観',
    'nav.map': 'ストーリーマップ',
    'nav.studio': '執筆スタジオ',
    'nav.settings': '設定',
    'nav.allProjects': '全プロジェクト',
    'nav.collapse': '折りたたむ',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.loading': '読み込み中...',
    'common.add': '追加',
    'common.edit': '編集',
    'common.search': '検索',
    'common.create': '作成',
    'common.back': '戻る',
    'settings.title': '設定',
    'settings.storyDetails': 'ストーリー詳細',
    'settings.storyTitle': 'タイトル',
    'settings.storyLanguage': 'ストーリー言語',
    'settings.tone': 'トーン',
    'settings.themeColors': 'テーマカラー',
    'settings.display': '表示',
    'settings.editor': 'エディター',
    'settings.ai': '人工知能',
    'settings.language': '言語',
    'settings.notifications': '通知',
    'settings.privacy': 'プライバシー',
    'settings.advanced': '詳細',
    'settings.dangerZone': '危険ゾーン',
    'settings.particles': 'パーティクル効果',
    'settings.animations': 'アニメーション',
    'settings.reducedMotion': 'モーション軽減',
    'settings.compactMode': 'コンパクトモード',
    'settings.wordCount': '文字数表示',
    'settings.fontSize': 'フォントサイズ',
    'settings.lineHeight': '行の高さ',
    'settings.fontFamily': 'フォント',
    'settings.autosave': '自動保存',
    'settings.spellcheck': 'スペルチェック',
    'settings.aiEnabled': 'AIアシスタント',
    'settings.autoSuggest': '自動提案',
    'settings.contextSources': 'コンテキストソース',
    'settings.useLore': '世界観を使用',
    'settings.useOutline': 'アウトラインを使用',
    'settings.useStoryMap': 'マップを使用',
    'settings.useCharacters': 'キャラクターを使用',
    'settings.aiModel': 'AIモデル',
    'settings.creativity': '創造性',
    'settings.uiLanguage': 'インターフェース言語',
    'settings.notifyOnSave': '保存時に通知',
    'settings.notifyOnAI': 'AI完了時に通知',
    'settings.soundEffects': '効果音',
    'settings.analytics': '分析',
    'settings.crashReports': 'エラーレポート',
    'settings.debugMode': 'デバッグモード',
    'settings.experimental': '実験的機能',
    'settings.autoBackup': '自動バックアップ',
    'settings.backupInterval': 'バックアップ間隔',
    'settings.deleteStory': 'ストーリーを削除',
    'settings.resetAll': 'すべてリセット',
    'settings.export': 'ストーリーをエクスポート',
    'map.title': 'ストーリーマップ',
    'map.addNode': 'ノードを追加',
    'map.connect': '接続',
    'map.aiAnalyze': 'AI分析',
    'map.aiAutoWire': 'AI自動接続',
    'map.resetView': 'ビューをリセット',
    'map.chapter': '章',
    'map.character': 'キャラクター',
    'map.event': 'イベント',
    'map.location': '場所',
    'map.insights': 'AIの洞察',
    'map.stats': '統計',
    'map.nodes': 'ノード',
    'map.connections': '接続',
    'map.selectedNode': '選択中のノード',
    'map.editNode': 'ノードを編集',
    'chapters.title': '章',
    'chapters.addChapter': '章を追加',
    'chapters.generateDraft': '下書きを生成',
    'chapters.words': '語',
    'characters.title': 'キャラクター',
    'characters.addCharacter': 'キャラクターを追加',
    'characters.aiGenerate': 'AIで生成',
    'overview.title': 'ストーリー概要',
    'overview.narrativeIntent': '物語の意図',
    'overview.stakes': '賭けられているもの',
    'overview.setting': '設定の説明',
    'overview.timePeriod': '時代',
    'overview.themes': '中心テーマ',
    'overview.stats': 'ストーリー統計',
    'export.title': 'ストーリーをエクスポート',
    'export.format': 'フォーマット',
    'export.download': 'ダウンロード',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  currentLanguage: LanguageInfo;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ui-language');
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      return saved as Language;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('ui-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  }, [language]);

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
