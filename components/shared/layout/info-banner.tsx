/**
 * Компонент информационного баннера
 * Извлечен из image-upscaler (строки 113-119)
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InfoBannerProps {
  /** Контент баннера */
  children: ReactNode
  /** Вариант баннера */
  variant?: 'info' | 'warning' | 'success'
  /** Дополнительные CSS классы */
  className?: string
}

/**
 * Информационный баннер
 */
export function InfoBanner({
  children,
  variant = 'info',
  className,
}: InfoBannerProps) {
  return (
    <div
      className={cn(
        'p-4 border rounded-lg',
        variant === 'info' && 'bg-primary/5 border-primary/20',
        variant === 'warning' && 'bg-yellow-50 border-yellow-200',
        variant === 'success' && 'bg-green-50 border-green-200',
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
