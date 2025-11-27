/**
 * Конфигурация модели Bria Remove Background
 */

import { ReplicateModelConfig } from '../types'

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
