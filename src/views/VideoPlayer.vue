<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import CommentSection from '../components/CommentSection.vue'
import { getAnimeDetail, getEpisodes, getRelated, getStreamingLinks } from '../services/api.js'
import { getAllSources } from '../services/streamSources.js'

const route  = useRoute()
const router = useRouter()

const animeId   = computed(() => route.params.id)
const currentEp = ref(Number(route.params.ep) || 1)

const anime          = ref(null)
const synopsisExpanded = ref(false)
const episodes       = ref([])
const related        = ref([])
const streamingLinks = ref([])
const loading        = ref(true)
const activeTab      = ref('episodes')
const audioMode      = ref('sub') // 'sub' | 'dub'

/* ── Streaming state ── */
const streamLoading = ref(false)
const streamError   = ref('')
const allSources    = ref([])   // all available iframe sources
const activeSrc     = ref('')   // currently displayed iframe URL
const activeGroup   = ref('')   // active source group label

/* ── Computed ── */
const currentEpisode = computed(() => episodes.value.find(e => e.number === currentEp.value) || null)
const hasNext = computed(() => episodes.value.some(e => e.number === currentEp.value + 1))
const hasPrev = computed(() => episodes.value.some(e => e.number === currentEp.value - 1))
const hasStream   = computed(() => !!activeSrc.value)

const serviceIcons = {
  Crunchyroll: '🟠', Netflix: '🔴', Funimation: '🟣',
  'Amazon Prime Video': '🔵', 'Disney+': '🔷', HIDIVE: '🟦', Hulu: '🟢',
}

function selectSource(src) {
  activeSrc.value   = src.url
  activeGroup.value = src.group
}

async function loadEpisodeStream(epNum) {
  activeSrc.value     = ''
  allSources.value    = []
  streamError.value   = ''
  streamLoading.value = true

  try {
    const sources = await getAllSources(anime.value.title, epNum)
    allSources.value = sources
    if (sources.length) {
      activeSrc.value   = sources[0].url
      activeGroup.value = sources[0].group
    }
  } catch (e) {
    streamError.value = e.message
  }
  streamLoading.value = false
}

/* ── Episode navigation ── */
function watchEp(ep) {
  currentEp.value = ep.number
  router.push({ name: 'watch', params: { id: animeId.value, ep: ep.number } })
  loadEpisodeStream(ep.number)
}
function nextEpisode() { const n = episodes.value.find(e => e.number === currentEp.value + 1); if (n) watchEp(n) }
function prevEpisode() { const p = episodes.value.find(e => e.number === currentEp.value - 1); if (p) watchEp(p) }

/* ── Data fetch ── */
async function fetchData() {
  loading.value   = true
  activeSrc.value = ''
  allSources.value = []

  const [ad, ep, rel, sl] = await Promise.allSettled([
    getAnimeDetail(animeId.value),
    getEpisodes(animeId.value),
    getRelated(animeId.value),
    getStreamingLinks(animeId.value),
  ])
  if (ad.status === 'fulfilled') anime.value          = ad.value.data
  if (ep.status === 'fulfilled') episodes.value       = ep.value.data
  if (rel.status === 'fulfilled') related.value       = rel.value.data
  if (sl.status === 'fulfilled') streamingLinks.value = sl.value.data
  loading.value = false

  if (anime.value?.title) {
    await loadEpisodeStream(currentEp.value)
  }
}

watch(() => route.params.id, () => { currentEp.value = 1; fetchData() })

onMounted(fetchData)
onUnmounted(() => {})
</script>

<template>
  <div class="page">
    <AppNavbar />

    <div class="breadcrumb">
      <router-link to="/" class="bc-link">Home</router-link>
      <span class="bc-sep">›</span>
      <router-link to="/watch" class="bc-link">Watch</router-link>
      <span class="bc-sep">›</span>
      <span class="bc-current">{{ anime?.title || '…' }}</span>
      <span v-if="currentEpisode" class="bc-sep">›</span>
      <span v-if="currentEpisode" class="bc-ep">Episode {{ currentEp }}</span>
    </div>

    <div class="player-layout">
      <div class="player-left">

        <!-- Episode nav + audio toggle -->
        <div class="ep-nav">
          <button class="ep-nav-btn" :disabled="!hasPrev" @click="prevEpisode">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            Prev
          </button>
          <span class="ep-nav-label">
            <span class="ep-nav-title">{{ anime?.title }}</span>
            <span class="ep-nav-ep">Episode {{ currentEp }}</span>
          </span>
          <div class="audio-toggle" v-if="allSources.length">
            <button :class="['audio-btn', { active: audioMode === 'sub' }]" @click="audioMode = 'sub'; loadEpisodeStream(currentEp)">SUB</button>
            <button :class="['audio-btn', { active: audioMode === 'dub' }]" @click="audioMode = 'dub'; loadEpisodeStream(currentEp)">DUB</button>
          </div>
          <button class="ep-nav-btn" :disabled="!hasNext" @click="nextEpisode">
            Next
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14 5.03 3.6L8 17.14V9.86zM16 6h2v12h-2z"/></svg>
          </button>
        </div>

        <!-- ── Player ── -->
        <div class="player-wrap">
          <!-- Iframe stream -->
          <iframe
            v-if="hasStream"
            class="video-el"
            :src="activeSrc"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            frameborder="0"
            scrolling="no"
          ></iframe>

          <!-- Loading -->
          <div v-if="streamLoading" class="overlay-center">
            <div class="spin"></div>
            <p>Loading stream…</p>
          </div>

          <!-- No source found -->
          <div v-if="!streamLoading && !hasStream" class="overlay-center">
            <div class="no-video-icon">▶</div>
            <p>No stream available for this episode</p>
          </div>
        </div>

        <!-- Source picker -->
        <div v-if="allSources.length" class="server-bar">
          <span class="server-label">Source</span>
          <button
            v-for="src in allSources"
            :key="src.url"
            :class="['server-btn', { active: activeSrc === src.url }]"
            @click="selectSource(src)"
          >
            {{ src.label }}
          </button>
        </div>

        <!-- No source notice -->
        <div v-if="!streamLoading && !hasStream && !allSources.length" class="trailer-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="notice-icon">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Stream unavailable for this episode. Try another episode or check back later.
        </div>

        <!-- Licensed streaming links -->
        <div v-if="!loading && streamingLinks.length" class="streaming-section">
          <p class="streaming-label">Watch Licensed Episodes On</p>
          <div class="streaming-links">
            <a v-for="link in streamingLinks" :key="link.name" :href="link.url" target="_blank" rel="noopener noreferrer" class="streaming-btn">
              <span>{{ serviceIcons[link.name] || '▶' }}</span>
              {{ link.name }}
            </a>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-wrap">
          <div class="tabs">
            <button :class="['tab', { active: activeTab === 'episodes' }]" @click="activeTab = 'episodes'">
              Episodes <span class="tab-count">{{ episodes.length }}</span>
            </button>
            <button :class="['tab', { active: activeTab === 'related' }]" @click="activeTab = 'related'">
              Related <span class="tab-count">{{ related.length }}</span>
            </button>
          </div>

          <div v-if="activeTab === 'episodes'" class="ep-list">
            <div v-if="!episodes.length && !loading" class="ep-empty">No episode list available</div>
            <button v-for="ep in episodes" :key="ep.number" :class="['ep-item', { active: ep.number === currentEp }]" @click="watchEp(ep)">
              <div class="ep-thumb">
                <img v-if="ep.thumbnail" :src="ep.thumbnail" :alt="`EP ${ep.number}`" loading="lazy" />
                <div v-else class="ep-thumb-ph">{{ ep.number }}</div>
                <div class="ep-play-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
              </div>
              <div class="ep-info">
                <span class="ep-num">Episode {{ ep.number }}</span>
                <span class="ep-title-text">{{ ep.title }}</span>
              </div>
              <span v-if="ep.number === currentEp" class="ep-now">PLAYING</span>
            </button>
          </div>

          <div v-if="activeTab === 'related'" class="related-grid">
            <div v-if="!related.length && !loading" class="ep-empty">No related anime</div>
            <div v-for="rel in related" :key="rel.id" class="rel-card" @click="router.push({ name: 'watch', params: { id: rel.id, ep: 1 } })">
              <div class="rel-img">
                <img :src="rel.image" :alt="rel.title" loading="lazy" />
                <div class="rel-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
              </div>
              <div class="rel-info">
                <span class="rel-genre">{{ rel.genre }}</span>
                <h4 class="rel-title">{{ rel.title }}</h4>
                <div class="rel-meta"><span>{{ rel.episodes }} ep</span><span class="rel-rating">★ {{ rel.rating }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <CommentSection v-if="animeId" :anime-id="animeId" />
      </div>

      <!-- ── Sidebar ── -->
      <aside class="player-sidebar">
        <template v-if="loading">
          <div class="sk-poster skeleton"></div>
          <div class="sk-title skeleton"></div>
          <div class="sk-line skeleton"></div>
          <div class="sk-line skeleton" style="width:70%"></div>
        </template>
        <template v-else-if="anime">
          <div class="sidebar-poster">
            <img :src="anime.image" :alt="anime.title" />
            <div class="sidebar-poster-glow"></div>
          </div>
          <div class="sidebar-meta">
            <span class="badge-glow">{{ anime.badge || anime.genre }}</span>
            <span class="badge-outline">{{ anime.genre }}</span>
          </div>
          <h2 class="sidebar-title gradient-text">{{ anime.title }}</h2>
          <p class="sidebar-subtitle">{{ anime.subtitle }}</p>
          <div class="sidebar-stats">
            <div class="s-stat"><span class="s-stat-icon">▶</span><div><span class="s-stat-val">{{ anime.episodes }}</span><span class="s-stat-label">Episodes</span></div></div>
            <div class="s-stat"><span class="s-stat-icon star">★</span><div><span class="s-stat-val">{{ typeof anime.rating === 'number' ? anime.rating.toFixed(1) : anime.rating }}</span><span class="s-stat-label">Rating</span></div></div>
            <div class="s-stat" v-if="anime.studio"><span class="s-stat-icon">🎬</span><div><span class="s-stat-val">{{ anime.studio }}</span><span class="s-stat-label">Studio</span></div></div>
          </div>
          <div class="synopsis-wrap">
            <p class="sidebar-synopsis" :class="{ expanded: synopsisExpanded }">{{ anime.synopsis }}</p>
            <button v-if="anime.synopsis?.length > 180" class="synopsis-toggle" @click="synopsisExpanded = !synopsisExpanded">
              {{ synopsisExpanded ? 'See less ↑' : 'See more ↓' }}
            </button>
          </div>
          <div class="series-progress" v-if="anime.episodes && typeof anime.episodes === 'number'">
            <div class="sp-header"><span class="sp-label">Progress</span><span class="sp-val">{{ currentEp }} / {{ anime.episodes }}</span></div>
            <div class="sp-track"><div class="sp-fill" :style="{ width: ((currentEp / anime.episodes) * 100) + '%' }"></div></div>
          </div>
          <div class="details-table">
            <div class="dt-row" v-if="anime.status"><span class="dt-key">Status</span><span :class="['dt-val', anime.status === 'Airing' ? 'text-cyan' : 'text-green']">{{ anime.status }}</span></div>
            <div class="dt-row" v-if="anime.year"><span class="dt-key">Year</span><span class="dt-val">{{ anime.year }}</span></div>
            <div class="dt-row" v-if="anime.studio"><span class="dt-key">Studio</span><span class="dt-val">{{ anime.studio }}</span></div>
            <div class="dt-row" v-if="anime.genre"><span class="dt-key">Genre</span><span class="dt-val">{{ anime.genre }}</span></div>
            <div class="dt-row" v-if="allSources.length">
              <span class="dt-key">Stream</span>
              <span class="dt-val text-cyan">{{ allSources[0]?.group || 'Available' }} ✓</span>
            </div>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg); }

.breadcrumb { display:flex; align-items:center; gap:.4rem; padding:4.5rem 2rem .75rem; max-width:1400px; margin:0 auto; font-size:.78rem; color:var(--text-muted); }
.bc-link { color:var(--text-muted); text-decoration:none; transition:color .2s; }
.bc-link:hover { color:var(--cyan); }
.bc-sep { color:var(--border); }
.bc-current { color:var(--text); font-weight:600; }
.bc-ep { color:var(--cyan); font-weight:600; }

.player-layout { display:grid; grid-template-columns:1fr 320px; gap:1.5rem; max-width:1400px; margin:0 auto; padding:0 2rem 4rem; align-items:start; }

/* Ep nav */
.ep-nav { display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.6rem; }
.ep-nav-btn { display:flex; align-items:center; gap:.4rem; padding:.4rem .9rem; background:var(--surface); border:1px solid var(--border); color:var(--text-muted); border-radius:6px; font-size:.8rem; font-weight:700; cursor:pointer; transition:all .2s; flex-shrink:0; }
.ep-nav-btn svg { width:1rem; height:1rem; }
.ep-nav-btn:hover:not(:disabled) { border-color:var(--cyan-dim); color:var(--cyan); }
.ep-nav-btn:disabled { opacity:.3; cursor:default; }
.ep-nav-label { text-align:center; overflow:hidden; flex:1; }
.ep-nav-title { display:block; font-size:.82rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ep-nav-ep { display:block; font-size:.72rem; color:var(--cyan); margin-top:.1rem; }

.audio-toggle { display:flex; border:1px solid var(--border); border-radius:6px; overflow:hidden; flex-shrink:0; }
.audio-btn { padding:.3rem .65rem; background:none; border:none; color:var(--text-muted); font-size:.72rem; font-weight:800; letter-spacing:.06em; cursor:pointer; transition:all .2s; }
.audio-btn.active { background:var(--pink); color:#fff; }

/* Player */
.player-wrap { position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:10px; overflow:hidden; border:1px solid var(--border); box-shadow:0 0 40px rgba(0,0,0,.6),0 0 0 1px rgba(0,240,255,.06); }
.player-wrap.hide-cursor { cursor:none; }
.video-el { width:100%; height:100%; object-fit:contain; display:block; background:#000; }

.overlay-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; background:rgba(0,0,0,.5); color:var(--text-muted); font-size:.85rem; z-index:6; }
.no-video-icon { font-size:3rem; color:var(--border); }

.spin { width:36px; height:36px; border:3px solid rgba(255,255,255,.1); border-top-color:var(--cyan); border-radius:50%; animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Skip intro */
.skip-intro { position:absolute; bottom:80px; right:1.5rem; z-index:10; background:rgba(10,14,26,.85); border:1px solid var(--cyan-dim); color:var(--cyan); font-size:.8rem; font-weight:700; letter-spacing:.05em; padding:.45rem 1rem; border-radius:4px; cursor:pointer; transition:all .2s; backdrop-filter:blur(8px); }
.skip-intro:hover { background:rgba(0,240,255,.15); }

/* Big play */
.big-play { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:5; pointer-events:none; }
.big-play-btn { width:72px; height:72px; border-radius:50%; background:rgba(255,45,120,.85); display:flex; align-items:center; justify-content:center; box-shadow:0 0 40px rgba(255,45,120,.6); pointer-events:all; cursor:pointer; transition:transform .2s; }
.big-play-btn:hover { transform:scale(1.1); }
.big-play-btn svg { width:30px; height:30px; color:#fff; }

/* Controls */
.controls { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; background:linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 40%); z-index:8; }
.ctrl-top { position:absolute; top:0; left:0; right:0; display:flex; flex-direction:column; padding:1rem 1.25rem; background:linear-gradient(to bottom,rgba(0,0,0,.7) 0%,transparent 100%); pointer-events:none; }
.ctrl-title { font-size:.88rem; font-weight:700; color:#fff; }
.ctrl-ep { font-size:.75rem; color:var(--cyan); margin-top:.1rem; }

.progress-wrap { padding:0 1rem; cursor:pointer; margin-bottom:.6rem; }
.progress-track { position:relative; height:4px; border-radius:2px; background:rgba(255,255,255,.15); overflow:visible; transition:height .15s; }
.progress-wrap:hover .progress-track { height:6px; }
.progress-buffered { position:absolute; top:0; left:0; bottom:0; background:rgba(255,255,255,.2); border-radius:2px; pointer-events:none; }
.progress-fill { position:absolute; top:0; left:0; bottom:0; background:linear-gradient(90deg,var(--pink),#ff6fa8); border-radius:2px; pointer-events:none; }
.progress-thumb { position:absolute; right:-5px; top:50%; transform:translateY(-50%); width:12px; height:12px; border-radius:50%; background:#fff; box-shadow:0 0 6px rgba(255,45,120,.6); opacity:0; transition:opacity .15s; }
.progress-wrap:hover .progress-thumb { opacity:1; }

.ctrl-bottom { display:flex; align-items:center; justify-content:space-between; padding:0 .75rem .75rem; gap:.5rem; }
.ctrl-left,.ctrl-right { display:flex; align-items:center; gap:.2rem; }
.ctrl-btn { background:none; border:none; color:rgba(255,255,255,.85); cursor:pointer; padding:.4rem; border-radius:4px; display:flex; align-items:center; justify-content:center; transition:color .15s,background .15s; }
.ctrl-btn:hover { color:#fff; background:rgba(255,255,255,.1); }
.ctrl-btn:disabled { opacity:.3; cursor:default; }
.ctrl-btn svg { width:1.1rem; height:1.1rem; }
.ctrl-btn.play-pause svg { width:1.3rem; height:1.3rem; }
.ctrl-text { font-size:.78rem; font-weight:700; letter-spacing:.04em; padding:.3rem .5rem; }
.ctrl-time { font-size:.78rem; color:rgba(255,255,255,.8); white-space:nowrap; padding:0 .4rem; }

.volume-wrap { display:flex; align-items:center; gap:.25rem; }
.volume-slider { width:70px; accent-color:var(--pink); cursor:pointer; }

.menu-wrap { position:relative; }
.popup-menu { position:absolute; bottom:110%; right:0; background:rgba(10,14,26,.95); border:1px solid var(--border); border-radius:6px; overflow:hidden; min-width:80px; backdrop-filter:blur(12px); z-index:20; }
.menu-item { display:block; width:100%; text-align:center; padding:.4rem .75rem; font-size:.8rem; font-weight:600; color:var(--text-muted); background:none; border:none; cursor:pointer; transition:all .15s; }
.menu-item:hover { color:var(--cyan); background:rgba(0,240,255,.07); }
.menu-item.active { color:var(--pink); font-weight:800; }

/* Server picker */
.server-bar { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; padding:.55rem 0; margin-top:.4rem; border-bottom:1px solid var(--border); }
.server-label { font-size:.65rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); margin-right:.2rem; flex-shrink:0; }
.server-btn { padding:.28rem .65rem; background:var(--surface); border:1px solid var(--border); border-radius:5px; color:var(--text-muted); font-size:.7rem; font-weight:700; cursor:pointer; transition:all .18s; }
.server-btn:hover { border-color:var(--cyan-dim); color:var(--cyan); }
.server-btn.active { background:rgba(0,240,255,.1); border-color:var(--cyan); color:var(--cyan); }

/* Shortcuts */
.shortcuts-bar { display:flex; gap:1.25rem; flex-wrap:wrap; padding:.6rem 0; margin-top:.5rem; border-bottom:1px solid var(--border); }
.shortcut { font-size:.72rem; color:var(--text-muted); display:flex; align-items:center; gap:.3rem; }
kbd { background:var(--surface); border:1px solid var(--border); border-radius:3px; padding:.1rem .35rem; font-size:.68rem; color:var(--text); }

/* Transitions */
.fade-enter-active,.fade-leave-active { transition:opacity .2s; }
.fade-enter-from,.fade-leave-to { opacity:0; }
.ctrl-fade-enter-active,.ctrl-fade-leave-active { transition:opacity .3s; }
.ctrl-fade-enter-from,.ctrl-fade-leave-to { opacity:0; }

/* Trailer notice */
.trailer-notice { display:flex; align-items:center; gap:.5rem; margin-top:.6rem; font-size:.78rem; color:var(--text-muted); padding:.5rem .75rem; background:rgba(0,240,255,.04); border:1px solid rgba(0,240,255,.1); border-radius:6px; flex-wrap:wrap; }
.notice-icon { width:14px; height:14px; color:var(--cyan); flex-shrink:0; }
.error-detail { color:var(--pink); font-size:.72rem; }

/* Streaming links */
.streaming-section { margin-top:1.25rem; padding:1.25rem; background:var(--surface); border:1px solid var(--border); border-radius:10px; }
.streaming-label { font-size:.72rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); margin-bottom:.85rem; }
.streaming-links { display:flex; flex-wrap:wrap; gap:.6rem; }
.streaming-btn { display:inline-flex; align-items:center; gap:.45rem; padding:.5rem 1.1rem; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:.85rem; font-weight:700; text-decoration:none; transition:all .2s; }
.streaming-btn:hover { border-color:var(--cyan-dim); background:rgba(0,240,255,.07); color:var(--cyan); transform:translateY(-1px); }

/* Tabs */
.tabs-wrap { margin-top:1.5rem; }
.tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:1rem; }
.tab { position:relative; padding:.6rem 1.25rem; background:none; border:none; color:var(--text-muted); font-size:.88rem; font-weight:700; letter-spacing:.04em; cursor:pointer; transition:color .2s; }
.tab::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--cyan),var(--pink)); transform:scaleX(0); transition:transform .25s; }
.tab:hover { color:var(--text); }
.tab.active { color:var(--cyan); }
.tab.active::after { transform:scaleX(1); }
.tab-count { display:inline-block; background:var(--surface); border-radius:20px; padding:.05rem .45rem; font-size:.68rem; margin-left:.4rem; color:var(--text-muted); }

.ep-list { display:flex; flex-direction:column; gap:.5rem; max-height:460px; overflow-y:auto; padding-right:.25rem; }
.ep-list::-webkit-scrollbar { width:4px; }
.ep-list::-webkit-scrollbar-thumb { background:var(--pink); border-radius:2px; }
.ep-empty { color:var(--text-muted); font-size:.85rem; padding:1rem 0; }

.ep-item { display:flex; align-items:center; gap:.75rem; padding:.5rem; border-radius:8px; background:var(--surface); border:1px solid var(--border); cursor:pointer; transition:all .2s; text-align:left; width:100%; }
.ep-item:hover { border-color:var(--cyan-dim); background:rgba(0,240,255,.04); }
.ep-item.active { border-color:var(--pink); background:rgba(255,45,120,.06); }
.ep-thumb { position:relative; width:100px; flex-shrink:0; aspect-ratio:16/9; border-radius:5px; overflow:hidden; background:#0d1527; }
.ep-thumb img { width:100%; height:100%; object-fit:cover; }
.ep-thumb-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:1.8rem; color:var(--border); }
.ep-play-icon { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; background:rgba(0,0,0,.5); }
.ep-item:hover .ep-play-icon { opacity:1; }
.ep-play-icon svg { width:20px; height:20px; color:#fff; }
.ep-info { flex:1; display:flex; flex-direction:column; gap:.2rem; overflow:hidden; }
.ep-num { font-size:.7rem; font-weight:800; letter-spacing:.08em; color:var(--cyan); text-transform:uppercase; }
.ep-title-text { font-size:.85rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ep-now { font-size:.6rem; font-weight:800; letter-spacing:.1em; color:var(--pink); white-space:nowrap; padding:.2rem .4rem; border:1px solid var(--pink); border-radius:3px; }

.related-grid { display:flex; flex-direction:column; gap:.75rem; }
.rel-card { display:flex; gap:.75rem; align-items:center; padding:.5rem; border-radius:8px; background:var(--surface); border:1px solid var(--border); cursor:pointer; transition:all .2s; }
.rel-card:hover { border-color:var(--cyan-dim); }
.rel-img { position:relative; width:64px; flex-shrink:0; aspect-ratio:2/3; border-radius:5px; overflow:hidden; background:#0d1527; }
.rel-img img { width:100%; height:100%; object-fit:cover; }
.rel-play { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; background:rgba(0,0,0,.6); transition:opacity .2s; }
.rel-card:hover .rel-play { opacity:1; }
.rel-play svg { width:18px; height:18px; color:#fff; }
.rel-info { flex:1; overflow:hidden; }
.rel-genre { font-size:.66rem; font-weight:700; letter-spacing:.08em; color:var(--pink); text-transform:uppercase; }
.rel-title { font-size:.85rem; font-weight:600; color:var(--text); margin:.15rem 0 .3rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rel-meta { display:flex; gap:.75rem; font-size:.72rem; color:var(--text-muted); }
.rel-rating { color:#ffd700; }

/* Sidebar */
.player-sidebar { position:sticky; top:80px; }
.sidebar-poster { position:relative; width:100%; aspect-ratio:2/3; border-radius:10px; overflow:hidden; margin-bottom:1rem; border:1px solid var(--border); }
.sidebar-poster img { width:100%; height:100%; object-fit:cover; }
.sidebar-poster-glow { position:absolute; inset:0; background:linear-gradient(to top,rgba(10,14,26,.8) 0%,transparent 50%); }
.sidebar-meta { display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.75rem; }
.badge-glow { padding:.22rem .65rem; border-radius:4px; font-size:.68rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; background:var(--pink); color:#fff; box-shadow:0 0 10px rgba(255,45,120,.5); }
.badge-outline { padding:.22rem .65rem; border-radius:4px; font-size:.68rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; border:1px solid var(--cyan-dim); color:var(--cyan); background:rgba(0,240,255,.07); }
.sidebar-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(1.5rem,3vw,2rem); line-height:1; letter-spacing:.04em; margin-bottom:.3rem; }
.gradient-text { background:linear-gradient(135deg,#fff 20%,var(--cyan) 60%,var(--pink) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.sidebar-subtitle { font-size:.8rem; color:var(--cyan); letter-spacing:.1em; margin-bottom:1rem; font-weight:500; }
.sidebar-stats { display:flex; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
.s-stat { display:flex; align-items:center; gap:.4rem; }
.s-stat-icon { color:var(--cyan); font-size:.8rem; }
.s-stat-icon.star { color:#ffd700; }
.s-stat div { display:flex; flex-direction:column; }
.s-stat-val { font-size:.9rem; font-weight:800; color:var(--text); line-height:1.2; }
.s-stat-label { font-size:.65rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:.08em; }
.synopsis-wrap { margin-bottom:1.25rem; }
.sidebar-synopsis { font-size:.85rem; color:var(--text-muted); line-height:1.7; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; transition:all .3s; }
.sidebar-synopsis.expanded { -webkit-line-clamp:unset; overflow:visible; }
.synopsis-toggle { background:none; border:none; color:var(--cyan); font-size:.78rem; font-weight:700; cursor:pointer; padding:.35rem 0 0; display:block; transition:color .2s; }
.synopsis-toggle:hover { color:var(--pink); }
.series-progress { margin-bottom:1.25rem; }
.sp-header { display:flex; justify-content:space-between; margin-bottom:.4rem; }
.sp-label { font-size:.72rem; font-weight:700; letter-spacing:.08em; color:var(--text-muted); text-transform:uppercase; }
.sp-val { font-size:.72rem; font-weight:700; color:var(--cyan); }
.sp-track { height:4px; border-radius:2px; background:rgba(255,255,255,.1); overflow:hidden; }
.sp-fill { height:100%; background:linear-gradient(90deg,var(--cyan),var(--pink)); border-radius:2px; transition:width .4s; }
.details-table { border-top:1px solid var(--border); padding-top:1rem; }
.dt-row { display:flex; justify-content:space-between; padding:.45rem 0; border-bottom:1px solid rgba(255,255,255,.04); }
.dt-key { font-size:.75rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.07em; }
.dt-val { font-size:.8rem; font-weight:600; color:var(--text); }
.text-cyan { color:var(--cyan) !important; }
.text-green { color:#6eff6e !important; }
.text-muted { color:var(--text-muted) !important; }

.sk-poster { width:100%; aspect-ratio:2/3; border-radius:10px; }
.sk-title { height:28px; width:80%; margin:1rem 0 .5rem; border-radius:4px; }
.sk-line { height:14px; width:100%; margin-bottom:.5rem; border-radius:4px; }
.skeleton { background:linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size:200%; animation:shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

@media (max-width:1024px) {
  .player-layout { grid-template-columns:1fr; padding:0 1rem 3rem; }
  .player-sidebar { position:static; display:grid; grid-template-columns:160px 1fr; gap:1rem; align-items:start; }
  .sidebar-poster { margin-bottom:0; }
  .series-progress,.details-table { grid-column:1/-1; }
}
@media (max-width:640px) {
  .breadcrumb { padding:4rem 1rem .5rem; font-size:.72rem; }
  .player-sidebar { grid-template-columns:1fr; }
  .ep-nav-title { display:none; }
  .shortcuts-bar { display:none; }
  .volume-slider { width:50px; }
}
</style>
