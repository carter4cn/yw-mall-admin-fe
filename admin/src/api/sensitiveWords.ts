import { del, get, post } from './request'
import type { PageParams, SensitiveWord } from '@/types/api'

export interface SensitiveWordListResponse {
  total: number
  words: SensitiveWord[]
}

export function listSensitiveWords(params: PageParams) {
  return get<SensitiveWordListResponse>('/sensitive-words', { params })
}

export interface CreateSensitiveWordRequest {
  word: string
  category?: string
  action?: string
}

export function createSensitiveWord(req: CreateSensitiveWordRequest) {
  return post('/sensitive-words', req)
}

export function deleteSensitiveWord(id: number) {
  return del(`/sensitive-words/${id}`)
}
