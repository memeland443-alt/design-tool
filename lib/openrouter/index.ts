/**
 * OpenRouter API integration
 * Экспорт всех модулей для работы с OpenRouter
 */

// Типы
export type {
  MessageRole,
  ContentType,
  TextContent,
  ImageContent,
  MessageContent,
  ChatMessage,
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterError,
  TranslationResult,
  TranslationConfig,
  RetryOptions,
  ProcessingStatus,
} from './types'

// Сервис
export { OpenRouterService, createOpenRouterService } from './service'

// Модели и конфигурации
export {
  GEMINI_MODEL,
  ALTERNATIVE_MODELS,
  DEFAULT_TRANSLATION_CONFIG,
  createTranslationConfig,
  getSystemPrompt,
  getUserPrompt,
  validateTranslationConfig,
} from './models/image-translation'

// Промпты
export {
  TRANSLATION_SYSTEM_PROMPT,
  buildTranslationPrompt,
  TECHNICAL_DOCUMENT_PROMPT,
  MARKETING_MATERIAL_PROMPT,
  UI_UX_PROMPT,
  LEGAL_DOCUMENT_PROMPT,
} from './prompts/translation'
