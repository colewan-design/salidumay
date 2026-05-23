<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth.js'
import { getHistory, removeFromHistory, clearHistory, syncHistoryFromServer } from '../services/userdata.js'

const router = useRouter()
const { isLoggedIn } = useAuth()

const history = ref([])
const loading = ref(true)
const confirmClear = ref(false)

async function load() {
  loading.value = true
  if (isLoggedIn.value) {
    history.value = await syncHistoryFromServer()
  } else {
    history.value = getHistory()
  }
  loading.value = false
}

async function remove(id) {
  await removeFromHistory(id)
  history.value = history.value.filter(a => String(a.id) !== String(id))
}

async function handleClear() {
  await clearHistory()
  history.value = []
  confirmClear.value = false
}

function resume(anime) {
  router.push({ name: 'watch', params: { id: anime.id, ep: anime.episode } })
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="history-wrap">
      <div class="history-header">
        <div class="header-left">
          <h1 class="history-title">Watch History</h1>
          <span class="history-count" v-if="history.length">{{ history.length }} anime</span>
        </div>
        <button v-if="history.length" class="clear-btn" @click="confirmClear = true">Clear All</button>
      </div>

      <!-- Confirm clear dialog -->
      <div v-if="confirmClear" class="confirm-bar">
        <span>Clear all watch history?</span>
        <button class="confirm-yes" @click="handleClear">Yes, clear</button>
        <button class="confirm-no" @click="confirmClear = false">Cancel</button>
      </div>

      <div v-if="loading" class="state-msg">Loading…</div>

      <div v-else-if="!isLoggedIn" class="empty-state">
        <div class="empty-icon">🕐</div>
        <p>Sign in to track your watch history.</p>
        <button class="cta-btn" @click="router.push('/login')">Sign In</button>
      </div>

      <div v-else-if="!history.length" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No watch history yet. Start watching to track your progress!</p>
        <button class="cta-btn" @click="router.push('/watch')">Browse Anime</button>
      </div>

      <div v-else class="history-list">
        <div v-for="anime in history" :key="anime.id" class="history-item">
          <div class="item-img" @click="resume(anime)">
            <img :src="anime.image" :alt="anime.title" loading="lazy" />
            <div class="item-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
          <div class="item-info">
            <h3 class="item-title" @click="resume(anime)">{{ anime.title }}</h3>
            <div class="item-meta">
              <span class="item-ep">Episode {{ anime.episode }}</span>
              <span class="item-date">{{ formatDate(anime.watchedAt) }}</span>
            </div>
            <span v-if="anime.genre" class="item-genre">{{ anime.genre }}</span>
          </div>
          <button class="resume-btn" @click="resume(anime)">Resume</button>
          <button class="remove-btn" @click="remove(anime.id)" title="Remove">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg); }

.history-wrap { max-width: 900px; margin: 0 auto; padding: 1.5rem 2rem 4rem; }

.history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; }
.header-left { display: flex; align-items: baseline; gap: 1rem; }
.history-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: .06em; background: linear-gradient(135deg, #fff 20%, var(--cyan) 60%, var(--pink) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.history-count { font-size: .8rem; color: var(--text-muted); font-weight: 600; }
.clear-btn { padding: .35rem .85rem; background: none; border: 1px solid var(--border); border-radius: 5px; color: var(--text-muted); font-size: .75rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.clear-btn:hover { border-color: var(--pink); color: var(--pink); }

.confirm-bar { display: flex; align-items: center; gap: .75rem; padding: .65rem 1rem; background: rgba(255,45,120,.08); border: 1px solid rgba(255,45,120,.25); border-radius: 8px; margin-bottom: 1.25rem; font-size: .85rem; color: var(--text); }
.confirm-yes { padding: .3rem .75rem; background: var(--pink); border: none; border-radius: 5px; color: #fff; font-size: .78rem; font-weight: 700; cursor: pointer; }
.confirm-no { padding: .3rem .75rem; background: none; border: 1px solid var(--border); border-radius: 5px; color: var(--text-muted); font-size: .78rem; font-weight: 700; cursor: pointer; }

.state-msg { color: var(--text-muted); font-size: .9rem; padding: 3rem 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 5rem 0; color: var(--text-muted); text-align: center; }
.empty-icon { font-size: 3rem; }
.empty-state p { font-size: .95rem; }
.cta-btn { padding: .55rem 1.5rem; background: var(--pink); border: none; border-radius: 6px; color: #fff; font-size: .85rem; font-weight: 700; cursor: pointer; transition: opacity .2s; }
.cta-btn:hover { opacity: .85; }

.history-list { display: flex; flex-direction: column; gap: .75rem; }

.history-item { position: relative; display: flex; gap: 1rem; align-items: center; padding: .75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; transition: border-color .2s; }
.history-item:hover { border-color: var(--cyan-dim); }

.item-img { position: relative; width: 90px; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; cursor: pointer; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-play { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5); opacity: 0; transition: opacity .2s; }
.history-item:hover .item-play { opacity: 1; }
.item-play svg { width: 22px; height: 22px; color: #fff; }

.item-info { flex: 1; overflow: hidden; }
.item-title { font-size: .9rem; font-weight: 700; color: var(--text); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: .3rem; }
.item-title:hover { color: var(--cyan); }
.item-meta { display: flex; gap: .6rem; align-items: center; margin-bottom: .25rem; }
.item-ep { font-size: .75rem; font-weight: 700; color: var(--cyan); }
.item-date { font-size: .72rem; color: var(--text-muted); }
.item-genre { font-size: .7rem; color: var(--text-muted); }

.resume-btn { flex-shrink: 0; padding: .35rem .85rem; background: rgba(0,240,255,.1); border: 1px solid var(--cyan-dim); border-radius: 6px; color: var(--cyan); font-size: .75rem; font-weight: 700; cursor: pointer; transition: all .2s; white-space: nowrap; }
.resume-btn:hover { background: rgba(0,240,255,.2); }

.remove-btn { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: none; border: 1px solid var(--border); color: var(--text-muted); font-size: .7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
.remove-btn:hover { border-color: var(--pink); color: var(--pink); }

@media (max-width: 640px) {
  .history-wrap { padding: 1rem 1rem 3rem; }
  .resume-btn { display: none; }
}
</style>
