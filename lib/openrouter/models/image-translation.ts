/**
 * Конфигурация модели Google Gemini для перевода изображений
 */

import { TranslationConfig } from '../types'
import { TRANSLATION_SYSTEM_PROMPT, buildTranslationPrompt } from '../prompts/translation'

/**
 * Модель для использования
 * google/gemini-3-pro-image-preview - поддержка изображений и перевода
 */
export const GEMINI_MODEL = 'google/gemini-3-pro-image-preview'

/**
 * Альтернативные модели (для будущего использования)
 */
export const ALTERNATIVE_MODELS = {
  // Старая версия Gemini Pro Vision (deprecated)
  geminiProVision: 'google/gemini-pro-vision',
  // Gemini 2.0 когда станет доступен
  gemini2: 'google/gemini-2.0-flash-exp:free',
  // GPT-4 Vision как альтернатива
  gpt4vision: 'openai/gpt-4-vision-preview',
  // Claude 3 с vision
  claude3: 'anthropic/claude-3-opus-20240229',
} as const

/**
 * Конфигурация по умолчанию для перевода
 */
export const DEFAULT_TRANSLATION_CONFIG = {
  temperature: 0.3, // Низкая температура для стабильности и точности
  maxTokens: 4096, // Достаточно для больших текстов
  topP: 1,
} as const

/**
 * Создает конфигурацию для перевода с заданным языком
 */
export function createTranslationConfig(
  targetLanguageCode: string,
  targetLanguageName: string,
  options?: Partial<TranslationConfig>
): TranslationConfig {
  return {
    targetLanguage: targetLanguageCode,
    languageName: targetLanguageName,
    temperature: options?.temperature ?? DEFAULT_TRANSLATION_CONFIG.temperature,
    maxTokens: options?.maxTokens ?? DEFAULT_TRANSLATION_CONFIG.maxTokens,
  }
}

/**
 * Получить системный промпт для перевода
 */
export function getSystemPrompt(): string {
  return TRANSLATION_SYSTEM_PROMPT
}

/**
 * Получить user промпт для конкретного языка
 */
export function getUserPrompt(targetLanguageCode: string, targetLanguageName: string): string {
  return buildTranslationPrompt(targetLanguageCode, targetLanguageName)
}

/**
 * Валидация конфигурации перевода
 */
export function validateTranslationConfig(config: TranslationConfig): void {
  if (!config.targetLanguage || config.targetLanguage.length < 2) {
    throw new Error('Invalid target language code')
  }

  if (!config.languageName || config.languageName.length === 0) {
    throw new Error('Invalid language name')
  }

  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    throw new Error('Temperature must be between 0 and 2')
  }

  if (config.maxTokens !== undefined && config.maxTokens < 1) {
    throw new Error('Max tokens must be positive')
  }
}
