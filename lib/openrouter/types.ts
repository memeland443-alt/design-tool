/**
 * Типы для работы с OpenRouter API
 * Документация: https://openrouter.ai/docs
 */

/**
 * Роль сообщения в чате
 */
export type MessageRole = 'system' | 'user' | 'assistant'

/**
 * Тип контента сообщения
 */
export type ContentType = 'text' | 'image_url'

/**
 * Текстовый контент
 */
export interface TextContent {
  type: 'text'
  text: string
}

/**
 * Изображение в формате URL или base64
 */
export interface ImageContent {
  type: 'image_url'
  image_url: {
    url: string // data:image/jpeg;base64,... или https://...
    detail?: 'low' | 'high' | 'auto'
  }
}

/**
 * Multimodal контент (текст + изображения)
 */
export type MessageContent = string | (TextContent | ImageContent)[]

/**
 * Сообщение в чате
 */
export interface ChatMessage {
  role: MessageRole
  content: MessageContent
}

/**
 * Параметры запроса к OpenRouter
 */
export interface OpenRouterRequest {
  /** Модель для использования (например, "google/gemini-pro-vision") */
  model: string
  /** Массив сообщений */
  messages: ChatMessage[]
  /** Модальности для multimodal моделей (например, ["image", "text"]) */
  modalities?: string[]
  /** Температура генерации (0-2, по умолчанию 1) */
  temperature?: number
  /** Top-p sampling (0-1) */
  top_p?: number
  /** Максимальное количество токенов в ответе */
  max_tokens?: number
  /** Streaming ответа */
  stream?: boolean
  /** Webhook для уведомлений */
  webhook?: string
}

/**
 * Выбор модели в ответе
 */
export interface ResponseChoice {
  index: number
  message: {
    role: 'assistant'
    content: string
    images?: Array<{
      type: 'image_url'
      image_url: {
        url: string // data:image/png;base64,...
      }
    }>
  }
  finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls'
}

/**
 * Информация об использовании токенов
 */
export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * Ответ от OpenRouter
 */
export interface OpenRouterResponse {
  id: string
  model: string
  created: number
  choices: ResponseChoice[]
  usage?: Usage
}

/**
 * Ошибка от OpenRouter
 */
export interface OpenRouterError {
  error: {
    message: string
    type: string
    code: string | number
  }
}

/**
 * Результат перевода изображения
 */
export interface TranslationResult {
  /** Переведенный текст */
  translatedText: string
  /** URL переведенного изображения (если доступно) */
  translatedImageUrl?: string | null
  /** Исходный язык (если определен) */
  detectedLanguage?: string
  /** Целевой язык */
  targetLanguage: string
  /** Использованные токены */
  tokensUsed?: number
  /** Время обработки в мс */
  processingTime?: number
}

/**
 * Конфигурация для перевода
 */
export interface TranslationConfig {
  /** Код целевого языка (ISO 639-1) */
  targetLanguage: string
  /** Полное название языка */
  languageName: string
  /** Температура для модели */
  temperature?: number
  /** Максимум токенов */
  maxTokens?: number
}

/**
 * Опции для retry логики
 */
export interface RetryOptions {
  /** Максимальное количество попыток */
  maxRetries?: number
  /** Начальная задержка в мс */
  initialDelay?: number
  /** Множитель для экспоненциального backoff */
  backoffMultiplier?: number
  /** Максимальная задержка в мс */
  maxDelay?: number
}

/**
 * Статус обработки
 */
export type ProcessingStatus = 'pending' | 'extracting' | 'translating' | 'completed' | 'error'
