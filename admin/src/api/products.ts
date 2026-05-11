import { get, post } from './request'
import type { PageParams, Product, ReviewRequest } from '@/types/api'

export interface ProductListResponse {
  total: number
  products: Product[]
}

export function listProductsForReview(params: PageParams) {
  return get<ProductListResponse>('/products/review', { params })
}

export function reviewProduct(id: number, req: ReviewRequest) {
  return post(`/products/${id}/review`, req)
}
