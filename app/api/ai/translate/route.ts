import { NextRequest, NextResponse } from 'next/server'
import {
  createOpenRouterService,
  createTranslationConfig,
  getSystemPrompt,
  validateTranslationConfig,
  OpenRouterService,
} from '@/lib/openrouter'
import { isValidLanguageCode, getLanguageName } from '@/constants/languages'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received image translation request')

    const formData = await request.formData()
    const image = formData.get('image') as File
    const targetLanguage = formData.get('targetLanguage') as string

    // Валидация входных данных
    if (!image) {
      console.error('❌ No image provided')
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    if (!targetLanguage) {
      console.error('❌ No target language provided')
      return NextResponse.json(
        { error: 'No target language provided' },
        { status: 400 }
      )
    }

    // Валидация языкового кода
    if (!isValidLanguageCode(targetLanguage)) {
      console.error(`❌ Invalid language code: ${targetLanguage}`)
      return NextResponse.json(
        { error: `Invalid language code: ${targetLanguage}` },
        { status: 400 }
      )
    }

    console.log(`📸 Processing image: ${image.name} (${image.size} bytes, ${image.type})`)
    console.log(`🌐 Target language: ${targetLanguage} (${getLanguageName(targetLanguage)})`)

    // Проверка API ключа
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ OpenRouter API key not configured')
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // Конвертация изображения в base64
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = OpenRouterService.bufferToBase64(buffer, image.type)

    console.log(`✅ Image converted to base64`)

    // Создание сервиса OpenRouter
    const openRouterService = createOpenRouterService()

    // Подготовка конфигурации перевода
    const translationConfig = createTranslationConfig(
      targetLanguage,
      getLanguageName(targetLanguage)
    )

    // Валидация конфигурации
    validateTranslationConfig(translationConfig)

    // Получение системного промпта
    const systemPrompt = getSystemPrompt()

    // Выполнение перевода
    const result = await openRouterService.translateImage(
      base64Image,
      translationConfig,
      systemPrompt
    )

    console.log(`✅ Translation completed successfully`)
    console.log(`📊 Processing time: ${result.processingTime}ms`)
    console.log(`📊 Tokens used: ${result.tokensUsed || 'unknown'}`)

    // Если есть переведённое изображение, возвращаем его
    if (result.translatedImageUrl) {
      console.log(`🖼️ Translated image URL: ${result.translatedImageUrl}`)
      return NextResponse.json({
        output: result.translatedImageUrl,
        translatedText: result.translatedText,
        targetLanguage: result.targetLanguage,
        tokensUsed: result.tokensUsed,
        processingTime: result.processingTime,
      })
    }

    // Fallback: если изображения нет, возвращаем текст
    console.log(`⚠️ No translated image found, falling back to text`)
    return NextResponse.json({
      output: `data:text/plain;base64,${Buffer.from(result.translatedText).toString('base64')}`,
      translatedText: result.translatedText,
      targetLanguage: result.targetLanguage,
      tokensUsed: result.tokensUsed,
      processingTime: result.processingTime,
    })
  } catch (error) {
    console.error('❌ Error translating image')
    console.error('❌ Error message:', error instanceof Error ? error.message : error)
    if (error instanceof Error && error.stack) {
      console.error('❌ Stack trace:', error.stack)
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to translate image',
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
