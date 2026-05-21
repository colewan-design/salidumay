import axios from 'axios'

const jikan = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  headers: { Accept: 'application/json' },
})


function normalizeAnime(item) {
  return {
    id: item.mal_id,
    title: item.title || '',
    subtitle: item.title_japanese || item.title_english || '',
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    genre: item.genres?.[0]?.name || item.demographics?.[0]?.name || 'Anime',
    badge: item.genres?.[0]?.name || 'Anime',
    rating: typeof item.score === 'number' ? item.score : 0,
    episodes: item.episodes ?? '?',
    status: item.status === 'Currently Airing' ? 'Airing' : 'Done',
    year: item.year ?? item.aired?.prop?.from?.year ?? null,
    studio: item.studios?.[0]?.name || '',
    synopsis: item.synopsis || '',
    members: item.members || 0,
    new: item.status === 'Currently Airing',
    trailerUrl: item.trailer?.embed_url
      ? item.trailer.embed_url.replace('autoplay=1', 'autoplay=0') + '&enablejsapi=0'
      : null,
  }
}


const COMMUNITY_THREADS = [
  {
    id: 1,
    user: { name: 'SakuraFan99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SakuraFan99' },
    tag: 'Discussion',
    time: '2h ago',
    title: 'Which anime are you most hyped about this season?',
    preview: 'This season looks absolutely stacked. So many great titles dropping at once — hard to keep up!',
    replies: 142,
    likes: 1204,
  },
  {
    id: 2,
    user: { name: 'OtakuMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OtakuMaster' },
    tag: 'Analysis',
    time: '5h ago',
    title: 'Why Attack on Titan has the best ending in anime history',
    preview: 'Breaking down the final arc — themes of freedom vs determinism and how Isayama resolved them perfectly.',
    replies: 89,
    likes: 3871,
  },
  {
    id: 3,
    user: { name: 'AniméKing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeKing' },
    tag: 'Rankings',
    time: '1d ago',
    title: 'Top 10 anime openings of all time — community vote results',
    preview: 'After 48 hours and 15,000 votes, here are your picks for the greatest anime openings ever made.',
    replies: 215,
    likes: 6432,
  },
]

export const getHero = async () => {
  const { data } = await jikan.get('/top/anime', { params: { filter: 'airing', limit: 1 } })
  const item = data.data?.[0]
  if (!item) throw new Error('No hero data')
  return { data: normalizeAnime(item) }
}

export const getTrending = async () => {
  const { data } = await jikan.get('/top/anime', { params: { filter: 'airing', limit: 12 } })
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getSeasonal = async () => {
  const { data } = await jikan.get('/seasons/now', { params: { limit: 16 } })
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getGenres = async () => {
  const { data } = await jikan.get('/genres/anime')
  return { data: (data.data || []).slice(0, 24).map(g => ({ name: g.name, id: g.mal_id })) }
}

export const getTop = async () => {
  const { data } = await jikan.get('/top/anime', { params: { limit: 10 } })
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getCommunity = () => Promise.resolve({ data: COMMUNITY_THREADS })

export const getAnimeList = async () => {
  const { data } = await jikan.get('/top/anime', { params: { limit: 25 } })
  return { data: (data.data || []).map(normalizeAnime) }
}

export const searchAnime = async (query) => {
  const { data } = await jikan.get('/anime', { params: { q: query, limit: 25, sfw: true } })
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getAnimeDetail = async (id) => {
  const { data } = await jikan.get(`/anime/${id}`)
  return { data: normalizeAnime(data.data) }
}

export const getStreamingLinks = async (id) => {
  const { data } = await jikan.get(`/anime/${id}/streaming`)
  return { data: data.data || [] }
}

export const getEpisodes = async (id) => {
  const { data } = await jikan.get(`/anime/${id}/episodes`)
  return {
    data: (data.data || []).map(ep => ({
      number: ep.mal_id,
      title: ep.title || `Episode ${ep.mal_id}`,
      duration: null,
      thumbnail: null,
      videoUrl: null,
    })),
  }
}

export const getRelated = async (id) => {
  const { data } = await jikan.get(`/anime/${id}/recommendations`)
  return { data: (data.data || []).slice(0, 10).map(rec => normalizeAnime(rec.entry)) }
}
