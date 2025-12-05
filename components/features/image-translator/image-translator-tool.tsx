/**
 * Инструмент перевода изображений
 * Расширяет ImageProcessor для добавления выбора языка
 */

'use client'

import { useCallback, useState } from 'react'
import { Languages, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUploadZone, ImagePreviewCard, ImageGrid } from '@/components/shared/image'
import { LanguageSelector } from '@/components/shared/language-selector'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useImageDownload } from '@/hooks/use-image-download'
import { useLanguageSelection } from '@/hooks/use-language-selection'
import { IMAGE_TRANSLATOR_CONFIG } from '@/constants/ai-tools'
import { TEXTS } from '@/constants/texts'
import { ProcessedImage, ImageStatus } from '@/types/image'
import { InfoBanner } from '@/components/shared/layout/info-banner'

export default function ImageTranslatorTool() {
  const [isProcessing, setIsProcessing] = useState(false)

  // Hooks
  const { selectedLanguage, setLanguage } = useLanguageSelection()

  const {
    images,
    addImages,
    removeImage,
    setImages,
  } = useImageUpload({
    acceptedFileTypes: IMAGE_TRANSLATOR_CONFIG.acceptedFileTypes,
    maxSize: IMAGE_TRANSLATOR_CONFIG.maxFileSize,
  })

  const { downloadImage, downloadAll, isDownloading } = useImageDownload()

  // Кастомный метод обработки с передачей языка
  const processImages = useCallback(async () => {
    setIsProcessing(true)

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

        // Создаем FormData с изображением и целевым языком
        const formData = new FormData()
        formData.append('image', blob, images[i].name)
        formData.append('targetLanguage', selectedLanguage.code)

        // Отправляем на API
        const result = await fetch(IMAGE_TRANSLATOR_CONFIG.apiEndpoint, {
          method: 'POST',
          body: formData,
        })

        if (!result.ok) {
          const errorData = await result.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to translate image')
        }

        const data = await result.json()

        // Обновляем с результатом
        // Сохраняем переведенное изображение (или текст как fallback)
        setImages(prev =>
          prev.map((img, idx) =>
            idx === i
              ? {
                  ...img,
                  processed: data.output, // URL переведенного изображения
                  translatedText: data.translatedText, // Сохраняем текст для отладки
                  status: 'completed' as ImageStatus,
                }
              : img
          )
        )
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

        console.error(`Failed to translate image ${images[i].name}:`, error)
      }
    }

    setIsProcessing(false)
  }, [images, selectedLanguage.code, setImages])

  // Используем стандартный hook для скачивания изображений
  const handleDownloadAll = useCallback(() => {
    const completedImages = images.filter(
      img => img.status === 'completed' && img.processed
    )
    downloadAll(completedImages)
  }, [images, downloadAll])

  // Вычисляемые значения
  const hasImagesToProcess = images.some(img => img.status === 'pending')
  const hasCompletedImages = images.some(img => img.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Информационный баннер */}
      {IMAGE_TRANSLATOR_CONFIG.infoBanner && (
        <InfoBanner>{IMAGE_TRANSLATOR_CONFIG.infoBanner}</InfoBanner>
      )}

      {/* Селектор языка */}
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageChange={setLanguage}
        disabled={isProcessing}
      />

      {/* Зона загрузки */}
      <ImageUploadZone
        onFilesAccepted={addImages}
        acceptedFileTypes={IMAGE_TRANSLATOR_CONFIG.acceptedFileTypes}
        maxSize={IMAGE_TRANSLATOR_CONFIG.maxFileSize}
        multiple
        disabled={isProcessing}
        formatNote={TEXTS.imageUpload.formats.images}
      />

      {/* Кнопки действий */}
      {images.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={processImages}
            disabled={isProcessing || !hasImagesToProcess}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {IMAGE_TRANSLATOR_CONFIG.processingLabel}
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                {TEXTS.actions.processAll}
              </>
            )}
          </Button>

          <Button
            onClick={handleDownloadAll}
            variant="outline"
            disabled={!hasCompletedImages || isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {TEXTS.actions.downloadAll}
          </Button>
        </div>
      )}

      {/* Сетка изображений с переведенным текстом */}
      {images.length > 0 && (
        <ImageGrid
          images={images}
          mobileColumns={1}
          desktopColumns={2}
          renderCard={(image, index) => (
            <div key={index} className="space-y-3">
              {/* Превью изображения */}
              <ImagePreviewCard
                image={image}
                onRemove={() => removeImage(index)}
                onDownload={() =>
                  image.processed &&
                  downloadImage(image.processed, image.name)
                }
                originalLabel={IMAGE_TRANSLATOR_CONFIG.labels?.original}
                processedLabel={`${IMAGE_TRANSLATOR_CONFIG.labels?.processed} (${selectedLanguage.nativeName})`}
                showCheckeredBackground={false}
              />
            </div>
          )}
        />
      )}
    </div>
  )
}
