<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { getRankings } from '../services/api.js'

const router     = useRouter()
const items      = ref([])
const loading    = ref(true)
const loadingMore = ref(false)
const page       = ref(1)
const hasNext    = ref(false)

async function load(p = 1) {
  if (p === 1) loading.value = true
  else loadingMore.value = true

  const res = await getRankings(p).catch(() => null)
  if (res) {
    items.value   = p === 1 ? res.data : [...items.value, ...res.data]
    hasNext.value = res.pagination?.has_next ?? false
    page.value    = p
  }

  loading.value    = false
  loadingMore.value = false
}

function loadMore() { load(page.value + 1) }

function watch(anime) {
  router.push({ name: 'watch', params: { id: anime.id, ep: 1 } })
}

onMounted(() => load(1))
</script>

<template>
  <div class="page">
    <AppNavbar />

    <section class="banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <span class="tag">Hall of Fame</span>
        <h1 class="title">Full <span class="accent">Rankings</span></h1>
        <p class="sub">Every anime ranked by popularity</p>
      </div>
    </section>

    <main class="wrap">
      <!-- Skeleton -->
      <div v-if="loading" class="rank-list">
        <div v-for="n in 25" :key="n" class="rank-item skeleton-item">
          <div class="skeleton rank-num-sk"></div>
          <div class="skeleton thumb-sk"></div>
          <div class="info-sk">
            <div class="skeleton line-sk" style="width:60%"></div>
            <div class="skeleton line-sk" style="width:35%; margin-top:.4rem"></div>
          </div>
          <div class="skeleton score-sk"></div>
        </div>
      </div>

      <!-- List -->
      <div v-else class="rank-list">
        <article
          v-for="(anime, i) in items"
          :key="anime.id"
          class="rank-item"
          @click="watch(anime)"
        >
          <span class="rank-num" :class="{ gold: i === 0, silver: i === 1, bronze: i === 2 }">
            {{ i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}` }}
          </span>
          <img class="thumb" :src="anime.image" :alt="anime.title" loading="lazy" />
          <div class="info">
            <h3 class="anime-title">{{ anime.title }}</h3>
            <div class="info-meta">
              <span class="genre-tag">{{ anime.genre }}</span>
              <span>{{ anime.studio }}</span>
              <span v-if="anime.year">{{ anime.year }}</span>
              <span>{{ anime.episodes }} ep</span>
            </div>
          </div>
          <div class="score-wrap">
            <span class="score">{{ typeof anime.rating === 'number' ? anime.rating.toFixed(2) : '—' }}</span>
            <span class="score-label">Score</span>
            <span class="members" v-if="anime.members">{{ (anime.members / 1000).toFixed(0) }}K</span>
          </div>
        </article>
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
  background: radial-gradient(ellipse at 50% 60%, rgba(255,215,0,0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 30% 40%, rgba(0,240,255,0.1) 0%, transparent 55%), var(--bg);
}
.banner-content { position: relative; z-index: 2; text-align: center; padding: 5rem 2rem 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #ffd700; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,8vw,5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: var(--cyan); }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 900px; margin: 0 auto; padding: 2rem 2rem 4rem; }

.rank-list { display: flex; flex-direction: column; gap: .6rem; }

.rank-item {
  display: flex; align-items: center; gap: 1rem;
  padding: .85rem 1.1rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; cursor: pointer;
  transition: all .2s;
}
.rank-item:hover {
  border-color: var(--cyan-dim);
  box-shadow: 0 0 20px rgba(0,240,255,.1);
  transform: translateX(4px);
}

.rank-num {
  font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem;
  min-width: 3rem; text-align: center; color: var(--text-muted);
}
.rank-num.gold   { color: #ffd700; filter: drop-shadow(0 0 6px #ffd700); }
.rank-num.silver { color: #c0c0c0; }
.rank-num.bronze { color: #cd7f32; }

.thumb { width: 44px; height: 62px; object-fit: cover; border-radius: 4px; flex-shrink: 0; border: 1px solid var(--border); }

.info { flex: 1; min-width: 0; }
.anime-title { font-size: .92rem; font-weight: 700; color: var(--text); margin: 0 0 .3rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.info-meta { display: flex; gap: .75rem; flex-wrap: wrap; font-size: .72rem; color: var(--text-muted); }
.genre-tag { color: var(--pink); font-weight: 700; }

.score-wrap { text-align: right; flex-shrink: 0; }
.score { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: var(--cyan); line-height: 1; }
.score-label { display: block; font-size: .6rem; color: var(--text-muted); letter-spacing: .1em; text-transform: uppercase; }
.members { display: block; font-size: .7rem; color: var(--text-muted); margin-top: .1rem; }

/* Skeleton */
.skeleton-item { cursor: default; }
.skeleton-item:hover { transform: none; box-shadow: none; border-color: var(--border); }
.skeleton { background: linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; border-radius: 4px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.rank-num-sk { width: 3rem; height: 2rem; flex-shrink: 0; }
.thumb-sk    { width: 44px; height: 62px; flex-shrink: 0; border-radius: 4px; }
.info-sk     { flex: 1; }
.line-sk     { height: 14px; border-radius: 4px; }
.score-sk    { width: 50px; height: 44px; flex-shrink: 0; }

.load-more-wrap { text-align: center; margin-top: 2rem; }
.load-more-btn {
  padding: .7rem 2.5rem;
  background: linear-gradient(135deg, var(--cyan), #007acc);
  color: #000; border: none; border-radius: 6px;
  font-size: .88rem; font-weight: 800; letter-spacing: .05em;
  cursor: pointer; transition: box-shadow .2s;
  display: inline-flex; align-items: center; gap: .5rem;
}
.load-more-btn:hover { box-shadow: 0 0 24px rgba(0,240,255,.4); }
.load-more-btn:disabled { opacity: .6; cursor: default; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,.2); border-top-color: #000; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .rank-num { min-width: 2rem; font-size: 1rem; }
  .info-meta { gap: .4rem; }
  .score { font-size: 1.2rem; }
}
</style>
