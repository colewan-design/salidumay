<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import {
  getPopularFilms, getTrendingFilms, getTopRatedFilms,
  getNowPlayingFilms, getUpcomingFilms, getFilmsByGenre,
} from '../services/tmdb.js'

const route  = useRoute()
const router = useRouter()

const CATEGORIES = {
  popular:     { title: 'Featured',  accent: 'Films',  tag: 'Cinema',   color: 'pink', fetcher: (p) => getPopularFilms(p) },
  trending:    { title: 'Trending',  accent: 'Films',  tag: 'Hot',      color: 'cyan', fetcher: (p) => getTrendingFilms(p) },
  'top-rated': { title: 'Top',       accent: 'Rated',  tag: 'Best',     color: 'pink', fetcher: (p) => getTopRatedFilms(p) },
  'now-playing':{ title: 'Now',      accent: 'Playing',tag: 'In Cinemas',color:'cyan', fetcher: (p) => getNowPlayingFilms(p) },
  'coming-soon':{ title: 'Coming',   accent: 'Soon',   tag: 'Upcoming', color: 'cyan', fetcher: (p) => getUpcomingFilms(p) },
  action:      { title: 'Action',    accent: 'Movies', tag: 'Action',   color: 'pink', fetcher: (p) => getFilmsByGenre(28, p) },
  horror:      { title: 'Horror',    accent: 'Films',  tag: 'Horror',   color: 'cyan', fetcher: (p) => getFilmsByGenre(27, p) },
  'sci-fi':    { title: 'Sci-Fi',    accent: 'Movies', tag: 'Sci-Fi',   color: 'pink', fetcher: (p) => getFilmsByGenre(878, p) },
  comedy:      { title: 'Comedy',    accent: 'Films',  tag: 'Comedy',   color: 'cyan', fetcher: (p) => getFilmsByGenre(35, p) },
  romance:     { title: 'Romance',   accent: 'Films',  tag: 'Romance',  color: 'pink', fetcher: (p) => getFilmsByGenre(10749, p) },
  thriller:    { title: 'Thriller',  accent: 'Films',  tag: 'Thriller', color: 'cyan', fetcher: (p) => getFilmsByGenre(53, p) },
  animation:   { title: 'Animation', accent: 'Films',  tag: 'Animated', color: 'pink', fetcher: (p) => getFilmsByGenre(16, p) },
}

const slug    = computed(() => route.params.category)
const config  = computed(() => CATEGORIES[slug.value] || CATEGORIES.popular)

const items       = ref([])
const loading     = ref(true)
const loadingMore = ref(false)
const page        = ref(1)
const totalPages  = ref(1)

async function load(p = 1) {
  if (p === 1) { loading.value = true; items.value = [] }
  else loadingMore.value = true

  const res = await config.value.fetcher(p).catch(() => null)

  if (res) {
    items.value    = p === 1 ? res.data : [...items.value, ...res.data]
    totalPages.value = res.totalPages ?? res.pagination?.total_pages ?? 1
    page.value     = p
  }

  loading.value    = false
  loadingMore.value = false
}

watch(slug, () => { page.value = 1; load(1) })
onMounted(() => load(1))
</script>

<template>
  <div class="page">

    <section class="banner">
      <div class="banner-bg" :class="config.color"></div>
      <div class="banner-content">
        <span :class="['tag', config.color]">{{ config.tag }}</span>
        <h1 class="title">
          {{ config.title }} <span :class="['accent', config.color]">{{ config.accent }}</span>
        </h1>
        <router-link to="/films" class="back-link">← All Films</router-link>
      </div>
    </section>

    <main class="wrap">

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
        <article
          v-for="film in items" :key="film.id"
          class="card"
          @click="router.push({ name: 'film', params: { id: film.id } })"
        >
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
              <span class="rating">★ {{ film.rating?.toFixed(1) }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="empty">
        <p class="empty-icon">🎬</p>
        <p class="empty-title">No films found</p>
        <p class="empty-sub">Try a different category</p>
      </div>

      <!-- Load more -->
      <div v-if="!loading && page < totalPages" class="load-more-wrap">
        <button class="load-more-btn" :disabled="loadingMore" @click="load(page + 1)">
          <span v-if="loadingMore" class="spin"></span>
          <span v-else>Load More</span>
        </button>
      </div>

    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }

.banner {
  position: relative;
  height: 30vh; min-height: 200px;
  display: flex; align-items: center; justify-content: center;
}
.banner-bg {
  position: absolute; inset: 0;
}
.banner-bg.pink {
  background:
    radial-gradient(ellipse at 30% 50%, rgba(255,45,120,.15) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 30%, rgba(124,58,237,.08) 0%, transparent 55%),
    var(--bg);
}
.banner-bg.cyan {
  background:
    radial-gradient(ellipse at 30% 50%, rgba(0,240,255,.12) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 30%, rgba(255,45,120,.07) 0%, transparent 55%),
    var(--bg);
}

.banner-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }

.tag {
  font-size: .7rem; font-weight: 800;
  letter-spacing: .2em; text-transform: uppercase;
  display: block; margin-bottom: .4rem;
}
.tag.pink { color: var(--pink); }
.tag.cyan { color: var(--cyan); }

.title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1; color: #fff; margin-bottom: .75rem;
}
.accent.pink { color: var(--pink); }
.accent.cyan { color: var(--cyan); }

.back-link {
  font-size: .78rem; font-weight: 700;
  color: var(--text-muted); text-decoration: none;
  transition: color .2s;
}
.back-link:hover { color: var(--text); }

.wrap { max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 4rem; }

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

.load-more-wrap { text-align: center; margin-top: 2.5rem; }
.load-more-btn { padding: .7rem 2.5rem; background: linear-gradient(135deg, var(--pink), #ff6fa8); color: #fff; border: none; border-radius: 6px; font-size: .88rem; font-weight: 800; cursor: pointer; transition: box-shadow .2s; display: inline-flex; align-items: center; gap: .5rem; }
.load-more-btn:hover { box-shadow: 0 0 24px rgba(255,45,120,.4); }
.load-more-btn:disabled { opacity: .6; cursor: default; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem; }
  .wrap { padding: 1rem 1rem 3rem; }
}
</style>
