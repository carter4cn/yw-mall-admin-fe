import { get, post } from './request'
import type { PageParams, ReviewDeleteRequest, ReviewRequest } from '@/types/api'

export interface ReviewDeleteListResponse {
  total: number
  requests: ReviewDeleteRequest[]
}

export interface ReviewDeleteListParams extends PageParams {
  status?: number
}

export function listReviewDeleteRequests(params: ReviewDeleteListParams) {
  return get<ReviewDeleteListResponse>('/reviews/delete-requests', { params })
}

export function handleReviewDeleteRequest(id: number, req: ReviewRequest) {
  return post(`/reviews/delete-requests/${id}/handle`, req)
}
