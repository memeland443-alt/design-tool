/**
 * Feature flags для управления доступностью инструментов
 */

export const FEATURES = {
  backgroundRemover: true,
  imageUpscaler: true,
  imageEnhancer: false, // В разработке
  videoProcessor: false, // В разработке
  aiGeneration: false, // Будущая фича
} as const

export type FeatureKey = keyof typeof FEATURES

/**
 * Проверяет, включена ли фича
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature]
}
