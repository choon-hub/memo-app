import { describe, expect, it } from 'vitest'
import { parseCsv } from '../parseCsv'

describe('parseCsv', () => {
  it('parses a header row and data rows into an array of records', () => {
    const csv = 'name,age\nAlice,30\nBob,25'

    expect(parseCsv(csv)).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(parseCsv('')).toEqual([])
  })

  it('returns an empty array when only a header row is present', () => {
    expect(parseCsv('name,age')).toEqual([])
  })

  it('handles a trailing newline without producing an extra row', () => {
    const csv = 'name,age\nAlice,30\n'

    expect(parseCsv(csv)).toEqual([{ name: 'Alice', age: '30' }])
  })

  it('skips empty lines', () => {
    const csv = 'name,age\nAlice,30\n\nBob,25\n'

    expect(parseCsv(csv)).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ])
  })

  it('parses a quoted field containing a comma', () => {
    const csv = 'name,note\nAlice,"Tokyo, Japan"'

    expect(parseCsv(csv)).toEqual([{ name: 'Alice', note: 'Tokyo, Japan' }])
  })

  it('parses a quoted field containing a newline', () => {
    const csv = 'name,note\nAlice,"line1\nline2"'

    expect(parseCsv(csv)).toEqual([{ name: 'Alice', note: 'line1\nline2' }])
  })

  it('unescapes double-doublequotes into a single double-quote', () => {
    const csv = 'name,quote\nAlice,"She said ""hi"""'

    expect(parseCsv(csv)).toEqual([{ name: 'Alice', quote: 'She said "hi"' }])
  })

  it('throws a line-numbered error when a row has too few columns', () => {
    const csv = 'name,age,city\nAlice,30'

    expect(() => parseCsv(csv)).toThrow('Line 2')
  })

  it('throws a line-numbered error when a row has too many columns', () => {
    const csv = 'name,age\nAlice,30,Tokyo'

    expect(() => parseCsv(csv)).toThrow('Line 2')
  })

  it('reports the correct line number for a mismatched row after a multi-line quoted field', () => {
    const csv = 'name,note,age\nAlice,"line1\nline2",30\nBob,25'

    expect(() => parseCsv(csv)).toThrow('Line 4')
  })
})
