import axios from 'axios'

const backend = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/anime',
  headers: { Accept: 'application/json' },
  timeout: 20000,
})


function normalizeAnime(item) {
  if (!item) return null
  return {
    id: item.id ?? item.mal_id,
    title: item.title || '',
    subtitle: item.subtitle || item.title_japanese || item.title_english || '',
    image: item.image || item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    genre: item.genre || item.genres?.[0]?.name || item.demographics?.[0]?.name || 'Anime',
    badge: item.badge || item.genres?.[0]?.name || 'Anime',
    rating: typeof item.rating === 'number' ? item.rating : (typeof item.score === 'number' ? item.score : 0),
    episodes: item.episodes ?? '?',
    status: item.status === 'Currently Airing' ? 'Airing' : (item.status || 'Done'),
    year: item.year ?? item.aired?.prop?.from?.year ?? null,
    studio: item.studio || item.studios?.[0]?.name || '',
    synopsis: item.synopsis || '',
    members: item.members || 0,
    new: item.new ?? item.status === 'Currently Airing',
    trailerUrl: item.trailerUrl ?? (item.trailer?.embed_url
      ? item.trailer.embed_url.replace('autoplay=1', 'autoplay=0') + '&enablejsapi=0'
      : null),
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
  const { data } = await backend.get('/hero')
  return { data: normalizeAnime(data.data) }
}

export const getTrending = async () => {
  const { data } = await backend.get('/trending')
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getSeasonal = async () => {
  const { data } = await backend.get('/seasonal')
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getGenres = async () => {
  const { data } = await backend.get('/genres')
  return { data: data.data || [] }
}

export const getTop = async () => {
  const { data } = await backend.get('/top')
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getCommunity = () => Promise.resolve({ data: COMMUNITY_THREADS })

export const getAnimeList = async () => {
  const { data } = await backend.get('/list')
  return { data: (data.data || []).map(normalizeAnime) }
}

export const searchAnime = async (query) => {
  const { data } = await backend.get('/search', { params: { q: query } })
  return { data: (data.data || []).map(normalizeAnime) }
}

export const getAnimeDetail = async (id) => {
  const { data } = await backend.get(`/${id}`)
  return { data: normalizeAnime(data.data) }
}

export const getStreamingLinks = async (id) => {
  const { data } = await backend.get(`/${id}/streaming`)
  return { data: data.data || [] }
}

export const getEpisodes = async (id) => {
  const { data } = await backend.get(`/${id}/episodes`)
  return { data: data.data || [] }
}

export const getMovies = async (page = 1) => {
  const { data } = await backend.get('/movies', { params: { page } })
  return {
    data: (data.data || []).map(normalizeAnime),
    pagination: data.pagination || {},
  }
}

export const getRankings = async (page = 1) => {
  const { data } = await backend.get('/rankings', { params: { page } })
  return {
    data: (data.data || []).map(normalizeAnime),
    pagination: data.pagination || {},
  }
}

export const getByGenre = async (genre, page = 1) => {
  const { data } = await backend.get(`/genre/${encodeURIComponent(genre)}`, { params: { page } })
  return {
    data: (data.data || []).map(normalizeAnime),
    pagination: data.pagination || {},
  }
}

export const getRelated = async (id) => {
  const { data } = await backend.get(`/${id}/related`)
  return { data: (data.data || []).map(normalizeAnime) }
}
