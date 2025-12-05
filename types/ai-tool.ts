/**
 * Типы для конфигурации AI инструментов
 */

import { ReactNode } from 'react'

/**
 * Категория инструмента
 */
export type ToolCategory = 'image' | 'video'

/**
 * Ограничения размеров изображения
 */
export interface ImageDimensionLimits {
  /** Максимальная ширина в пикселях */
  maxWidth: number
  /** Максимальная высота в пикселях */
  maxHeight: number
  /** Максимальное количество мегапикселей */
  maxMegapixels: number
}

/**
 * Конфигурация AI инструмента
 */
export interface AIToolConfig {
  /** Уникальный идентификатор инструмента */
  id: string
  /** Название инструмента (на русском) */
  name: string
  /** Описание инструмента */
  description: string
  /** Иконка инструмента */
  icon?: ReactNode
  /** Категория инструмента */
  category: ToolCategory
  /** API endpoint для обработки */
  apiEndpoint: string
  /** Поддерживаемые типы файлов */
  acceptedFileTypes: Record<string, string[]>
  /** Максимальный размер файла в байтах */
  maxFileSize?: number
  /** Текст на кнопке обработки */
  processingLabel: string
  /** Суффикс для скачиваемых файлов (добавляется перед расширением) */
  outputSuffix: string
  /** Лейблы для оригинала и обработанного */
  labels?: {
    original: string
    processed: string
  }
  /** Инструмент в разработке */
  comingSoon?: boolean
  /** Контент информационного баннера */
  infoBanner?: string
  /** Ограничения размеров изображения (для валидации при загрузке) */
  dimensionLimits?: ImageDimensionLimits
}
