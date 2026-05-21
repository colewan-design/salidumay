<script setup>
import { ref, onMounted } from 'vue'
import AppNavbar       from '../components/AppNavbar.vue'
import HeroSection     from '../components/HeroSection.vue'
import TrendingNow     from '../components/TrendingNow.vue'
import SeasonalAnime   from '../components/SeasonalAnime.vue'
import GenreExplorer   from '../components/GenreExplorer.vue'
import TopAnime        from '../components/TopAnime.vue'
import CommunitySection from '../components/CommunitySection.vue'
import AppFooter       from '../components/AppFooter.vue'

import {
  getHero, getTrending, getSeasonal, getGenres, getTop, getCommunity,
} from '../services/api.js'

const hero      = ref(null)
const trending  = ref([])
const seasonal  = ref([])
const genres    = ref([])
const top       = ref([])
const community = ref([])

const loading = ref({
  hero: true, trending: true, seasonal: true,
  genres: true, top: true, community: true,
})

function settle(result, ref, key) {
  if (result.status === 'fulfilled') ref.value = result.value.data
  loading.value[key] = false
}

async function fetchAll() {
  // Jikan rate-limit: 3 req/sec — fire in two staggered batches
  const [h, t, s] = await Promise.allSettled([
    getHero(), getTrending(), getSeasonal(),
  ])
  await new Promise(r => setTimeout(r, 400))
  const [g, tp, c] = await Promise.allSettled([
    getGenres(), getTop(), getCommunity(),
  ])

  settle(h,  hero,      'hero')
  settle(t,  trending,  'trending')
  settle(s,  seasonal,  'seasonal')
  settle(g,  genres,    'genres')
  settle(tp, top,       'top')
  settle(c,  community, 'community')
}

// Intersection-observer fade-in
function initScrollReveal() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
    }),
    { threshold: 0.08 }
  )
  document.querySelectorAll('.section').forEach((el) => io.observe(el))
}

onMounted(async () => {
  await fetchAll()
  initScrollReveal()
})
</script>

<template>
  <div class="page">
    <AppNavbar />
    <HeroSection :hero="hero" :loading="loading.hero" />

    <main class="main-content">
      <TrendingNow  :items="trending"  :loading="loading.trending"  />
      <SeasonalAnime :items="seasonal" :loading="loading.seasonal"  />

      <div class="two-col">
        <GenreExplorer :genres="genres" :loading="loading.genres" />
        <TopAnime      :items="top"     :loading="loading.top"    />
      </div>

      <CommunitySection :threads="community" :loading="loading.community" />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.main-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; gap: 0; }
  .main-content { padding: 0 1rem; }
}
</style>
