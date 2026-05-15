import { get, post } from './request'

export interface KycPendingItemDTO {
  userId: number
  username: string
  realName: string
  idCardNo: string
  idCardFrontUrl: string
  idCardBackUrl: string
  faceVideoUrl: string
  submitTime: number
  status: number
}

export interface ListPendingKycResponse {
  items: KycPendingItemDTO[]
  total: number
}

export interface AuditKycResponse {
  ok: boolean
}

export function listPendingKyc(params: { page: number; pageSize: number }): Promise<ListPendingKycResponse> {
  return get<ListPendingKycResponse>('/users/kyc/pending', { params })
}

export function auditKyc(userId: number, pass: boolean, reason?: string): Promise<AuditKycResponse> {
  return post<AuditKycResponse>(`/users/kyc/${userId}/audit`, { pass, reason })
}
