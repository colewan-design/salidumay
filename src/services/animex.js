import axios from 'axios'

const ax = axios.create({
  baseURL: '/animex',
  timeout: 12000,
  headers: { Accept: 'application/json, text/plain, */*' },
})

export async function animexSearch(title) {
  const { data } = await ax.get('/api/anime/browse', { params: { q: title } })
  return data.data || []
}

export function animexBestMatch(results, title) {
  if (!results.length) return null
  const norm = (s) => s?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
  const target = norm(title)
  return (
    results.find((r) => norm(r.title) === target) ||
    results.find((r) => norm(r.title).includes(target) || target.includes(norm(r.title))) ||
    results[0]
  )
}

export async function animexEpisodeSources(animeId, ep) {
  const { data } = await ax.get(`/api/anime/${animeId}/episodes/${ep}`)
  return {
    sources: data.sources || [],
    subtitles: data.subtitles || [],
    intro: data.intro || null,
    outro: data.outro || null,
  }
}
