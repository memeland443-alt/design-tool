/**
 * Экспорт всех конфигураций моделей Replicate
 */

export * from './background-removal'
export * from './upscaling'

// Registry всех моделей для удобного доступа
import { BRIA_REMOVE_BG_CONFIG } from './background-removal'
import { RECRAFT_UPSCALER_CONFIG } from './upscaling'

export const REPLICATE_MODELS = {
  backgroundRemoval: BRIA_REMOVE_BG_CONFIG,
  upscaling: RECRAFT_UPSCALER_CONFIG,
} as const

export type ModelKey = keyof typeof REPLICATE_MODELS
