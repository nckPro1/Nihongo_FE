import type { ApiResponse } from './auth'

export type LearningProjectItem = {
  id: string
  name: string
  description?: string | null
  createdAt?: string | null
  cardCount: number
}

export type CreateLearningProjectPayload = {
  name: string
  description?: string | null
}

export type LearningProjectApiResponse = ApiResponse<LearningProjectItem>
export type LearningProjectListApiResponse = ApiResponse<LearningProjectItem[]>
