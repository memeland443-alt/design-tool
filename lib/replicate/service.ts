/**
 * Универсальный сервис для работы с Replicate API
 * Поддерживает любые модели с типобезопасностью
 */

import Replicate from 'replicate'
import type {
  ReplicateModelConfig,
  ModelResult,
  RunModelOptions,
  PredictionStatus,
} from './types'

/**
 * Сервис для работы с моделями Replicate
 */
export class ReplicateService {
  private client: Replicate
  private readonly DEFAULT_POLL_INTERVAL = 1000 // 1 секунда
  private readonly MAX_POLL_ATTEMPTS = 60 // 60 секунд максимум

  constructor(apiToken?: string) {
    if (!apiToken && !process.env.REPLICATE_API_TOKEN) {
      throw new Error(
        'Replicate API token is required. Set REPLICATE_API_TOKEN environment variable or pass it to constructor.'
      )
    }

    this.client = new Replicate({
      auth: apiToken || process.env.REPLICATE_API_TOKEN,
    })
  }

  /**
   * Запустить модель с типобезопасностью
   * @param config Конфигурация модели
   * @param options Опции запуска
   * @returns Результат выполнения модели
   */
  async runModel<TInput, TOutput>(
    config: ReplicateModelConfig<TInput, TOutput>,
    options: RunModelOptions<TInput>
  ): Promise<ModelResult<TOutput>> {
    const startTime = Date.now()

    try {
      // Валидация входных данных
      if (config.validateInput) {
        await config.validateInput(options.input)
      }

      // Объединение входных данных с параметрами по умолчанию
      const input = {
        ...config.defaultInput,
        ...options.input,
      }

      console.log(`🚀 Starting ${config.name} prediction...`)

      // Логируем только метаданные, не base64 данные
      const inputMeta = Object.keys(input as Record<string, any>).reduce((acc, key) => {
        const value = (input as any)[key]
        if (typeof value === 'string' && value.startsWith('data:')) {
          acc[key] = `<base64 data, ${Math.round(value.length / 1024)}KB>`
        } else {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)
      console.log(`📊 Input params:`, JSON.stringify(inputMeta, null, 2))

      // Создание предсказания
      const prediction = await this.client.predictions.create({
        version: config.version,
        input: input as Record<string, any>,
        webhook: options.webhook,
        webhook_events_filter: options.webhook_events_filter,
      })

      console.log(`⏳ Prediction created: ${prediction.id}`)

      // Ожидание результата
      const result = await this.waitForPrediction(
        prediction.id,
        options.waitTimeout || config.waitTimeout || 30
      )

      const executionTime = Date.now() - startTime

      // Обработка результата
      if (result.status === 'succeeded') {
        const output = config.transformOutput
          ? config.transformOutput(result.output)
          : result.output

        console.log(`✅ ${config.name} succeeded in ${executionTime}ms`)

        return {
          status: 'succeeded',
          output,
          predictionId: prediction.id,
          executionTime,
        }
      } else if (result.status === 'failed') {
        console.error(`❌ ${config.name} failed`)
        console.error(`❌ Error details:`, JSON.stringify(result.error, null, 2))
        return {
          status: 'failed',
          error: result.error?.toString() || 'Prediction failed',
          predictionId: prediction.id,
          executionTime,
        }
      } else {
        console.error(`⏱️ ${config.name} timed out`)
        return {
          status: 'failed',
          error: 'Prediction timed out',
          predictionId: prediction.id,
          executionTime,
        }
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error(`❌ Error in ${config.name}:`, errorMessage)
      if (error instanceof Error && error.stack) {
        console.error(`❌ Stack trace:`, error.stack)
      }
      console.error(`❌ Full error:`, error)

      return {
        status: 'failed',
        error: errorMessage,
        predictionId: 'unknown',
        executionTime,
      }
    }
  }

  /**
   * Ожидание завершения предсказания с polling
   * @param predictionId ID предсказания
   * @param maxWaitSeconds Максимальное время ожидания в секундах
   * @returns Результат предсказания
   */
  private async waitForPrediction(
    predictionId: string,
    maxWaitSeconds: number
  ): Promise<{ status: PredictionStatus; output?: any; error?: any }> {
    const maxAttempts = Math.min(
      Math.ceil(maxWaitSeconds / (this.DEFAULT_POLL_INTERVAL / 1000)),
      this.MAX_POLL_ATTEMPTS
    )

    let attempts = 0

    while (attempts < maxAttempts) {
      const prediction = await this.client.predictions.get(predictionId)

      if (
        prediction.status === 'succeeded' ||
        prediction.status === 'failed' ||
        prediction.status === 'canceled'
      ) {
        return {
          status: prediction.status,
          output: prediction.output,
          error: prediction.error,
        }
      }

      attempts++

      if (attempts % 5 === 0) {
        console.log(`⏳ Still processing... (${attempts}s) status: ${prediction.status}`)
      }

      await new Promise((resolve) => setTimeout(resolve, this.DEFAULT_POLL_INTERVAL))
    }

    return {
      status: 'failed',
      error: 'Timeout',
    }
  }

  /**
   * Получить статус предсказания
   * @param predictionId ID предсказания
   */
  async getPredictionStatus(predictionId: string) {
    return await this.client.predictions.get(predictionId)
  }

  /**
   * Отменить предсказание
   * @param predictionId ID предсказания
   */
  async cancelPrediction(predictionId: string) {
    return await this.client.predictions.cancel(predictionId)
  }

  /**
   * Преобразовать File в Data URL
   * Использует Data URLs для файлов ≤256KB (рекомендация Replicate)
   * @param file Файл изображения
   * @returns Data URL
   */
  static async fileToDataUrl(file: File | Blob): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file instanceof File ? file.type : 'image/png'
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  }

  /**
   * Проверка размера файла для выбора оптимального метода передачи
   * @param file Файл
   * @returns true если файл подходит для Data URL (≤256KB)
   */
  static shouldUseDataUrl(file: File | Blob): boolean {
    const SIZE_LIMIT = 256 * 1024 // 256KB
    return file.size <= SIZE_LIMIT
  }
}

/**
 * Создать экземпляр сервиса Replicate
 * @param apiToken Опциональный API токен (если не задан в env)
 */
export function createReplicateService(apiToken?: string): ReplicateService {
  return new ReplicateService(apiToken)
}
