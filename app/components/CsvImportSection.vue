<script setup lang="ts" generic="T">
import { computed, ref } from 'vue'
import { parseCsv } from '~/utils/parseCsv'
import type { CsvImportError, CsvImportResult } from '~/utils/csvImport'

const props = defineProps<{
  columns: { key: string; label: string }[]
  validate: (rows: Record<string, string>[]) => CsvImportResult<T>
  loading?: boolean
}>()

const emit = defineEmits<{
  import: [payloads: T[]]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const fileName = ref('')
const parseError = ref('')
const rowErrors = ref<CsvImportError[]>([])
const previewRows = ref<Record<string, string>[]>([])
const payloads = ref<T[]>([])

const hasResult = computed(
  () => parseError.value !== '' || rowErrors.value.length > 0 || previewRows.value.length > 0,
)
const canImport = computed(() => previewRows.value.length > 0 && !props.loading)

function resetResult() {
  parseError.value = ''
  rowErrors.value = []
  previewRows.value = []
  payloads.value = []
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  fileName.value = file.name
  resetResult()

  try {
    const text = await file.text()
    const rows = parseCsv(text)
    if (rows.length === 0) {
      parseError.value = 'CSVにデータ行がありません'
      return
    }

    const result = props.validate(rows)
    if (result.success) {
      previewRows.value = rows
      payloads.value = result.rows
    } else {
      rowErrors.value = result.errors
    }
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : 'CSVの読み込みに失敗しました'
  }
}

function handleCancel() {
  resetResult()
  fileName.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleImport() {
  if (!canImport.value) return
  emit('import', payloads.value as T[])
  handleCancel()
}
</script>

<template>
  <div class="csv-import">
    <div class="field">
      <label for="csv-import-file" class="label">CSVファイル</label>
      <input
        id="csv-import-file"
        ref="fileInputRef"
        type="file"
        accept=".csv,text/csv"
        class="file-input"
        @change="handleFileChange"
      />
    </div>

    <div v-if="hasResult" class="result">
      <p v-if="parseError" class="parse-error" role="alert">{{ parseError }}</p>

      <div v-if="rowErrors.length > 0" class="row-errors">
        <p class="row-errors-title">{{ rowErrors.length }}件のエラーがあります</p>
        <ul class="row-errors-list">
          <li v-for="(error, index) in rowErrors" :key="index" class="row-error-item">
            {{ error.row }}行目: {{ error.reason }}
          </li>
        </ul>
      </div>

      <div v-if="previewRows.length > 0" class="preview">
        <p class="preview-count">{{ previewRows.length }}件をインポートします</p>
        <div class="preview-table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in previewRows" :key="index">
                <td v-for="column in columns" :key="column.key">{{ row[column.key] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="cancel-btn" @click="handleCancel">キャンセル</button>
        <button
          v-if="previewRows.length > 0"
          type="button"
          class="import-btn"
          :disabled="!canImport"
          @click="handleImport"
        >
          登録する
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.csv-import {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 11px;
  font-weight: 700;
  color: #bab9d0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.file-input {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid #ecf1f4;
  border-radius: 4px;
  font-size: 14px;
  color: #29303e;
  background: #f1f3f7;
  box-sizing: border-box;
  font-family: inherit;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.parse-error {
  margin: 0;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.row-errors {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
}

.row-errors-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.row-errors-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-count {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #29303e;
}

.preview-table-wrapper {
  max-height: 240px;
  overflow: auto;
  border: 1px solid #ecf1f4;
  border-radius: 8px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th,
.preview-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #ecf1f4;
  white-space: nowrap;
}

.preview-table th {
  background: #f1f3f7;
  color: #bab9d0;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn {
  padding: 10px 16px;
  border: 1px solid #ecf1f4;
  border-radius: 4px;
  background: white;
  color: #29303e;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.import-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  background: #4754f0;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.import-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
