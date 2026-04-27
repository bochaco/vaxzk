import { createContext, useContext, useState } from 'react';
import { translations, type Language, type Translations } from './i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  i18n: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  i18n: translations.en,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, i18n: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
