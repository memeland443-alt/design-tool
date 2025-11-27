/**
 * Конфигурация модели Recraft AI Crisp Upscale
 */

import { ReplicateModelConfig } from '../types'
import { ImageProcessingOutput } from './background-removal'

/**
 * Параметры для модели Recraft AI Crisp Upscale
 */
export interface RecraftUpscalerInput {
  /** Base64 Data URL или HTTP URL изображения */
  image: string
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
