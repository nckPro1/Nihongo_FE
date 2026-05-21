import { apiClient } from '../client'
import type { ApiResponse } from '../../types/auth'
import type {
  CreateLearningProjectPayload,
  LearningProjectApiResponse,
  LearningProjectItem,
  LearningProjectListApiResponse,
} from '../../types/learningProject'

export async function listLearningProjects(): Promise<LearningProjectListApiResponse> {
  const { data } = await apiClient.get<LearningProjectListApiResponse>('/learning-projects')
  return data
}

export async function createLearningProject(
  payload: CreateLearningProjectPayload,
): Promise<LearningProjectApiResponse> {
  const { data } = await apiClient.post<LearningProjectApiResponse>('/learning-projects', {
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
  })
  return data
}

export type QuizResultLine = { flashcardId: string; correct: boolean }

export async function submitQuizResults(
  projectId: string,
  results: QuizResultLine[],
): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(`/learning-projects/${projectId}/quiz-results`, {
    results,
  })
  return data
}

export async function deleteLearningProject(id: string): Promise<{ success: boolean; message?: string }> {
  const { data } = await apiClient.delete(`/learning-projects/${id}`)
  return data
}

export type { LearningProjectItem, CreateLearningProjectPayload }
