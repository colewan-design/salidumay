import axios from 'axios'

const BASE = (import.meta.env.VITE_HIANIME_API || '').replace(/\/$/, '')

export const hiAnimeEnabled = !!BASE

const hi = axios.create({ baseURL: BASE, timeout: 20000 })

// Store the title as the ID — the extract endpoint accepts names directly
export const hiSearch = async (query) => {
  return [{ id: query, name: query }]
}

// Episodes come from the Jikan backend — return empty, stream is fetched by title+ep
export const hiEpisodes = async () => {
  return []
}

// episodeId format: "{animeTitle}:::{episodeNumber}"
export const hiStream = async (episodeId, category = 'sub') => {
  const [title, epNum] = episodeId.includes(':::')
    ? episodeId.split(':::')
    : [episodeId, '1']

  const audioKey = category === 'dub' ? 'sdub' : 'ssub'

  const { data } = await hi.get(`/anime/extract/${encodeURIComponent(title)}`, {
    params: epNum ? { ep: epNum } : {},
  })

  const streamData = data[audioKey] || data.ssub || data.sdub
  if (!streamData?.streams?.length) return null

  const stream = [...(streamData.streams)]
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .find(s => s.url)

  if (!stream?.url) return null

  const proxyBase  = import.meta.env.PROD ? '/stream-proxy.php' : `${BASE}/proxy_m3u8`
  const referer    = encodeURIComponent('https://hianime.to/')
  const proxiedUrl = `${proxyBase}?url=${encodeURIComponent(stream.url)}&referer=${referer}`

  return {
    sources: [{ url: proxiedUrl, type: 'hls' }],
    tracks: (streamData.subtitles || []).map(s => ({
      file: s.file,
      kind: 'captions',
      label: 'English',
      default: true,
    })),
  }
}

export function bestMatch(results, title) {
  if (!results.length) return null
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const target = norm(title)
  return (
    results.find(r => norm(r.name) === target) ||
    results.find(r => norm(r.name).includes(target) || target.includes(norm(r.name))) ||
    results[0]
  )
}
