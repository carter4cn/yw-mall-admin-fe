import { get, post } from './request'
import type { Complaint, PageParams, ReviewRequest } from '@/types/api'

export interface ComplaintListResponse {
  total: number
  complaints: Complaint[]
}

export interface ComplaintListParams extends PageParams {
  status?: number
}

export function listComplaints(params: ComplaintListParams) {
  return get<ComplaintListResponse>('/complaints', { params })
}

export function handleComplaint(id: number, req: ReviewRequest) {
  return post(`/complaints/${id}/handle`, req)
}
