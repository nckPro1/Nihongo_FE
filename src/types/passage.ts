import type { ApiResponse } from './auth'

export type PassageDirection = 'jp_vi' | 'vi_jp'

export type PassageCompound = {
  surface: string
  reading: string
  glossVi: string
}

export type PassageTranslateData = {
  direction?: PassageDirection | string | null
  japanese?: string | null
  vietnamese?: string | null
  hiraganaLine?: string | null
  compounds?: PassageCompound[] | null
}

export type PassageTranslateApiResponse = ApiResponse<PassageTranslateData>
