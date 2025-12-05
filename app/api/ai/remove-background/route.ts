import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  createReplicateService,
  BRIA_REMOVE_BG_CONFIG,
  RECRAFT_UPSCALER_CONFIG,
  ReplicateService,
  BriaRemoveBackgroundInput,
  RecraftUpscalerInput,
} from '@/lib/replicate'

// Ограничения для автоматического апскейла (чтобы избежать больших расходов)
const MAX_WIDTH_FOR_UPSCALE = 2048
const MAX_HEIGHT_FOR_UPSCALE = 2048
const MAX_MEGAPIXELS_FOR_UPSCALE = 4 // 2048x2048 = 4 мегапикселя

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

    // Получаем размеры оригинального изображения
    const imageBuffer = Buffer.from(await image.arrayBuffer())
    const originalMetadata = await sharp(imageBuffer).metadata()
    const originalWidth = originalMetadata.width || 0
    const originalHeight = originalMetadata.height || 0
    console.log(`📐 Original image dimensions: ${originalWidth}x${originalHeight}`)

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

      // Проверяем размер оригинального изображения перед апскейлом
      const megapixels = (originalWidth * originalHeight) / 1_000_000
      const isTooLargeForUpscale =
        originalWidth > MAX_WIDTH_FOR_UPSCALE ||
        originalHeight > MAX_HEIGHT_FOR_UPSCALE ||
        megapixels > MAX_MEGAPIXELS_FOR_UPSCALE

      if (isTooLargeForUpscale) {
        console.warn(`⚠️ Original image is too large for automatic upscaling`)
        console.warn(`⚠️ Maximum allowed: ${MAX_WIDTH_FOR_UPSCALE}x${MAX_HEIGHT_FOR_UPSCALE} (${MAX_MEGAPIXELS_FOR_UPSCALE} MP)`)
        console.warn(`⚠️ Your image: ${originalWidth}x${originalHeight} (${megapixels.toFixed(2)} MP)`)
        console.warn(`⚠️ Skipping upscaling and resizing, returning background removal result`)

        return NextResponse.json({
          output: result.output.url,
          predictionId: result.predictionId,
          executionTime: result.executionTime ?? 0,
          warning: `Изображение слишком большое для автоматического апскейла (${originalWidth}x${originalHeight}). Максимальный размер: ${MAX_WIDTH_FOR_UPSCALE}x${MAX_HEIGHT_FOR_UPSCALE} пикселей.`,
          skippedStages: ['upscaling', 'resizing'],
        })
      }

      // Автоматический апскейл после удаления фона
      console.log('🔍 Starting automatic upscaling...')

      const upscaleInput: RecraftUpscalerInput = {
        image: result.output.url, // Используем URL изображения без фона
        desired_increase: 2,
        preserve_alpha: true,
        sync: true,
        content_moderation: false,
      }

      const upscaleResult = await replicateService.runModel(
        RECRAFT_UPSCALER_CONFIG,
        {
          input: upscaleInput,
          waitTimeout: 60,
          maxRetries: 3,
        }
      )

      if (upscaleResult.status === 'succeeded' && upscaleResult.output) {
        const bgRemovalTime = result.executionTime ?? 0
        const upscaleTime = upscaleResult.executionTime ?? 0
        let totalTime = bgRemovalTime + upscaleTime

        console.log(`✅ Image upscaled successfully in ${upscaleTime}ms`)
        console.log(`📎 Upscaled output URL: ${upscaleResult.output.url}`)

        // Растягиваем до оригинального размера с сохранением пропорций
        console.log('📏 Resizing to original dimensions...')
        const resizeStartTime = Date.now()

        try {
          // Скачиваем апскейленное изображение
          const upscaledImageResponse = await fetch(upscaleResult.output.url)
          const upscaledImageBuffer = Buffer.from(await upscaledImageResponse.arrayBuffer())

          // Растягиваем до оригинального размера с сохранением пропорций
          const resizedImageBuffer = await sharp(upscaledImageBuffer)
            .resize(originalWidth, originalHeight, {
              fit: 'contain', // Сохраняем пропорции, вписываем в размер
              background: { r: 0, g: 0, b: 0, alpha: 0 }, // Прозрачный фон
            })
            .png() // Сохраняем как PNG для поддержки прозрачности
            .toBuffer()

          const resizeTime = Date.now() - resizeStartTime
          totalTime += resizeTime

          // Конвертируем в Data URL
          const resizedDataUrl = `data:image/png;base64,${resizedImageBuffer.toString('base64')}`

          console.log(`✅ Image resized to original dimensions in ${resizeTime}ms`)
          console.log(`📐 Final dimensions: ${originalWidth}x${originalHeight}`)
          console.log(`⏱️ Total processing time: ${totalTime}ms`)

          return NextResponse.json({
            output: resizedDataUrl,
            predictionId: upscaleResult.predictionId,
            executionTime: totalTime,
            dimensions: {
              original: { width: originalWidth, height: originalHeight },
            },
            stages: {
              backgroundRemoval: {
                predictionId: result.predictionId,
                executionTime: bgRemovalTime,
              },
              upscaling: {
                predictionId: upscaleResult.predictionId,
                executionTime: upscaleTime,
              },
              resizing: {
                executionTime: resizeTime,
              },
            },
          })
        } catch (resizeError) {
          console.error(`❌ Resizing failed:`, resizeError)
          // Возвращаем апскейленный результат без растягивания
          return NextResponse.json({
            output: upscaleResult.output.url,
            predictionId: upscaleResult.predictionId,
            executionTime: totalTime,
            warning: 'Resizing failed, returning upscaled result',
            stages: {
              backgroundRemoval: {
                predictionId: result.predictionId,
                executionTime: bgRemovalTime,
              },
              upscaling: {
                predictionId: upscaleResult.predictionId,
                executionTime: upscaleTime,
              },
            },
          })
        }
      } else {
        console.error(`❌ Upscaling failed, returning background removal result`)
        console.error(`❌ Upscale error:`, upscaleResult.error)

        // Если апскейл не удался, возвращаем результат без фона
        return NextResponse.json({
          output: result.output.url,
          predictionId: result.predictionId,
          executionTime: result.executionTime ?? 0,
          warning: 'Upscaling failed, returning original size',
        })
      }
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
