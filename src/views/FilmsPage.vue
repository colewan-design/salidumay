<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import {
  getPopularFilms, getTopRatedFilms, getTrendingFilms,
  getNowPlayingFilms, getFilmGenres, getFilmsByGenre, searchFilms,
} from '../services/tmdb.js'

const router = useRouter()

const items        = ref([])
const loading      = ref(true)
const loadingMore  = ref(false)
const page         = ref(1)
const totalPages   = ref(1)
const activeTab    = ref('popular')
const genres       = ref([])
const activeGenre  = ref(null)
const searchQuery  = ref('')
const searching    = ref(false)
let   searchTimer  = null

const tabs = [
  { key: 'popular',    label: 'Popular' },
  { key: 'trending',   label: 'Trending' },
  { key: 'top_rated',  label: 'Top Rated' },
  { key: 'now_playing',label: 'Now Playing' },
]

const fetchers = {
  popular:     getPopularFilms,
  trending:    getTrendingFilms,
  top_rated:   getTopRatedFilms,
  now_playing: getNowPlayingFilms,
}

async function load(p = 1) {
  if (p === 1) loading.value = true
  else loadingMore.value = true

  let res
  if (searchQuery.value.trim().length >= 2) {
    res = await searchFilms(searchQuery.value.trim(), p).catch(() => null)
  } else if (activeGenre.value) {
    res = await getFilmsByGenre(activeGenre.value, p).catch(() => null)
  } else {
    res = await fetchers[activeTab.value](p).catch(() => null)
  }

  if (res) {
    items.value      = p === 1 ? res.data : [...items.value, ...res.data]
    totalPages.value = res.totalPages ?? 1
    page.value       = p
  }

  loading.value    = false
  loadingMore.value = false
}

function setTab(key) {
  activeTab.value   = key
  activeGenre.value = null
  searchQuery.value = ''
  load(1)
}

function setGenre(id) {
  activeGenre.value = id === activeGenre.value ? null : id
  searchQuery.value = ''
  load(1)
}

function loadMore() { load(page.value + 1) }

function watch_(film) {
  router.push({ name: 'film', params: { id: film.id } })
}

watch(searchQuery, (q) => {
  clearTimeout(searchTimer)
  if (q.trim().length >= 2) {
    searching.value = true
    searchTimer = setTimeout(() => { load(1); searching.value = false }, 450)
  } else if (q.trim().length === 0) {
    load(1)
  }
})

onMounted(async () => {
  genres.value = await getFilmGenres().catch(() => [])
  load(1)
})
</script>

<template>
  <div class="page">

    <section class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <span class="tag">Cinema</span>
        <h1 class="title">Films <span class="accent">&amp; Movies</span></h1>
        <p class="sub">Hollywood · International · Blockbusters · Classics</p>
        <div class="search-bar">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model="searchQuery" class="search-input" placeholder="Search movies…" autocomplete="off" />
          <span v-if="searching" class="search-spin"></span>
        </div>
      </div>
    </section>

    <main class="wrap">
      <!-- Tabs -->
      <div v-if="!searchQuery.trim()" class="tabs-row">
        <div class="tabs">
          <button
            v-for="t in tabs" :key="t.key"
            :class="['tab', { active: activeTab === t.key && !activeGenre }]"
            @click="setTab(t.key)"
          >{{ t.label }}</button>
        </div>
      </div>

      <!-- Genre chips -->
      <div v-if="genres.length && !searchQuery.trim()" class="genre-row">
        <button
          v-for="g in genres" :key="g.id"
          :class="['genre-chip', { active: activeGenre === g.id }]"
          @click="setGenre(g.id)"
        >{{ g.name }}</button>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="grid">
        <div v-for="n in 20" :key="n" class="skeleton-card">
          <div class="sk-img skeleton"></div>
          <div class="sk-line skeleton"></div>
          <div class="sk-line2 skeleton"></div>
        </div>
      </div>

      <!-- Grid -->
      <div v-else-if="items.length" class="grid">
        <article v-for="film in items" :key="film.id" class="card" @click="watch_(film)">
          <div class="card-img">
            <img :src="film.image" :alt="film.title" loading="lazy" />
            <span class="film-badge">FILM</span>
            <div class="play-overlay">
              <div class="play-btn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ film.title }}</h3>
            <div class="meta">
              <span class="year">{{ film.year }}</span>
              <span class="rating">★ {{ film.rating.toFixed(1) }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="empty">
        <p class="empty-icon">🎬</p>
        <p class="empty-title">No results</p>
        <p class="empty-sub">Try a different search or category</p>
      </div>

      <!-- Load More -->
      <div v-if="!loading && page < totalPages" class="load-more-wrap">
        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
          <span v-if="loadingMore" class="spin"></span>
          <span v-else>Load More</span>
        </button>
      </div>

      <!-- TMDB credit -->
      <p class="tmdb-credit">
        Data provided by
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener">The Movie Database (TMDB)</a>
      </p>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }

.banner {
  position: relative; height: 36vh; min-height: 240px;
  display: flex; align-items: center; justify-content: center;
}
.banner-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(255,45,120,0.12) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 30%, rgba(0,240,255,0.08) 0%, transparent 55%),
    var(--bg);
}
.banner-content { position: relative; z-index: 2; text-align: center; padding: 2rem 2rem 2rem; }
.tag  { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--pink); }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,8vw,5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: var(--pink); }
.sub { font-size: .9rem; color: var(--text-muted); margin-bottom: 1.5rem; }

.search-bar {
  position: relative; display: inline-flex; align-items: center;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px; padding: .5rem 1.25rem; width: min(480px, 90vw);
  backdrop-filter: blur(12px);
  transition: border-color .2s;
}
.search-bar:focus-within { border-color: rgba(255,45,120,0.5); }
.search-icon { width: 1rem; height: 1rem; color: var(--text-muted); flex-shrink: 0; margin-right: .6rem; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text); font-size: .9rem;
}
.search-input::placeholder { color: var(--text-muted); }
.search-spin {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.15);
  border-top-color: var(--pink); border-radius: 50%;
  animation: spin .8s linear infinite; flex-shrink: 0; margin-left: .5rem;
}

.wrap { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 4rem; }

.tabs-row { margin-bottom: 1rem; }
.tabs { display: flex; gap: .4rem; flex-wrap: wrap; }
.tab {
  padding: .4rem 1rem; border-radius: 999px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text-muted); font-size: .82rem; font-weight: 700;
  cursor: pointer; transition: all .2s; letter-spacing: .04em;
}
.tab:hover { border-color: var(--pink); color: var(--pink); }
.tab.active { background: var(--pink); border-color: var(--pink); color: #fff; }

.genre-row { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.genre-chip {
  padding: .28rem .75rem; border-radius: 999px;
  background: transparent; border: 1px solid var(--border);
  color: var(--text-muted); font-size: .75rem; font-weight: 600;
  cursor: pointer; transition: all .2s;
}
.genre-chip:hover { border-color: var(--cyan-dim); color: var(--cyan); }
.genre-chip.active { background: rgba(0,240,255,.1); border-color: var(--cyan); color: var(--cyan); }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; }

.card { border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); cursor: pointer; transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 0 0 1px rgba(255,45,120,.35), 0 8px 40px rgba(255,45,120,.1); }
.card:hover .play-overlay { opacity: 1; }
.card:hover .card-img img { transform: scale(1.08); }

.card-img { position: relative; padding-top: 150%; overflow: hidden; background: #0d1527; }
.card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }

.film-badge { position: absolute; top: 8px; left: 8px; background: rgba(255,45,120,.25); color: var(--pink); border: 1px solid rgba(255,45,120,.45); font-size: .58rem; font-weight: 800; padding: .18rem .4rem; border-radius: 4px; z-index: 2; letter-spacing: .08em; }

.play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .25s; background: linear-gradient(to top, rgba(10,14,26,.85) 0%, transparent 70%); z-index: 3; }
.play-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--pink); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(255,45,120,.5); }
.play-btn svg { width: 18px; height: 18px; color: #fff; }

.card-body { padding: .7rem; }
.card-title { font-size: .85rem; font-weight: 700; color: var(--text); margin: 0 0 .35rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; justify-content: space-between; font-size: .72rem; color: var(--text-muted); }
.rating { color: #ffd700; font-weight: 700; }

.empty { text-align: center; padding: 6rem 2rem; }
.empty-icon { font-size: 3rem; }
.empty-title { font-size: 1.2rem; font-weight: 700; color: var(--text); margin: .5rem 0; }
.empty-sub { font-size: .85rem; color: var(--text-muted); }

.skeleton-card { border-radius: 8px; overflow: hidden; background: var(--surface); }
.skeleton { background: linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk-img  { padding-top: 150%; }
.sk-line { height: 14px; margin: .75rem .7rem .3rem; border-radius: 4px; }
.sk-line2{ height: 10px; margin: 0 .7rem .75rem; width: 60%; border-radius: 4px; }

.load-more-wrap { text-align: center; margin-top: 2rem; }
.load-more-btn { padding: .7rem 2.5rem; background: linear-gradient(135deg, var(--pink), #ff6fa8); color: #fff; border: none; border-radius: 6px; font-size: .88rem; font-weight: 800; cursor: pointer; transition: box-shadow .2s; display: inline-flex; align-items: center; gap: .5rem; }
.load-more-btn:hover { box-shadow: 0 0 24px rgba(255,45,120,.4); }
.load-more-btn:disabled { opacity: .6; cursor: default; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.tmdb-credit { text-align: center; margin-top: 2rem; font-size: .72rem; color: var(--text-muted); }
.tmdb-credit a { color: var(--cyan); text-decoration: none; }
.tmdb-credit a:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem; }
  .wrap { padding: 1rem 1rem 3rem; }
}
</style>
