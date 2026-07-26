import { describe, expect, it } from 'vitest'
import { importDailyNewRows, importTopicRows, importWorkoutRows } from '../csvImport'

describe('importDailyNewRows', () => {
  it('converts valid rows into daily_new insert payloads', () => {
    const result = importDailyNewRows([
      { title: 'title1', content: 'content1' },
      { title: 'title2', content: 'content2', date: '2026-01-15' },
    ])

    expect(result).toEqual({
      success: true,
      rows: [
        { title: 'title1', content: 'content1' },
        { title: 'title2', content: 'content2', created_at: '2026-01-15T00:00:00.000Z' },
      ],
    })
  })

  it('treats an empty date column as unspecified', () => {
    const result = importDailyNewRows([{ title: 'title1', content: 'content1', date: '' }])

    expect(result).toEqual({
      success: true,
      rows: [{ title: 'title1', content: 'content1' }],
    })
  })

  it('reports an error for a missing title', () => {
    const result = importDailyNewRows([{ title: '', content: 'content1' }])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'title は必須です' }],
    })
  })

  it('reports an error for a missing content', () => {
    const result = importDailyNewRows([{ title: 'title1', content: '' }])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'content は必須です' }],
    })
  })

  it('reports an error for a malformed date', () => {
    const result = importDailyNewRows([
      { title: 'title1', content: 'content1', date: '2026/01/15' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'date は YYYY-MM-DD 形式で指定してください' }],
    })
  })

  it('returns all errors across rows and no payloads when any row is invalid', () => {
    const result = importDailyNewRows([
      { title: '', content: 'content1' },
      { title: 'title2', content: 'content2' },
      { title: 'title3', content: '' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [
        { row: 1, reason: 'title は必須です' },
        { row: 3, reason: 'content は必須です' },
      ],
    })
  })
})

describe('importTopicRows', () => {
  it('converts valid rows into topics insert payloads with an empty persons array', () => {
    const result = importTopicRows([{ content: 'content1', date: '2026-02-01' }])

    expect(result).toEqual({
      success: true,
      rows: [{ content: 'content1', persons: [], created_at: '2026-02-01T00:00:00.000Z' }],
    })
  })

  it('reports an error for a missing content', () => {
    const result = importTopicRows([{ content: '' }])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'content は必須です' }],
    })
  })
})

describe('importWorkoutRows', () => {
  it('converts valid rows into workout_records insert payloads', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'bench press', intensity: '80', reps: '10' },
    ])

    expect(result).toEqual({
      success: true,
      rows: [{ category: 'chest', menu: 'bench press', intensity: 80, reps: 10 }],
    })
  })

  it('applies the date formatting convention when date is present', () => {
    const result = importWorkoutRows([
      { category: 'back', menu: 'pull up', intensity: '5', reps: '12', date: '2026-03-10' },
    ])

    expect(result).toEqual({
      success: true,
      rows: [
        {
          category: 'back',
          menu: 'pull up',
          intensity: 5,
          reps: 12,
          created_at: '2026-03-10T00:00:00.000Z',
        },
      ],
    })
  })

  it('reports an error for an invalid category', () => {
    const result = importWorkoutRows([
      { category: 'arms', menu: 'curl', intensity: '10', reps: '10' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'category は chest/back/legs のいずれかで指定してください' }],
    })
  })

  it('reports an error for a missing menu', () => {
    const result = importWorkoutRows([{ category: 'legs', menu: '', intensity: '10', reps: '10' }])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'menu は必須です' }],
    })
  })

  it('accepts an intensity of 0 for bodyweight exercises', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'push up', intensity: '0', reps: '10' },
    ])

    expect(result).toEqual({
      success: true,
      rows: [{ category: 'chest', menu: 'push up', intensity: 0, reps: 10 }],
    })
  })

  it('reports an error for a negative intensity', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'bench press', intensity: '-1', reps: '10' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'intensity は0以上の数値で指定してください' }],
    })
  })

  it('reports an error for a non-numeric reps', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'bench press', intensity: '10', reps: 'abc' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'reps は正の整数で指定してください' }],
    })
  })

  it('reports an error for a non-integer reps', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'bench press', intensity: '10', reps: '10.5' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'reps は正の整数で指定してください' }],
    })
  })

  it('collects multiple errors from a single row', () => {
    const result = importWorkoutRows([{ category: 'arms', menu: '', intensity: '-1', reps: '' }])

    expect(result).toEqual({
      success: false,
      errors: [
        { row: 1, reason: 'category は chest/back/legs のいずれかで指定してください' },
        { row: 1, reason: 'menu は必須です' },
        { row: 1, reason: 'intensity は0以上の数値で指定してください' },
        { row: 1, reason: 'reps は必須です' },
      ],
    })
  })

  it('reports a date-format error even when all other fields are valid', () => {
    const result = importWorkoutRows([
      { category: 'chest', menu: 'bench press', intensity: '10', reps: '10', date: '2026/03/10' },
    ])

    expect(result).toEqual({
      success: false,
      errors: [{ row: 1, reason: 'date は YYYY-MM-DD 形式で指定してください' }],
    })
  })
})
