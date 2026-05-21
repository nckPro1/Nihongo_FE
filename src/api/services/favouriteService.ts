import { apiClient } from '../client'
import type { ApiResponse } from '../../types/auth'
import type { FavouriteListApiResponse } from '../../types/favourite'

export async function listFavourites(type?: string): Promise<FavouriteListApiResponse> {
  const { data } = await apiClient.get<FavouriteListApiResponse>('/favourites', {
    params: type ? { type: type.toUpperCase() } : {},
  })
  return data
}

export async function addFavourite(targetType: string, targetId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>('/favourites', {
    targetType: targetType.toUpperCase(),
    targetId,
  })
  return data
}

export async function removeFavourite(targetType: string, targetId: string): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>('/favourites', {
    params: { targetType: targetType.toUpperCase(), targetId },
  })
  return data
}
