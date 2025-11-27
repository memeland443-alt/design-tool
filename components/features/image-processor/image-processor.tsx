/**
 * Generic компонент для обработки изображений
 * Заменяет background-remover.tsx (244 строки) и image-upscaler.tsx (261 строка)
 * на единый переиспользуемый компонент
 */

'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import {
  ImageUploadZone,
  ImagePreviewCard,
  ImageGrid,
} from '@/components/shared/image'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useImageProcessing } from '@/hooks/use-image-processing'
import { useImageDownload } from '@/hooks/use-image-download'
import { TEXTS } from '@/constants/texts'
import { ImageProcessorProps } from './types'

/**
 * Generic компонент для обработки изображений через AI
 * Работает с ЛЮБЫМ AI инструментом через конфигурацию
 */
export function ImageProcessor({
  toolConfig,
  apiEndpoint,
  infoBanner,
  processingIcon,
}: ImageProcessorProps) {
  // Hooks для управления состоянием
  const {
    images,
    addImages,
    removeImage,
    setImages,
  } = useImageUpload({
    acceptedFileTypes: toolConfig.acceptedFileTypes,
    maxSize: toolConfig.maxFileSize,
  })

  const { processImages, isProcessing } = useImageProcessing({
    apiEndpoint,
  })

  const { downloadImage, downloadAll, isDownloading } = useImageDownload()

  // Обработчики
  const handleProcess = useCallback(() => {
    processImages(images, setImages)
  }, [images, processImages, setImages])

  const handleDownloadAll = useCallback(() => {
    downloadAll(images, toolConfig.outputSuffix)
  }, [images, downloadAll, toolConfig.outputSuffix])

  const handleDownloadImage = useCallback(
    (url: string, filename: string) => {
      downloadImage(url, filename, toolConfig.outputSuffix)
    },
    [downloadImage, toolConfig.outputSuffix]
  )

  // Вычисляемые значения
  const hasImagesToProcess = images.some(img => img.status === 'pending')
  const hasCompletedImages = images.some(img => img.status === 'completed')

  // Формируем текст с поддерживаемыми форматами
  const formatNote = toolConfig.maxFileSize
    ? `${TEXTS.imageUpload.formats.images}, ${TEXTS.imageUpload.maxSize}: ${Math.round(toolConfig.maxFileSize / 1024 / 1024)} МБ`
    : TEXTS.imageUpload.formats.images

  return (
    <div className="space-y-6">
      {/* Информационный баннер */}
      {infoBanner}

      {/* Зона загрузки */}
      <ImageUploadZone
        onFilesAccepted={addImages}
        acceptedFileTypes={toolConfig.acceptedFileTypes}
        maxSize={toolConfig.maxFileSize}
        multiple
        disabled={isProcessing}
        formatNote={formatNote}
      />

      {/* Кнопки действий */}
      {images.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={handleProcess}
            disabled={isProcessing || !hasImagesToProcess}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {toolConfig.processingLabel}
              </>
            ) : (
              <>
                {processingIcon}
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

      {/* Сетка изображений */}
      {images.length > 0 && (
        <ImageGrid
          images={images}
          mobileColumns={1}
          desktopColumns={2}
          renderCard={(image, index) => (
            <ImagePreviewCard
              key={index}
              image={image}
              onRemove={() => removeImage(index)}
              onDownload={() =>
                image.processed &&
                handleDownloadImage(image.processed, image.name)
              }
              originalLabel={toolConfig.labels?.original}
              processedLabel={toolConfig.labels?.processed}
              showCheckeredBackground={toolConfig.id === 'remove-bg'}
            />
          )}
        />
      )}
    </div>
  )
}
