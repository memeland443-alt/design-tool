/**
 * Компонент карточки предпросмотра изображения
 * Извлечен из background-remover (строки 165-238) и image-upscaler (строки 178-255)
 */

'use client'

import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProcessedImage } from '@/types/image'
import { ImageComparisonView } from './image-comparison-view'
import { TEXTS } from '@/constants/texts'

interface ImagePreviewCardProps {
  /** Данные изображения */
  image: ProcessedImage
  /** Callback для удаления */
  onRemove: () => void
  /** Callback для скачивания */
  onDownload: () => void
  /** Лейбл для оригинала */
  originalLabel?: string
  /** Лейбл для обработанного */
  processedLabel?: string
  /** Показывать checkered фон */
  showCheckeredBackground?: boolean
}

/**
 * Карточка предпросмотра изображения с возможностью удаления и скачивания
 */
export function ImagePreviewCard({
  image,
  onRemove,
  onDownload,
  originalLabel,
  processedLabel,
  showCheckeredBackground = false,
}: ImagePreviewCardProps) {
  const canDownload = image.status === 'completed' && image.processed
  const canRemove = image.status !== 'processing'

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Заголовок с именем файла и кнопками */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate flex-1">{image.name}</span>
        <div className="flex gap-1">
          {canDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              title={TEXTS.common.download}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            title={TEXTS.common.remove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Сравнение изображений */}
      <ImageComparisonView
        image={image}
        originalLabel={originalLabel}
        processedLabel={processedLabel}
        showCheckeredBackground={showCheckeredBackground}
      />
    </div>
  )
}
