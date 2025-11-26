# Replicate API Integration

Универсальная архитектура для интеграции любых моделей Replicate с полной типобезопасностью.

## Оглавление

- [Быстрый старт](#быстрый-старт)
- [Архитектура](#архитектура)
- [Добавление новой модели](#добавление-новой-модели)
- [Примеры использования](#примеры-использования)
- [API Reference](#api-reference)
- [Лучшие практики](#лучшие-практики)

## Быстрый старт

### 1. Настройка окружения

```bash
# Установите переменную окружения с вашим API токеном
REPLICATE_API_TOKEN=your_token_here
```

### 2. Использование существующей модели

```typescript
import { createReplicateService, BRIA_REMOVE_BG_CONFIG } from '@/lib/replicate'

const service = createReplicateService()

const result = await service.runModel(BRIA_REMOVE_BG_CONFIG, {
  input: {
    image: 'data:image/png;base64,...',
  },
})

if (result.status === 'succeeded') {
  console.log('Output URL:', result.output.url)
}
```

## Архитектура

### Структура файлов

```
lib/replicate/
├── types.ts          # Типы и конфигурации моделей
├── service.ts        # Основной сервис для работы с API
├── index.ts          # Экспорты
└── README.md         # Документация
```

### Основные компоненты

1. **ReplicateService** - Универсальный сервис для запуска любых моделей
2. **ReplicateModelConfig** - Типобезопасная конфигурация модели
3. **ModelResult** - Стандартизированный результат выполнения

## Добавление новой модели

### Шаг 1: Определите типы входных/выходных данных

```typescript
// lib/replicate/types.ts

/**
 * Параметры для модели улучшения изображений
 */
export interface ImageEnhanceInput {
  image: string // Data URL или HTTP URL
  enhancement_level?: number // 0-10
  denoise?: boolean
}

export interface ImageEnhanceOutput {
  url: string
  metadata?: {
    quality_score: number
  }
}
```

### Шаг 2: Создайте конфигурацию модели

```typescript
// lib/replicate/types.ts

export const IMAGE_ENHANCE_CONFIG: ReplicateModelConfig<
  ImageEnhanceInput,
  ImageEnhanceOutput
> = {
  version: 'version_id_from_replicate', // Получите с страницы модели
  name: 'Image Enhancement',
  waitTimeout: 30,
  defaultInput: {
    enhancement_level: 5,
    denoise: true,
  },
  validateInput: (input) => {
    if (!input.image) {
      throw new Error('Image is required')
    }
    if (input.enhancement_level && (input.enhancement_level < 0 || input.enhancement_level > 10)) {
      throw new Error('Enhancement level must be between 0 and 10')
    }
  },
  transformOutput: (output) => {
    // Адаптируйте под формат выхода вашей модели
    if (typeof output === 'string') {
      return { url: output }
    }
    return output
  },
}
```

### Шаг 3: Экспортируйте конфигурацию

```typescript
// lib/replicate/index.ts

export { IMAGE_ENHANCE_CONFIG } from './types'
```

### Шаг 4: Создайте API endpoint

```typescript
// app/api/enhance-image/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createReplicateService, IMAGE_ENHANCE_CONFIG, ReplicateService } from '@/lib/replicate'
import type { ImageEnhanceInput } from '@/lib/replicate'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Конвертация в Data URL
    const dataUrl = await ReplicateService.fileToDataUrl(image)

    // Создание сервиса
    const replicateService = createReplicateService()

    // Подготовка входных данных
    const input: ImageEnhanceInput = {
      image: dataUrl,
      enhancement_level: 7, // Можно получить из formData
    }

    // Запуск модели
    const result = await replicateService.runModel(IMAGE_ENHANCE_CONFIG, {
      input,
      waitTimeout: 60,
    })

    if (result.status === 'succeeded' && result.output) {
      return NextResponse.json({
        output: result.output.url,
        metadata: result.output.metadata,
        executionTime: result.executionTime,
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    )
  }
}
```

## Примеры использования

### Пример 1: Удаление фона (уже реализовано)

```typescript
import { createReplicateService, BRIA_REMOVE_BG_CONFIG } from '@/lib/replicate'

const service = createReplicateService()

const result = await service.runModel(BRIA_REMOVE_BG_CONFIG, {
  input: {
    image: dataUrl,
    preserve_partial_alpha: true, // Сохранить качество краев
  },
})
```

### Пример 2: Работа с большими файлами (>256KB)

Для файлов больше 256KB рекомендуется использовать HTTP URLs:

```typescript
// 1. Загрузите файл на временное хранилище (например, Vercel Blob, S3, Cloudinary)
const uploadedUrl = await uploadToStorage(file)

// 2. Используйте HTTP URL вместо Data URL
const result = await service.runModel(YOUR_MODEL_CONFIG, {
  input: {
    image_url: uploadedUrl, // Используйте поле image_url
  },
})
```

### Пример 3: Использование webhooks

```typescript
const result = await service.runModel(YOUR_MODEL_CONFIG, {
  input: { image: dataUrl },
  webhook: 'https://your-domain.com/api/webhook',
  webhook_events_filter: ['completed'], // Получать только финальный результат
})
```

### Пример 4: Обработка ошибок

```typescript
const result = await service.runModel(YOUR_MODEL_CONFIG, {
  input: { image: dataUrl },
})

switch (result.status) {
  case 'succeeded':
    console.log('Success!', result.output)
    break
  case 'failed':
    console.error('Failed:', result.error)
    // Отправить в систему мониторинга
    break
  default:
    console.warn('Unexpected status:', result.status)
}
```

## API Reference

### ReplicateService

#### Constructor

```typescript
new ReplicateService(apiToken?: string)
```

- `apiToken` - Опциональный API токен (если не задан REPLICATE_API_TOKEN в env)

#### Methods

##### `runModel<TInput, TOutput>(config, options): Promise<ModelResult<TOutput>>`

Запустить модель с типобезопасностью.

**Parameters:**
- `config: ReplicateModelConfig<TInput, TOutput>` - Конфигурация модели
- `options: RunModelOptions<TInput>` - Опции запуска

**Returns:** `Promise<ModelResult<TOutput>>`

##### `static fileToDataUrl(file: File | Blob): Promise<string>`

Конвертировать файл в Data URL.

##### `static shouldUseDataUrl(file: File | Blob): boolean`

Проверить, подходит ли файл для Data URL (≤256KB).

### ReplicateModelConfig<TInput, TOutput>

```typescript
interface ReplicateModelConfig<TInput, TOutput> {
  version: string                                    // ID версии модели
  name: string                                       // Название для логов
  waitTimeout?: number                               // Timeout в секундах (1-60)
  defaultInput?: Partial<TInput>                     // Параметры по умолчанию
  validateInput?: (input: TInput) => void | Promise<void>  // Валидация
  transformOutput?: (output: any) => TOutput         // Трансформация результата
}
```

### ModelResult<TOutput>

```typescript
interface ModelResult<TOutput> {
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: TOutput         // Результат (если успешно)
  error?: string           // Ошибка (если неудачно)
  predictionId: string     // ID предсказания
  executionTime?: number   // Время выполнения в мс
}
```

## Лучшие практики

### 1. Оптимизация размера файлов

```typescript
// ✅ ХОРОШО: Проверка размера файла
if (ReplicateService.shouldUseDataUrl(file)) {
  // Используем Data URL для файлов ≤256KB
  const dataUrl = await ReplicateService.fileToDataUrl(file)
  input.image = dataUrl
} else {
  // Загружаем на storage для больших файлов
  const url = await uploadToStorage(file)
  input.image_url = url
}

// ❌ ПЛОХО: Всегда использовать Data URL
const dataUrl = await ReplicateService.fileToDataUrl(file) // Может быть медленно для больших файлов
```

### 2. Параметры качества

```typescript
// ✅ ХОРОШО: Используйте параметры для сохранения качества
const config = {
  ...BRIA_REMOVE_BG_CONFIG,
  defaultInput: {
    preserve_partial_alpha: true, // Сохраняет полупрозрачные области
  },
}

// ❌ ПЛОХО: Не указывать параметры качества
const config = {
  version: '...',
  name: 'Remove BG',
  // Отсутствуют важные параметры
}
```

### 3. Обработка ошибок

```typescript
// ✅ ХОРОШО: Полная обработка ошибок
try {
  const result = await service.runModel(config, { input })

  if (result.status === 'succeeded') {
    return result.output
  } else {
    // Логируем детали для отладки
    console.error('Prediction failed:', {
      predictionId: result.predictionId,
      error: result.error,
      executionTime: result.executionTime,
    })
    throw new Error(result.error)
  }
} catch (error) {
  // Отправляем в систему мониторинга
  await logError(error)
  throw error
}

// ❌ ПЛОХО: Игнорирование ошибок
const result = await service.runModel(config, { input })
return result.output // Может быть undefined!
```

### 4. Валидация входных данных

```typescript
// ✅ ХОРОШО: Валидация в конфигурации
export const MY_MODEL_CONFIG: ReplicateModelConfig<MyInput, MyOutput> = {
  version: '...',
  name: 'My Model',
  validateInput: (input) => {
    if (!input.image && !input.image_url) {
      throw new Error('Image or image_url required')
    }
    if (input.strength < 0 || input.strength > 1) {
      throw new Error('Strength must be between 0 and 1')
    }
  },
}

// ❌ ПЛОХО: Без валидации
export const MY_MODEL_CONFIG = {
  version: '...',
  name: 'My Model',
  // Нет validateInput - можно отправить невалидные данные
}
```

### 5. Типобезопасность

```typescript
// ✅ ХОРОШО: Явные типы
interface MyModelInput {
  image: string
  strength: number
}

interface MyModelOutput {
  url: string
  confidence: number
}

const config: ReplicateModelConfig<MyModelInput, MyModelOutput> = {
  // TypeScript проверит соответствие типов
}

// ❌ ПЛОХО: Без типов
const config = {
  version: '...',
  // Нет типобезопасности
}
```

### 6. Мониторинг производительности

```typescript
// ✅ ХОРОШО: Логирование метрик
const result = await service.runModel(config, { input })

console.log('Performance metrics:', {
  model: config.name,
  executionTime: result.executionTime,
  predictionId: result.predictionId,
  status: result.status,
})

// Отправляем в систему мониторинга
await trackMetric('model_execution', {
  duration: result.executionTime,
  status: result.status,
})
```

## Получение информации о моделях

### Где найти version ID?

1. Откройте страницу модели на [Replicate](https://replicate.com)
2. Перейдите на вкладку "API"
3. Скопируйте version ID из примера кода

Пример: `https://replicate.com/bria/remove-background/api`
```
Version ID: 1a075954106b608c3671c2583e10526216f700d846b127fcf01461e8f642fb48
```

### Как узнать параметры модели?

На странице API модели есть раздел "Input schema" с описанием всех параметров:
- Название параметра
- Тип данных
- Значение по умолчанию
- Описание

## Troubleshooting

### Ошибка: "Replicate API token not configured"

**Решение:** Установите переменную окружения:
```bash
REPLICATE_API_TOKEN=your_token_here
```

### Ошибка: "Prediction timed out"

**Решение:** Увеличьте `waitTimeout`:
```typescript
await service.runModel(config, {
  input,
  waitTimeout: 120, // Увеличено до 2 минут
})
```

### Медленная обработка больших файлов

**Решение:** Используйте HTTP URLs вместо Data URLs для файлов >256KB:
```typescript
if (!ReplicateService.shouldUseDataUrl(file)) {
  const url = await uploadToStorage(file)
  input.image_url = url // Вместо input.image
}
```

### Низкое качество результата

**Решение:** Проверьте параметры качества в `defaultInput`:
```typescript
defaultInput: {
  preserve_partial_alpha: true,  // Для удаления фона
  denoise: true,                 // Для улучшения
  // и т.д.
}
```

## Дополнительные ресурсы

- [Официальная документация Replicate](https://replicate.com/docs)
- [Библиотека моделей Replicate](https://replicate.com/explore)
- [Replicate API Reference](https://replicate.com/docs/reference/http)
