import { get, post } from './request'
import type { PageParams, Rule } from '@/types/api'

export interface RuleListResponse {
  total: number
  rules: Rule[]
}

export function listRules(params: PageParams) {
  return get<RuleListResponse>('/rules', { params })
}

export interface RuleUpsertRequest {
  code: string
  description?: string
  expression: string
  status?: number
}

export function createRule(req: RuleUpsertRequest) {
  return post('/rules', req)
}

export interface ValidateRuleResponse {
  valid: boolean
  message?: string
}

export function validateRule(expression: string) {
  return post<ValidateRuleResponse>('/rules/validate', { expression })
}
