import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL?.replace('/anime', '') || '/api'

function authHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── localStorage helpers ──────────────────────────────────────────
function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
function lsSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ── Library ───────────────────────────────────────────────────────
const LIBRARY_KEY = 'user_library'

export function getLibrary() {
  return lsGet(LIBRARY_KEY) || []
}

export function isInLibrary(animeId) {
  return getLibrary().some(a => String(a.id) === String(animeId))
}

export async function addToLibrary(anime, type = 'anime') {
  const entry = {
    id:       anime.id,
    title:    anime.title,
    image:    anime.image,
    genre:    anime.genre || anime.genreNames?.[0] || '',
    episodes: anime.episodes ?? null,
    rating:   anime.rating,
    type:     anime.type || type,
    addedAt:  new Date().toISOString(),
  }

  const list = getLibrary().filter(a => String(a.id) !== String(anime.id))
  list.unshift(entry)
  lsSet(LIBRARY_KEY, list)

  try {
    await axios.post(`${BASE}/user/library`, entry, { headers: authHeaders() })
  } catch (_) {}

  return list
}

export async function removeFromLibrary(animeId) {
  const list = getLibrary().filter(a => String(a.id) !== String(animeId))
  lsSet(LIBRARY_KEY, list)

  try {
    await axios.delete(`${BASE}/user/library/${animeId}`, { headers: authHeaders() })
  } catch (_) {}

  return list
}

export async function syncLibraryFromServer() {
  try {
    const { data } = await axios.get(`${BASE}/user/library`, { headers: authHeaders() })
    const serverList = data.data || data || []
    lsSet(LIBRARY_KEY, serverList)
    return serverList
  } catch (_) {
    return getLibrary()
  }
}

// ── Watch History ─────────────────────────────────────────────────
const HISTORY_KEY = 'user_history'

export function getHistory() {
  return lsGet(HISTORY_KEY) || []
}

export async function recordHistory(anime, epNum) {
  const entry = {
    id:        anime.id,
    title:     anime.title,
    image:     anime.image,
    genre:     anime.genre,
    episode:   epNum,
    watchedAt: new Date().toISOString(),
  }

  // Keep only the latest entry per anime (remove older duplicate)
  const list = getHistory().filter(a => String(a.id) !== String(anime.id))
  list.unshift(entry)
  // Cap at 200 entries
  const trimmed = list.slice(0, 200)
  lsSet(HISTORY_KEY, trimmed)

  try {
    await axios.post(`${BASE}/user/history`, entry, { headers: authHeaders() })
  } catch (_) {}

  return trimmed
}

export async function removeFromHistory(animeId) {
  const list = getHistory().filter(a => String(a.id) !== String(animeId))
  lsSet(HISTORY_KEY, list)

  try {
    await axios.delete(`${BASE}/user/history/${animeId}`, { headers: authHeaders() })
  } catch (_) {}

  return list
}

export async function clearHistory() {
  lsSet(HISTORY_KEY, [])
  try {
    await axios.delete(`${BASE}/user/history`, { headers: authHeaders() })
  } catch (_) {}
}

export async function syncHistoryFromServer() {
  try {
    const { data } = await axios.get(`${BASE}/user/history`, { headers: authHeaders() })
    const serverList = data.data || data || []
    lsSet(HISTORY_KEY, serverList)
    return serverList
  } catch (_) {
    return getHistory()
  }
}
