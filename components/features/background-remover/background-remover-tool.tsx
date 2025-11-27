/**
 * Инструмент удаления фона
 * Заменяет background-remover.tsx (244 строки) на 15 строк!
 */

'use client'

import { Eraser } from 'lucide-react'
import { ImageProcessor } from '../image-processor/image-processor'
import { BACKGROUND_REMOVER_CONFIG } from '@/constants/ai-tools'

export default function BackgroundRemoverTool() {
  return (
    <ImageProcessor
      toolConfig={BACKGROUND_REMOVER_CONFIG}
      apiEndpoint={BACKGROUND_REMOVER_CONFIG.apiEndpoint}
      processingIcon={<Eraser className="mr-2 h-4 w-4" />}
    />
  )
}
