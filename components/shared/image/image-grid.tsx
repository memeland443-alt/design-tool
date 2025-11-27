/**
 * Компонент сетки изображений
 * Извлечен из background-remover (строки 162-241) и image-upscaler (строки 175-258)
 */

'use client'

import { ReactNode } from 'react'
import { ProcessedImage } from '@/types/image'
import { cn } from '@/lib/utils'

interface ImageGridProps {
  /** Массив изображений */
  images: ProcessedImage[]
  /** Функция рендеринга карточки (render props) */
  renderCard?: (image: ProcessedImage, index: number) => ReactNode
  /** Количество колонок на mobile */
  mobileColumns?: 1 | 2
  /** Количество колонок на desktop */
  desktopColumns?: 1 | 2 | 3 | 4
  /** Дополнительные CSS классы */
  className?: string
  /** Callback для удаления изображения */
  onRemove?: (index: number) => void
  /** Callback для скачивания изображения */
  onDownload?: (url: string, filename: string) => void
}

/**
 * Responsive сетка для отображения изображений
 */
export function ImageGrid({
  images,
  renderCard,
  mobileColumns = 1,
  desktopColumns = 2,
  className,
}: ImageGridProps) {
  if (images.length === 0) {
    return null
  }

  const gridClasses = cn(
    'grid gap-4',
    mobileColumns === 1 && 'grid-cols-1',
    mobileColumns === 2 && 'grid-cols-2',
    desktopColumns === 1 && 'md:grid-cols-1',
    desktopColumns === 2 && 'md:grid-cols-2',
    desktopColumns === 3 && 'md:grid-cols-3',
    desktopColumns === 4 && 'md:grid-cols-4',
    className
  )

  return (
    <div className={gridClasses}>
      {images.map((image, index) =>
        renderCard ? (
          <div key={index}>{renderCard(image, index)}</div>
        ) : (
          <div key={index} className="border rounded-lg p-4">
            <p className="text-sm">{image.name}</p>
          </div>
        )
      )}
    </div>
  )
}
