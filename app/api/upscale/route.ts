import { NextRequest, NextResponse } from 'next/server'
import {
  createReplicateService,
  RECRAFT_UPSCALER_CONFIG,
  ReplicateService,
} from '@/lib/replicate'
import type { RecraftUpscalerInput } from '@/lib/replicate'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received image upscale request')

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
    const dataUrl = await ReplicateService.fileToDataUrl(image)

    console.log(`✅ Image converted to Data URL`)
    console.log(`📊 Using Data URL: ${ReplicateService.shouldUseDataUrl(image) ? 'Yes (≤256KB)' : 'No (>256KB)'}`)

    // Создание сервиса Replicate
    const replicateService = createReplicateService()

    // Подготовка входных данных
    const input: RecraftUpscalerInput = {
      image: dataUrl,
    }

    // Запуск модели с типобезопасностью
    const result = await replicateService.runModel(
      RECRAFT_UPSCALER_CONFIG,
      {
        input,
        waitTimeout: 60, // Максимум 60 секунд
      }
    )

    // Обработка результата
    if (result.status === 'succeeded' && result.output) {
      console.log(`✅ Image upscaled successfully in ${result.executionTime}ms`)
      console.log(`📎 Output URL: ${result.output.url}`)

      return NextResponse.json({
        output: result.output.url,
        predictionId: result.predictionId,
        executionTime: result.executionTime,
      })
    } else {
      console.error(`❌ Image upscale failed: ${result.error}`)
      return NextResponse.json(
        {
          error: result.error || 'Failed to upscale image',
          predictionId: result.predictionId,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error processing image:', error)
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
