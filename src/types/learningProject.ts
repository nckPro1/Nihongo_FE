import type { ApiResponse } from './auth'

export type LearningProjectItem = {
  id: string
  name: string
  description?: string | null
  createdAt?: string | null
  cardCount: number
  /** Trung bình điểm nắm (0–100) trên mọi thẻ; thẻ chưa quiz = 0 */
  progressPercent?: number
  /** Thẻ có mastery ≥ 80 */
  masteredCardCount?: number
}

export type CreateLearningProjectPayload = {
  name: string
  description?: string | null
}

export type LearningProjectApiResponse = ApiResponse<LearningProjectItem>
export type LearningProjectListApiResponse = ApiResponse<LearningProjectItem[]>
