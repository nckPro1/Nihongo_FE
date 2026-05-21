import type { ApiResponse } from './auth'
import type { VocabDirection } from './vocabulary'

export type FlashcardItem = {
  id: string
  projectId?: string | null
  kanji: string
  reading?: string | null
  meaning: string
  direction?: VocabDirection | string | null
  sourceQuery?: string | null
  createdAt?: string | null
  /** 0–100 tiến độ nắm qua quiz */
  masteryScore?: number
}

export type CreateFlashcardPayload = {
  projectId: string
  kanji: string
  reading?: string | null
  meaning: string
  direction?: VocabDirection | string | null
  sourceQuery?: string | null
}

export type FlashcardApiResponse = ApiResponse<FlashcardItem>
export type FlashcardListApiResponse = ApiResponse<FlashcardItem[]>

export type BulkFlashcardItemPayload = {
  kanji: string
  reading?: string | null
  meaning: string
}

export type BulkCreateFlashcardsPayload = {
  projectId: string
  items: BulkFlashcardItemPayload[]
}

export type BulkCreateFlashcardsResult = {
  created: number
  skippedDuplicates: number
  skippedInvalid: number
}

export type BulkCreateFlashcardsApiResponse = ApiResponse<BulkCreateFlashcardsResult>
