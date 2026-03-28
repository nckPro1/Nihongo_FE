import type { PassageCompound } from '../../types/passage'

export type PassagePart =
  | { kind: 'text'; text: string }
  | { kind: 'compound'; compound: PassageCompound }

/**
 * Chia chuỗi tiếng Nhật: ưu tiên cụm dài hơn (compound) khớp substring.
 */
export function segmentJapaneseLine(japanese: string, compounds: PassageCompound[]): PassagePart[] {
  if (!japanese) return []
  const sorted = [...compounds].sort((a, b) => b.surface.length - a.surface.length)
  const parts: PassagePart[] = []
  let i = 0
  let textBuf = ''
  const flushText = () => {
    if (textBuf.length > 0) {
      parts.push({ kind: 'text', text: textBuf })
      textBuf = ''
    }
  }
  while (i < japanese.length) {
    let matched: PassageCompound | null = null
    for (const c of sorted) {
      if (c.surface && japanese.startsWith(c.surface, i)) {
        matched = c
        break
      }
    }
    if (matched) {
      flushText()
      parts.push({ kind: 'compound', compound: matched })
      i += matched.surface.length
    } else {
      const cp = japanese.codePointAt(i)
      if (cp === undefined) break
      textBuf += String.fromCodePoint(cp)
      i += cp > 0xffff ? 2 : 1
    }
  }
  flushText()
  return parts
}
