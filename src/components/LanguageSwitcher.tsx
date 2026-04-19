import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-100">
      <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-navy/60" />
      <select
        value={i18n.language}
        onChange={changeLanguage}
        className="bg-transparent text-xs sm:text-sm font-medium text-navy focus:outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
