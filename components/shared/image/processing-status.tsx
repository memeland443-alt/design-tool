/**
 * Компонент отображения статуса обработки изображения
 * Извлечен из background-remover и image-upscaler
 */

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ImageStatus } from '@/types/image'
import { TEXTS } from '@/constants/texts'
import { cn } from '@/lib/utils'

interface ProcessingStatusProps {
  /** Статус обработки */
  status: ImageStatus
  /** Сообщение об ошибке */
  error?: string
  /** Дополнительные CSS классы */
  className?: string
}

/**
 * Компонент для отображения статуса обработки изображения
 */
export function ProcessingStatus({ status, error, className }: ProcessingStatusProps) {
  if (status === 'pending') {
    return (
      <p className={cn('text-xs text-muted-foreground bg-white/80 px-3 py-1 rounded', className)}>
        {TEXTS.processing.pending}
      </p>
    )
  }

  if (status === 'processing') {
    return (
      <div className={cn('bg-white/80 p-3 rounded', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={cn('text-center p-3', className)}>
        <Badge variant="destructive" className="mb-2">
          {TEXTS.processing.error}
        </Badge>
        {error && (
          <p className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded mt-1">
            {error}
          </p>
        )}
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <Badge variant="default" className={cn('bg-green-500', className)}>
        {TEXTS.processing.completed}
      </Badge>
    )
  }

  return null
}
