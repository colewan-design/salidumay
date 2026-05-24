<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchAnime } from '../services/api.js'
import { searchFilms } from '../services/tmdb.js'

const router = useRouter()

const searchQuery = ref('')
const suggestions = ref([])
const showSug     = ref(false)
const activeSug   = ref(-1)
let   searchTimer = null

watch(searchQuery, (q) => {
  clearTimeout(searchTimer)
  activeSug.value = -1
  const t = q.trim()
  if (t.length >= 2) {
    searchTimer = setTimeout(async () => {
      const [animeRes, filmRes] = await Promise.allSettled([
        searchAnime(t),
        searchFilms(t, 1),
      ])
      const anime = animeRes.status === 'fulfilled'
        ? (animeRes.value.data || []).slice(0, 4).map(a => ({ ...a, _type: 'anime' }))
        : []
      const films = filmRes.status === 'fulfilled'
        ? (filmRes.value.data || []).slice(0, 3).map(f => ({ ...f, _type: 'film' }))
        : []
      suggestions.value = [...anime, ...films]
      showSug.value = suggestions.value.length > 0
    }, 350)
  } else {
    suggestions.value = []; showSug.value = false
  }
})

function selectSug(item) {
  searchQuery.value = ''; showSug.value = false
  if (item._type === 'film') {
    router.push({ name: 'film', params: { id: item.id } })
  } else {
    router.push({ name: 'watch', params: { id: item.id, ep: 1 } })
  }
}

function onKeydown(e) {
  if (e.key === 'Escape') { showSug.value = false; return }
  if (e.key === 'Enter') {
    if (activeSug.value >= 0) { e.preventDefault(); selectSug(suggestions.value[activeSug.value]) }
    else submitSearch()
    return
  }
  if (!showSug.value || !suggestions.value.length) return
  if (e.key === 'ArrowDown') { e.preventDefault(); activeSug.value = Math.min(activeSug.value + 1, suggestions.value.length - 1) }
  if (e.key === 'ArrowUp')   { e.preventDefault(); activeSug.value = Math.max(activeSug.value - 1, -1) }
}

function submitSearch() {
  const q = searchQuery.value.trim()
  if (q) { router.push({ path: '/watch', query: { q } }); searchQuery.value = ''; showSug.value = false }
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-search" @click.stop>
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="searchQuery"
        class="search-input"
        placeholder="Search anime & films…"
        autocomplete="off"
        @keydown="onKeydown"
        @blur="showSug = false"
        @focus="showSug = suggestions.length > 0"
      />
      <Transition name="fade">
        <ul v-if="showSug && suggestions.length" class="suggestions">
          <li
            v-for="(item, i) in suggestions" :key="item._type + item.id"
            :class="['sug-item', { active: activeSug === i }]"
            @mousedown.prevent="selectSug(item)"
          >
            <img :src="item.image" class="sug-img" :alt="item.title" />
            <div class="sug-info">
              <span class="sug-title">{{ item.title }}</span>
              <span class="sug-meta">
                <span :class="['sug-badge', item._type]">{{ item._type === 'film' ? 'FILM' : 'ANIME' }}</span>
                {{ item.genre || item.genreNames?.[0] || '' }}
                · ★ {{ typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating }}
              </span>
            </div>
          </li>
        </ul>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 220px;
  right: 0;
  height: 56px;
  background: rgba(6, 14, 20, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 212, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1.5rem;
  z-index: 100;
}

.topbar-search {
  position: relative;
  width: 280px;
  transition: width .25s;
}
.topbar-search:focus-within {
  width: 340px;
}

.search-icon {
  position: absolute;
  left: .65rem;
  top: 50%;
  transform: translateY(-50%);
  width: .9rem;
  height: .9rem;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: rgba(0, 212, 255, .06);
  border: 1px solid rgba(0, 212, 255, .18);
  border-radius: 8px;
  padding: .45rem .65rem .45rem 2rem;
  color: var(--text);
  font-size: .82rem;
  outline: none;
  transition: border-color .2s;
}
.search-input::placeholder { color: var(--text-muted); }
.search-input:focus {
  border-color: rgba(0, 212, 255, .5);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, .08);
}

.suggestions {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  background: rgba(6, 14, 20, .98);
  border: 1px solid rgba(0, 212, 255, .2);
  border-radius: 10px;
  list-style: none;
  padding: .3rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .6);
  z-index: 400;
  overflow: hidden;
}

.sug-item {
  display: flex;
  align-items: center;
  gap: .55rem;
  padding: .4rem .75rem;
  cursor: pointer;
  transition: background .15s;
}
.sug-item:hover, .sug-item.active { background: rgba(0, 212, 255, .1); }
.sug-img  { width: 28px; height: 40px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.sug-info { flex: 1; min-width: 0; }
.sug-title { display: block; font-size: .78rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-meta  { display: flex; align-items: center; gap: .35rem; font-size: .65rem; color: var(--text-muted); margin-top: .1rem; }
.sug-badge { font-size: .55rem; font-weight: 800; letter-spacing: .08em; padding: .1rem .3rem; border-radius: 3px; flex-shrink: 0; }
.sug-badge.anime { background: rgba(0, 212, 255, .15); color: #00d4ff; }
.sug-badge.film  { background: rgba(255, 45, 120, .2);  color: var(--pink); }

.fade-enter-active, .fade-leave-active { transition: opacity .15s, transform .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .topbar {
    left: 0;
    padding: 0 1rem 0 4rem;
  }
  .topbar-search { width: 100%; }
  .search-input  { width: 100%; }
  .search-input:focus { width: 100%; }
  .suggestions   { width: 100%; right: 0; }
}
</style>
