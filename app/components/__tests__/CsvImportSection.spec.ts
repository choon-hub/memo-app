import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import CsvImportSection from '../CsvImportSection.vue'
import type { CsvImportResult } from '~/utils/csvImport'

interface Payload {
  title: string
  content: string
}

const columns = [
  { key: 'title', label: 'タイトル' },
  { key: 'content', label: '内容' },
]

function createFile(content: string, name = 'import.csv') {
  return new File([content], name, { type: 'text/csv' })
}

async function selectFile(wrapper: ReturnType<typeof mount>, file: File) {
  const input = wrapper.find('input[type="file"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await wrapper.find('input[type="file"]').trigger('change')
  await flushPromises()
}

function mountSection(validate: (rows: Record<string, string>[]) => CsvImportResult<Payload>) {
  return mount(CsvImportSection, { props: { columns, validate } })
}

describe('CsvImportSection', () => {
  it('shows a preview list and count when the CSV is valid', async () => {
    const validate = vi.fn(
      (rows: Record<string, string>[]): CsvImportResult<Payload> => ({
        success: true,
        rows: rows.map((row) => ({ title: row.title ?? '', content: row.content ?? '' })),
      }),
    )
    const wrapper = mountSection(validate)

    await selectFile(wrapper, createFile('title,content\nタイトル1,内容1\nタイトル2,内容2'))

    expect(validate).toHaveBeenCalledWith([
      { title: 'タイトル1', content: '内容1' },
      { title: 'タイトル2', content: '内容2' },
    ])
    expect(wrapper.text()).toContain('2件をインポートします')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.find('button.import-btn').attributes('disabled')).toBeUndefined()
  })

  it('hides the import button and lists row numbers and reasons when rows are invalid', async () => {
    const validate = vi.fn(
      (): CsvImportResult<Payload> => ({
        success: false,
        errors: [
          { row: 1, reason: 'title は必須です' },
          { row: 2, reason: 'content は必須です' },
        ],
      }),
    )
    const wrapper = mountSection(validate)

    await selectFile(wrapper, createFile('title,content\n,内容1\nタイトル2,'))

    expect(wrapper.find('button.import-btn').exists()).toBe(false)
    expect(wrapper.text()).toContain('2件のエラーがあります')
    expect(wrapper.text()).toContain('1行目: title は必須です')
    expect(wrapper.text()).toContain('2行目: content は必須です')
  })

  it('shows a parse error and no import button when the CSV is malformed', async () => {
    const validate = vi.fn()
    const wrapper = mountSection(validate)

    await selectFile(wrapper, createFile('title,content\nタイトル1'))

    expect(validate).not.toHaveBeenCalled()
    expect(wrapper.find('.parse-error').exists()).toBe(true)
    expect(wrapper.find('button.import-btn').exists()).toBe(false)
  })

  it('emits import with the validated payloads when the import button is clicked, then clears the preview', async () => {
    const validate = vi.fn(
      (rows: Record<string, string>[]): CsvImportResult<Payload> => ({
        success: true,
        rows: rows.map((row) => ({ title: row.title ?? '', content: row.content ?? '' })),
      }),
    )
    const wrapper = mountSection(validate)

    await selectFile(wrapper, createFile('title,content\nタイトル1,内容1'))
    await wrapper.find('button.import-btn').trigger('click')

    const emitted = wrapper.emitted('import')
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toEqual([{ title: 'タイトル1', content: '内容1' }])
    expect(wrapper.find('.result').exists()).toBe(false)
  })

  it('discards the preview and resets the file input when cancel is clicked', async () => {
    const validate = vi.fn(
      (rows: Record<string, string>[]): CsvImportResult<Payload> => ({
        success: true,
        rows: rows.map((row) => ({ title: row.title ?? '', content: row.content ?? '' })),
      }),
    )
    const wrapper = mountSection(validate)

    await selectFile(wrapper, createFile('title,content\nタイトル1,内容1'))
    await wrapper.find('button.cancel-btn').trigger('click')

    expect(wrapper.find('.result').exists()).toBe(false)
    expect((wrapper.find('input[type="file"]').element as HTMLInputElement).value).toBe('')
    expect(wrapper.emitted('import')).toBeUndefined()
  })

  it('disables the import button while loading', async () => {
    const validate = vi.fn(
      (rows: Record<string, string>[]): CsvImportResult<Payload> => ({
        success: true,
        rows: rows.map((row) => ({ title: row.title ?? '', content: row.content ?? '' })),
      }),
    )
    const wrapper = mount(CsvImportSection, { props: { columns, validate, loading: true } })

    await selectFile(wrapper, createFile('title,content\nタイトル1,内容1'))

    expect(wrapper.find('button.import-btn').attributes('disabled')).toBeDefined()
  })
})
