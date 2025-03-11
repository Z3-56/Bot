import { useLanguageContext } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

export function useTranslation() {
  const { language } = useLanguageContext();

  const t = (key: keyof typeof translations['en']) => {
    return translations[language as keyof typeof translations][key] || translations.en[key];
  };

  return { t, language };
}