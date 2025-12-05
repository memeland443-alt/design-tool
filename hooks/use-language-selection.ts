/**
 * Hook для управления выбором языка перевода
 * Сохраняет выбранный язык в localStorage
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Language, DEFAULT_LANGUAGE, findLanguageByCode } from '@/constants/languages'

const STORAGE_KEY = 'translator_target_language'

interface UseLanguageSelectionReturn {
  /** Выбранный язык */
  selectedLanguage: Language
  /** Функция для изменения языка */
  setLanguage: (language: Language) => void
  /** Код выбранного языка */
  languageCode: string
  /** Название выбранного языка */
  languageName: string
}

/**
 * Hook для управления выбранным языком перевода
 */
export function useLanguageSelection(): UseLanguageSelectionReturn {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(DEFAULT_LANGUAGE)

  // Загрузка сохраненного языка из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const language = findLanguageByCode(saved)
        if (language) {
          setSelectedLanguage(language)
        }
      }
    } catch (error) {
      console.error('Failed to load language from localStorage:', error)
    }
  }, [])

  // Функция для установки языка и сохранения в localStorage
  const setLanguage = useCallback((language: Language) => {
    setSelectedLanguage(language)
    try {
      localStorage.setItem(STORAGE_KEY, language.code)
    } catch (error) {
      console.error('Failed to save language to localStorage:', error)
    }
  }, [])

  return {
    selectedLanguage,
    setLanguage,
    languageCode: selectedLanguage.code,
    languageName: selectedLanguage.name,
  }
}
