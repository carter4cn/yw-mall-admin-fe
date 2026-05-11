import { get, post } from './request'
import type { LevelApplication, PageParams, ReviewRequest } from '@/types/api'

export interface LevelApplicationListResponse {
  total: number
  applications: LevelApplication[]
}

export interface LevelApplicationListParams extends PageParams {
  status?: number
}

export function listLevelApplications(params: LevelApplicationListParams) {
  return get<LevelApplicationListResponse>('/level-applications', { params })
}

export function reviewLevelApplication(id: number, req: ReviewRequest) {
  return post(`/level-applications/${id}/review`, req)
}
