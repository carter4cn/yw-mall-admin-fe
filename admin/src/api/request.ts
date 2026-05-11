import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'yw-mall-admin-user'

function readToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token ?? null
  } catch {
    return null
  }
}

const request: AxiosInstance = axios.create({
  baseURL: '/admin/v1',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (resp) => {
    const body = resp.data
    // 401 surfaces here normally as an HTTP 200 with code? Backend may use both:
    if (body && typeof body === 'object' && 'code' in body) {
      const code = (body as { code: number }).code
      if (code !== 0) {
        const message = (body as { message?: string }).message ?? '请求失败'
        ElMessage.error(message)
        return Promise.reject(new Error(message))
      }
      // Return the entire body so callers can access flattened list fields
      return body
    }
    return body
  },
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEY)
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
      ElMessage.error('登录已失效，请重新登录')
      return Promise.reject(error)
    }
    const message = error?.response?.data?.message || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export function get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, config) as unknown as Promise<T>
}

export function post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request.post(url, data, config) as unknown as Promise<T>
}

export function put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return request.put(url, data, config) as unknown as Promise<T>
}

export function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.delete(url, config) as unknown as Promise<T>
}

export default request
