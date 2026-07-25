interface CsvRow {
  line: number
  fields: string[]
}

function isEmptyRow(fields: string[]): boolean {
  return fields.length === 1 && fields[0] === ''
}

function tokenizeRows(input: string): CsvRow[] {
  const rows: CsvRow[] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let line = 1
  let rowStartLine = 1

  const pushField = (): void => {
    row.push(field)
    field = ''
  }

  const pushRow = (): void => {
    pushField()
    rows.push({ line: rowStartLine, fields: row })
    row = []
  }

  let i = 0
  const len = input.length

  while (i < len) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      if (char === '\n') {
        line += 1
      }
      field += char
      i += 1
      continue
    }

    switch (char) {
      case '"':
        inQuotes = true
        i += 1
        break
      case ',':
        pushField()
        i += 1
        break
      case '\r':
        i += 1
        break
      case '\n':
        pushRow()
        line += 1
        rowStartLine = line
        i += 1
        break
      default:
        field += char
        i += 1
    }
  }

  if (field !== '' || row.length > 0) {
    pushRow()
  }

  return rows
}

export function parseCsv(input: string): Record<string, string>[] {
  const rows = tokenizeRows(input)
  if (rows.length === 0) {
    return []
  }

  const [header, ...dataRows] = rows
  if (!header) {
    return []
  }
  const columns = header.fields
  const records: Record<string, string>[] = []

  for (const row of dataRows) {
    if (isEmptyRow(row.fields)) {
      continue
    }

    if (row.fields.length !== columns.length) {
      throw new Error(
        `Line ${row.line}: expected ${columns.length} columns but got ${row.fields.length}`,
      )
    }

    const record: Record<string, string> = {}
    columns.forEach((column, index) => {
      record[column] = row.fields[index] ?? ''
    })
    records.push(record)
  }

  return records
}
