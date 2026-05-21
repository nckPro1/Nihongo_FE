import { apiClient } from '../client'
import type {
  GrammarGroupsApiResponse,
  GrammarLevelsApiResponse,
  GrammarPointDetailApiResponse,
  GrammarPointsApiResponse,
} from '../../types/grammar'

export async function listGrammarLevels(): Promise<GrammarLevelsApiResponse> {
  const { data } = await apiClient.get<GrammarLevelsApiResponse>('/grammar/levels')
  return data
}

export async function listGrammarGroups(level: string): Promise<GrammarGroupsApiResponse> {
  const { data } = await apiClient.get<GrammarGroupsApiResponse>('/grammar/groups', {
    params: { level: level.toUpperCase() },
  })
  return data
}

export async function listGrammarPoints(params: {
  level: string
  groupId?: string
  q?: string
}): Promise<GrammarPointsApiResponse> {
  const { data } = await apiClient.get<GrammarPointsApiResponse>('/grammar/points', {
    params: {
      level: params.level.toUpperCase(),
      groupId: params.groupId || undefined,
      q: params.q?.trim() || undefined,
    },
  })
  return data
}

export async function getGrammarPointDetail(id: string): Promise<GrammarPointDetailApiResponse> {
  const { data } = await apiClient.get<GrammarPointDetailApiResponse>(`/grammar/points/${id}`)
  return data
}
