import { apiClient } from '../client'
import type { PassageTranslateApiResponse } from '../../types/passage'

/** Khớp PassageTranslateRequest.MAX_CHARS backend */
export const PASSAGE_MAX_CHARS = 2500

export async function passageTranslate(text: string): Promise<PassageTranslateApiResponse> {
  const { data } = await apiClient.post<PassageTranslateApiResponse>('/vocabulary/passage-translate', {
    text: text.trim(),
  })
  return data
}
