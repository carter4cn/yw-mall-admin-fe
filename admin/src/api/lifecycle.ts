import { get, post } from './request'
import type { LifecycleRequest, PageParams, ReviewRequest } from '@/types/api'

export interface LifecycleListResponse {
  total: number
  requests: LifecycleRequest[]
}

export interface LifecycleListParams extends PageParams {
  status?: number
}

export function listLifecycleRequests(params: LifecycleListParams) {
  return get<LifecycleListResponse>('/shop-lifecycle-requests', { params })
}

export function reviewLifecycleRequest(id: number, req: ReviewRequest) {
  return post(`/shop-lifecycle-requests/${id}/review`, req)
}
