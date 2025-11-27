/**
 * Компонент зоны загрузки изображений
 * Извлечен из background-remover (строки 112-131) и image-upscaler (строки 122-141)
 */

'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { TEXTS } from '@/constants/texts'
import { cn } from '@/lib/utils'

interface ImageUploadZoneProps {
  /** Callback при добавлении файлов */
  onFilesAccepted: (files: File[]) => void
  /** Поддерживаемые типы файлов */
  acceptedFileTypes?: Record<string, string[]>
  /** Максимальный размер файла */
  maxSize?: number
  /** Разрешить множественную загрузку */
  multiple?: boolean
  /** Отключить зону загрузки */
  disabled?: boolean
  /** Дополнительный текст о форматах */
  formatNote?: string
}

/**
 * Зона загрузки изображений с drag & drop
 */
export function ImageUploadZone({
  onFilesAccepted,
  acceptedFileTypes,
  maxSize,
  multiple = true,
  disabled = false,
  formatNote,
}: ImageUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles)
    },
    [onFilesAccepted]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer',
        'transition-colors duration-200',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-2">
        {isDragActive
          ? TEXTS.imageUpload.dragActive
          : TEXTS.imageUpload.dragAndDrop}
      </p>
      <p className="text-sm text-muted-foreground">
        {TEXTS.imageUpload.clickToSelect}
        {formatNote && (
          <>
            {' '}
            <span className="font-medium">({formatNote})</span>
          </>
        )}
      </p>
    </div>
  )
}
