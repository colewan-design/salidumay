import { reactive, computed } from 'vue'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL?.replace('/anime', '') || '/api'

const state = reactive({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token: localStorage.getItem('auth_token') || null,
  loading: false,
  error: null,
})

export const useAuth = () => {
  const isLoggedIn = computed(() => !!state.token && !!state.user)
  const user = computed(() => state.user)
  const loading = computed(() => state.loading)
  const error = computed(() => state.error)

  function setSession(user, token) {
    state.user = user
    state.token = token
    localStorage.setItem('auth_user', JSON.stringify(user))
    localStorage.setItem('auth_token', token)
  }

  function clearSession() {
    state.user = null
    state.token = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  function authHeaders() {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {}
  }

  async function register(name, email, password, passwordConfirmation) {
    state.loading = true
    state.error = null
    try {
      const { data } = await axios.post(`${BASE}/auth/register`, {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSession(data.user, data.token)
      return { success: true }
    } catch (err) {
      state.error = extractError(err)
      return { success: false, error: state.error }
    } finally {
      state.loading = false
    }
  }

  async function login(email, password) {
    state.loading = true
    state.error = null
    try {
      const { data } = await axios.post(`${BASE}/auth/login`, { email, password })
      setSession(data.user, data.token)
      return { success: true }
    } catch (err) {
      state.error = extractError(err)
      return { success: false, error: state.error }
    } finally {
      state.loading = false
    }
  }

  async function logout() {
    try {
      await axios.post(`${BASE}/auth/logout`, {}, { headers: authHeaders() })
    } catch (_) { /* token may already be expired */ }
    clearSession()
  }

  async function fetchMe() {
    if (!state.token) return
    try {
      const { data } = await axios.get(`${BASE}/auth/me`, { headers: authHeaders() })
      state.user = data.user
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    } catch (_) {
      clearSession()
    }
  }

  function loginWithGoogle() {
    window.location.href = `${BASE}/auth/google`
  }

  function handleGoogleCallback(token) {
    state.token = token
    localStorage.setItem('auth_token', token)
    return fetchMe()
  }

  return {
    user,
    isLoggedIn,
    loading,
    error,
    register,
    login,
    logout,
    fetchMe,
    loginWithGoogle,
    handleGoogleCallback,
    authHeaders,
  }
}

function extractError(err) {
  if (err.response?.data?.errors) {
    return Object.values(err.response.data.errors).flat().join(' ')
  }
  return err.response?.data?.message || 'Something went wrong.'
}
