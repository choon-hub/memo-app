import { describe, expect, it } from 'vitest'
import { toDateInputValue } from '../date'

describe('toDateInputValue', () => {
  it('converts a full ISO timestamp into a YYYY-MM-DD string', () => {
    expect(toDateInputValue('2026-01-15T12:00:00.000Z')).toBe('2026-01-15')
  })

  it('pads single-digit months and days with leading zeros', () => {
    expect(toDateInputValue('2026-03-05T12:00:00.000Z')).toBe('2026-03-05')
  })

  it('converts an ISO timestamp with a non-midnight time', () => {
    expect(toDateInputValue('2026-07-28T09:30:00.000Z')).toBe('2026-07-28')
  })

  it('returns the UTC calendar date regardless of the local runtime timezone', () => {
    expect(toDateInputValue('2026-07-28T23:30:00.000Z')).toBe('2026-07-28')
  })
})
