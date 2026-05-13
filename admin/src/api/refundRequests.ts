import { get, post } from './request'

export interface RefundItemDTO {
  skuId: number
  skuName: string
  quantity: number
  amount: number
}

export interface RefundInfo {
  id: number
  orderId: number
  orderNo: string
  userId: number
  shopId: number
  amount: number
  reason: string
  evidence?: string[]
  items?: RefundItemDTO[]
  status: number
  merchantUserId?: number
  merchantRemark?: string
  merchantHandleTime?: number
  adminId?: number
  adminRemark?: string
  adminHandleTime?: number
  appealReason?: string
  appealTime?: number
  refundNo?: string
  refundCompleteTime?: number
  createTime: number
}

export interface RefundListResponse {
  total: number
  requests: RefundInfo[]
}

export interface RefundListParams {
  status?: number
  page?: number
  page_size?: number
}

export function listArbitrations(params: RefundListParams) {
  return get<RefundListResponse>('/refunds/arbitrations', { params })
}

export function arbitrateRefund(id: number, body: { action: number; remark?: string }) {
  return post(`/refunds/${id}/arbitrate`, body)
}
