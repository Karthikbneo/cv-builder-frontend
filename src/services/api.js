import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
  withCredentials: true,
})



let isRefreshing = false
let pending = []

api.interceptors.request.use((config) => {
  // make sure credentials are sent
  config.withCredentials = true
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original?._retry) {
      try {
        original._retry = true

        if (isRefreshing) {
          // wait for ongoing refresh
          await new Promise((resolve) => pending.push(resolve))
        } else {
          isRefreshing = true
          // call refresh endpoint — server will read refresh cookie and set a new access cookie
          await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, null, {
            withCredentials: true,
          })
          pending.forEach((r) => r())
          pending = []
          isRefreshing = false
        }

        // retry original request — cookies will be sent automatically
        original.withCredentials = true
        return api(original)
      } catch (e) {
        isRefreshing = false
        pending = []
        // If refresh fails, clear any client-side user hints (if present)
        try {
          localStorage.removeItem('auth:user')
        } catch (_) {}
      }
    }
    return Promise.reject(error)
  }
)

export default api
