/**
 * Films service — talks to the Laravel backend (/api/films/*).
 * The backend holds the TMDB key; no key is needed in the frontend.
 * Falls back to calling TMDB directly if VITE_TMDB_KEY is set and the
 * backend returns an error (useful during local dev before running the scraper).
 */
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '/api/anime').replace(/\/anime$/, '/films')

const backend = axios.create({
  baseURL: API_BASE,
  headers: { Accept: 'application/json' },
  timeout: 15000,
})

// ── Direct TMDB fallback (only used when VITE_TMDB_KEY is present) ──────────

const TMDB_KEY  = import.meta.env.VITE_TMDB_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE  = 'https://image.tmdb.org/t/p'

const tmdbDirect = axios.create({ baseURL: TMDB_BASE, timeout: 15000 })

function img(path, size = 'w500') {
  return path ? `${IMG_BASE}/${size}${path}` : ''
}

function normalizeDirect(m) {
  return {
    id:           m.id,
    title:        m.title || m.name || '',
    overview:     m.overview || '',
    image:        img(m.poster_path),
    backdrop:     img(m.backdrop_path, 'original'),
    rating:       m.vote_average ?? 0,
    year:         m.release_date ? m.release_date.slice(0, 4) : '',
    genre:        m.genres?.[0]?.name || '',
    genre_ids:    m.genre_ids || m.genres?.map(g => g.id) || [],
    genres:       m.genres?.map(g => ({ id: g.id, name: g.name })) || [],
    genreNames:   m.genres?.map(g => g.name) || [],
    runtime:      m.runtime ?? null,
    tagline:      m.tagline || '',
    status:       m.status || '',
    popularity:   m.popularity ?? 0,
    vote_count:   m.vote_count ?? 0,
    voteCount:    m.vote_count ?? 0,
    adult:        m.adult ?? false,
    originalLang: m.original_language || '',
    director:     m.credits?.crew?.find(c => c.job === 'Director')?.name || '',
    cast:         (m.credits?.cast || []).slice(0, 12).map(c => ({
      id: c.id, name: c.name, character: c.character,
      image: img(c.profile_path, 'w185'),
    })),
    trailer_key:  m.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
    trailer:      m.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null,
    similar:      (m.similar?.results || []).slice(0, 12).map(normalizeDirect),
  }
}

async function withFallback(backendCall, directCall) {
  try {
    const res = await backendCall()
    // If backend has no data yet (empty), try direct
    if (res.data?.data?.length === 0 && TMDB_KEY) {
      return await directCall()
    }
    return res.data
  } catch {
    if (TMDB_KEY) return await directCall()
    throw new Error('Backend unavailable and no VITE_TMDB_KEY set')
  }
}

function p(extra = {}) { return { api_key: TMDB_KEY, ...extra } }

// ── Public API ───────────────────────────────────────────────────────────────

export const getPopularFilms = async (page = 1) => {
  return withFallback(
    () => backend.get('/popular', { params: { page } }),
    async () => {
      const { data } = await tmdbDirect.get('/movie/popular', { params: p({ page }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

export const getTopRatedFilms = async (page = 1) => {
  return withFallback(
    () => backend.get('/top-rated', { params: { page } }),
    async () => {
      const { data } = await tmdbDirect.get('/movie/top_rated', { params: p({ page }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

export const getTrendingFilms = async (page = 1) => {
  return withFallback(
    () => backend.get('/trending', { params: { page } }),
    async () => {
      const { data } = await tmdbDirect.get('/trending/movie/week', { params: p({ page }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

export const getNowPlayingFilms = async (page = 1) => {
  return withFallback(
    () => backend.get('/now-playing', { params: { page } }),
    async () => {
      const { data } = await tmdbDirect.get('/movie/now_playing', { params: p({ page }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

export const getFilmGenres = async () => {
  try {
    const res = await backend.get('/genres')
    return res.data?.data || []
  } catch {
    if (!TMDB_KEY) return []
    const { data } = await tmdbDirect.get('/genre/movie/list', { params: p() })
    return data.genres || []
  }
}

export const getFilmsByGenre = async (genreId, page = 1) => {
  return withFallback(
    () => backend.get(`/genre/${genreId}`, { params: { page } }),
    async () => {
      const { data } = await tmdbDirect.get('/discover/movie', { params: p({ with_genres: genreId, page, sort_by: 'popularity.desc' }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

export const getUpcomingFilms = async (page = 1) => {
  return withFallback(
    () => backend.get('/upcoming', { params: { page } }),
    async () => {
      const { data } = await tmdbDirect.get('/movie/upcoming', { params: p({ page }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

export const searchFilms = async (query, page = 1) => {
  return withFallback(
    () => backend.get('/search', { params: { q: query, page } }),
    async () => {
      const { data } = await tmdbDirect.get('/search/movie', { params: p({ query, page }) })
      return { data: data.results.map(normalizeDirect), totalPages: data.total_pages, pagination: { has_next: page < data.total_pages, total_pages: data.total_pages } }
    }
  )
}

function normalizeBackend(f) {
  return {
    ...f,
    genreNames:   (f.genres || []).map(g => g.name).filter(Boolean),
    similar:      f.similar || [],
    voteCount:    f.vote_count ?? 0,
    originalLang: f.original_language || '',
    trailer:      f.trailer_key || null,
  }
}

export const getFilmDetail = async (id) => {
  try {
    const res = await backend.get(`/${id}`)
    const film = res.data?.data
    if (film) return normalizeBackend(film)
    throw new Error('Not found')
  } catch {
    if (!TMDB_KEY) return null
    const { data } = await tmdbDirect.get(`/movie/${id}`, {
      params: p({ append_to_response: 'credits,similar,videos' }),
    })
    return normalizeDirect(data)
  }
}

export const FILM_EMBED_SOURCES = (tmdbId) => [
  { label: 'VidSrc',      url: `https://vidsrc.to/embed/movie/${tmdbId}` },
  { label: 'VidSrc 2',    url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` },
  { label: '2Embed',      url: `https://www.2embed.cc/embed/${tmdbId}` },
  { label: 'Embed.su',    url: `https://embed.su/embed/movie/${tmdbId}` },
  { label: 'AutoEmbed',   url: `https://autoembed.cc/movie/tmdb/${tmdbId}` },
  { label: 'MultiEmbed',  url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1` },
  { label: 'Videasy',     url: `https://player.videasy.net/movie/${tmdbId}` },
]
