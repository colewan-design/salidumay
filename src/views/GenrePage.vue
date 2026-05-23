<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import { getByGenre, getGenres } from '../services/api.js'

const router      = useRouter()
const route       = useRoute()
const items       = ref([])
const genres      = ref([])
const loading     = ref(true)
const loadingMore = ref(false)
const page        = ref(1)
const hasNext     = ref(false)
const activeGenre = ref(route.params.genre || '')

async function loadGenres() {
  const res = await getGenres().catch(() => null)
  if (res) genres.value = res.data.map(g => g.name)
}

async function load(p = 1) {
  if (!activeGenre.value) return
  if (p === 1) loading.value = true
  else loadingMore.value = true

  const res = await getByGenre(activeGenre.value, p).catch(() => null)
  if (res) {
    items.value   = p === 1 ? res.data : [...items.value, ...res.data]
    hasNext.value = res.pagination?.has_next ?? false
    page.value    = p
  }

  loading.value     = false
  loadingMore.value = false
}

function selectGenre(genre) {
  activeGenre.value = genre
  page.value = 1
  router.replace({ name: 'genre', params: { genre } })
  load(1)
}

function loadMore() { load(page.value + 1) }

function watchAnime(anime) {
  router.push({ name: 'watch', params: { id: anime.id, ep: 1 } })
}

watch(() => route.params.genre, (g) => {
  if (g && g !== activeGenre.value) { activeGenre.value = g; load(1) }
})

onMounted(async () => {
  await loadGenres()
  if (!activeGenre.value && genres.value.length) activeGenre.value = genres.value[0]
  load(1)
})
</script>

<template>
  <div class="page">

    <section class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <span class="tag">Browse</span>
        <h1 class="title">Anime by <span class="accent">Genre</span></h1>
        <p class="sub">{{ activeGenre || 'Pick a genre below' }}</p>
      </div>
    </section>

    <main class="wrap">
      <!-- Genre chips -->
      <div class="genres-bar">
        <button
          v-for="g in genres"
          :key="g"
          :class="['genre-chip', { active: activeGenre === g }]"
          @click="selectGenre(g)"
        >{{ g }}</button>
      </div>

      <!-- Count -->
      <p class="count" v-if="!loading && items.length">
        {{ items.length }}{{ hasNext ? '+' : '' }} anime in <strong>{{ activeGenre }}</strong>
      </p>

      <!-- Skeleton -->
      <div v-if="loading" class="grid">
        <div v-for="n in 24" :key="n" class="skeleton-card">
          <div class="sk-img skeleton"></div>
          <div class="sk-line skeleton"></div>
          <div class="sk-line2 skeleton"></div>
        </div>
      </div>

      <!-- Grid -->
      <div v-else-if="items.length" class="grid">
        <article v-for="anime in items" :key="anime.id" class="card" @click="watchAnime(anime)">
          <div class="card-img">
            <img :src="anime.image" :alt="anime.title" loading="lazy" />
            <span v-if="anime.status === 'Airing'" class="airing-badge">● AIRING</span>
            <div class="play-overlay">
              <div class="play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ anime.title }}</h3>
            <div class="meta">
              <span>{{ anime.episodes }} ep</span>
              <span class="rating">★ {{ typeof anime.rating === 'number' ? anime.rating.toFixed(1) : anime.rating }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty">
        <p class="empty-icon">⊘</p>
        <p class="empty-title">No anime found for "{{ activeGenre }}"</p>
        <p class="empty-sub">Try running the scraper with <code>--full</code> to get more data</p>
      </div>

      <!-- Load more -->
      <div class="load-more-wrap" v-if="!loading && hasNext">
        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
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
  position: relative; height: 30vh; min-height: 200px;
  display: flex; align-items: center; justify-content: center;
}
.banner-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 60% 60%, rgba(255,45,120,0.12) 0%, transparent 55%),
              radial-gradient(ellipse at 30% 40%, rgba(0,240,255,0.1) 0%, transparent 55%), var(--bg);
}
.banner-content { position: relative; z-index: 2; text-align: center; padding: 2rem 2rem 1.5rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: var(--pink); }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem,6vw,4rem); line-height: 1; color: #fff; margin: .3rem 0 .4rem; }
.accent { color: var(--pink); }
.sub { font-size: .9rem; color: var(--cyan); font-weight: 600; letter-spacing: .05em; }

.wrap { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem 4rem; }

.genres-bar {
  display: flex; flex-wrap: wrap; gap: .5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}
.genre-chip {
  padding: .3rem .85rem; border-radius: 20px;
  font-size: .78rem; font-weight: 700;
  border: 1px solid var(--border); background: transparent;
  color: var(--text-muted); cursor: pointer; transition: all .2s;
}
.genre-chip:hover { border-color: var(--pink); color: var(--pink); }
.genre-chip.active { background: rgba(255,45,120,.15); border-color: var(--pink); color: var(--pink); }

.count { font-size: .8rem; color: var(--text-muted); margin-bottom: 1.25rem; }
.count strong { color: var(--text); }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; }

.card { border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); cursor: pointer; transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 0 0 1px rgba(255,45,120,.4), 0 8px 40px rgba(255,45,120,.15); }
.card:hover .play-overlay { opacity: 1; }
.card:hover .card-img img { transform: scale(1.08); }

.card-img { position: relative; padding-top: 140%; overflow: hidden; background: #0d1527; }
.card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
.airing-badge { position: absolute; bottom: 8px; left: 8px; background: rgba(0,240,255,.15); color: var(--cyan); border: 1px solid var(--cyan-dim); font-size: .62rem; font-weight: 800; padding: .2rem .5rem; border-radius: 4px; z-index: 2; }
.play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .25s; background: linear-gradient(to top, rgba(10,14,26,.8) 0%, transparent 70%); z-index: 3; }
.play-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--pink); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(255,45,120,.6); }
.play-btn svg { width: 18px; height: 18px; color: #fff; }

.card-body { padding: .7rem; }
.card-title { font-size: .88rem; font-weight: 700; color: var(--text); margin: 0 0 .4rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; justify-content: space-between; font-size: .72rem; color: var(--text-muted); }
.rating { color: #ffd700; font-weight: 700; }

.empty { text-align: center; padding: 4rem 2rem; }
.empty-icon { font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; }
.empty-title { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
.empty-sub { font-size: .85rem; color: var(--text-muted); }
.empty-sub code { background: var(--surface); padding: .1rem .4rem; border-radius: 4px; color: var(--cyan); }

.skeleton-card { border-radius: 8px; overflow: hidden; background: var(--surface); }
.skeleton { background: linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk-img  { padding-top: 140%; }
.sk-line { height: 14px; margin: .75rem .7rem .3rem; border-radius: 4px; }
.sk-line2{ height: 10px; margin: 0 .7rem .75rem; width: 60%; border-radius: 4px; }

.load-more-wrap { text-align: center; margin-top: 2rem; }
.load-more-btn { padding: .7rem 2.5rem; background: linear-gradient(135deg, var(--pink), #c4005a); color: #fff; border: none; border-radius: 6px; font-size: .88rem; font-weight: 800; cursor: pointer; transition: box-shadow .2s; display: inline-flex; align-items: center; gap: .5rem; }
.load-more-btn:hover { box-shadow: 0 0 24px rgba(255,45,120,.4); }
.load-more-btn:disabled { opacity: .6; cursor: default; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) { .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem; } .wrap { padding: 1rem 1rem 3rem; } }
</style>
