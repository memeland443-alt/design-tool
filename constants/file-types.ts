/**
 * Поддерживаемые типы файлов для различных инструментов
 */

export const ACCEPTED_FILE_TYPES = {
  images: {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
  },
  pdf: {
    'application/pdf': ['.pdf'],
  },
  imagesAndPdf: {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    'application/pdf': ['.pdf'],
  },
  video: {
    'video/*': ['.mp4', '.webm', '.mov'],
  },
}

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  pdf: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
} as const
