import type { ApiResponse } from './auth'

export type FavouriteItem = {
  targetType: string
  targetId: string
  createdAt: string
  title: string
  detail?: string | null
  grammarJlptLevel?: string | null
  resourceMissing: boolean
}

export type FavouriteListApiResponse = ApiResponse<FavouriteItem[]>
