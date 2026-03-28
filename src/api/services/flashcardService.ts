import { apiClient } from '../client'
import type {
  CreateFlashcardPayload,
  FlashcardApiResponse,
  FlashcardItem,
  FlashcardListApiResponse,
} from '../../types/flashcard'

export async function listFlashcards(projectId: string): Promise<FlashcardListApiResponse> {
  const { data } = await apiClient.get<FlashcardListApiResponse>('/flashcards', {
    params: { projectId },
  })
  return data
}

export async function createFlashcard(payload: CreateFlashcardPayload): Promise<FlashcardApiResponse> {
  const { data } = await apiClient.post<FlashcardApiResponse>('/flashcards', {
    projectId: payload.projectId,
    kanji: payload.kanji,
    reading: payload.reading?.trim() || undefined,
    meaning: payload.meaning,
    direction: payload.direction || undefined,
    sourceQuery: payload.sourceQuery?.trim() || undefined,
  })
  return data
}

export type { FlashcardItem, CreateFlashcardPayload }
