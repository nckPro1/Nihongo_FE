import { apiClient } from '../client'
import type {
  BulkCreateFlashcardsApiResponse,
  BulkCreateFlashcardsPayload,
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

const BATCH_MAX = 300

export async function createFlashcardsBatch(
  payload: BulkCreateFlashcardsPayload,
): Promise<BulkCreateFlashcardsApiResponse> {
  const { projectId, items } = payload
  if (items.length <= BATCH_MAX) {
    const { data } = await apiClient.post<BulkCreateFlashcardsApiResponse>('/flashcards/batch', {
      projectId,
      items: items.map((i) => ({
        kanji: i.kanji,
        reading: i.reading?.trim() || undefined,
        meaning: i.meaning,
      })),
    })
    return data
  }

  let created = 0
  let skippedDuplicates = 0
  let skippedInvalid = 0

  for (let i = 0; i < items.length; i += BATCH_MAX) {
    const chunk = items.slice(i, i + BATCH_MAX)
    const { data } = await apiClient.post<BulkCreateFlashcardsApiResponse>('/flashcards/batch', {
      projectId,
      items: chunk.map((row) => ({
        kanji: row.kanji,
        reading: row.reading?.trim() || undefined,
        meaning: row.meaning,
      })),
    })
    if (!data.success || !data.data) {
      return data
    }
    created += data.data.created
    skippedDuplicates += data.data.skippedDuplicates
    skippedInvalid += data.data.skippedInvalid
  }

  const parts = [`Đã thêm ${created} thẻ`]
  if (skippedDuplicates > 0) parts.push(`bỏ qua ${skippedDuplicates} trùng`)
  if (skippedInvalid > 0) parts.push(`${skippedInvalid} dòng không hợp lệ`)
  return {
    success: true,
    message: parts.join(', ') + '.',
    data: { created, skippedDuplicates, skippedInvalid },
  }
}

export async function deleteFlashcard(id: string): Promise<{ success: boolean; message?: string }> {
  const { data } = await apiClient.delete(`/flashcards/${id}`)
  return data
}

export type { FlashcardItem, CreateFlashcardPayload }
