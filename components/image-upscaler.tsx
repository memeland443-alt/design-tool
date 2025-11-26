'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, Loader2, X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ProcessedImage {
  original: string
  processed: string | null
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export default function ImageUpscaler() {
  const [images, setImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      original: URL.createObjectURL(file),
      processed: null,
      name: file.name,
      status: 'pending' as const,
    }))
    setImages(prev => [...prev, ...newImages])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  })

  const processImages = async () => {
    setIsProcessing(true)

    for (let i = 0; i < images.length; i++) {
      if (images[i].status !== 'pending') continue

      setImages(prev => prev.map((img, idx) =>
        idx === i ? { ...img, status: 'processing' } : img
      ))

      try {
        const response = await fetch(images[i].original)
        const blob = await response.blob()

        const formData = new FormData()
        formData.append('image', blob, images[i].name)

        const result = await fetch('/api/upscale', {
          method: 'POST',
          body: formData,
        })

        if (!result.ok) {
          const errorData = await result.json()
          throw new Error(errorData.error || 'Failed to process image')
        }

        const data = await result.json()

        setImages(prev => prev.map((img, idx) =>
          idx === i ? {
            ...img,
            processed: data.output,
            status: 'completed'
          } : img
        ))
      } catch (error) {
        setImages(prev => prev.map((img, idx) =>
          idx === i ? {
            ...img,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          } : img
        ))
      }
    }

    setIsProcessing(false)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index))
  }

  const downloadImage = async (url: string, filename: string) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `upscaled-${filename}`
    link.click()
  }

  const downloadAll = async () => {
    for (const img of images) {
      if (img.processed) {
        await downloadImage(img.processed, img.name)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          Using <span className="font-semibold text-foreground">Recraft AI Crisp Upscale</span> -
          automatically enhances image resolution with optimal quality settings
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to select files (PNG, JPG, WEBP, max 10MB)
        </p>
      </div>

      {/* Action Buttons */}
      {images.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={processImages}
            disabled={isProcessing || images.every(img => img.status !== 'pending')}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ZoomIn className="mr-2 h-4 w-4" />
                Upscale Images
              </>
            )}
          </Button>
          <Button
            onClick={downloadAll}
            variant="outline"
            disabled={!images.some(img => img.status === 'completed')}
          >
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {images.map((image, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate flex-1">
                  {image.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(index)}
                  disabled={image.status === 'processing'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Original */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Original</p>
                  <div className="relative w-full min-h-[200px] bg-muted rounded-md overflow-hidden">
                    <Image
                      src={image.original}
                      alt="Original"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>

                {/* Processed */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Upscaled
                  </p>
                  <div className="relative w-full min-h-[200px] bg-muted rounded-md overflow-hidden flex items-center justify-center">
                    {image.status === 'pending' && (
                      <p className="text-xs text-muted-foreground bg-white/80 px-3 py-1 rounded">Waiting...</p>
                    )}
                    {image.status === 'processing' && (
                      <div className="bg-white/80 p-3 rounded">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {image.status === 'error' && (
                      <div className="text-center p-3">
                        <p className="text-xs text-destructive bg-white/80 px-3 py-1 rounded mb-2">Error</p>
                        {image.error && (
                          <p className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">{image.error}</p>
                        )}
                      </div>
                    )}
                    {image.status === 'completed' && image.processed && (
                      <Image
                        src={image.processed}
                        alt="Upscaled"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              {image.status === 'completed' && image.processed && (
                <Button
                  onClick={() => downloadImage(image.processed!, image.name)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Upscaled Image
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
