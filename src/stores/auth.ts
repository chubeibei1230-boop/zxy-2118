import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getProfile } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<Record<string, any> | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const role = computed(() => user.value?.role || '')
  const username = computed(() => user.value?.username || '')

  async function login(usernameVal: string, password: string) {
    const res: any = await loginApi({ username: usernameVal, password })
    token.value = res.token
    localStorage.setItem('token', res.token)
    user.value = res.user
  }

  async function fetchProfile() {
    try {
      const res: any = await getProfile()
      user.value = res
    } catch {
      clearAuth()
    }
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  function hasRole(roles: string[]) {
    if (!user.value) return false
    return roles.includes(user.value.role)
  }

  return { token, user, isLoggedIn, role, username, login, fetchProfile, clearAuth, hasRole }
})
