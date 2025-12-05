/**
 * Все тексты интерфейса на русском языке
 * Централизованное хранилище для легкой локализации
 */

export const TEXTS = {
  // Общие тексты
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    cancel: 'Отмена',
    download: 'Скачать',
    remove: 'Удалить',
    process: 'Обработать',
    uploadFiles: 'Загрузить файлы',
    retry: 'Повторить',
  },

  // Главная страница
  home: {
    title: 'Инструменты дизайнера',
    description: 'AI-инструменты для работы с изображениями и видео',
  },

  // Загрузка изображений
  imageUpload: {
    dragAndDrop: 'Перетащите изображения сюда',
    dragActive: 'Отпустите файлы здесь',
    clickToSelect: 'или нажмите для выбора файлов',
    supportedFormats: 'Поддерживаемые форматы',
    maxSize: 'Максимальный размер',
    formats: {
      images: 'PNG, JPG, WEBP',
      video: 'MP4, WEBM, MOV',
    },
  },

  // Статусы обработки
  processing: {
    pending: 'Ожидание...',
    processing: 'Обработка...',
    completed: 'Готово',
    error: 'Ошибка обработки',
    waiting: 'В очереди...',
  },

  // Инструменты
  tools: {
    backgroundRemover: {
      name: 'Удаление фона',
      tabName: 'Remove BG',
      description: 'Загрузите изображения и автоматически удалите фон с помощью AI',
      actionButton: 'Удалить фон',
      processing: 'Удаление фона...',
      outputSuffix: '-bg-removed',
      labels: {
        original: 'Оригинал',
        processed: 'Без фона',
      },
    },
    imageUpscaler: {
      name: 'Увеличение разрешения',
      tabName: 'Upscale',
      description: 'Улучшите разрешение изображений с помощью технологии upscaling',
      actionButton: 'Увеличить качество',
      processing: 'Увеличение разрешения...',
      outputSuffix: '-upscaled',
      infoBanner: 'Используется Recraft AI Crisp Upscale - автоматическое улучшение разрешения с оптимальными настройками качества',
      labels: {
        original: 'Оригинал',
        processed: 'Улучшенное',
      },
      maxSizeNote: 'максимум 10 МБ',
    },
    imageTranslator: {
      name: 'Перевод изображений',
      tabName: 'Translate',
      description: 'AI автоматически адаптирует все аспекты: язык, единицы измерения, даты, валюту и культурные особенности',
      actionButton: 'Перевести',
      processing: 'Перевод текста...',
      outputSuffix: '-translated',
      infoBanner: 'AI автоматически адаптирует все аспекты: язык, единицы измерения, даты, валюту и культурные особенности',
      labels: {
        original: 'Оригинал',
        processed: 'Переведено',
      },
      selectLanguage: 'Выберите язык для перевода',
      noLanguageSelected: 'Язык не выбран',
      languagePlaceholder: 'Поиск языка...',
      popularLanguages: 'Популярные языки',
      allLanguages: 'Все языки',
    },
    imageEnhancer: {
      name: 'Улучшение изображений',
      tabName: 'Enhance',
      description: 'Скоро...',
      comingSoon: true,
    },
    moreTools: {
      name: 'Ещё инструменты',
      tabName: 'Ещё',
      description: 'Скоро...',
      comingSoon: true,
    },
  },

  // Кнопки действий
  actions: {
    processAll: 'Обработать все',
    downloadAll: 'Скачать все',
    clearAll: 'Очистить всё',
    retry: 'Повторить',
    cancel: 'Отменить',
  },

  // Ошибки
  errors: {
    noFiles: 'Файлы не выбраны',
    processingFailed: 'Не удалось обработать изображение',
    uploadFailed: 'Не удалось загрузить файл',
    fileTooLarge: 'Файл слишком большой (максимум {size})',
    unsupportedFormat: 'Неподдерживаемый формат файла',
    networkError: 'Ошибка сети. Проверьте подключение к интернету',
    unknownError: 'Неизвестная ошибка',
  },

  // Уведомления
  notifications: {
    processingComplete: 'Обработка завершена!',
    allImagesProcessed: 'Все изображения обработаны',
    downloadStarted: 'Загрузка началась',
    imageRemoved: 'Изображение удалено',
    processingStarted: 'Обработка началась',
  },

  // Прогресс
  progress: {
    processing: 'Обработка {current} из {total}',
    completed: 'Обработано {count} изображений',
  },
} as const

// Типобезопасный доступ к текстам
export type TextsKey = keyof typeof TEXTS

// Хелпер для форматирования текстов с параметрами
export function formatText(text: string, params: Record<string, string | number>): string {
  let result = text
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value))
  })
  return result
}
