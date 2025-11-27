/**
 * Инструмент увеличения разрешения
 * Заменяет image-upscaler.tsx (261 строка) на 23 строки!
 */

'use client'

import { ZoomIn } from 'lucide-react'
import { ImageProcessor } from '../image-processor/image-processor'
import { IMAGE_UPSCALER_CONFIG } from '@/constants/ai-tools'

export default function ImageUpscalerTool() {
  return (
    <ImageProcessor
      toolConfig={IMAGE_UPSCALER_CONFIG}
      apiEndpoint={IMAGE_UPSCALER_CONFIG.apiEndpoint}
      processingIcon={<ZoomIn className="mr-2 h-4 w-4" />}
    />
  )
}
