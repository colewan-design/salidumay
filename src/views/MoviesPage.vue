<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import { getMovies } from '../services/api.js'
import { addToLibrary, removeFromLibrary, getLibrary } from '../services/userdata.js'

const router      = useRouter()
const items       = ref([])
const loading     = ref(true)
const loadingMore = ref(false)
const page        = ref(1)
const hasNext     = ref(false)
const libraryIds  = ref(new Set(getLibrary().map(a => String(a.id))))

async function toggleLibrary(e, anime) {
  e.stopPropagation()
  const id = String(anime.id)
  if (libraryIds.value.has(id)) {
    await removeFromLibrary(anime.id)
    libraryIds.value.delete(id)
  } else {
    await addToLibrary(anime)
    libraryIds.value.add(id)
  }
  libraryIds.value = new Set(libraryIds.value)
}

async function load(p = 1) {
  if (p === 1) loading.value = true
  else loadingMore.value = true

  const res = await getMovies(p).catch(() => null)
  if (res) {
    items.value   = p === 1 ? res.data : [...items.value, ...res.data]
    hasNext.value = res.pagination?.has_next ?? false
    page.value    = p
  }

  loading.value     = false
  loadingMore.value = false
}

function loadMore() { load(page.value + 1) }
function watch(anime) { router.push({ name: 'watch', params: { id: anime.id, ep: 1 } }) }

onMounted(() => load(1))
</script>

<template>
  <div class="page">

    <section class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <span class="tag">Cinema</span>
        <h1 class="title">Anime <span class="accent">Movies</span></h1>
        <p class="sub">Top-rated anime films of all time</p>
      </div>
    </section>

    <main class="wrap">
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
        <article v-for="(anime, i) in items" :key="anime.id" class="card" @click="watch(anime)">
          <div class="card-img">
            <img :src="anime.image" :alt="anime.title" loading="lazy" />
            <span class="movie-badge">🎬 MOVIE</span>
            <span class="rank-badge">#{{ i + 1 }}</span>
            <div class="play-overlay">
              <div class="play-btn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <button
                :class="['add-btn', { saved: libraryIds.has(String(anime.id)) }]"
                :title="libraryIds.has(String(anime.id)) ? 'Remove from library' : 'Add to library'"
                @click="toggleLibrary($event, anime)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                  <path v-if="!libraryIds.has(String(anime.id))" d="M12 5v14M5 12h14" stroke-linecap="round"/>
                  <path v-else d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="card-body">
            <span class="genre">{{ anime.genre }}</span>
            <h3 class="card-title">{{ anime.title }}</h3>
            <div class="meta">
              <span class="year">{{ anime.year || '—' }}</span>
              <span class="rating">★ {{ typeof anime.rating === 'number' ? anime.rating.toFixed(1) : '—' }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="empty">
        <p class="empty-icon">🎬</p>
        <p class="empty-title">No movies yet</p>
        <p class="empty-sub">Run <code>php artisan anime:scrape</code> on the server to populate movies</p>
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
  position: relative; height: 34vh; min-height: 220px;
  display: flex; align-items: center; justify-content: center;
}
.banner-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 40% 60%, rgba(255,215,0,0.1) 0%, transparent 55%),
              radial-gradient(ellipse at 70% 30%, rgba(255,45,120,0.1) 0%, transparent 55%), var(--bg);
}
.banner-content { position: relative; z-index: 2; text-align: center; padding: 2rem 2rem 2rem; }
.tag  { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #ffd700; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,8vw,5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #ffd700; }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 4rem; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; }

.card { border-radius: 8px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); cursor: pointer; transition: transform .3s cubic-bezier(.175,.885,.32,1.275), box-shadow .3s; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 0 0 1px rgba(255,215,0,.4), 0 8px 40px rgba(255,215,0,.12); }
.card:hover .play-overlay { opacity: 1; }
.card:hover .card-img img { transform: scale(1.08); }

.card-img { position: relative; padding-top: 140%; overflow: hidden; background: #0d1527; }
.card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }

.movie-badge { position: absolute; top: 8px; left: 8px; background: rgba(255,215,0,.2); color: #ffd700; border: 1px solid rgba(255,215,0,.4); font-size: .6rem; font-weight: 800; padding: .2rem .45rem; border-radius: 4px; z-index: 2; }
.rank-badge  { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,.6); color: rgba(255,255,255,.8); font-size: .62rem; font-weight: 800; padding: .2rem .45rem; border-radius: 4px; z-index: 2; }

.play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: .6rem; opacity: 0; transition: opacity .25s; background: linear-gradient(to top, rgba(10,14,26,.8) 0%, transparent 70%); z-index: 3; }
.play-btn { width: 44px; height: 44px; border-radius: 50%; background: #ffd700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(255,215,0,.5); }
.play-btn svg { width: 18px; height: 18px; color: #000; }
.add-btn { width: 34px; height: 34px; border-radius: 50%; background: rgba(0,240,255,.15); border: 1px solid rgba(0,240,255,.35); color: var(--cyan); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
.add-btn:hover { background: rgba(0,240,255,.3); }
.add-btn.saved { background: rgba(110,255,110,.15); border-color: rgba(110,255,110,.4); color: #6eff6e; }
.add-btn.saved:hover { background: rgba(110,255,110,.28); }

.card-body { padding: .7rem; }
.genre { font-size: .66rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #ffd700; }
.card-title { font-size: .88rem; font-weight: 700; color: var(--text); margin: .2rem 0 .4rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; justify-content: space-between; font-size: .72rem; color: var(--text-muted); }
.rating { color: #ffd700; font-weight: 700; }

.empty { text-align: center; padding: 6rem 2rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
.empty-sub { font-size: .85rem; color: var(--text-muted); }
.empty-sub code { background: var(--surface); padding: .1rem .4rem; border-radius: 4px; color: var(--cyan); font-size: .8rem; }

.skeleton-card { border-radius: 8px; overflow: hidden; background: var(--surface); }
.skeleton { background: linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk-img  { padding-top: 140%; }
.sk-line { height: 14px; margin: .75rem .7rem .3rem; border-radius: 4px; }
.sk-line2{ height: 10px; margin: 0 .7rem .75rem; width: 60%; border-radius: 4px; }

.load-more-wrap { text-align: center; margin-top: 2rem; }
.load-more-btn { padding: .7rem 2.5rem; background: linear-gradient(135deg, #ffd700, #e6a800); color: #000; border: none; border-radius: 6px; font-size: .88rem; font-weight: 800; cursor: pointer; transition: box-shadow .2s; display: inline-flex; align-items: center; gap: .5rem; }
.load-more-btn:hover { box-shadow: 0 0 24px rgba(255,215,0,.4); }
.load-more-btn:disabled { opacity: .6; cursor: default; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,.2); border-top-color: #000; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) { .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem; } }
</style>
