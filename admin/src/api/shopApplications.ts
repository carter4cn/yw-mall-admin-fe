import { get, post } from './request'
import type { PageParams, ReviewRequest, ShopApplication } from '@/types/api'

export interface ShopApplicationListResponse {
  total: number
  applications: ShopApplication[]
}

export interface ShopApplicationListParams extends PageParams {
  status?: number
}

export function listShopApplications(params: ShopApplicationListParams) {
  return get<ShopApplicationListResponse>('/shop-applications', { params })
}

export function getShopApplication(id: number) {
  return get<ShopApplication>(`/shop-applications/${id}`)
}

export function reviewShopApplication(id: number, req: ReviewRequest) {
  return post(`/shop-applications/${id}/review`, req)
}
