<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getLibrary, removeFromLibrary, syncLibraryFromServer } from '../services/userdata.js'

const router = useRouter()
const { isLoggedIn } = useAuth()

const library = ref([])
const loading = ref(true)

function migrateEntry(item) {
  if (item.type) return item
  // episodes is null/undefined → saved from TMDB film carousel; anime always has a number or '?'
  const isFilm = item.episodes == null || item.episodes === 0
  return { ...item, type: isFilm ? 'film' : 'anime' }
}

async function load() {
  loading.value = true
  let entries = isLoggedIn.value ? await syncLibraryFromServer() : getLibrary()
  // backfill type for entries saved before the type field was introduced
  library.value = entries.map(migrateEntry)
  loading.value = false
}

async function remove(id) {
  await removeFromLibrary(id)
  library.value = library.value.filter(a => String(a.id) !== String(id))
}

function watch(item) {
  if (item.type === 'film') {
    router.push({ name: 'film', params: { id: item.id } })
  } else {
    router.push({ name: 'watch', params: { id: item.id, ep: 1 } })
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="library-wrap">
      <div class="library-header">
        <h1 class="library-title">My Library</h1>
        <span class="library-count" v-if="library.length">{{ library.length }} saved</span>
      </div>

      <div v-if="loading" class="state-msg">Loading…</div>

      <div v-else-if="!isLoggedIn" class="empty-state">
        <div class="empty-icon">📚</div>
        <p>Sign in to save anime to your library.</p>
        <button class="cta-btn" @click="router.push('/login')">Sign In</button>
      </div>

      <div v-else-if="!library.length" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Your library is empty. Start adding anime while watching!</p>
        <button class="cta-btn" @click="router.push('/watch')">Browse Anime</button>
      </div>

      <div v-else class="anime-grid">
        <div v-for="anime in library" :key="anime.id" class="anime-card">
          <div class="card-img" @click="watch(anime)">
            <img :src="anime.image" :alt="anime.title" loading="lazy" />
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <div class="card-info">
            <h3 class="card-title" @click="watch(anime)">{{ anime.title }}</h3>
            <div class="card-meta">
              <span>{{ anime.genre }}</span>
              <span v-if="anime.episodes">· {{ anime.episodes }} ep</span>
              <span v-if="anime.rating" class="card-rating">★ {{ anime.rating }}</span>
            </div>
          </div>
          <button class="remove-btn" @click="remove(anime.id)" title="Remove from library">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg); }

.library-wrap { max-width: 1400px; margin: 0 auto; padding: 1.5rem 2rem 4rem; }

.library-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.75rem; }
.library-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: .06em; background: linear-gradient(135deg, #fff 20%, var(--cyan) 60%, var(--pink) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.library-count { font-size: .8rem; color: var(--text-muted); font-weight: 600; }

.state-msg { color: var(--text-muted); font-size: .9rem; padding: 3rem 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 5rem 0; color: var(--text-muted); text-align: center; }
.empty-icon { font-size: 3rem; }
.empty-state p { font-size: .95rem; }
.cta-btn { padding: .55rem 1.5rem; background: var(--pink); border: none; border-radius: 6px; color: #fff; font-size: .85rem; font-weight: 700; cursor: pointer; transition: opacity .2s; }
.cta-btn:hover { opacity: .85; }

.anime-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; }

.anime-card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: border-color .2s; }
.anime-card:hover { border-color: var(--cyan-dim); }

.card-img { position: relative; aspect-ratio: 2/3; cursor: pointer; overflow: hidden; }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.anime-card:hover .card-img img { transform: scale(1.04); }
.card-play { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5); opacity: 0; transition: opacity .2s; }
.anime-card:hover .card-play { opacity: 1; }
.card-play svg { width: 32px; height: 32px; color: #fff; }

.card-info { padding: .6rem .7rem .7rem; }
.card-title { font-size: .82rem; font-weight: 700; color: var(--text); cursor: pointer; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; margin-bottom: .3rem; }
.card-title:hover { color: var(--cyan); }
.card-meta { display: flex; gap: .35rem; flex-wrap: wrap; font-size: .7rem; color: var(--text-muted); }
.card-rating { color: #ffd700; }

.remove-btn { position: absolute; top: .4rem; right: .4rem; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,.7); border: none; color: rgba(255,255,255,.7); font-size: .65rem; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .2s, background .2s; }
.anime-card:hover .remove-btn { opacity: 1; }
.remove-btn:hover { background: var(--pink); color: #fff; }

@media (max-width: 640px) {
  .library-wrap { padding: 1rem 1rem 3rem; }
  .anime-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; }
}
</style>
