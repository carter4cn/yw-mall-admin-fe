import { get, post } from './request'
import type { PageParams, Shop } from '@/types/api'

export interface ShopListResponse {
  total: number
  shops: Shop[]
}

export function listShops(params: PageParams) {
  return get<ShopListResponse>('/shops', { params })
}

export interface ShopStatusRequest {
  status: number
  reason?: string
}

export function updateShopStatus(id: number, req: ShopStatusRequest) {
  return post(`/shops/${id}/status`, req)
}

export interface ShopCreditRequest {
  delta: number
  reason?: string
}

export function updateShopCredit(id: number, req: ShopCreditRequest) {
  return post(`/shops/${id}/credit`, req)
}
