import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.success && res.data !== undefined) {
      return res.data
    }
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request
