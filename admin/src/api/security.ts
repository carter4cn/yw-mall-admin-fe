import { get, post, del } from './request'

interface ApiWrap<T> { data?: T }

async function unwrap<T>(p: Promise<ApiWrap<T> & T>): Promise<T> {
  const body = await p
  if (body && (body as ApiWrap<T>).data) return (body as ApiWrap<T>).data as T
  return body as unknown as T
}

export interface MfaStatusResp {
  enabled: boolean
  lastUsedAt: number
}

export interface MfaEnableResp {
  totpSecret: string
  qrUrl: string
  backupCodes: string[]
}

export interface OkResp {
  ok: boolean
}

export interface IpWhitelistEntry {
  id: number
  adminId: number
  cidr: string
  note: string
  createTime: number
}

export interface IpWhitelistResp {
  items: IpWhitelistEntry[]
}

export interface AddIpWhitelistResp {
  id: number
}

export function mfaStatus(): Promise<MfaStatusResp> {
  return unwrap(get<ApiWrap<MfaStatusResp> & MfaStatusResp>('/profile/mfa'))
}

export function mfaEnable(): Promise<MfaEnableResp> {
  return unwrap(post<ApiWrap<MfaEnableResp> & MfaEnableResp>('/profile/mfa/enable'))
}

export function mfaConfirm(code: string): Promise<OkResp> {
  return unwrap(post<ApiWrap<OkResp> & OkResp>('/profile/mfa/confirm', { code }))
}

export function mfaDisable(code: string): Promise<OkResp> {
  return unwrap(post<ApiWrap<OkResp> & OkResp>('/profile/mfa/disable', { code }))
}

export function changePassword(oldPassword: string, newPassword: string): Promise<OkResp> {
  return unwrap(post<ApiWrap<OkResp> & OkResp>('/profile/password', { oldPassword, newPassword }))
}

export function listIpWhitelist(): Promise<IpWhitelistResp> {
  return unwrap(get<ApiWrap<IpWhitelistResp> & IpWhitelistResp>('/security/ip-whitelist'))
}

export function addIpWhitelist(cidr: string, note?: string): Promise<AddIpWhitelistResp> {
  return unwrap(post<ApiWrap<AddIpWhitelistResp> & AddIpWhitelistResp>('/security/ip-whitelist', { cidr, note }))
}

export function deleteIpWhitelist(id: number): Promise<OkResp> {
  return unwrap(del<ApiWrap<OkResp> & OkResp>(`/security/ip-whitelist/${id}`))
}
