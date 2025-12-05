import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from 'canvas'

// Configure pdfjs worker for Node.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Convert PDF page to PNG image (base64 data URL)
 */
export async function convertPdfPageToImage(
  pdfBuffer: Buffer,
  pageNumber: number,
  scale: number = 2.0
): Promise<string> {
  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdfDocument = await loadingTask.promise

  // Get specific page
  const page = await pdfDocument.getPage(pageNumber)

  // Calculate dimensions
  const viewport = page.getViewport({ scale })
  const canvas = createCanvas(viewport.width, viewport.height)
  const context = canvas.getContext('2d')

  // Render page to canvas
  await page.render({
    canvasContext: context as any,
    viewport: viewport,
    canvas: canvas as any,
  }).promise

  // Convert to PNG data URL
  const dataUrl = canvas.toDataURL('image/png')

  await pdfDocument.destroy()

  return dataUrl
}

/**
 * Get total page count from PDF
 */
export async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdfDocument = await loadingTask.promise
  const pageCount = pdfDocument.numPages
  await pdfDocument.destroy()
  return pageCount
}
