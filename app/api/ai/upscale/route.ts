import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  createReplicateService,
  RECRAFT_UPSCALER_CONFIG,
  ReplicateService,
  RecraftUpscalerInput,
} from '@/lib/replicate'

// Ограничения для апскейла (чтобы избежать больших расходов)
const MAX_WIDTH = 2048
const MAX_HEIGHT = 2048
const MAX_MEGAPIXELS = 4 // 2048x2048 = 4 мегапикселя

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

    // Проверяем размеры изображения перед апскейлом
    const imageBuffer = Buffer.from(await image.arrayBuffer())
    const imageMetadata = await sharp(imageBuffer).metadata()
    const width = imageMetadata.width || 0
    const height = imageMetadata.height || 0
    const megapixels = (width * height) / 1_000_000

    console.log(`📐 Image dimensions: ${width}x${height} (${megapixels.toFixed(2)} MP)`)

    // Проверка размеров изображения
    if (width > MAX_WIDTH || height > MAX_HEIGHT || megapixels > MAX_MEGAPIXELS) {
      console.warn(`⚠️ Image is too large for upscaling`)
      console.warn(`⚠️ Maximum allowed: ${MAX_WIDTH}x${MAX_HEIGHT} (${MAX_MEGAPIXELS} MP)`)
      console.warn(`⚠️ Your image: ${width}x${height} (${megapixels.toFixed(2)} MP)`)

      return NextResponse.json(
        {
          error: 'Image is too large for upscaling',
          details: {
            message: `Изображение слишком большое для апскейла. Максимальный размер: ${MAX_WIDTH}x${MAX_HEIGHT} пикселей (${MAX_MEGAPIXELS} мегапикселей)`,
            yourImage: {
              width,
              height,
              megapixels: parseFloat(megapixels.toFixed(2)),
            },
            maxAllowed: {
              width: MAX_WIDTH,
              height: MAX_HEIGHT,
              megapixels: MAX_MEGAPIXELS,
            },
          },
        },
        { status: 400 }
      )
    }

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

    // Подготовка входных данных с дефолтными настройками Bria
    const input: RecraftUpscalerInput = {
      image: dataUrl,
      desired_increase: 2,
      preserve_alpha: true,
      sync: true,
      content_moderation: false,
    }

    // Запуск модели с типобезопасностью и retry логикой
    const result = await replicateService.runModel(
      RECRAFT_UPSCALER_CONFIG,
      {
        input,
        waitTimeout: 60, // Максимум 60 секунд
        maxRetries: 3, // Автоматически повторять при rate limit
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
      console.error(`❌ Image upscale failed`)
      console.error(`❌ Prediction ID: ${result.predictionId}`)
      console.error(`❌ Error message:`, result.error)
      return NextResponse.json(
        {
          error: result.error || 'Failed to upscale image',
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
