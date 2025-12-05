/**
 * Поддерживаемые языки для перевода
 * ISO 639-1 коды языков
 */

export interface Language {
  /** ISO 639-1 код (2 буквы) */
  code: string
  /** Название на английском */
  name: string
  /** Название на родном языке */
  nativeName: string
  /** Популярный язык (для сортировки) */
  popular?: boolean
}

/**
 * Список поддерживаемых языков
 * Отсортированы по популярности для международного бизнеса
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  // Самые популярные языки (топ-10)
  { code: 'en', name: 'English', nativeName: 'English', popular: true },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', popular: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', popular: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', popular: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', popular: true },
  { code: 'fr', name: 'French', nativeName: 'Français', popular: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', popular: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', popular: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', popular: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', popular: true },

  // Другие важные языки
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },

  // Европейские языки
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },

  // Азиатские языки
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },

  // Другие языки
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
]

/**
 * Получить популярные языки
 */
export function getPopularLanguages(): Language[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang.popular)
}

/**
 * Получить все языки
 */
export function getAllLanguages(): Language[] {
  return SUPPORTED_LANGUAGES
}

/**
 * Найти язык по коду
 */
export function findLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code.toLowerCase() === code.toLowerCase())
}

/**
 * Получить название языка по коду
 */
export function getLanguageName(code: string): string {
  const language = findLanguageByCode(code)
  return language ? language.name : code
}

/**
 * Получить native название языка по коду
 */
export function getLanguageNativeName(code: string): string {
  const language = findLanguageByCode(code)
  return language ? language.nativeName : code
}

/**
 * Валидация языкового кода
 */
export function isValidLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code.toLowerCase() === code.toLowerCase())
}

/**
 * Язык по умолчанию (английский)
 */
export const DEFAULT_LANGUAGE: Language = SUPPORTED_LANGUAGES[0]
