import { post } from './request'
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types/api'

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const body = await post<ApiResponse<LoginResponse> & LoginResponse>('/login', req)
  // Backend may return {code,data:{...}} or flat fields; support both
  if (body && (body as ApiResponse<LoginResponse>).data) {
    return (body as ApiResponse<LoginResponse>).data as LoginResponse
  }
  return body as unknown as LoginResponse
}
