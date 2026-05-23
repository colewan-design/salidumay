import axios from 'axios'

const ax = axios.create({
  timeout: 30000,
  headers: { Accept: 'application/json' },
})

const API = '/animepahe-proxy.php'

function norm(s) {
  return s?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''
}

export async function animePaheDirectSearch(title) {
  const { data } = await ax.get(API, { params: { m: 'search', q: title } })
  return data.data || []
}

export function animePaheDirectMatch(results, title) {
  if (!results.length) return null
  const t = norm(title)
  return (
    results.find(r => norm(r.title) === t) ||
    results.find(r => norm(r.title).includes(t) || t.includes(norm(r.title))) ||
    results[0]
  )
}

export async function animePaheDirectEpisodes(session, targetEp) {
  // Paginate through release pages until we find the episode
  let page = 1
  while (true) {
    const { data } = await ax.get(API, {
      params: { m: 'release', id: session, sort: 'episode_asc', page },
    })
    const episodes = data.data || []
    if (!episodes.length) break

    const match = episodes.find(e => Number(e.episode) === Number(targetEp))
    if (match) return match

    if (!data.next_page_url) break
    page++
  }
  return null
}

// Returns an iframe URL for the episode, or null if not found
export async function getAnimePaheDirectSource(title, ep) {
  const results = await animePaheDirectSearch(title)
  console.log('[animepahe-direct] search results:', results.length, results[0]?.title)
  const match = animePaheDirectMatch(results, title)
  if (!match) return null

  const episode = await animePaheDirectEpisodes(match.session, ep)
  console.log('[animepahe-direct] episode match:', episode?.episode, episode?.session?.slice(0, 16))
  if (!episode) return null

  return {
    label: 'AnimePahe',
    url:   `https://animepahe.pw/play/${match.session}/${episode.session}`,
    group: 'AnimePahe',
    type:  'iframe',
  }
}
