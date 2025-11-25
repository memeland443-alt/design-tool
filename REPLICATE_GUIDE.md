# Руководство по работе с Replicate API

## 📚 Основы Replicate API

### Два подхода к работе с моделями

#### 1. Синхронный (replicate.run)
```typescript
const output = await replicate.run(
  'model-owner/model-name:version-hash',
  {
    input: {
      prompt: "your input"
    }
  }
)
```
✅ Простой в использовании
✅ Ждет завершения автоматически
❌ Блокирует запрос (может timeout)

#### 2. Асинхронный (predictions.create + polling)
```typescript
// Создаем prediction
let prediction = await replicate.predictions.create({
  version: 'version-hash',
  input: { prompt: "your input" }
})

// Ждем завершения
while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
  await new Promise(resolve => setTimeout(resolve, 1000))
  prediction = await replicate.predictions.get(prediction.id)
}

const output = prediction.output
```
✅ Не блокирует запрос
✅ Можно показывать прогресс
✅ Надежнее для долгих операций
❌ Немного сложнее код

## 🎨 Примеры популярных моделей

### 1. Удаление фона (Background Removal)
```typescript
// Модель: bria/remove-background
const prediction = await replicate.predictions.create({
  version: '1a075954106b608c3671c2583e10526216f700d846b127fcf01461e8f642fb48',
  input: {
    image: base64DataUrl // или HTTP URL
  }
})
```

### 2. Увеличение разрешения (Upscaling)
```typescript
// Модель: nightmareai/real-esrgan
const prediction = await replicate.predictions.create({
  version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
  input: {
    image: imageUrl,
    scale: 4, // 2x или 4x
    face_enhance: true
  }
})
```

### 3. Улучшение качества (Image Enhancement)
```typescript
// Модель: tencentarc/gfpgan
const prediction = await replicate.predictions.create({
  version: '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
  input: {
    img: imageUrl,
    version: 'v1.4',
    scale: 2
  }
})
```

### 4. Генерация изображений (Stable Diffusion)
```typescript
// Модель: stability-ai/sdxl
const prediction = await replicate.predictions.create({
  version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
  input: {
    prompt: "astronaut riding a horse",
    negative_prompt: "ugly, blurry",
    width: 1024,
    height: 1024,
    num_inference_steps: 50
  }
})
```

### 5. Удаление объектов (Inpainting)
```typescript
// Модель: stability-ai/stable-diffusion-inpainting
const prediction = await replicate.predictions.create({
  version: '95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3',
  input: {
    image: originalImageUrl,
    mask: maskImageUrl, // белый = удалить, черный = оставить
    prompt: "replace with grass"
  }
})
```

### 6. Раскрашивание черно-белых фото
```typescript
// Модель: tencentarc/colorize
const prediction = await replicate.predictions.create({
  version: 'd6c6c5c57c89dff54f59b93bb9fdb5f78c1ed4fe1f5e5e4e1fb2c1d0c3c5c5c5',
  input: {
    image: blackAndWhiteImageUrl
  }
})
```

## 🔧 Структура API Route для любой модели

```typescript
// app/api/[function-name]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    // Конвертируем в base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    // Создаем prediction
    let prediction = await replicate.predictions.create({
      version: 'YOUR-MODEL-VERSION-HASH',
      input: {
        image: base64Image,
        // Дополнительные параметры модели
      }
    })

    // Ждем завершения (max 60 секунд)
    const maxAttempts = 60
    let attempts = 0

    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      attempts < maxAttempts
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      prediction = await replicate.predictions.get(prediction.id)
      attempts++
    }

    if (prediction.status === 'succeeded') {
      return NextResponse.json({ output: prediction.output })
    } else {
      return NextResponse.json(
        { error: 'Processing failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 📝 Как найти нужную модель

1. Перейдите на https://replicate.com/explore
2. Используйте поиск или фильтры по категориям
3. Откройте страницу модели
4. Найдите **Version** (хеш версии) в разделе API
5. Изучите **Input Schema** для параметров

## 💡 Полезные советы

### Работа с изображениями

```typescript
// ✅ Рекомендуется: URL изображения
input: {
  image: "https://example.com/image.jpg"
}

// ✅ Для маленьких файлов (<256KB): Data URL
input: {
  image: "data:image/jpeg;base64,/9j/4AAQ..."
}

// ❌ Не передавайте: Сырые байты
```

### Оптимизация размера base64

```typescript
// Сжатие изображения перед отправкой
import sharp from 'sharp'

const compressed = await sharp(buffer)
  .resize(2048, 2048, { fit: 'inside' })
  .jpeg({ quality: 85 })
  .toBuffer()

const base64 = `data:image/jpeg;base64,${compressed.toString('base64')}`
```

### Обработка ошибок

```typescript
try {
  const prediction = await replicate.predictions.create({...})

  if (prediction.status === 'failed') {
    console.error('Prediction error:', prediction.error)
    // prediction.error содержит детали ошибки
  }
} catch (error) {
  if (error.response?.status === 422) {
    // Неверная версия модели или параметры
  } else if (error.response?.status === 429) {
    // Rate limit exceeded
  }
}
```

## 🚀 Добавление новой функции в проект

### Шаг 1: Создайте API Route
```bash
# Создайте файл app/api/upscale/route.ts
```

### Шаг 2: Создайте компонент
```typescript
// components/upscale.tsx
'use client'
// Скопируйте background-remover.tsx и адаптируйте
```

### Шаг 3: Добавьте в главную страницу
```typescript
// app/page.tsx
import Upscale from '@/components/upscale'

// В TabsContent:
<TabsContent value="upscale">
  <Card>
    <CardHeader>
      <CardTitle>Image Upscaling</CardTitle>
    </CardHeader>
    <CardContent>
      <Upscale />
    </CardContent>
  </Card>
</TabsContent>
```

## 📊 Лимиты и цены

- **Бесплатный план**: Ограниченное количество запросов
- **Rate limits**: 600 запросов/минуту на создание predictions
- **Стоимость**: Зависит от модели (см. страницу модели)
- **Timeout**: 60 секунд для синхронного ожидания

## 🔗 Полезные ссылки

- [Replicate API Docs](https://replicate.com/docs)
- [JavaScript SDK](https://github.com/replicate/replicate-javascript)
- [Explore Models](https://replicate.com/explore)
- [Pricing](https://replicate.com/pricing)
