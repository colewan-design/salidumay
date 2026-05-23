import axios from 'axios'

const ax = axios.create({ timeout: 20000 })

export async function getAllAnimeSources(title, ep, mode = 'sub') {
  const { data } = await ax.get('/allanime-proxy.php', {
    params: { title, ep, mode },
  })

  console.log('[allanime] raw response:', JSON.stringify(data).slice(0, 300))

  if (data.error || !data.sources?.length) return []

  // Prefer gogoanime m3u8, then other direct stream URLs
  return data.sources
    .filter(s => s.url && (s.url.includes('.m3u8') || s.url.includes('gogoanime') || s.url.includes('mp4')))
    .map(s => ({
      label: `AllAnime · ${s.name}`,
      url:   s.url,
      group: 'AllAnime',
      type:  s.url.includes('.m3u8') ? 'hls' : 'iframe',
    }))
}
