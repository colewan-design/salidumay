import axios from 'axios'

const isProd = import.meta.env.PROD

function buildUrl(path, params = {}) {
  if (isProd) {
    const qs = new URLSearchParams({ path, ...params }).toString()
    return `/consumet-proxy.php?${qs}`
  }
  // Dev: use Vite proxy /consumet/* → consumet API
  const base = `/consumet${path}`
  const qs = new URLSearchParams(params).toString()
  return qs ? `${base}?${qs}` : base
}

const ax = axios.create({ timeout: 15000, headers: { Accept: 'application/json' } })

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function proxyStream(url, referer) {
  if (!url) return null
  const base = isProd ? '/stream-proxy.php' : '/stream-proxy.php'
  return `${base}?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer)}`
}

// ── Gogoanime ─────────────────────────────────────────────────────
export async function gogoanimeSearch(title) {
  const { data } = await ax.get(buildUrl(`/anime/gogoanime/${encodeURIComponent(title)}`))
  return data.results || []
}

export function gogoanimeMatch(results, title) {
  if (!results.length) return null
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const t = norm(title)
  return (
    results.find(r => norm(r.title) === t) ||
    results.find(r => norm(r.title).includes(t) || t.includes(norm(r.title))) ||
    results[0]
  )
}

export async function gogoanimeWatch(episodeId) {
  const { data } = await ax.get(buildUrl(`/anime/gogoanime/watch/${encodeURIComponent(episodeId)}`))
  return {
    sources: data.sources || [],
    referer: data.headers?.Referer || 'https://gogoplay.io/',
  }
}

export async function getGogoanimeStreams(title, ep) {
  const results = await gogoanimeSearch(title)
  const match   = gogoanimeMatch(results, title)
  if (!match) return []

  // Prefer sub version; fall back to dub
  const episodes = match.episodes || []
  const episode  = episodes.find(e => e.number === ep || e.number === String(ep))
  const epId     = episode?.id || `${slugify(match.title)}-episode-${ep}`

  const { sources, referer } = await gogoanimeWatch(epId)

  return sources
    .filter(s => s.url && s.isM3U8)
    .map(s => ({
      label: `Gogoanime${s.quality ? ' · ' + s.quality : ''}`,
      url  : proxyStream(s.url, referer),
      group: 'Gogoanime',
    }))
}

// ── Zoro / Aniwatch ───────────────────────────────────────────────
export async function zoroSearch(title) {
  const { data } = await ax.get(buildUrl(`/anime/zoro/${encodeURIComponent(title)}`))
  return data.results || []
}

export function zoroMatch(results, title) {
  if (!results.length) return null
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const t = norm(title)
  return (
    results.find(r => norm(r.title) === t) ||
    results.find(r => norm(r.title).includes(t) || t.includes(norm(r.title))) ||
    results[0]
  )
}

export async function zoroEpisodes(animeId) {
  const { data } = await ax.get(buildUrl(`/anime/zoro/info`, { id: animeId }))
  return data.episodes || []
}

export async function zoroWatch(episodeId) {
  const { data } = await ax.get(buildUrl(`/anime/zoro/watch`, { episodeId }))
  return {
    sources: data.sources || [],
    referer: data.headers?.Referer || 'https://aniwatch.to/',
  }
}

export async function getZoroStreams(title, ep) {
  const results = await zoroSearch(title)
  const match   = zoroMatch(results, title)
  if (!match) return []

  const episodes = await zoroEpisodes(match.id)
  const episode  = episodes.find(e => e.number === ep || e.number === String(ep))
  if (!episode) return []

  const { sources, referer } = await zoroWatch(episode.id)

  return sources
    .filter(s => s.url && s.isM3U8)
    .map(s => ({
      label: `Zoro${s.quality ? ' · ' + s.quality : ''}`,
      url  : proxyStream(s.url, referer),
      group: 'Zoro',
    }))
}
