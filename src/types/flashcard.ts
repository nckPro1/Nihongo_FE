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
