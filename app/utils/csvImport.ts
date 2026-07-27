import type { WorkoutCategory } from '#shared/types/domain'
import type { Database } from '#shared/types/database'

export type DailyNewCsvPayload = Database['public']['Tables']['daily_new']['Insert']
export type TopicCsvPayload = Database['public']['Tables']['topics']['Insert']
export type WorkoutRecordCsvPayload = Database['public']['Tables']['workout_records']['Insert']

export interface CsvImportError {
  row: number
  reason: string
}

export type CsvImportResult<T> =
  | { success: true; rows: T[] }
  | { success: false; errors: CsvImportError[] }

const WORKOUT_CATEGORIES: WorkoutCategory[] = ['chest', 'back', 'legs']
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function requireString(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): string | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push({ row, reason: `${field} は必須です` })
    return undefined
  }
  return trimmed
}

// WorkoutForm.vue のバリデーションと同じ基準に揃える：
// intensity は自重種目（0kg）を許容するため 0 以上、reps は正の整数のみ許可する
function requireNonNegativeNumber(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): number | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push({ row, reason: `${field} は必須です` })
    return undefined
  }
  const num = Number(trimmed)
  if (!Number.isFinite(num) || num < 0) {
    errors.push({ row, reason: `${field} は0以上の数値で指定してください` })
    return undefined
  }
  return num
}

function requirePositiveInteger(
  value: string | undefined,
  field: string,
  row: number,
  errors: CsvImportError[],
): number | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push({ row, reason: `${field} は必須です` })
    return undefined
  }
  const num = Number(trimmed)
  if (!Number.isInteger(num) || num <= 0) {
    errors.push({ row, reason: `${field} は正の整数で指定してください` })
    return undefined
  }
  return num
}

function requireWorkoutCategory(
  value: string | undefined,
  row: number,
  errors: CsvImportError[],
): WorkoutCategory | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    errors.push({ row, reason: 'category は必須です' })
    return undefined
  }
  if (!WORKOUT_CATEGORIES.includes(trimmed as WorkoutCategory)) {
    errors.push({ row, reason: 'category は chest/back/legs のいずれかで指定してください' })
    return undefined
  }
  return trimmed as WorkoutCategory
}

// date は任意列。指定する場合のみ YYYY-MM-DD 形式を許可し、既存 create と同じ
// T00:00:00.000Z 整形を行う。空欄は未指定として扱い created_at を省略する（DB デフォルト）。
function validateDate(
  value: string | undefined,
  row: number,
  errors: CsvImportError[],
): string | undefined {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return undefined
  }
  if (!DATE_PATTERN.test(trimmed)) {
    errors.push({ row, reason: 'date は YYYY-MM-DD 形式で指定してください' })
    return undefined
  }
  return `${trimmed}T00:00:00.000Z`
}

export function importDailyNewRows(
  rows: Record<string, string>[],
): CsvImportResult<DailyNewCsvPayload> {
  const errors: CsvImportError[] = []
  const payloads: DailyNewCsvPayload[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const title = requireString(row.title, 'title', rowNumber, errors)
    const content = requireString(row.content, 'content', rowNumber, errors)
    const createdAt = validateDate(row.date, rowNumber, errors)

    if (title === undefined || content === undefined || (row.date && createdAt === undefined)) {
      return
    }
    payloads.push({
      title,
      content,
      ...(createdAt ? { created_at: createdAt } : {}),
    })
  })

  if (errors.length > 0) {
    return { success: false, errors }
  }
  return { success: true, rows: payloads }
}

export function importTopicRows(rows: Record<string, string>[]): CsvImportResult<TopicCsvPayload> {
  const errors: CsvImportError[] = []
  const payloads: TopicCsvPayload[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const content = requireString(row.content, 'content', rowNumber, errors)
    const createdAt = validateDate(row.date, rowNumber, errors)

    if (content === undefined || (row.date && createdAt === undefined)) {
      return
    }
    payloads.push({
      content,
      persons: [],
      ...(createdAt ? { created_at: createdAt } : {}),
    })
  })

  if (errors.length > 0) {
    return { success: false, errors }
  }
  return { success: true, rows: payloads }
}

export function importWorkoutRows(
  rows: Record<string, string>[],
): CsvImportResult<WorkoutRecordCsvPayload> {
  const errors: CsvImportError[] = []
  const payloads: WorkoutRecordCsvPayload[] = []

  rows.forEach((row, index) => {
    const rowNumber = index + 1
    const category = requireWorkoutCategory(row.category, rowNumber, errors)
    const menu = requireString(row.menu, 'menu', rowNumber, errors)
    const intensity = requireNonNegativeNumber(row.intensity, 'intensity', rowNumber, errors)
    const reps = requirePositiveInteger(row.reps, 'reps', rowNumber, errors)
    const createdAt = validateDate(row.date, rowNumber, errors)

    if (
      category === undefined ||
      menu === undefined ||
      intensity === undefined ||
      reps === undefined ||
      (row.date && createdAt === undefined)
    ) {
      return
    }
    payloads.push({
      category,
      menu,
      intensity,
      reps,
      ...(createdAt ? { created_at: createdAt } : {}),
    })
  })

  if (errors.length > 0) {
    return { success: false, errors }
  }
  return { success: true, rows: payloads }
}
