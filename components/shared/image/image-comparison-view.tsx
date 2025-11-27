/**
 * Компонент сравнения оригинала и обработанного изображения
 * Извлечен из background-remover (строки 180-224) и image-upscaler (строки 193-240)
 */

'use client'

import Image from 'next/image'
import { ProcessedImage } from '@/types/image'
import { ProcessingStatus } from './processing-status'

interface ImageComparisonViewProps {
  /** Данные изображения */
  image: ProcessedImage
  /** Лейбл для оригинала */
  originalLabel?: string
  /** Лейбл для обработанного */
  processedLabel?: string
  /** Показывать checkered фон для прозрачности */
  showCheckeredBackground?: boolean
}

/**
 * Компонент для сравнения оригинала и обработанного изображения
 */
export function ImageComparisonView({
  image,
  originalLabel = 'Оригинал',
  processedLabel = 'Обработано',
  showCheckeredBackground = false,
}: ImageComparisonViewProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Оригинал */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{originalLabel}</p>
        <div className="relative w-full min-h-[200px] bg-muted rounded-md overflow-hidden">
          <Image
            src={image.original}
            alt="Original"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      </div>

      {/* Обработанное */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{processedLabel}</p>
        <div
          className="relative w-full min-h-[200px] rounded-md overflow-hidden flex items-center justify-center"
          style={
            showCheckeredBackground && image.status === 'completed'
              ? {
                  backgroundImage:
                    'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }
              : { backgroundColor: '#f5f5f5' }
          }
        >
          {image.status !== 'completed' ? (
            <ProcessingStatus status={image.status} error={image.error} />
          ) : (
            image.processed && (
              <Image
                src={image.processed}
                alt="Processed"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
