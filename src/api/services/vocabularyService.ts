import { apiClient } from '../client'
import type { QuickTranslateApiResponse, QuickTranslateData } from '../../types/vocabulary'

export async function quickTranslate(text: string): Promise<QuickTranslateApiResponse> {
  const { data } = await apiClient.post<QuickTranslateApiResponse>('/vocabulary/quick-translate', {
    text: text.trim(),
  })
  return data
}

export type { QuickTranslateData }
