import { get, post } from './request'
import type { PageParams, UserItem } from '@/types/api'

export interface UserListResponse {
  total: number
  users: UserItem[]
}

export function listUsers(params: PageParams) {
  return get<UserListResponse>('/users', { params })
}

export interface UserStatusRequest {
  status: number
  reason?: string
}

export function updateUserStatus(id: number, req: UserStatusRequest) {
  return post(`/users/${id}/status`, req)
}
