import { get, post } from './request'
import type { PageParams, ReviewRequest, Withdrawal } from '@/types/api'

export interface WithdrawalListResponse {
  total: number
  withdrawals: Withdrawal[]
}

export interface WithdrawalListParams extends PageParams {
  status?: number
}

export function listWithdrawals(params: WithdrawalListParams) {
  return get<WithdrawalListResponse>('/withdrawals', { params })
}

export function handleWithdrawal(id: number, req: ReviewRequest) {
  return post(`/withdrawals/${id}/handle`, req)
}
