import { PDFDocument } from 'pdf-lib'
import { convertPdfPageToImage, getPdfPageCount } from './converter'
import { OpenRouterService } from '../openrouter/service'
import { TranslationConfig } from '../openrouter/types'
import { TRANSLATION_SYSTEM_PROMPT } from '../openrouter/prompts/translation'
import pLimit from 'p-limit'

export interface PdfTranslationProgress {
  currentPage: number
  totalPages: number
  status: 'processing' | 'completed' | 'error'
  error?: string
}

export type ProgressCallback = (progress: PdfTranslationProgress) => void

/**
 * PDF Translation Service
 */
export class PdfTranslationService {
  constructor(
    private openRouterService: OpenRouterService,
    private concurrencyLimit: number = 3 // Max 3 parallel requests
  ) {}

  /**
   * Translate entire PDF document
   */
  async translatePdf(
    pdfBuffer: Buffer,
    config: TranslationConfig,
    onProgress?: ProgressCallback
  ): Promise<Buffer> {
    const totalPages = await getPdfPageCount(pdfBuffer)
    console.log(`📄 PDF has ${totalPages} pages`)

    // Create concurrency limiter
    const limit = pLimit(this.concurrencyLimit)

    // Convert all pages to images
    onProgress?.({
      currentPage: 0,
      totalPages,
      status: 'processing',
    })

    const pageImagePromises = Array.from({ length: totalPages }, (_, i) =>
      limit(async () => {
        const pageNum = i + 1
        console.log(`📸 Converting page ${pageNum}/${totalPages} to image`)
        return {
          pageNumber: pageNum,
          imageDataUrl: await convertPdfPageToImage(pdfBuffer, pageNum),
        }
      })
    )

    const pageImages = await Promise.all(pageImagePromises)

    // Translate all pages with controlled concurrency
    const translatedImagePromises = pageImages.map((pageData) =>
      limit(async () => {
        console.log(`🌐 Translating page ${pageData.pageNumber}/${totalPages}`)

        const result = await this.openRouterService.translateImage(
          pageData.imageDataUrl,
          config,
          TRANSLATION_SYSTEM_PROMPT
        )

        onProgress?.({
          currentPage: pageData.pageNumber,
          totalPages,
          status: 'processing',
        })

        if (!result.translatedImageUrl) {
          throw new Error(`No translated image for page ${pageData.pageNumber}`)
        }

        return {
          pageNumber: pageData.pageNumber,
          translatedImageUrl: result.translatedImageUrl,
        }
      })
    )

    const translatedPages = await Promise.all(translatedImagePromises)

    // Sort by page number (in case parallel processing finished out of order)
    translatedPages.sort((a, b) => a.pageNumber - b.pageNumber)

    // Create new PDF from translated images
    console.log('📦 Merging translated pages into PDF')
    const newPdf = await this.createPdfFromImages(
      translatedPages.map((p) => p.translatedImageUrl)
    )

    onProgress?.({
      currentPage: totalPages,
      totalPages,
      status: 'completed',
    })

    return newPdf
  }

  /**
   * Create PDF document from array of image data URLs
   */
  private async createPdfFromImages(imageDataUrls: string[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create()

    for (const imageDataUrl of imageDataUrls) {
      // Extract base64 data
      const base64Data = imageDataUrl.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')

      // Embed image
      const image = await pdfDoc.embedPng(imageBuffer)

      // Add page with same dimensions as image
      const page = pdfDoc.addPage([image.width, image.height])

      // Draw image to fill entire page
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      })
    }

    // Serialize to bytes
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  }
}
