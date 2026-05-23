import axios from 'axios'

const ax = axios.create({ timeout: 25000 })

export async function getYugenSources(title, ep) {
  const { data } = await ax.get('/yugen-proxy.php', {
    params: { title, ep },
  })

  if (data.error || !data.sources?.length) {
    console.warn('[yugen] no sources:', data.error ?? 'empty')
    return []
  }

  return data.sources.map(s => ({
    label: `Yugen${s.quality && s.quality !== 'auto' ? ' · ' + s.quality : ''}`,
    url:   s.url,
    group: 'Yugen',
    type:  s.type === 'hls' ? 'hls' : 'mp4',
  }))
}
