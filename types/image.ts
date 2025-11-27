/**
 * Типы для работы с изображениями
 */

/**
 * Статусы обработки изображения
 */
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'error'

/**
 * Обработанное изображение с оригиналом и результатом
 */
export interface ProcessedImage {
  /** URL оригинального изображения (blob URL) */
  original: string
  /** URL обработанного изображения (от Replicate API) */
  processed: string | null
  /** Имя файла */
  name: string
  /** Текущий статус обработки */
  status: ImageStatus
  /** Сообщение об ошибке (если status === 'error') */
  error?: string
}
