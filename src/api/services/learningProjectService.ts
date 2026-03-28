import { apiClient } from '../client'
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

export type { LearningProjectItem, CreateLearningProjectPayload }
