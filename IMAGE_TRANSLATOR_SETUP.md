# Настройка инструмента перевода изображений

## Обзор

Инструмент **Image Translator** использует Google Gemini 3 Pro Image Preview через OpenRouter API для перевода текста на изображениях с автоматической адаптацией контента (единицы измерения, даты, валюта, культурные особенности).

## Получение API ключа OpenRouter

1. Перейдите на [https://openrouter.ai](https://openrouter.ai)
2. Зарегистрируйтесь или войдите в аккаунт
3. Перейдите в раздел **Keys** (https://openrouter.ai/keys)
4. Создайте новый API ключ
5. Скопируйте ключ (он показывается только один раз!)

## Локальная разработка

### 1. Добавьте ключ в `.env.local`

Создайте или отредактируйте файл `.env.local` в корне проекта:

```bash
# Существующие ключи
REPLICATE_API_TOKEN=your_replicate_token_here

# Добавьте OpenRouter ключ
OPENROUTER_API_KEY=sk-or-v1-... # Ваш ключ из OpenRouter
```

### 2. Перезапустите dev сервер

```bash
npm run dev
```

### 3. Откройте приложение

Перейдите на [http://localhost:3000](http://localhost:3000) и откройте вкладку **Translate**

## Деплой на Vercel

### Добавление environment variable

#### Через веб-интерфейс:

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте новую переменную:
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: Ваш API ключ из OpenRouter
   - **Environments**: Production, Preview, Development

#### Через CLI:

```bash
vercel env add OPENROUTER_API_KEY
```

Введите ваш ключ, когда будет запрошено.

### Redeploy проекта

```bash
git add .
git commit -m "Add image translator feature"
git push
```

Vercel автоматически задеплоит новую версию с environment variable.

## Использование

1. Откройте вкладку **Translate**
2. Выберите целевой язык из выпадающего списка (с поиском)
3. Загрузите изображения (PNG, JPG, WEBP)
4. Нажмите **Перевести все**
5. Скачайте переведенный текст как `.txt` файлы

## Поддерживаемые языки

Более 45 языков, включая:
- Английский (English)
- Русский (Русский)
- Испанский (Español)
- Китайский (简体中文)
- Французский (Français)
- Немецкий (Deutsch)
- Японский (日本語)
- И многие другие...

## Адаптация контента

AI автоматически адаптирует:
- **Единицы измерения**: мили → км, °F → °C, фунты → кг
- **Даты**: MM/DD/YYYY → DD.MM.YYYY (в зависимости от региона)
- **Валюта**: $ → € → ₽ и т.д.
- **Культурные ссылки**: идиомы, метафоры, примеры
- **Адреса**: форматы адресов по локальным стандартам

## Стоимость

OpenRouter работает по модели pay-as-you-go. Google Gemini 3 Pro Image Preview имеет конкурентные цены для обработки изображений.

Проверьте актуальные цены: [https://openrouter.ai/models/google/gemini-3-pro-image-preview](https://openrouter.ai/models/google/gemini-3-pro-image-preview)

## Лимиты

- Максимальный размер изображения: 10 МБ
- Поддерживаемые форматы: PNG, JPG, WEBP
- Рекомендуемое качество: изображения с четким текстом

## Troubleshooting

### Ошибка "OpenRouter API key not configured"

Убедитесь что:
1. Переменная `OPENROUTER_API_KEY` добавлена в `.env.local` (локально)
2. Переменная добавлена в Vercel Environment Variables (на проде)
3. Dev сервер перезапущен после добавления переменной

### Ошибка "Rate limit (429)"

API автоматически повторяет запрос при rate limit. Если ошибка сохраняется:
1. Подождите несколько минут
2. Проверьте лимиты вашего аккаунта на OpenRouter

### Плохое качество перевода

1. Используйте изображения с четким текстом
2. Избегайте размытых или низкокачественных картинок
3. Для handwritten text качество может варьироваться

## Архитектура

### Созданные файлы:

```
lib/openrouter/
├── types.ts                    # Типы для OpenRouter API
├── service.ts                  # OpenRouter service с retry логикой
├── models/
│   └── image-translation.ts    # Конфигурация Gemini модели
├── prompts/
│   └── translation.ts          # Системные промпты для перевода
└── index.ts                    # Exports

constants/
├── languages.ts                # 45+ поддерживаемых языков

hooks/
├── use-language-selection.ts   # Hook для выбора языка

components/
├── shared/
│   └── language-selector.tsx   # Компонент выбора языка
└── features/
    └── image-translator/
        └── image-translator-tool.tsx  # Основной компонент

app/api/ai/translate/
└── route.ts                    # API endpoint
```

## Будущие улучшения

- [ ] PDF поддержка (multi-page translation)
- [ ] Batch processing optimization
- [ ] Глоссарий пользовательских терминов
- [ ] Экспорт в DOCX/JSON
- [ ] Translation memory

---

Создано с помощью Claude Code
