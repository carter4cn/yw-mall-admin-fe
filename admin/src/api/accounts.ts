import { get, post } from './request'
import type { Account, PageParams } from '@/types/api'

export interface AccountListResponse {
  total: number
  accounts: Account[]
}

export function listAccounts(params: PageParams) {
  return get<AccountListResponse>('/accounts', { params })
}

export interface CreateAccountRequest {
  username: string
  password: string
  email?: string
  role: string
}

export function createAccount(req: CreateAccountRequest) {
  return post('/accounts', req)
}
