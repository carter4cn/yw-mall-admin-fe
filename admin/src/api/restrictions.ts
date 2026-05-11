import { del, get, post } from './request'
import type { Restriction } from '@/types/api'

export interface RestrictionListResponse {
  total: number
  restrictions: Restriction[]
}

export function listShopRestrictions(shopId: number) {
  return get<RestrictionListResponse>(`/shops/${shopId}/restrictions`)
}

export interface AddRestrictionRequest {
  restriction: string
  reason?: string
  expireTime?: number
}

export function addShopRestriction(shopId: number, req: AddRestrictionRequest) {
  return post(`/shops/${shopId}/restrictions`, req)
}

export function removeShopRestriction(shopId: number, rid: number) {
  return del(`/shops/${shopId}/restrictions/${rid}`)
}
