import { post } from './request'
import type { LoginRequest, LoginResponse, RefreshResponse, ApiResponse } from '@/types/api'

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const body = await post<ApiResponse<LoginResponse> & LoginResponse>('/login', req)
  // Backend may return {code,data:{...}} or flat fields; support both
  if (body && (body as ApiResponse<LoginResponse>).data) {
    return (body as ApiResponse<LoginResponse>).data as LoginResponse
  }
  return body as unknown as LoginResponse
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const body = await post<ApiResponse<RefreshResponse> & RefreshResponse>('/refresh', { refreshToken })
  if (body && (body as ApiResponse<RefreshResponse>).data) {
    return (body as ApiResponse<RefreshResponse>).data as RefreshResponse
  }
  return body as unknown as RefreshResponse
}

export async function logout(): Promise<void> {
  await post<unknown>('/logout', {})
}
