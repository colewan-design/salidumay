import axios from 'axios'

// Dev  → Vite proxy: /animex/* → https://animex.wrdd.site/*  (see vite.config.js)
// Prod → PHP proxy: /animex-proxy.php?path=/*  (public/animex-proxy.php)
const isProd = import.meta.env.PROD

function buildUrl(path, params = {}) {
  if (isProd) {
    const qs = new URLSearchParams({ path, ...params }).toString()
    return `/animex-proxy.php?${qs}`
  }
  const base = `/animex${path}`
  const qs = new URLSearchParams(params).toString()
  return qs ? `${base}?${qs}` : base
}

const ax = axios.create({
  timeout: 12000,
  headers: { Accept: 'application/json, text/plain, */*' },
})

export async function animexSearch(title) {
  const { data } = await ax.get(buildUrl('/api/anime/browse', { q: title }))
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
  const { data } = await ax.get(buildUrl(`/api/anime/${animeId}/episodes/${ep}`))
  return {
    sources: data.sources || [],
    subtitles: data.subtitles || [],
    intro: data.intro || null,
    outro: data.outro || null,
  }
}
