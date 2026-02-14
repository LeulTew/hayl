import { useUserProfile } from './useUserProfile';
import { translations, type Language } from '../lib/translations';

export function useTranslation() {
  const { profile } = useUserProfile();
  const lang: Language = (profile?.languagePreference as Language) || 'en';

  const t = (key: keyof typeof translations.en) => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return { t, lang };
}
