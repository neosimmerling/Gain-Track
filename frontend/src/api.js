const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('gaintrack_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body && !(body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body instanceof URLSearchParams ? body : body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let detail = 'Ein Fehler ist aufgetreten'
    try {
      const data = await res.json()
      detail = data.detail || detail
    } catch (_) {}
    throw new Error(detail)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),

  login: async (username, password) => {
    const form = new URLSearchParams()
    form.set('username', username)
    form.set('password', password)
    const data = await request('/auth/login', { method: 'POST', body: form, auth: false })
    localStorage.setItem('gaintrack_token', data.access_token)
    return data
  },

  me: () => request('/auth/me'),

  logout: () => localStorage.removeItem('gaintrack_token'),

  listExercises: () => request('/exercises'),
  createExercise: (payload) => request('/exercises', { method: 'POST', body: payload }),

  listWorkouts: () => request('/workouts'),
  createWorkout: (payload) => request('/workouts', { method: 'POST', body: payload }),
  deleteWorkout: (id) => request(`/workouts/${id}`, { method: 'DELETE' }),

  exerciseProgress: (exerciseId) => request(`/stats/exercise/${exerciseId}/progress`),
  summary: () => request('/stats/summary'),

  myMilestones: () => request('/milestones/me'),
  listFriends: () => request('/friends'),
  sendFriendRequest: (username) => request('/friends/request', { method: 'POST', body: { username } }),
  acceptFriendRequest: (userId) => request(`/friends/${userId}/accept`, { method: 'POST' }),
  friendMilestones: (friendId) => request(`/friends/${friendId}/milestones`),
}
