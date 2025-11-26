/**
 * Типы для работы с Replicate API
 * Поддерживает типобезопасную конфигурацию различных моделей
 */

import { Prediction } from 'replicate'

/**
 * Базовый интерфейс для конфигурации модели Replicate
 */
export interface ReplicateModelConfig<TInput = Record<string, any>, TOutput = any> {
  /** ID версии модели в формате Replicate */
  version: string
  /** Название модели для логирования и отладки */
  name: string
  /** Максимальное время ожидания в секундах (1-60) */
  waitTimeout?: number
  /** Параметры по умолчанию для модели */
  defaultInput?: Partial<TInput>
  /** Функция валидации входных данных */
  validateInput?: (input: TInput) => void | Promise<void>
  /** Функция трансформации результата */
  transformOutput?: (output: any) => TOutput
}

/**
 * Параметры для модели удаления фона Bria
 */
export interface BriaRemoveBackgroundInput {
  /** Base64 Data URL или HTTP URL изображения */
  image?: string
  /** HTTP URL изображения (альтернатива image) */
  image_url?: string
  /** Сохранять полупрозрачные области (рекомендуется true для лучшего качества) */
  preserve_partial_alpha?: boolean
  /** Включить модерацию контента */
  content_moderation?: boolean
}

/**
 * Результат обработки изображения
 */
export interface ImageProcessingOutput {
  /** URL обработанного изображения */
  url: string
  /** Метаданные (если есть) */
  metadata?: Record<string, any>
}

/**
 * Параметры для модели Recraft AI Crisp Upscale
 */
export interface RecraftUpscalerInput {
  /** Base64 Data URL или HTTP URL изображения */
  image: string
}

/**
 * Конфигурация модели Bria Remove Background
 */
export const BRIA_REMOVE_BG_CONFIG: ReplicateModelConfig<
  BriaRemoveBackgroundInput,
  ImageProcessingOutput
> = {
  version: '1a075954106b608c3671c2583e10526216f700d846b127fcf01461e8f642fb48',
  name: 'Bria Remove Background',
  waitTimeout: 30,
  defaultInput: {
    preserve_partial_alpha: true, // Сохраняем качество краев
    content_moderation: false,
  },
  validateInput: (input) => {
    if (!input.image && !input.image_url) {
      throw new Error('Either image or image_url must be provided')
    }
    if (input.image && input.image_url) {
      throw new Error('Provide either image or image_url, not both')
    }
  },
  transformOutput: (output) => {
    if (typeof output === 'string') {
      return { url: output }
    }
    if (Array.isArray(output) && output.length > 0) {
      return { url: output[0] }
    }
    throw new Error('Unexpected output format from Replicate')
  },
}

/**
 * Конфигурация модели Recraft AI Crisp Upscale
 */
export const RECRAFT_UPSCALER_CONFIG: ReplicateModelConfig<
  RecraftUpscalerInput,
  ImageProcessingOutput
> = {
  version: '31c70d9026bbd25ee2b751825e19101e0321b8814c33863c88fe5d0d63c00c82',
  name: 'Recraft AI Crisp Upscale',
  waitTimeout: 60,
  validateInput: (input) => {
    if (!input.image) {
      throw new Error('Image is required')
    }
  },
  transformOutput: (output) => {
    if (typeof output === 'string') {
      return { url: output }
    }
    if (Array.isArray(output) && output.length > 0) {
      return { url: output[0] }
    }
    throw new Error('Unexpected output format from Replicate')
  },
}

/**
 * Типы статусов предсказания
 */
export type PredictionStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'

/**
 * Результат выполнения модели
 */
export interface ModelResult<TOutput = any> {
  /** Статус выполнения */
  status: PredictionStatus
  /** Результат (если успешно) */
  output?: TOutput
  /** Ошибка (если неудачно) */
  error?: string
  /** ID предсказания для отладки */
  predictionId: string
  /** Время выполнения в миллисекундах */
  executionTime?: number
}

/**
 * Опции для запуска модели
 */
export interface RunModelOptions<TInput = any> {
  /** Входные параметры модели */
  input: TInput
  /** Переопределить timeout для этого запроса */
  waitTimeout?: number
  /** Webhook URL для уведомлений */
  webhook?: string
  /** Фильтр событий webhook */
  webhook_events_filter?: ('start' | 'output' | 'logs' | 'completed')[]
}
