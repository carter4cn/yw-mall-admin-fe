import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { LoginRequest, LoginResponse } from '@/types/api'
import { login as loginApi } from '@/api/auth'

const STORAGE_KEY = 'yw-mall-admin-user'

interface PersistedState {
  token: string
  uid: number
  username: string
  role: string
  perms: string[]
  shopId: number
}

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const persisted = loadFromStorage()

  const token = ref<string>(persisted?.token ?? '')
  const uid = ref<number>(persisted?.uid ?? 0)
  const username = ref<string>(persisted?.username ?? '')
  const role = ref<string>(persisted?.role ?? '')
  const perms = ref<string[]>(persisted?.perms ?? [])
  const shopId = ref<number>(persisted?.shopId ?? 0)

  function persist() {
    const state: PersistedState = {
      token: token.value,
      uid: uid.value,
      username: username.value,
      role: role.value,
      perms: perms.value,
      shopId: shopId.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  watch([token, uid, username, role, perms, shopId], () => {
    if (token.value) {
      persist()
    }
  }, { deep: true })

  async function login(req: LoginRequest): Promise<LoginResponse> {
    const resp = await loginApi(req)
    token.value = resp.token
    uid.value = resp.uid
    role.value = resp.role
    perms.value = resp.perms ?? []
    shopId.value = resp.shopId ?? 0
    username.value = resp.username ?? req.username
    persist()
    return resp
  }

  function logout() {
    token.value = ''
    uid.value = 0
    username.value = ''
    role.value = ''
    perms.value = []
    shopId.value = 0
    localStorage.removeItem(STORAGE_KEY)
  }

  function hasPerm(p: string): boolean {
    if (role.value === 'super_admin') return true
    if (!p) return true
    return perms.value.includes(p)
  }

  return {
    token,
    uid,
    username,
    role,
    perms,
    shopId,
    login,
    logout,
    hasPerm,
  }
})
