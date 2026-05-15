import { get } from './request'

export interface OpLogEntryDTO {
  id: number
  actorId: number
  actorRole: string
  method: string
  path: string
  requestBody: string
  statusCode: number
  ip: string
  createTime: number
}

export interface OpLogQueryParams {
  actorId?: number
  actorRole?: string
  method?: string
  path?: string
  statusMin?: number
  statusMax?: number
  since?: number
  until?: number
  page: number
  pageSize: number
}

export interface QueryOpLogResponse {
  total: number
  items: OpLogEntryDTO[]
}

export function queryOpLog(params: OpLogQueryParams): Promise<QueryOpLogResponse> {
  return get<QueryOpLogResponse>('/op-log', { params })
}
