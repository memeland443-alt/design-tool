/**
 * Hook для скачивания обработанных изображений
 * Извлекает дублированную логику из background-remover и image-upscaler
 */

import { useState, useCallback } from 'react'
import { ProcessedImage } from '@/types/image'
import JSZip from 'jszip'

/**
 * Добавляет суффикс к имени файла перед расширением
 * @example addSuffixToFilename('photo.jpg', '-bg-removed') => 'photo-bg-removed.jpg'
 */
function addSuffixToFilename(filename: string, suffix: string): string {
  if (!suffix) return filename

  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) {
    // Нет расширения, просто добавляем суффикс
    return filename + suffix
  }

  const name = filename.substring(0, lastDotIndex)
  const extension = filename.substring(lastDotIndex)
  return name + suffix + extension
}

export interface UseImageDownloadReturn {
  /** Скачивает одно изображение */
  downloadImage: (url: string, filename: string, suffix?: string) => Promise<void>
  /** Скачивает все обработанные изображения */
  downloadAll: (images: ProcessedImage[], suffix?: string) => Promise<void>
  /** Флаг процесса скачивания */
  isDownloading: boolean
}

/**
 * Hook для скачивания изображений
 */
export function useImageDownload(): UseImageDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false)

  /**
   * Скачивает одно изображение
   * @param url - URL изображения
   * @param filename - Имя файла
   * @param suffix - Суффикс для имени файла (добавляется перед расширением)
   */
  const downloadImage = useCallback(async (
    url: string,
    filename: string,
    suffix: string = ''
  ) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = addSuffixToFilename(filename, suffix)
      link.click()

      // Освобождаем URL после небольшой задержки
      setTimeout(() => URL.revokeObjectURL(link.href), 100)
    } catch (error) {
      console.error('Failed to download image:', error)
      throw error
    }
  }, [])

  /**
   * Скачивает все обработанные изображения в ZIP архиве
   * @param images - Массив изображений
   * @param suffix - Суффикс для имени файлов (добавляется перед расширением)
   */
  const downloadAll = useCallback(async (
    images: ProcessedImage[],
    suffix: string = ''
  ) => {
    setIsDownloading(true)

    try {
      const completedImages = images.filter(
        img => img.status === 'completed' && img.processed
      )

      if (completedImages.length === 0) {
        return
      }

      // Создаем ZIP архив
      const zip = new JSZip()

      // Добавляем все изображения в архив
      for (const img of completedImages) {
        if (img.processed) {
          try {
            const response = await fetch(img.processed)
            const blob = await response.blob()
            const filename = addSuffixToFilename(img.name, suffix)
            zip.file(filename, blob)
          } catch (error) {
            console.error(`Failed to add ${img.name} to ZIP:`, error)
          }
        }
      }

      // Генерируем ZIP файл
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // Скачиваем ZIP архив
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `processed_${timestamp}.zip`
      link.click()

      // Освобождаем URL после небольшой задержки
      setTimeout(() => URL.revokeObjectURL(link.href), 100)
    } catch (error) {
      console.error('Failed to download all images:', error)
      throw error
    } finally {
      setIsDownloading(false)
    }
  }, [])

  return {
    downloadImage,
    downloadAll,
    isDownloading,
  }
}
