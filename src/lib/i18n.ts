 import i18n from 'i18next';
 import { initReactI18next } from 'react-i18next';
 
 // Import all translations
 import en from '@/locales/en.json';
 import tr from '@/locales/tr.json';
 import es from '@/locales/es.json';
 import fr from '@/locales/fr.json';
 import de from '@/locales/de.json';
 import it from '@/locales/it.json';
 import pt from '@/locales/pt.json';
 import ru from '@/locales/ru.json';
 import zh from '@/locales/zh.json';
 import ja from '@/locales/ja.json';
 
 const resources = {
   en: { translation: en },
   tr: { translation: tr },
   es: { translation: es },
   fr: { translation: fr },
   de: { translation: de },
   it: { translation: it },
   pt: { translation: pt },
   ru: { translation: ru },
   zh: { translation: zh },
   ja: { translation: ja },
 };
 
 i18n
   .use(initReactI18next)
   .init({
     resources,
     lng: localStorage.getItem('loomy-language') || 'en',
     fallbackLng: 'en',
     interpolation: {
       escapeValue: false,
     },
   });
 
 export default i18n;