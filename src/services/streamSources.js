import { animexSearch, animexBestMatch, animexEpisodeSources } from './animex.js'
import { getGogoanimeStreams, getZoroStreams } from './consumet.js'

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ── Source 1: AnimEx ──────────────────────────────────────────────
export async function getAnimexSources(title, ep) {
  const results = await animexSearch(title)
  const match   = animexBestMatch(results, title)
  if (!match) return []

  const { sources } = await animexEpisodeSources(match.id, ep)
  return sources
    .filter(s => s.url)
    .map(s => ({
      label : `AnimEx${s.quality ? ' · ' + s.quality : ''}${s.lang ? ' · ' + s.lang.toUpperCase() : ''}`,
      url   : s.url,
      group : 'AnimEx',
    }))
}

// ── Source 2: Gogoanime (via Consumet) ────────────────────────────
export async function getGogoanime(title, ep) {
  return getGogoanimeStreams(title, ep)
}

// ── Source 3: Zoro / Aniwatch (via Consumet) ──────────────────────
export async function getZoro(title, ep) {
  return getZoroStreams(title, ep)
}

// ── Source 4: Anikoto ────────────────────────────────────────────
export async function getAnikotoSources(title, ep) {
  const proxyBase = import.meta.env.PROD ? '/anikoto-proxy.php' : null
  if (!proxyBase) return []

  try {
    const res  = await fetch(`${proxyBase}?q=${encodeURIComponent(title)}&ep=${ep}`)
    const data = await res.json()
    if (!data.url) return []
    return [{ label: 'Anikoto', url: data.url, group: 'Anikoto' }]
  } catch {
    return []
  }
}

// ── Source 5: JustAnime (iframe) ─────────────────────────────────
export function getJustAnimeSources(title, ep) {
  const slug = slugify(title)
  return [{ label: 'JustAnime', url: `https://justanime.to/watch/${slug}-episode-${ep}`, group: 'JustAnime', type: 'iframe' }]
}


// ── Aggregate all sources ─────────────────────────────────────────
export async function getAllSources(title, ep) {
  const [animexRes, gogoanimeRes, zoroRes, anikotoRes] = await Promise.allSettled([
    getAnimexSources(title, ep),
    getGogoanime(title, ep),
    getZoro(title, ep),
    getAnikotoSources(title, ep),
  ])

  const iframeSources = getJustAnimeSources(title, ep)

  return [
    ...(animexRes.status    === 'fulfilled' ? animexRes.value    : []),
    ...(gogoanimeRes.status === 'fulfilled' ? gogoanimeRes.value : []),
    ...(zoroRes.status      === 'fulfilled' ? zoroRes.value      : []),
    ...(anikotoRes.status   === 'fulfilled' ? anikotoRes.value   : []),
    ...iframeSources,
  ]
}
