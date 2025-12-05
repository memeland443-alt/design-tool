/**
 * Hook для управления загрузкой изображений
 * Извлекает дублированную логику из background-remover и image-upscaler
 */

import { useState, useCallback } from 'react'
import { ProcessedImage } from '@/types/image'
import { ImageDimensionLimits } from '@/types/ai-tool'

/**
 * Получает размеры изображения из URL
 */
async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = url
  })
}

export interface UseImageUploadOptions {
  /** Поддерживаемые типы файлов */
  acceptedFileTypes?: Record<string, string[]>
  /** Максимальный размер файла в байтах */
  maxSize?: number
  /** Разрешить множественную загрузку */
  multiple?: boolean
  /** Ограничения размеров изображения (для валидации) */
  dimensionLimits?: ImageDimensionLimits
}

export interface UseImageUploadReturn {
  /** Массив изображений */
  images: ProcessedImage[]
  /** Функция для добавления новых изображений */
  addImages: (files: File[]) => Promise<void>
  /** Функция для удаления изображения по индексу */
  removeImage: (index: number) => void
  /** Функция для очистки всех изображений */
  clearImages: () => void
  /** Функция для обновления состояния изображений */
  setImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>
}

/**
 * Hook для управления загрузкой и хранением изображений
 */
export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadReturn {
  const [images, setImages] = useState<ProcessedImage[]>([])

  /**
   * Добавляет новые файлы в список изображений
   * Создает blob URLs для preview
   * Проверяет размеры изображения, если заданы ограничения
   */
  const addImages = useCallback(async (files: File[]) => {
    const newImages: ProcessedImage[] = await Promise.all(
      files.map(async (file) => {
        const blobUrl = URL.createObjectURL(file)

        // Если заданы ограничения размеров, проверяем изображение
        if (options?.dimensionLimits) {
          try {
            const dimensions = await getImageDimensions(blobUrl)
            const megapixels = (dimensions.width * dimensions.height) / 1_000_000

            // Проверяем, не превышает ли изображение лимиты
            if (
              dimensions.width > options.dimensionLimits.maxWidth ||
              dimensions.height > options.dimensionLimits.maxHeight ||
              megapixels > options.dimensionLimits.maxMegapixels
            ) {
              return {
                original: blobUrl,
                processed: null,
                name: file.name,
                status: 'error' as const,
                error: `Изображение слишком большое (${dimensions.width}×${dimensions.height} пикселей, ${megapixels.toFixed(1)} Мп). Максимальный размер: ${options.dimensionLimits.maxWidth}×${options.dimensionLimits.maxHeight} пикселей (${options.dimensionLimits.maxMegapixels} Мп)`,
              }
            }
          } catch (error) {
            console.error('Failed to check image dimensions:', error)
            // Если не удалось проверить размеры, все равно добавляем изображение
          }
        }

        return {
          original: blobUrl,
          processed: null,
          name: file.name,
          status: 'pending' as const,
        }
      })
    )

    setImages(prev => [...prev, ...newImages])
  }, [options?.dimensionLimits])

  /**
   * Удаляет изображение по индексу
   * Также освобождает blob URL
   */
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const imageToRemove = prev[index]
      // Освобождаем blob URL для предотвращения утечек памяти
      if (imageToRemove?.original.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.original)
      }
      return prev.filter((_, idx) => idx !== index)
    })
  }, [])

  /**
   * Очищает все изображения
   * Освобождает все blob URLs
   */
  const clearImages = useCallback(() => {
    setImages(prev => {
      // Освобождаем все blob URLs
      prev.forEach(img => {
        if (img.original.startsWith('blob:')) {
          URL.revokeObjectURL(img.original)
        }
      })
      return []
    })
  }, [])

  return {
    images,
    addImages,
    removeImage,
    clearImages,
    setImages,
  }
}
