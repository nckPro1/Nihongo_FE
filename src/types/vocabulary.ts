import type { ApiResponse } from './auth'

/** Phản hồi tra cứu nhanh — khớp JSON gọn từ backend (tiết kiệm output token). */
export type VocabDirection = 'jp_vi' | 'vi_jp'

export type QuickTranslateData = {
  kanji?: string | null
  romaji?: string | null
  meaning?: string | null
  /** jp_vi: Nhật→Việt; vi_jp: Việt→Nhật */
  direction?: VocabDirection | string | null
}

export type QuickTranslateApiResponse = ApiResponse<QuickTranslateData>
