/**
 * Конфигурация модели Bria Increase Resolution
 */

import { ReplicateModelConfig } from '../types'
import { ImageProcessingOutput } from './background-removal'

/**
 * Параметры для модели Bria Increase Resolution
 */
export interface RecraftUpscalerInput {
  /** Base64 Data URL или HTTP URL изображения */
  image: string
  /** Resolution multiplier (scale factor). Possible values are 2 or 4. Maximum total area is 8192x8192 pixels (default: 2) */
  desired_increase?: number
  /** Preserve alpha channel in output. When true, maintains original transparency. When false, output is fully opaque. (default: true) */
  preserve_alpha?: boolean
  /** Synchronous response mode (default: true) */
  sync?: boolean
  /** Enable content moderation (default: false) */
  content_moderation?: boolean
}

/**
 * Конфигурация модели Bria Increase Resolution
 */
export const RECRAFT_UPSCALER_CONFIG: ReplicateModelConfig<
  RecraftUpscalerInput,
  ImageProcessingOutput
> = {
  model: 'bria/increase-resolution',
  name: 'Bria Increase Resolution',
  waitTimeout: 60,
  validateInput: (input) => {
    if (!input.image) {
      throw new Error('Image is required')
    }
  },
  transformOutput: (output) => {
    // Новый API возвращает объект с методом url()
    if (output && typeof output === 'object' && 'url' in output) {
      if (typeof output.url === 'function') {
        return { url: output.url() }
      }
      return { url: output.url }
    }
    // Поддержка старого формата (строка)
    if (typeof output === 'string') {
      return { url: output }
    }
    // Поддержка массива
    if (Array.isArray(output) && output.length > 0) {
      return { url: output[0] }
    }
    throw new Error('Unexpected output format from Replicate')
  },
}
