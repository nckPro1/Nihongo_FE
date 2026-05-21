import type { ApiResponse } from './auth'

export const GRAMMAR_JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
export type GrammarJlptLevel = (typeof GRAMMAR_JLPT_LEVELS)[number]

export type GrammarLevelSummary = {
  level: string
  grammarCount: number
  groupCount: number
}

export type GrammarGroupSummary = {
  id: string
  jlptLevel: string
  name: string
  description?: string | null
  sortOrder: number
  pointCount: number
}

export type GrammarPointListItem = {
  id: string
  groupId: string
  groupName: string
  title: string
  meaningSummary: string
  sortOrder: number
  favourite: boolean
}

export type GrammarExample = {
  ja: string
  vi?: string | null
  register?: string | null
}

export type GrammarPointDetail = {
  id: string
  groupId: string
  jlptLevel: string
  groupName: string
  title: string
  formula?: string | null
  meaning: string
  context?: string | null
  note?: string | null
  examples: GrammarExample[]
  sortOrder: number
  favourite: boolean
  previousId?: string | null
  nextId?: string | null
}

export type GrammarLevelsApiResponse = ApiResponse<GrammarLevelSummary[]>
export type GrammarGroupsApiResponse = ApiResponse<GrammarGroupSummary[]>
export type GrammarPointsApiResponse = ApiResponse<GrammarPointListItem[]>
export type GrammarPointDetailApiResponse = ApiResponse<GrammarPointDetail>

export const FAVOURITE_TARGET_GRAMMAR = 'GRAMMAR'
export const FAVOURITE_TARGET_BLOG = 'BLOG'
