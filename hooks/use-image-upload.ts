/**
 * Hook для управления загрузкой изображений
 * Извлекает дублированную логику из background-remover и image-upscaler
 */

import { useState, useCallback } from 'react'
import { ProcessedImage } from '@/types/image'

export interface UseImageUploadOptions {
  /** Поддерживаемые типы файлов */
  acceptedFileTypes?: Record<string, string[]>
  /** Максимальный размер файла в байтах */
  maxSize?: number
  /** Разрешить множественную загрузку */
  multiple?: boolean
}

export interface UseImageUploadReturn {
  /** Массив изображений */
  images: ProcessedImage[]
  /** Функция для добавления новых изображений */
  addImages: (files: File[]) => void
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
   */
  const addImages = useCallback((files: File[]) => {
    const newImages: ProcessedImage[] = files.map(file => ({
      original: URL.createObjectURL(file),
      processed: null,
      name: file.name,
      status: 'pending' as const,
    }))

    setImages(prev => [...prev, ...newImages])
  }, [])

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
