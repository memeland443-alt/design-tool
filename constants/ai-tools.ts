/**
 * Конфигурация всех AI инструментов
 */

import { AIToolConfig } from '@/types/ai-tool'
import { TEXTS } from './texts'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZES } from './file-types'

/**
 * Конфигурация инструмента удаления фона
 */
export const BACKGROUND_REMOVER_CONFIG: Omit<AIToolConfig, 'icon'> = {
  id: 'remove-bg',
  name: TEXTS.tools.backgroundRemover.name,
  description: TEXTS.tools.backgroundRemover.description,
  category: 'image',
  apiEndpoint: '/api/ai/remove-background',
  acceptedFileTypes: ACCEPTED_FILE_TYPES.images,
  maxFileSize: MAX_FILE_SIZES.image,
  processingLabel: TEXTS.tools.backgroundRemover.processing,
  outputSuffix: TEXTS.tools.backgroundRemover.outputSuffix,
  labels: {
    original: TEXTS.tools.backgroundRemover.labels.original,
    processed: TEXTS.tools.backgroundRemover.labels.processed,
  },
}

/**
 * Конфигурация инструмента увеличения разрешения
 */
export const IMAGE_UPSCALER_CONFIG: Omit<AIToolConfig, 'icon'> = {
  id: 'upscale',
  name: TEXTS.tools.imageUpscaler.name,
  description: TEXTS.tools.imageUpscaler.description,
  category: 'image',
  apiEndpoint: '/api/ai/upscale',
  acceptedFileTypes: ACCEPTED_FILE_TYPES.images,
  maxFileSize: MAX_FILE_SIZES.image,
  processingLabel: TEXTS.tools.imageUpscaler.processing,
  outputSuffix: TEXTS.tools.imageUpscaler.outputSuffix,
  infoBanner: TEXTS.tools.imageUpscaler.infoBanner,
  labels: {
    original: TEXTS.tools.imageUpscaler.labels.original,
    processed: TEXTS.tools.imageUpscaler.labels.processed,
  },
}

/**
 * Конфигурация инструмента перевода изображений
 */
export const IMAGE_TRANSLATOR_CONFIG: Omit<AIToolConfig, 'icon'> = {
  id: 'translate',
  name: TEXTS.tools.imageTranslator.name,
  description: TEXTS.tools.imageTranslator.description,
  category: 'image',
  apiEndpoint: '/api/ai/translate',
  acceptedFileTypes: ACCEPTED_FILE_TYPES.images,
  maxFileSize: MAX_FILE_SIZES.image,
  processingLabel: TEXTS.tools.imageTranslator.processing,
  outputSuffix: TEXTS.tools.imageTranslator.outputSuffix,
  infoBanner: TEXTS.tools.imageTranslator.infoBanner,
  labels: {
    original: TEXTS.tools.imageTranslator.labels.original,
    processed: TEXTS.tools.imageTranslator.labels.processed,
  },
}

/**
 * Конфигурация инструмента улучшения изображений (заготовка)
 */
export const IMAGE_ENHANCER_CONFIG: Omit<AIToolConfig, 'icon'> = {
  id: 'enhance',
  name: TEXTS.tools.imageEnhancer.name,
  description: TEXTS.tools.imageEnhancer.description,
  category: 'image',
  apiEndpoint: '/api/ai/enhance',
  acceptedFileTypes: ACCEPTED_FILE_TYPES.images,
  maxFileSize: MAX_FILE_SIZES.image,
  processingLabel: 'Улучшение изображения...',
  outputSuffix: '-enhanced',
  comingSoon: true,
}

/**
 * Реестр всех инструментов
 */
export const AI_TOOLS = {
  backgroundRemover: BACKGROUND_REMOVER_CONFIG,
  imageUpscaler: IMAGE_UPSCALER_CONFIG,
  imageTranslator: IMAGE_TRANSLATOR_CONFIG,
  imageEnhancer: IMAGE_ENHANCER_CONFIG,
} as const

export type ToolId = keyof typeof AI_TOOLS
