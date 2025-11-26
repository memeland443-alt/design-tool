import { NextRequest, NextResponse } from 'next/server'
import {
  createReplicateService,
  BRIA_REMOVE_BG_CONFIG,
  ReplicateService,
} from '@/lib/replicate'
import type { BriaRemoveBackgroundInput } from '@/lib/replicate'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received background removal request')

    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      console.error('❌ No image provided')
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    console.log(`📸 Processing image: ${image.name} (${image.size} bytes, ${image.type})`)

    // Проверка API токена
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('❌ Replicate API token not configured')
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    // Конвертация изображения в Data URL
    // Использует Data URL для файлов ≤256KB (рекомендация Replicate для лучшей производительности)
    const dataUrl = await ReplicateService.fileToDataUrl(image)

    console.log(`✅ Image converted to Data URL`)
    console.log(`📊 Using Data URL: ${ReplicateService.shouldUseDataUrl(image) ? 'Yes (≤256KB)' : 'No (>256KB)'}`)

    // Создание сервиса Replicate
    const replicateService = createReplicateService()

    // Подготовка входных данных с оптимальными параметрами качества
    const input: BriaRemoveBackgroundInput = {
      image: dataUrl,
      // preserve_partial_alpha: true уже установлен в defaultInput конфигурации
      // это сохраняет полупрозрачные области для лучшего качества краев
    }

    // Запуск модели с типобезопасностью и retry логикой
    const result = await replicateService.runModel(
      BRIA_REMOVE_BG_CONFIG,
      {
        input,
        waitTimeout: 60, // Максимум 60 секунд
        maxRetries: 3, // Автоматически повторять при rate limit
      }
    )

    // Обработка результата
    if (result.status === 'succeeded' && result.output) {
      console.log(`✅ Background removed successfully in ${result.executionTime}ms`)
      console.log(`📎 Output URL: ${result.output.url}`)

      return NextResponse.json({
        output: result.output.url,
        predictionId: result.predictionId,
        executionTime: result.executionTime,
      })
    } else {
      console.error(`❌ Background removal failed`)
      console.error(`❌ Prediction ID: ${result.predictionId}`)
      console.error(`❌ Error message:`, result.error)
      return NextResponse.json(
        {
          error: result.error || 'Failed to remove background',
          predictionId: result.predictionId,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error processing image')
    console.error('❌ Error message:', error instanceof Error ? error.message : error)
    if (error instanceof Error && error.stack) {
      console.error('❌ Stack trace:', error.stack)
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process image',
      },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
