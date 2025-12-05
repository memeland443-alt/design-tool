import { NextRequest, NextResponse } from 'next/server'
import { createOpenRouterService } from '@/lib/openrouter/service'
import { PdfTranslationService } from '@/lib/pdf/service'
import { TranslationConfig } from '@/lib/openrouter/types'

export const maxDuration = 300 // 5 minutes for large PDFs

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetLanguageCode = formData.get('targetLanguage') as string
    const targetLanguageName = formData.get('languageName') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!targetLanguageCode || !targetLanguageName) {
      return NextResponse.json(
        { error: 'Target language not specified' },
        { status: 400 }
      )
    }

    console.log(`📄 Translating PDF: ${file.name} to ${targetLanguageName}`)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const pdfBuffer = Buffer.from(arrayBuffer)

    // Initialize services
    const openRouterService = createOpenRouterService()
    const pdfService = new PdfTranslationService(openRouterService)

    // Translate PDF
    const config: TranslationConfig = {
      targetLanguage: targetLanguageCode,
      languageName: targetLanguageName,
      temperature: 0.3,
      maxTokens: 4096,
    }

    const translatedPdfBuffer = await pdfService.translatePdf(
      pdfBuffer,
      config,
      (progress) => {
        console.log(
          `📊 Progress: ${progress.currentPage}/${progress.totalPages} pages`
        )
      }
    )

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(translatedPdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="translated-${file.name}"`,
      },
    })
  } catch (error) {
    console.error('❌ PDF translation error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'PDF translation failed',
      },
      { status: 500 }
    )
  }
}
