import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
  withCredentials: false
})

let accessToken = ''
let refreshToken = localStorage.getItem('auth:refresh') || ''
let isRefreshing = false
let pending = []

api.setToken = (t) => { accessToken = t }

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      try {
        original._retry = true

        // queue requests while refreshing
        if (isRefreshing) {
          await new Promise((resolve) => pending.push(resolve))
        } else {
          isRefreshing = true
          const { data } = await axios.post(
            `${api.defaults.baseURL}/api/v1/auth/refresh`,
            { token: refreshToken }
          )
          accessToken = data.access
          localStorage.setItem('auth:access', accessToken)
          pending.forEach((r) => r())
          pending = []
          isRefreshing = false
        }

        // retry with new access token
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (e) {
        isRefreshing = false
        pending = []
        // refresh failed — clear auth and bubble up
        localStorage.removeItem('auth:user')
        localStorage.removeItem('auth:access')
        localStorage.removeItem('auth:refresh')
        accessToken = ''
        refreshToken = ''
      }
    }
    return Promise.reject(error)
  }
)

export default api
