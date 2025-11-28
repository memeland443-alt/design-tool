/**
 * Конфигурация модели Crystal Upscaler
 */

import { ReplicateModelConfig } from '../types'
import { ImageProcessingOutput } from './background-removal'

/**
 * Параметры для модели Crystal Upscaler
 */
export interface RecraftUpscalerInput {
  /** Base64 Data URL или HTTP URL изображения */
  image: string
  /** Scale factor for upscaling (default: 2) */
  scale_factor?: number
  /** Creativity level for upscaling (default: 0, min: 0, max: 10) */
  creativity?: number
  /** Format of the output image (default: "png") */
  output_format?: string
}

/**
 * Конфигурация модели Crystal Upscaler
 */
export const RECRAFT_UPSCALER_CONFIG: ReplicateModelConfig<
  RecraftUpscalerInput,
  ImageProcessingOutput
> = {
  model: 'philz1337x/crystal-upscaler',
  name: 'Crystal Upscaler',
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
