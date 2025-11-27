/**
 * Типы для работы с Replicate API
 * Поддерживает типобезопасную конфигурацию различных моделей
 */

import { Prediction } from 'replicate'

/**
 * Базовый интерфейс для конфигурации модели Replicate
 */
export interface ReplicateModelConfig<TInput = Record<string, any>, TOutput = any> {
  /** ID версии модели в формате Replicate */
  version: string
  /** Название модели для логирования и отладки */
  name: string
  /** Максимальное время ожидания в секундах (1-60) */
  waitTimeout?: number
  /** Параметры по умолчанию для модели */
  defaultInput?: Partial<TInput>
  /** Функция валидации входных данных */
  validateInput?: (input: TInput) => void | Promise<void>
  /** Функция трансформации результата */
  transformOutput?: (output: any) => TOutput
}

/**
 * Типы статусов предсказания
 */
export type PredictionStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'

/**
 * Результат выполнения модели
 */
export interface ModelResult<TOutput = any> {
  /** Статус выполнения */
  status: PredictionStatus
  /** Результат (если успешно) */
  output?: TOutput
  /** Ошибка (если неудачно) */
  error?: string
  /** ID предсказания для отладки */
  predictionId: string
  /** Время выполнения в миллисекундах */
  executionTime?: number
}

/**
 * Опции для запуска модели
 */
export interface RunModelOptions<TInput = any> {
  /** Входные параметры модели */
  input: TInput
  /** Переопределить timeout для этого запроса */
  waitTimeout?: number
  /** Webhook URL для уведомлений */
  webhook?: string
  /** Фильтр событий webhook */
  webhook_events_filter?: ('start' | 'output' | 'logs' | 'completed')[]
  /** Максимальное количество повторов при rate limit (429) ошибках (по умолчанию 3) */
  maxRetries?: number
}
