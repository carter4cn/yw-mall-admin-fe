import { get, post } from './request'
import type { Activity, PageParams } from '@/types/api'

export interface ActivityListResponse {
  total: number
  activities: Activity[]
}

export function listActivities(params: PageParams) {
  return get<ActivityListResponse>('/activities', { params })
}

export interface ActivityUpsertRequest {
  id?: number
  code: string
  title: string
  type: string
  startTime: number
  endTime: number
  status?: number
}

export function createActivity(req: ActivityUpsertRequest) {
  return post('/activities', req)
}

export function updateActivity(id: number, req: ActivityUpsertRequest) {
  return post(`/activities/${id}`, req)
}

export function updateActivityStatus(id: number, status: number) {
  return post(`/activities/${id}/status`, { status })
}
