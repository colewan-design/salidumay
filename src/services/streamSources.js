import { animexSearch, animexBestMatch, animexEpisodeSources } from './animex.js'

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

// ── Source 2: JustAnime ──────────────────────────────────────────
export function getJustAnimeSources(title, ep) {
  const slug = slugify(title)
  return [
    {
      label : 'JustAnime',
      url   : `https://justanime.to/watch/${slug}-episode-${ep}`,
      group : 'JustAnime',
    },
  ]
}

// ── Source 3: Anikoto ────────────────────────────────────────────
export async function getAnikotoSources(title, ep) {
  const proxyBase = import.meta.env.PROD
    ? '/anikoto-proxy.php'
    : null

  if (!proxyBase) return []   // dev: skip (proxy only works on server)

  try {
    const res  = await fetch(`${proxyBase}?q=${encodeURIComponent(title)}&ep=${ep}`)
    const data = await res.json()
    if (!data.url) return []
    return [{ label: 'Anikoto', url: data.url, group: 'Anikoto' }]
  } catch {
    return []
  }
}

// ── Aggregate all sources ────────────────────────────────────────
export async function getAllSources(title, ep) {
  const [animexSrcs, anikotoSrcs] = await Promise.allSettled([
    getAnimexSources(title, ep),
    getAnikotoSources(title, ep),
  ])

  const justAnimeSrcs = getJustAnimeSources(title, ep)

  return [
    ...(animexSrcs.status   === 'fulfilled' ? animexSrcs.value   : []),
    ...(anikotoSrcs.status  === 'fulfilled' ? anikotoSrcs.value  : []),
    ...justAnimeSrcs,
  ]
}
