<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { getSeasonal } from '../services/api.js'

const router  = useRouter()
const items   = ref([])
const loading = ref(true)

const now    = new Date()
const year   = now.getFullYear()
const month  = now.getMonth() + 1
const season = month <= 3 ? 'Winter' : month <= 6 ? 'Spring' : month <= 9 ? 'Summer' : 'Fall'

onMounted(async () => {
  const res = await getSeasonal().catch(() => null)
  if (res) items.value = res.data
  loading.value = false
})

function watch(anime) {
  router.push({ name: 'watch', params: { id: anime.id, ep: 1 } })
}
</script>

<template>
  <div class="page">
    <AppNavbar />

    <section class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <span class="tag pink">Now Airing</span>
        <h1 class="title">{{ season }} <span class="accent">{{ year }}</span></h1>
        <p class="sub">All anime airing this season</p>
      </div>
    </section>

    <main class="wrap">
      <div v-if="loading" class="grid">
        <div v-for="n in 16" :key="n" class="skeleton-card">
          <div class="sk-img skeleton"></div>
          <div class="sk-line skeleton"></div>
          <div class="sk-line2 skeleton"></div>
        </div>
      </div>

      <div v-else-if="items.length" class="grid">
        <article v-for="anime in items" :key="anime.id" class="card" @click="watch(anime)">
          <div class="card-img">
            <img :src="anime.image" :alt="anime.title" loading="lazy" />
            <span v-if="anime.status === 'Airing'" class="airing-badge">● AIRING</span>
            <div class="play-overlay">
              <div class="play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            </div>
          </div>
          <div class="card-body">
            <span class="genre">{{ anime.genre }}</span>
            <h3 class="card-title">{{ anime.title }}</h3>
            <div class="meta">
              <span>{{ anime.episodes }} ep</span>
              <span class="rating">★ {{ typeof anime.rating === 'number' ? anime.rating.toFixed(1) : anime.rating }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty">
        <p class="empty-icon">🌸</p>
        <p class="empty-title">No seasonal anime found</p>
        <p class="empty-sub">Try running the scraper to populate data</p>
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
  background: radial-gradient(ellipse at 40% 60%, rgba(255,45,120,0.15) 0%, transparent 55%),
              radial-gradient(ellipse at 70% 30%, rgba(0,240,255,0.1) 0%, transparent 55%), var(--bg);
}
.banner-content { position: relative; z-index: 2; text-align: center; padding: 5rem 2rem 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; }
.pink { color: var(--pink); }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,8vw,5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: var(--pink); }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 4rem; }
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
.genre { font-size: .66rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--pink); }
.card-title { font-size: .88rem; font-weight: 700; color: var(--text); margin: .2rem 0 .4rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; justify-content: space-between; font-size: .72rem; color: var(--text-muted); }
.rating { color: #ffd700; font-weight: 700; }

.empty { text-align: center; padding: 6rem 2rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
.empty-sub { font-size: .9rem; color: var(--text-muted); }

.skeleton-card { border-radius: 8px; overflow: hidden; background: var(--surface); }
.skeleton { background: linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk-img  { padding-top: 140%; }
.sk-line { height: 14px; margin: .75rem .7rem .3rem; border-radius: 4px; }
.sk-line2{ height: 10px; margin: 0 .7rem .75rem; width: 60%; border-radius: 4px; }

@media (max-width: 640px) { .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .75rem; } }
</style>
