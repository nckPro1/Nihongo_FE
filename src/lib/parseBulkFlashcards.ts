/** Một dòng hợp lệ sau khi parse (gửi lên API batch). */
export type ParsedBulkFlashcardRow = {
  kanji: string
  reading?: string
  meaning: string
}

export type ParseBulkFlashcardsResult = {
  items: ParsedBulkFlashcardRow[]
  /** Dòng không rỗng nhưng không đủ cột / không nhận diện định dạng */
  invalidLineCount: number
}

function trimParts(parts: string[]): string[] {
  return parts.map((p) => p.trim())
}

/**
 * Nhận diện từng dòng:
 * - Tab: `tiếng Nhật \\t nghĩa` hoặc `tiếng Nhật \\t đọc \\t nghĩa`
 * - Dấu |: `tiếng Nhật | nghĩa` hoặc `tiếng Nhật | đọc | nghĩa`
 * - Gạch ngang có khoảng trắng: `tiếng Nhật - nghĩa` (chỉ tách lần đầu ` - `)
 */
export function parseBulkFlashcardLines(raw: string): ParseBulkFlashcardsResult {
  const lines = raw.split(/\r?\n/)
  const items: ParsedBulkFlashcardRow[] = []
  let invalidLineCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    let kanji = ''
    let reading: string | undefined
    let meaning = ''

    if (trimmed.includes('\t')) {
      const p = trimParts(trimmed.split('\t'))
      if (p.length >= 3) {
        kanji = p[0]!
        const r = p[1]!.trim()
        reading = r.length > 0 ? r : undefined
        meaning = p.slice(2).join('\t')
      } else if (p.length === 2) {
        ;[kanji, meaning] = [p[0]!, p[1]!]
      } else {
        invalidLineCount++
        continue
      }
    } else if (trimmed.includes('|')) {
      const p = trimParts(trimmed.split('|'))
      if (p.length >= 3) {
        kanji = p[0]!
        const r = p[1]!.trim()
        reading = r.length > 0 ? r : undefined
        meaning = p.slice(2).join('|')
      } else if (p.length === 2) {
        ;[kanji, meaning] = [p[0]!, p[1]!]
      } else {
        invalidLineCount++
        continue
      }
    } else {
      const idx = trimmed.indexOf(' - ')
      if (idx > 0 && idx < trimmed.length - 3) {
        kanji = trimmed.slice(0, idx).trim()
        meaning = trimmed.slice(idx + 3).trim()
      } else {
        invalidLineCount++
        continue
      }
    }

    if (!kanji || !meaning) {
      invalidLineCount++
      continue
    }

    items.push({
      kanji,
      ...(reading && reading.length > 0 ? { reading } : {}),
      meaning,
    })
  }

  return { items, invalidLineCount }
}
