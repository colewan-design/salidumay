<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import { getAnimeList, getGenres, searchAnime } from '../services/api.js'

const router    = useRouter()
const route     = useRoute()
const allAnime  = ref([])
const baseAnime = ref([])
const genres    = ref([])
const loading   = ref(true)

const searchQuery      = ref('')
const suggestions      = ref([])
const showSuggestions  = ref(false)
const activeSuggestion = ref(-1)
const activeGenre  = ref('All')
const activeStatus = ref('All')
const activeSort   = ref('rating')

const statuses = ['All', 'Airing', 'Done']
const sorts    = [
  { value: 'rating',    label: 'Top Rated' },
  { value: 'newest',    label: 'Newest' },
  { value: 'popular',   label: 'Most Popular' },
  { value: 'title',     label: 'A–Z' },
]

const filtered = computed(() => {
  let list = [...allAnime.value]

  if (activeGenre.value !== 'All')
    list = list.filter(a => a.genre === activeGenre.value)
  if (activeStatus.value !== 'All')
    list = list.filter(a => a.status === activeStatus.value)

  if (activeSort.value === 'rating')  list.sort((a, b) => b.rating - a.rating)
  if (activeSort.value === 'newest')  list.sort((a, b) => (b.year || 0) - (a.year || 0))
  if (activeSort.value === 'popular') list.sort((a, b) => (b.members || 0) - (a.members || 0))
  if (activeSort.value === 'title')   list.sort((a, b) => a.title.localeCompare(b.title))

  return list
})

function watchAnime(anime) {
  router.push({ name: 'watch', params: { id: anime.id, ep: 1 } })
}

let searchTimer = null

watch(searchQuery, (q) => {
  clearTimeout(searchTimer)
  activeSuggestion.value = -1
  const trimmed = q.trim()
  if (trimmed.length >= 2) {
    loading.value = true
    searchTimer = setTimeout(async () => {
      const res = await searchAnime(trimmed).catch(() => null)
      if (res) {
        allAnime.value = res.data
        suggestions.value = res.data.slice(0, 7)
        showSuggestions.value = true
      }
      loading.value = false
    }, 400)
  } else {
    suggestions.value = []
    showSuggestions.value = false
    if (!trimmed) allAnime.value = baseAnime.value
  }
})

function selectSuggestion(anime) {
  showSuggestions.value = false
  router.push({ name: 'watch', params: { id: anime.id, ep: 1 } })
}

function onSearchKeydown(e) {
  if (e.key === 'Escape') {
    searchQuery.value = ''
    showSuggestions.value = false
    return
  }
  if (!showSuggestions.value || !suggestions.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeSuggestion.value = Math.min(activeSuggestion.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeSuggestion.value = Math.max(activeSuggestion.value - 1, -1)
  } else if (e.key === 'Enter' && activeSuggestion.value >= 0) {
    e.preventDefault()
    selectSuggestion(suggestions.value[activeSuggestion.value])
  }
}

function onSearchBlur() {
  setTimeout(() => { showSuggestions.value = false }, 160)
}

onUnmounted(() => clearTimeout(searchTimer))

onMounted(async () => {
  const [al, gl] = await Promise.allSettled([getAnimeList(), getGenres()])
  if (al.status === 'fulfilled') { allAnime.value = al.value.data; baseAnime.value = al.value.data }
  if (gl.status === 'fulfilled') genres.value = ['All', ...gl.value.data.map(g => g.name)]
  loading.value = false

  if (route.query.q) searchQuery.value = String(route.query.q)
})
</script>

<template>
  <div class="page">

    <!-- Banner -->
    <section class="watch-banner">
      <div class="banner-bg"></div>
      <div class="scanlines"></div>
      <div class="banner-content">
        <p class="banner-tag">ANIMEX LIBRARY</p>
        <h1 class="banner-title gradient-text">Watch Anime</h1>
        <p class="banner-sub">Stream thousands of episodes in HD — dubbed &amp; subbed</p>

        <!-- Search -->
        <div class="search-container">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchQuery"
              class="search-input"
              placeholder="Search by title or genre…"
              autocomplete="off"
              @keydown="onSearchKeydown"
              @blur="onSearchBlur"
              @focus="showSuggestions = suggestions.length > 0"
            />
            <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; showSuggestions = false">✕</button>
          </div>

          <Transition name="suggestions">
            <ul v-if="showSuggestions && suggestions.length" class="suggestions-dropdown">
              <li
                v-for="(anime, i) in suggestions"
                :key="anime.id"
                :class="['suggestion-item', { active: activeSuggestion === i }]"
                @mousedown.prevent="selectSuggestion(anime)"
              >
                <img :src="anime.image" :alt="anime.title" class="sug-img" />
                <div class="sug-info">
                  <span class="sug-title">{{ anime.title }}</span>
                  <span class="sug-meta">{{ anime.genre }} · ★ {{ typeof anime.rating === 'number' ? anime.rating.toFixed(1) : anime.rating }} · {{ anime.episodes }}ep</span>
                </div>
                <span :class="['sug-status', anime.status === 'Airing' ? 'airing' : 'done']">{{ anime.status === 'Airing' ? '● Airing' : '✓ Done' }}</span>
              </li>
            </ul>
          </Transition>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filters-inner">
        <!-- Genre chips -->
        <div class="filter-group">
          <span class="filter-label">Genre</span>
          <div class="chips">
            <button
              v-for="g in genres"
              :key="g"
              :class="['chip', { active: activeGenre === g }]"
              @click="activeGenre = g"
            >{{ g }}</button>
          </div>
        </div>

        <div class="filter-row">
          <!-- Status -->
          <div class="filter-group">
            <span class="filter-label">Status</span>
            <div class="chips">
              <button
                v-for="s in statuses"
                :key="s"
                :class="['chip', { active: activeStatus === s }]"
                @click="activeStatus = s"
              >{{ s }}</button>
            </div>
          </div>

          <!-- Sort -->
          <div class="filter-group sort-group">
            <span class="filter-label">Sort</span>
            <select v-model="activeSort" class="sort-select">
              <option v-for="s in sorts" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <main class="catalog-wrap">
      <!-- Results count -->
      <div class="results-meta" v-if="!loading">
        <span class="results-count">{{ filtered.length }} anime</span>
        <button v-if="activeGenre !== 'All' || activeStatus !== 'All' || searchQuery" class="clear-filters" @click="activeGenre='All'; activeStatus='All'; searchQuery=''">
          Clear filters
        </button>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="anime-grid">
        <div v-for="n in 18" :key="n" class="card-skeleton">
          <div class="sk-img skeleton"></div>
          <div class="sk-text skeleton"></div>
          <div class="sk-text2 skeleton"></div>
        </div>
      </div>

      <!-- Anime Grid -->
      <div v-else-if="filtered.length" class="anime-grid">
        <article
          v-for="anime in filtered"
          :key="anime.id"
          class="w-card"
          @click="watchAnime(anime)"
        >
          <div class="w-card-img">
            <img :src="anime.image" :alt="anime.title" loading="lazy" />
            <div class="glitch-overlay"></div>
            <span v-if="anime.new" class="badge-new">NEW</span>
            <span v-if="anime.status" :class="['badge-status', anime.status === 'Airing' ? 'airing' : 'done']">
              {{ anime.status === 'Airing' ? '● AIRING' : '✓ DONE' }}
            </span>
            <div class="play-overlay">
              <div class="play-circle">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="w-card-body">
            <span class="w-genre">{{ anime.genre }}</span>
            <h3 class="w-title">{{ anime.title }}</h3>
            <div class="w-meta">
              <span class="w-eps">{{ anime.episodes }} ep</span>
              <span class="w-rating">★ {{ typeof anime.rating === 'number' ? anime.rating.toFixed(1) : anime.rating }}</span>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <div class="empty-icon">⊘</div>
        <p class="empty-title">No anime found</p>
        <p class="empty-sub">Try adjusting your filters or search query</p>
        <button class="btn-reset" @click="activeGenre='All'; activeStatus='All'; searchQuery=''">Reset Filters</button>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }

/* ── Banner ── */
.watch-banner {
  position: relative;
  height: 38vh;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.banner-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 60%, rgba(255,45,120,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 40%, rgba(0,240,255,0.12) 0%, transparent 55%),
    var(--bg);
}
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px);
  pointer-events: none;
}
.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 6rem 2rem 2rem;
}
.banner-tag {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--cyan);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.banner-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
}
.banner-sub {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
}

/* Search */
.search-container { position: relative; max-width: 480px; margin: 0 auto; }
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--cyan-dim);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-bar:focus-within {
  border-color: var(--cyan);
  box-shadow: 0 0 20px rgba(0,240,255,0.15);
}
.search-bar svg { width: 1rem; height: 1rem; color: var(--text-muted); flex-shrink: 0; }
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
}
.search-input::placeholder { color: var(--text-muted); }
.search-clear {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.1rem;
  transition: color 0.2s;
}
.search-clear:hover { color: var(--pink); }

/* Autocomplete dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  background: rgba(10,14,26,0.98);
  border: 1px solid var(--cyan-dim);
  border-radius: 10px;
  list-style: none;
  margin: 0; padding: 0.35rem 0;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,240,255,0.05);
  backdrop-filter: blur(16px);
  z-index: 300;
  overflow: hidden;
}
.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}
.suggestion-item:hover,
.suggestion-item.active { background: rgba(0,240,255,0.07); }
.sug-img { width: 38px; height: 54px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: #0d1527; }
.sug-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
.sug-title { font-size: 0.85rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-meta { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-status { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.06em; white-space: nowrap; flex-shrink: 0; }
.sug-status.airing { color: var(--cyan); }
.sug-status.done { color: #6eff6e; }

.suggestions-enter-active { transition: opacity 0.15s, transform 0.15s; }
.suggestions-leave-active { transition: opacity 0.1s; }
.suggestions-enter-from { opacity: 0; transform: translateY(-4px); }
.suggestions-leave-to { opacity: 0; }

/* ── Filters ── */
.filters-bar {
  position: sticky;
  top: 60px;
  z-index: 50;
  background: rgba(10,14,26,0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.filters-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.9rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}
.chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.chip {
  padding: 0.28rem 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
}
.chip:hover { border-color: var(--cyan-dim); color: var(--cyan); }
.chip.active {
  background: rgba(0,240,255,0.12);
  border-color: var(--cyan);
  color: var(--cyan);
}
.sort-select {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 0.8rem;
  font-family: inherit;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.sort-select:focus { border-color: var(--cyan); }

/* ── Catalog ── */
.catalog-wrap {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 2rem 4rem;
}
.results-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.results-count {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}
.clear-filters {
  background: none;
  border: 1px solid var(--border);
  color: var(--pink);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-filters:hover { border-color: var(--pink); background: rgba(255,45,120,0.08); }

/* Grid */
.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

/* Watch Card */
.w-card {
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(.175,.885,.32,1.275), box-shadow 0.3s;
}
.w-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 0 0 1px var(--cyan-dim), 0 8px 40px rgba(0,240,255,0.18);
}
.w-card:hover .glitch-overlay { opacity: 1; }
.w-card:hover .play-overlay { opacity: 1; }
.w-card:hover .w-card-img img { transform: scale(1.08); }

.w-card-img {
  position: relative;
  padding-top: 140%;
  overflow: hidden;
  background: #0d1527;
}
.w-card-img img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.glitch-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  background: linear-gradient(135deg, rgba(0,240,255,0.07) 0%, transparent 60%, rgba(255,45,120,0.07) 100%);
}
.badge-new, .badge-status {
  position: absolute;
  top: 8px; left: 8px;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  z-index: 2;
}
.badge-new { background: var(--pink); color: #fff; box-shadow: 0 0 8px rgba(255,45,120,0.5); }
.badge-status { top: auto; left: 8px; bottom: 8px; }
.badge-status.airing { background: rgba(0,240,255,0.15); color: var(--cyan); border: 1px solid var(--cyan-dim); }
.badge-status.done   { background: rgba(100,255,100,0.12); color: #6eff6e; border: 1px solid rgba(100,255,100,0.3); }

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s;
  background: linear-gradient(to top, rgba(10,14,26,0.8) 0%, transparent 70%);
  z-index: 3;
}
.play-circle {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--pink);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(255,45,120,0.7);
  transition: transform 0.2s;
}
.play-circle:hover { transform: scale(1.15); }
.play-circle svg { width: 20px; height: 20px; color: #fff; }

.w-card-body { padding: 0.7rem; }
.w-genre {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pink);
}
.w-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
  margin: 0.2rem 0 0.45rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.w-meta { display: flex; justify-content: space-between; align-items: center; }
.w-eps    { font-size: 0.72rem; color: var(--text-muted); }
.w-rating { font-size: 0.76rem; color: #ffd700; font-weight: 700; }

/* Skeleton */
.card-skeleton { border-radius: 8px; overflow: hidden; background: var(--surface); }
.skeleton {
  background: linear-gradient(90deg, #1a2240 25%, #222d4d 50%, #1a2240 75%);
  background-size: 200%;
  animation: shimmer 1.6s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.sk-img  { padding-top: 140%; }
.sk-text { height: 14px; margin: 0.75rem 0.7rem 0.4rem; border-radius: 4px; }
.sk-text2{ height: 10px; margin: 0 0.7rem 0.75rem; width: 60%; border-radius: 4px; }

/* Empty */
.empty-state { text-align: center; padding: 6rem 2rem; }
.empty-icon  { font-size: 3.5rem; color: var(--text-muted); margin-bottom: 1rem; }
.empty-title { font-size: 1.3rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
.empty-sub   { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; }
.btn-reset {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, var(--pink), #c4005a);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.btn-reset:hover { box-shadow: 0 0 24px rgba(255,45,120,0.5); }

@media (max-width: 768px) {
  .filters-inner { padding: 0.75rem 1rem; }
  .catalog-wrap  { padding: 1.5rem 1rem 3rem; }
  .anime-grid    { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.75rem; }
}
</style>
