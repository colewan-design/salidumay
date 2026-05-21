import axios from 'axios'

const BASE = (import.meta.env.VITE_HIANIME_API || '').replace(/\/$/, '')

export const hiAnimeEnabled = !!BASE

const hi = axios.create({ baseURL: BASE, timeout: 12000 })

export const hiSearch = async (query) => {
  const { data } = await hi.get('/api/v2/hianime/search', { params: { q: query, page: 1 } })
  return data.data?.animes || []
}

export const hiEpisodes = async (animeId) => {
  const { data } = await hi.get(`/api/v2/hianime/anime/${animeId}/episodes`)
  return data.data?.episodes || []
}

export const hiStream = async (episodeId, category = 'sub') => {
  const { data } = await hi.get('/api/v2/hianime/episode/sources', {
    params: { animeEpisodeId: episodeId, server: 'hd-1', category },
  })
  return data.data || null
}

// Fuzzy title match — picks the closest result to the Jikan title
export function bestMatch(results, title) {
  if (!results.length) return null
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const target = norm(title)
  return (
    results.find(r => norm(r.name) === target) ||
    results.find(r => norm(r.name).includes(target) || target.includes(norm(r.name))) ||
    results[0]
  )
}
