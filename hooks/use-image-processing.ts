/**
 * Hook для обработки изображений через AI API
 * Извлекает дублированную логику processImages из обоих компонентов
 */

import { useState, useCallback } from 'react'
import { ProcessedImage, ImageStatus } from '@/types/image'

export interface UseImageProcessingOptions {
  /** API endpoint для обработки */
  apiEndpoint: string
  /** Callback при успешной обработке */
  onSuccess?: (image: ProcessedImage, index: number) => void
  /** Callback при ошибке */
  onError?: (error: string, index: number) => void
  /** Callback при начале обработки */
  onStart?: () => void
  /** Callback при завершении всей batch обработки */
  onComplete?: () => void
}

export interface UseImageProcessingReturn {
  /** Обрабатывает массив изображений последовательно */
  processImages: (
    images: ProcessedImage[],
    setImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>
  ) => Promise<void>
  /** Флаг процесса обработки */
  isProcessing: boolean
}

/**
 * Hook для обработки изображений через API
 * Это ключевой hook, который устраняет 90% дублирования кода!
 */
export function useImageProcessing(
  options: UseImageProcessingOptions
): UseImageProcessingReturn {
  const { apiEndpoint, onSuccess, onError, onStart, onComplete } = options
  const [isProcessing, setIsProcessing] = useState(false)

  /**
   * Обрабатывает изображения последовательно
   * Идентичная логика из background-remover.tsx (строки 39-86)
   * и image-upscaler.tsx (строки 40-87)
   */
  const processImages = useCallback(
    async (
      images: ProcessedImage[],
      setImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>
    ) => {
      setIsProcessing(true)
      onStart?.()

      for (let i = 0; i < images.length; i++) {
        // Пропускаем уже обработанные изображения
        if (images[i].status !== 'pending') continue

        // Обновляем статус на "processing"
        setImages(prev =>
          prev.map((img, idx) =>
            idx === i ? { ...img, status: 'processing' as ImageStatus } : img
          )
        )

        try {
          // Получаем blob из URL
          const response = await fetch(images[i].original)
          const blob = await response.blob()

          // Создаем FormData для отправки
          const formData = new FormData()
          formData.append('image', blob, images[i].name)

          // Отправляем на API
          const result = await fetch(apiEndpoint, {
            method: 'POST',
            body: formData,
          })

          if (!result.ok) {
            const errorData = await result.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to process image')
          }

          const data = await result.json()

          // Обновляем с результатом
          setImages(prev =>
            prev.map((img, idx) =>
              idx === i
                ? {
                    ...img,
                    processed: data.output,
                    status: 'completed' as ImageStatus,
                  }
                : img
            )
          )

          onSuccess?.(images[i], i)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'

          // Обновляем статус на "error"
          setImages(prev =>
            prev.map((img, idx) =>
              idx === i
                ? {
                    ...img,
                    status: 'error' as ImageStatus,
                    error: errorMessage,
                  }
                : img
            )
          )

          onError?.(errorMessage, i)
          console.error(`Failed to process image ${images[i].name}:`, error)
        }
      }

      setIsProcessing(false)
      onComplete?.()
    },
    [apiEndpoint, onSuccess, onError, onStart, onComplete]
  )

  return {
    processImages,
    isProcessing,
  }
}
