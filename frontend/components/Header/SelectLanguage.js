import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from "@/context/Context";

const LANGUAGE_FLAGS = {
  en: '🇺🇸',
  fr: '🇫🇷',
  es: '🇲🇽',
  de: '🇩🇪',
  it: '🇮🇹',
  'pt-BR': '🇧🇷',
  // Add more flags as needed
};


const LanguageSwitcher = ({ onChange, btnClass }) => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const locales = router.locales ?? [i18n.language];
  const currentLanguage = i18n.language;

  const [open, setOpen] = useState(false);

  const { isLightTheme } = useAppContext();

  const languageNames = useMemo(() => {
    if (typeof currentLanguage !== 'string') {
      return {
        of: (code) => code,
      };
    }

    try {
      return new Intl.DisplayNames([currentLanguage], {
        type: 'language',
      });
    } catch (error) {
      // Fallback for unsupported environments or bad codes
      return {
        of: (code) => code,
      };
    }
  }, [currentLanguage]);

  const switchToLocale = useCallback(
    async (locale) => {
      const path = router.asPath;

      if (onChange) {
        onChange(locale);
      }

      await router.push(path, path, { locale });
    },
    [router, onChange]
  );

  const handleSelect = async (locale) => {
    setOpen(false);
    await switchToLocale(locale);
  };

  return (
    <div className="dropdown">
      <button
        className={`${isLightTheme ? btnClass : ''} btn ${isLightTheme ? 'btn-dark' : ''} btn-lg dropdown-toggle d-flex align-items-center gap-1 px-1 py-1`}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ fontSize: '2.2rem' }}
      >
        <span style={{ fontSize: '2.5rem' }}>
          {LANGUAGE_FLAGS[currentLanguage] || '🇧🇷'}
        </span>
      </button>

      <ul className={`dropdown-menu ${open ? 'show' : ''}`} style={{ fontSize: '1.1rem' }}>
        {locales.map((locale) => (
          <li key={locale}>
            <button
              className="dropdown-item d-flex align-items-center gap-2 py-2"
              onClick={() => handleSelect(locale)}
              style={{ fontSize: '2.1rem' }}
            >
              <span style={{ fontSize: '2.5rem' }}>
                {LANGUAGE_FLAGS[locale] || '🇧🇷'}
              </span>
              {capitalize(languageNames.of(locale) ?? locale)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default LanguageSwitcher;
