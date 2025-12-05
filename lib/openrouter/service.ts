/**
 * Сервис для работы с OpenRouter API
 * Поддержка multimodal моделей (текст + изображения)
 */

import {
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterError,
  TranslationResult,
  TranslationConfig,
  RetryOptions,
  ChatMessage,
} from './types'
import { GEMINI_MODEL } from './models/image-translation'

/**
 * Класс для работы с OpenRouter API
 */
export class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'
  private defaultRetryOptions: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
  }

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Конвертация файла изображения в base64 data URL
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Конвертация Buffer в base64 data URL
   */
  static bufferToBase64(buffer: Buffer, mimeType: string): string {
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
  }

  /**
   * Отправка запроса к OpenRouter API с retry логикой
   */
  private async makeRequest<T = OpenRouterResponse>(
    endpoint: string,
    body: any,
    retryOptions?: RetryOptions
  ): Promise<T> {
    const options = { ...this.defaultRetryOptions, ...retryOptions }
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        console.log(`📤 OpenRouter request (attempt ${attempt + 1}/${options.maxRetries + 1})`)

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Design Tools - Image Translator',
          },
          body: JSON.stringify(body),
        })

        // Проверка rate limit
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after')
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.min(
                options.initialDelay * Math.pow(options.backoffMultiplier, attempt),
                options.maxDelay
              )

          console.warn(`⏳ Rate limited (429). Retrying after ${delay}ms...`)

          if (attempt < options.maxRetries) {
            await this.sleep(delay)
            continue
          }
        }

        // Проверка успешности запроса
        if (!response.ok) {
          const errorData: OpenRouterError = await response.json()
          throw new Error(
            `OpenRouter API error: ${errorData.error.message} (${errorData.error.code})`
          )
        }

        const data: T = await response.json()
        console.log('✅ OpenRouter request succeeded')
        return data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`❌ OpenRouter request failed (attempt ${attempt + 1}):`, lastError.message)

        // Если это последняя попытка, пробрасываем ошибку
        if (attempt === options.maxRetries) {
          break
        }

        // Ждем перед следующей попыткой
        const delay = Math.min(
          options.initialDelay * Math.pow(options.backoffMultiplier, attempt),
          options.maxDelay
        )
        await this.sleep(delay)
      }
    }

    throw lastError || new Error('OpenRouter request failed after all retries')
  }

  /**
   * Вспомогательная функция для задержки
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Отправка чат-запроса с сообщениями
   */
  async chat(
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      topP?: number
      modalities?: string[]
    }
  ): Promise<OpenRouterResponse> {
    const request: OpenRouterRequest = {
      model,
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 4096,
      top_p: options?.topP ?? 1,
      ...(options?.modalities && { modalities: options.modalities }),
    }

    return this.makeRequest<OpenRouterResponse>('/chat/completions', request)
  }

  /**
   * Перевод текста на изображении
   */
  async translateImage(
    imageDataUrl: string,
    config: TranslationConfig,
    systemPrompt: string
  ): Promise<TranslationResult> {
    const startTime = Date.now()

    console.log(`🌐 Translating image to ${config.languageName} (${config.targetLanguage})`)

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Translate ALL text in this image to ${config.languageName} (${config.targetLanguage}).

IMPORTANT: Return a NEW IMAGE with the translated text overlaid/replaced in the same positions and style as the original.

Apply all localization rules:
- Units: imperial ↔ metric conversions
- Dates: adapt to regional format
- Currency: convert symbols and formats
- Cultural references: adapt to target culture

Return the translated image.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUrl,
              detail: 'high',
            },
          },
        ],
      },
    ]

    const response = await this.chat(
      GEMINI_MODEL,
      messages,
      {
        temperature: config.temperature ?? 0.3,
        maxTokens: config.maxTokens ?? 4096,
        modalities: ['image', 'text'], // Важно для генерации изображений!
      }
    )

    const processingTime = Date.now() - startTime

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from OpenRouter')
    }

    const choice = response.choices[0]
    const content = choice.message.content

    console.log(`✅ Translation completed in ${processingTime}ms`)
    console.log(`📊 Tokens used: ${response.usage?.total_tokens || 'unknown'}`)

    // Извлекаем изображение из поля images (правильный способ для image generation models)
    let translatedImageUrl = null

    if (choice.message.images && choice.message.images.length > 0) {
      translatedImageUrl = choice.message.images[0].image_url.url
      console.log('🖼️ Found generated image in response.images field')
      console.log(`🖼️ Image format: ${translatedImageUrl.substring(0, 50)}...`)
    } else {
      console.log('⚠️ No images found in response.images field')
      // Fallback: пытаемся найти URL в тексте (на случай других моделей)
      const markdownImageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/)
      if (markdownImageMatch) {
        translatedImageUrl = markdownImageMatch[1]
        console.log('🖼️ Found image URL in markdown format')
      }
    }

    return {
      translatedText: content,
      translatedImageUrl,
      targetLanguage: config.targetLanguage,
      tokensUsed: response.usage?.total_tokens,
      processingTime,
    }
  }
}

/**
 * Создание экземпляра OpenRouter сервиса
 */
export function createOpenRouterService(apiKey?: string): OpenRouterService {
  const key = apiKey || process.env.OPENROUTER_API_KEY

  if (!key) {
    throw new Error(
      'OpenRouter API key not found. Please set OPENROUTER_API_KEY environment variable.'
    )
  }

  return new OpenRouterService(key)
}
