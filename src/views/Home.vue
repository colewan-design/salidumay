<script setup>
import { ref, onMounted } from 'vue'
import HeroSection     from '../components/HeroSection.vue'
import TrendingNow     from '../components/TrendingNow.vue'
import SeasonalAnime   from '../components/SeasonalAnime.vue'
import FeaturedFilms   from '../components/FeaturedFilms.vue'
import AppFooter       from '../components/AppFooter.vue'

import { getTrending, getSeasonal } from '../services/api.js'
import { getPopularFilms, getUpcomingFilms, getFilmsByGenre } from '../services/tmdb.js'

// TMDB genre IDs
const GENRE_ACTION   = 28
const GENRE_HORROR   = 27
const GENRE_SCIFI    = 878
const GENRE_COMEDY   = 35
const GENRE_ROMANCE  = 10749

const featured  = ref([])
const trending  = ref([])
const seasonal  = ref([])

const filmRows = ref({
  popular:  { items: [], loading: true },
  upcoming: { items: [], loading: true },
  action:   { items: [], loading: true },
  horror:   { items: [], loading: true },
  scifi:    { items: [], loading: true },
  comedy:   { items: [], loading: true },
  romance:  { items: [], loading: true },
})

const loading = ref({ hero: true, trending: true, seasonal: true })

async function fetchFilmRow(key, fetcher) {
  const res = await fetcher().catch(() => null)
  filmRows.value[key].items   = res?.data?.slice(0, 20) ?? []
  filmRows.value[key].loading = false
}

async function fetchAll() {
  // Jikan rate-limit: 3 req/sec — anime first
  const [t, s] = await Promise.allSettled([getTrending(), getSeasonal()])

  if (t.status === 'fulfilled') {
    trending.value = t.value.data
    featured.value = t.value.data.filter(a => a.synopsis && a.image).slice(0, 6)
  }
  loading.value.hero = loading.value.trending = false

  if (s.status === 'fulfilled') seasonal.value = s.value.data
  loading.value.seasonal = false

  // Film rows — fire in parallel, TMDB has no strict rate limit for small bursts
  await Promise.all([
    fetchFilmRow('popular',  () => getPopularFilms(1)),
    fetchFilmRow('upcoming', () => getUpcomingFilms(1)),
    fetchFilmRow('action',   () => getFilmsByGenre(GENRE_ACTION)),
    fetchFilmRow('horror',   () => getFilmsByGenre(GENRE_HORROR)),
    fetchFilmRow('scifi',    () => getFilmsByGenre(GENRE_SCIFI)),
    fetchFilmRow('comedy',   () => getFilmsByGenre(GENRE_COMEDY)),
    fetchFilmRow('romance',  () => getFilmsByGenre(GENRE_ROMANCE)),
  ])
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
    <HeroSection :items="featured" :loading="loading.hero" />

    <main class="main-content">
      <TrendingNow   :items="trending" :loading="loading.trending" />
      <SeasonalAnime :items="seasonal" :loading="loading.seasonal" />

      <FeaturedFilms
        :items="filmRows.popular.items" :loading="filmRows.popular.loading"
        title="Featured" accent="Films" tag="Cinema" tagColor="pink" link="/films/popular"
      />
      <FeaturedFilms
        :items="filmRows.upcoming.items" :loading="filmRows.upcoming.loading"
        title="Coming" accent="Soon" tag="Upcoming" tagColor="cyan" link="/films/coming-soon"
      />
      <FeaturedFilms
        :items="filmRows.action.items" :loading="filmRows.action.loading"
        title="Action" accent="Movies" tag="Action" tagColor="pink" link="/films/action"
      />
      <FeaturedFilms
        :items="filmRows.horror.items" :loading="filmRows.horror.loading"
        title="Horror" accent="Films" tag="Horror" tagColor="cyan" link="/films/horror"
      />
      <FeaturedFilms
        :items="filmRows.scifi.items" :loading="filmRows.scifi.loading"
        title="Sci-Fi" accent="Movies" tag="Sci-Fi" tagColor="pink" link="/films/sci-fi"
      />
      <FeaturedFilms
        :items="filmRows.comedy.items" :loading="filmRows.comedy.loading"
        title="Comedy" accent="Films" tag="Comedy" tagColor="cyan" link="/films/comedy"
      />
      <FeaturedFilms
        :items="filmRows.romance.items" :loading="filmRows.romance.loading"
        title="Romance" accent="Films" tag="Romance" tagColor="pink" link="/films/romance"
      />
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
@media (max-width: 900px) {
  .main-content { padding: 0 1rem; }
}
</style>
