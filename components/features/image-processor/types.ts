/**
 * Типы для generic ImageProcessor компонента
 */

import { ReactNode } from 'react'
import { AIToolConfig } from '@/types/ai-tool'

export interface ImageProcessorProps {
  /** Конфигурация AI инструмента */
  toolConfig: Omit<AIToolConfig, 'icon'>
  /** API endpoint для обработки */
  apiEndpoint: string
  /** Опциональный информационный баннер */
  infoBanner?: ReactNode
  /** Иконка для кнопки обработки */
  processingIcon?: ReactNode
}
