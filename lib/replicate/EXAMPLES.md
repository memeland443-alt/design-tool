# Примеры интеграции моделей Replicate

Практические примеры для быстрой интеграции популярных моделей.

## Содержание

1. [Image Upscaling (Real-ESRGAN)](#1-image-upscaling-real-esrgan)
2. [Image Enhancement (CodeFormer)](#2-image-enhancement-codeformer)
3. [Object Removal (LaMa)](#3-object-removal-lama)
4. [Image Generation (Stable Diffusion)](#4-image-generation-stable-diffusion)
5. [Style Transfer](#5-style-transfer)

---

## 1. Image Upscaling (Real-ESRGAN)

### Модель: `nightmareai/real-esrgan`

**Применение:** Увеличение разрешения изображений в 4x раз

### Шаг 1: Добавьте типы

```typescript
// lib/replicate/types.ts

export interface RealESRGANInput {
  image: string
  scale?: number  // 2 | 4
  face_enhance?: boolean
}

export interface RealESRGANOutput {
  url: string
}

export const REAL_ESRGAN_CONFIG: ReplicateModelConfig<
  RealESRGANInput,
  RealESRGANOutput
> = {
  version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
  name: 'Real-ESRGAN Upscaler',
  waitTimeout: 60,
  defaultInput: {
    scale: 4,
    face_enhance: false,
  },
  validateInput: (input) => {
    if (!input.image) {
      throw new Error('Image is required')
    }
    if (input.scale && ![2, 4].includes(input.scale)) {
      throw new Error('Scale must be 2 or 4')
    }
  },
  transformOutput: (output) => ({
    url: typeof output === 'string' ? output : output[0],
  }),
}
```

### Шаг 2: Экспортируйте

```typescript
// lib/replicate/index.ts
export { REAL_ESRGAN_CONFIG } from './types'
```

### Шаг 3: Создайте API endpoint

```typescript
// app/api/upscale-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import {
  createReplicateService,
  REAL_ESRGAN_CONFIG,
  ReplicateService,
} from '@/lib/replicate'
import type { RealESRGANInput } from '@/lib/replicate'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const scale = parseInt(formData.get('scale') as string) || 4

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const dataUrl = await ReplicateService.fileToDataUrl(image)
    const replicateService = createReplicateService()

    const input: RealESRGANInput = {
      image: dataUrl,
      scale: scale as 2 | 4,
      face_enhance: true,
    }

    const result = await replicateService.runModel(REAL_ESRGAN_CONFIG, {
      input,
      waitTimeout: 120,
    })

    if (result.status === 'succeeded' && result.output) {
      return NextResponse.json({
        output: result.output.url,
        executionTime: result.executionTime,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upscale' },
      { status: 500 }
    )
  }
}
```

---

## 2. Image Enhancement (CodeFormer)

### Модель: `sczhou/codeformer`

**Применение:** Улучшение качества лиц на фотографиях

### Конфигурация

```typescript
// lib/replicate/types.ts

export interface CodeFormerInput {
  image: string
  codeformer_fidelity?: number  // 0-1
  background_enhance?: boolean
  face_upsample?: boolean
  upscale?: number  // 1-4
}

export interface CodeFormerOutput {
  url: string
}

export const CODEFORMER_CONFIG: ReplicateModelConfig<
  CodeFormerInput,
  CodeFormerOutput
> = {
  version: '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
  name: 'CodeFormer Face Enhancement',
  waitTimeout: 60,
  defaultInput: {
    codeformer_fidelity: 0.5,
    background_enhance: true,
    face_upsample: true,
    upscale: 2,
  },
  validateInput: (input) => {
    if (!input.image) {
      throw new Error('Image is required')
    }
    if (
      input.codeformer_fidelity !== undefined &&
      (input.codeformer_fidelity < 0 || input.codeformer_fidelity > 1)
    ) {
      throw new Error('Fidelity must be between 0 and 1')
    }
  },
  transformOutput: (output) => ({
    url: typeof output === 'string' ? output : output[0],
  }),
}
```

### API Endpoint

```typescript
// app/api/enhance-face/route.ts

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const image = formData.get('image') as File
  const fidelity = parseFloat(formData.get('fidelity') as string) || 0.5

  const dataUrl = await ReplicateService.fileToDataUrl(image)
  const service = createReplicateService()

  const result = await service.runModel(CODEFORMER_CONFIG, {
    input: {
      image: dataUrl,
      codeformer_fidelity: fidelity,
    },
  })

  if (result.status === 'succeeded') {
    return NextResponse.json({ output: result.output?.url })
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
}
```

---

## 3. Object Removal (LaMa)

### Модель: `andrewhires/lama`

**Применение:** Удаление объектов с изображений

### Конфигурация

```typescript
// lib/replicate/types.ts

export interface LamaInput {
  image: string
  mask: string  // Маска областей для удаления (PNG с прозрачностью)
}

export interface LamaOutput {
  url: string
}

export const LAMA_CONFIG: ReplicateModelConfig<LamaInput, LamaOutput> = {
  version: '2b6a82cdd5878f1823ae4b0bb9e2b9d0f7c4c6e8b8b60e5a8b68c4e1e3f6d9e2',
  name: 'LaMa Object Removal',
  waitTimeout: 60,
  validateInput: (input) => {
    if (!input.image || !input.mask) {
      throw new Error('Both image and mask are required')
    }
  },
  transformOutput: (output) => ({
    url: typeof output === 'string' ? output : output[0],
  }),
}
```

### API Endpoint

```typescript
// app/api/remove-object/route.ts

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const image = formData.get('image') as File
  const mask = formData.get('mask') as File

  if (!image || !mask) {
    return NextResponse.json(
      { error: 'Both image and mask required' },
      { status: 400 }
    )
  }

  const imageDataUrl = await ReplicateService.fileToDataUrl(image)
  const maskDataUrl = await ReplicateService.fileToDataUrl(mask)

  const service = createReplicateService()

  const result = await service.runModel(LAMA_CONFIG, {
    input: {
      image: imageDataUrl,
      mask: maskDataUrl,
    },
  })

  if (result.status === 'succeeded') {
    return NextResponse.json({ output: result.output?.url })
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
}
```

---

## 4. Image Generation (Stable Diffusion)

### Модель: `stability-ai/sdxl`

**Применение:** Генерация изображений по текстовому описанию

### Конфигурация

```typescript
// lib/replicate/types.ts

export interface SDXLInput {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  num_outputs?: number
  num_inference_steps?: number
  guidance_scale?: number
}

export interface SDXLOutput {
  urls: string[]
}

export const SDXL_CONFIG: ReplicateModelConfig<SDXLInput, SDXLOutput> = {
  version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  name: 'Stable Diffusion XL',
  waitTimeout: 120,
  defaultInput: {
    width: 1024,
    height: 1024,
    num_outputs: 1,
    num_inference_steps: 50,
    guidance_scale: 7.5,
  },
  validateInput: (input) => {
    if (!input.prompt || input.prompt.trim().length === 0) {
      throw new Error('Prompt is required')
    }
  },
  transformOutput: (output) => ({
    urls: Array.isArray(output) ? output : [output],
  }),
}
```

### API Endpoint

```typescript
// app/api/generate-image/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { prompt, negative_prompt, width, height } = body

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
  }

  const service = createReplicateService()

  const result = await service.runModel(SDXL_CONFIG, {
    input: {
      prompt,
      negative_prompt,
      width: width || 1024,
      height: height || 1024,
    },
    waitTimeout: 180,
  })

  if (result.status === 'succeeded') {
    return NextResponse.json({
      outputs: result.output?.urls,
      executionTime: result.executionTime,
    })
  } else {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
}
```

---

## 5. Style Transfer

### Модель: `cjwbw/style-transfer`

**Применение:** Перенос художественного стиля на изображение

### Конфигурация

```typescript
// lib/replicate/types.ts

export interface StyleTransferInput {
  content_image: string
  style_image: string
  style_strength?: number  // 0-1
}

export interface StyleTransferOutput {
  url: string
}

export const STYLE_TRANSFER_CONFIG: ReplicateModelConfig<
  StyleTransferInput,
  StyleTransferOutput
> = {
  version: 'model_version_id_here',
  name: 'Style Transfer',
  waitTimeout: 90,
  defaultInput: {
    style_strength: 0.5,
  },
  validateInput: (input) => {
    if (!input.content_image || !input.style_image) {
      throw new Error('Both content and style images are required')
    }
  },
  transformOutput: (output) => ({
    url: typeof output === 'string' ? output : output[0],
  }),
}
```

---

## Комбинирование моделей

### Пример: Upscale + Background Removal

```typescript
// app/api/upscale-and-remove-bg/route.ts

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const image = formData.get('image') as File

  const service = createReplicateService()

  // Шаг 1: Upscale
  const dataUrl = await ReplicateService.fileToDataUrl(image)

  const upscaleResult = await service.runModel(REAL_ESRGAN_CONFIG, {
    input: { image: dataUrl, scale: 4 },
  })

  if (upscaleResult.status !== 'succeeded' || !upscaleResult.output) {
    return NextResponse.json({ error: 'Upscale failed' }, { status: 500 })
  }

  // Шаг 2: Remove Background
  const removeBgResult = await service.runModel(BRIA_REMOVE_BG_CONFIG, {
    input: { image_url: upscaleResult.output.url },
  })

  if (removeBgResult.status === 'succeeded') {
    return NextResponse.json({
      output: removeBgResult.output?.url,
      totalTime: (upscaleResult.executionTime || 0) + (removeBgResult.executionTime || 0),
    })
  } else {
    return NextResponse.json({ error: removeBgResult.error }, { status: 500 })
  }
}
```

---

## Работа с большими файлами

### Загрузка на Vercel Blob Storage

```typescript
import { put } from '@vercel/blob'

async function uploadLargeFile(file: File): Promise<string> {
  // Для файлов >256KB загружаем на storage
  if (!ReplicateService.shouldUseDataUrl(file)) {
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })
    return blob.url
  }

  // Для маленьких используем Data URL
  return await ReplicateService.fileToDataUrl(file)
}

// Использование
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const image = formData.get('image') as File

  const imageUrl = await uploadLargeFile(image)

  const service = createReplicateService()
  const result = await service.runModel(YOUR_CONFIG, {
    input: {
      image_url: imageUrl, // Используем HTTP URL
    },
  })
}
```

---

## Батч-обработка

### Обработка нескольких изображений

```typescript
// app/api/batch-process/route.ts

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const files = formData.getAll('images') as File[]

  const service = createReplicateService()

  // Параллельная обработка
  const results = await Promise.all(
    files.map(async (file) => {
      const dataUrl = await ReplicateService.fileToDataUrl(file)
      return await service.runModel(BRIA_REMOVE_BG_CONFIG, {
        input: { image: dataUrl },
      })
    })
  )

  // Фильтруем успешные результаты
  const successful = results
    .filter((r) => r.status === 'succeeded')
    .map((r) => r.output?.url)

  return NextResponse.json({
    processed: successful.length,
    total: files.length,
    outputs: successful,
  })
}
```

---

## Мониторинг и логирование

### Интеграция с системой мониторинга

```typescript
async function trackModelExecution(
  modelName: string,
  result: ModelResult<any>
) {
  // Отправка метрик в систему мониторинга
  await fetch('https://your-monitoring-service.com/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      status: result.status,
      executionTime: result.executionTime,
      predictionId: result.predictionId,
      timestamp: new Date().toISOString(),
    }),
  })
}

// Использование
const result = await service.runModel(config, { input })
await trackModelExecution(config.name, result)
```

---

## Получение версий моделей

Чтобы получить version ID модели:

1. Откройте https://replicate.com/explore
2. Найдите нужную модель
3. Перейдите на вкладку "API"
4. Скопируйте version ID из примера кода

Или через API:

```bash
curl -s "https://api.replicate.com/v1/models/owner/model-name" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" | \
  jq '.latest_version.id'
```

---

## Дополнительные ресурсы

- 📚 [Основная документация](README.md)
- 🔍 [Библиотека моделей Replicate](https://replicate.com/explore)
- 📖 [API Reference Replicate](https://replicate.com/docs/reference/http)
