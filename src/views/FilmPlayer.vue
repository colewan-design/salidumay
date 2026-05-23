<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFilmDetail, FILM_EMBED_SOURCES } from '../services/tmdb.js'

const route  = useRoute()
const router = useRouter()

const film        = ref(null)
const loading     = ref(true)
const activeTab   = ref('similar')
const sources     = ref([])
const activeSrc   = ref('')
const activeSrcIdx = ref(0)
const srcLoading  = ref(false)
const srcError    = ref(false)

function selectSource(src, idx) {
  srcLoading.value = true
  srcError.value   = false
  activeSrc.value  = src.url
  activeSrcIdx.value = idx
}

function onIframeLoad() {
  srcLoading.value = false
  srcError.value   = false
}

function onIframeError() {
  srcLoading.value = false
  const next = activeSrcIdx.value + 1
  if (next < sources.value.length) {
    selectSource(sources.value[next], next)
  } else {
    srcError.value = true
  }
}

async function fetchFilm(id) {
  loading.value    = true
  film.value       = null
  activeSrc.value  = ''
  activeSrcIdx.value = 0
  sources.value    = []

  const data = await getFilmDetail(id).catch(() => null)
  if (data) {
    film.value    = data
    sources.value = FILM_EMBED_SOURCES(id)
    selectSource(sources.value[0], 0)
  }
  loading.value = false
}

watch(() => route.params.id, (id) => fetchFilm(id))
onMounted(() => fetchFilm(route.params.id))
</script>

<template>
  <div class="page">

    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <router-link to="/" class="bc-link">Home</router-link>
      <span class="bc-sep">›</span>
      <router-link to="/films" class="bc-link">Films</router-link>
      <span class="bc-sep">›</span>
      <span class="bc-current">{{ film?.title || '…' }}</span>
    </div>

    <!-- Backdrop -->
    <div v-if="film?.backdrop" class="backdrop-wrap">
      <img :src="film.backdrop" class="backdrop-img" :alt="film.title" />
      <div class="backdrop-fade"></div>
    </div>

    <div class="layout">
      <!-- Left: player + info -->
      <div class="player-col">

        <!-- Player header -->
        <div class="player-header" v-if="film">
          <h1 class="film-title">{{ film.title }}</h1>
          <div class="film-meta-row">
            <span class="pill">{{ film.year }}</span>
            <span class="pill star">★ {{ film.rating.toFixed(1) }}</span>
            <span v-if="film.runtime" class="pill">{{ Math.floor(film.runtime / 60) }}h {{ film.runtime % 60 }}m</span>
            <span v-for="g in film.genreNames.slice(0,3)" :key="g" class="pill genre">{{ g }}</span>
          </div>
        </div>

        <!-- Player -->
        <div class="player-wrap">
          <div v-if="loading || (!film && !loading)" class="overlay-center">
            <div v-if="loading" class="spin"></div>
            <p v-if="loading">Loading…</p>
            <p v-if="!loading && !film">Film not found.</p>
          </div>

          <template v-if="film && activeSrc">
            <div v-if="srcLoading" class="overlay-center abs">
              <div class="spin"></div>
              <p>Loading stream…</p>
            </div>
            <div v-if="srcError" class="overlay-center abs">
              <p class="err-icon">⚠</p>
              <p>All sources unavailable.</p>
              <p class="err-sub">Try again later or check another title.</p>
            </div>
            <iframe
              v-if="!srcError"
              :key="activeSrc"
              :src="activeSrc"
              class="video-el"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowfullscreen
              frameborder="0"
              scrolling="no"
              @load="onIframeLoad"
              @error="onIframeError"
            ></iframe>
          </template>
        </div>

        <!-- Source picker -->
        <div v-if="sources.length" class="server-bar">
          <span class="server-label">Source</span>
          <button
            v-for="(src, i) in sources" :key="src.url"
            :class="['server-btn', { active: activeSrcIdx === i }]"
            @click="selectSource(src, i)"
          >{{ src.label }}</button>
        </div>

        <!-- Tagline -->
        <p v-if="film?.tagline" class="tagline">"{{ film.tagline }}"</p>

        <!-- Overview -->
        <p v-if="film?.overview" class="overview">{{ film.overview }}</p>

        <!-- Tabs: Similar / Cast -->
        <div v-if="film" class="tabs-wrap">
          <div class="tabs">
            <button :class="['tab', { active: activeTab === 'similar' }]" @click="activeTab = 'similar'">
              Similar <span class="tc">{{ film.similar.length }}</span>
            </button>
            <button :class="['tab', { active: activeTab === 'cast' }]" @click="activeTab = 'cast'">
              Cast <span class="tc">{{ film.cast.length }}</span>
            </button>
          </div>

          <!-- Similar films grid -->
          <div v-if="activeTab === 'similar'" class="similar-grid">
            <div v-if="!film.similar.length" class="empty-tab">No similar films found.</div>
            <div
              v-for="m in film.similar" :key="m.id"
              class="sim-card"
              @click="router.push({ name: 'film', params: { id: m.id } })"
            >
              <div class="sim-img">
                <img v-if="m.image" :src="m.image" :alt="m.title" loading="lazy" />
                <div v-else class="sim-placeholder">🎬</div>
                <div class="sim-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
              </div>
              <div class="sim-info">
                <h4 class="sim-title">{{ m.title }}</h4>
                <div class="sim-meta">
                  <span>{{ m.year }}</span>
                  <span class="sim-rating">★ {{ m.rating.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cast grid -->
          <div v-if="activeTab === 'cast'" class="cast-grid">
            <div v-if="!film.cast.length" class="empty-tab">Cast info unavailable.</div>
            <div v-for="c in film.cast" :key="c.id" class="cast-card">
              <div class="cast-img">
                <img v-if="c.image" :src="c.image" :alt="c.name" loading="lazy" />
                <div v-else class="cast-ph">{{ c.name[0] }}</div>
              </div>
              <p class="cast-name">{{ c.name }}</p>
              <p class="cast-char">{{ c.character }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <template v-if="loading">
          <div class="sk-poster skeleton"></div>
          <div class="sk-title skeleton"></div>
          <div class="sk-line skeleton"></div>
        </template>
        <template v-else-if="film">
          <div class="poster-wrap">
            <img :src="film.image" :alt="film.title" class="poster" />
            <div class="poster-glow"></div>
          </div>
          <div class="badge-row">
            <span class="badge-pink">FILM</span>
            <span v-for="g in film.genreNames.slice(0,2)" :key="g" class="badge-outline">{{ g }}</span>
          </div>
          <h2 class="sb-title">{{ film.title }}</h2>
          <div class="stats">
            <div class="stat">
              <span class="stat-icon star">★</span>
              <div><span class="stat-val">{{ film.rating.toFixed(1) }}</span><span class="stat-lbl">Rating</span></div>
            </div>
            <div class="stat" v-if="film.year">
              <span class="stat-icon">📅</span>
              <div><span class="stat-val">{{ film.year }}</span><span class="stat-lbl">Year</span></div>
            </div>
            <div class="stat" v-if="film.runtime">
              <span class="stat-icon">⏱</span>
              <div><span class="stat-val">{{ Math.floor(film.runtime/60) }}h {{ film.runtime%60 }}m</span><span class="stat-lbl">Runtime</span></div>
            </div>
          </div>
          <div class="detail-table">
            <div v-if="film.status" class="dt-row"><span class="dt-key">Status</span><span class="dt-val">{{ film.status }}</span></div>
            <div v-if="film.director" class="dt-row"><span class="dt-key">Director</span><span class="dt-val">{{ film.director }}</span></div>
            <div v-if="film.originalLang" class="dt-row"><span class="dt-key">Language</span><span class="dt-val">{{ film.originalLang.toUpperCase() }}</span></div>
            <div v-if="film.voteCount" class="dt-row"><span class="dt-key">Votes</span><span class="dt-val">{{ film.voteCount.toLocaleString() }}</span></div>
          </div>
          <a
            v-if="film.trailer"
            :href="`https://www.youtube.com/watch?v=${film.trailer}`"
            target="_blank" rel="noopener"
            class="trailer-btn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>
            Watch Trailer
          </a>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg); }

.breadcrumb { display:flex; align-items:center; gap:.4rem; padding:1.5rem 2rem .5rem; max-width:1400px; margin:0 auto; font-size:.78rem; color:var(--text-muted); position:relative; z-index:2; }
.bc-link { color:var(--text-muted); text-decoration:none; transition:color .2s; }
.bc-link:hover { color:var(--pink); }
.bc-sep { color:var(--border); }
.bc-current { color:var(--text); font-weight:600; }

/* Backdrop */
.backdrop-wrap { position:fixed; top:0; left:0; right:0; height:55vh; z-index:0; pointer-events:none; }
.backdrop-img { width:100%; height:100%; object-fit:cover; object-position:top; opacity:.18; }
.backdrop-fade { position:absolute; inset:0; background:linear-gradient(to bottom, transparent 30%, var(--bg) 100%); }

.layout { position:relative; z-index:1; display:grid; grid-template-columns:1fr 300px; gap:1.5rem; max-width:1400px; margin:0 auto; padding:0 2rem 4rem; align-items:start; }

/* Player header */
.player-header { margin-bottom:.75rem; }
.film-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(1.6rem,4vw,2.8rem); line-height:1; color:#fff; letter-spacing:.04em; margin-bottom:.5rem; }
.film-meta-row { display:flex; gap:.4rem; flex-wrap:wrap; }
.pill { padding:.22rem .6rem; border-radius:4px; font-size:.72rem; font-weight:700; background:var(--surface); border:1px solid var(--border); color:var(--text-muted); }
.pill.star { color:#ffd700; border-color:rgba(255,215,0,.3); background:rgba(255,215,0,.07); }
.pill.genre { color:var(--pink); border-color:rgba(255,45,120,.3); background:rgba(255,45,120,.07); }

/* Player */
.player-wrap { position:relative; width:100%; aspect-ratio:16/9; background:#000; border-radius:10px; overflow:hidden; border:1px solid var(--border); box-shadow:0 0 40px rgba(0,0,0,.6),0 0 0 1px rgba(255,45,120,.06); }
.video-el { width:100%; height:100%; display:block; background:#000; }
.overlay-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; color:var(--text-muted); font-size:.85rem; z-index:6; background:rgba(0,0,0,.6); }
.overlay-center.abs { position:absolute; }
.spin { width:36px; height:36px; border:3px solid rgba(255,255,255,.1); border-top-color:var(--pink); border-radius:50%; animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.err-icon { font-size:2rem; }
.err-sub { font-size:.75rem; color:var(--text-muted); margin-top:-.5rem; }

/* Server bar */
.server-bar { display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; padding:.55rem 0; margin-top:.4rem; border-bottom:1px solid var(--border); }
.server-label { font-size:.65rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--text-muted); flex-shrink:0; }
.server-btn { padding:.28rem .65rem; background:var(--surface); border:1px solid var(--border); border-radius:5px; color:var(--text-muted); font-size:.7rem; font-weight:700; cursor:pointer; transition:all .18s; }
.server-btn:hover { border-color:var(--pink); color:var(--pink); }
.server-btn.active { background:rgba(255,45,120,.1); border-color:var(--pink); color:var(--pink); }

.tagline { font-style:italic; color:var(--text-muted); margin-top:1.25rem; font-size:.9rem; }
.overview { color:var(--text-muted); font-size:.9rem; line-height:1.8; margin:.75rem 0 1.5rem; }

/* Tabs */
.tabs-wrap { margin-top:.5rem; }
.tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:1rem; }
.tab { position:relative; padding:.6rem 1.25rem; background:none; border:none; color:var(--text-muted); font-size:.88rem; font-weight:700; cursor:pointer; transition:color .2s; }
.tab::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--pink),#ff6fa8); transform:scaleX(0); transition:transform .25s; }
.tab:hover { color:var(--text); }
.tab.active { color:var(--pink); }
.tab.active::after { transform:scaleX(1); }
.tc { display:inline-block; background:var(--surface); border-radius:20px; padding:.05rem .45rem; font-size:.68rem; margin-left:.4rem; color:var(--text-muted); }
.empty-tab { color:var(--text-muted); font-size:.85rem; padding:1rem 0; }

/* Similar */
.similar-grid { display:flex; flex-direction:column; gap:.6rem; }
.sim-card { display:flex; gap:.75rem; align-items:center; padding:.5rem; border-radius:8px; background:var(--surface); border:1px solid var(--border); cursor:pointer; transition:all .2s; }
.sim-card:hover { border-color:rgba(255,45,120,.35); }
.sim-img { position:relative; width:56px; flex-shrink:0; aspect-ratio:2/3; border-radius:5px; overflow:hidden; background:#0d1527; }
.sim-img img { width:100%; height:100%; object-fit:cover; }
.sim-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:1.4rem; }
.sim-play { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0; background:rgba(0,0,0,.6); transition:opacity .2s; }
.sim-card:hover .sim-play { opacity:1; }
.sim-play svg { width:18px; height:18px; color:#fff; }
.sim-info { flex:1; overflow:hidden; }
.sim-title { font-size:.85rem; font-weight:600; color:var(--text); margin:0 0 .25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sim-meta { display:flex; gap:.75rem; font-size:.72rem; color:var(--text-muted); }
.sim-rating { color:#ffd700; }

/* Cast */
.cast-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(90px,1fr)); gap:.75rem; }
.cast-card { text-align:center; }
.cast-img { width:100%; aspect-ratio:1; border-radius:50%; overflow:hidden; background:var(--surface); border:2px solid var(--border); margin-bottom:.4rem; }
.cast-img img { width:100%; height:100%; object-fit:cover; }
.cast-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:700; color:var(--text-muted); background:var(--surface); }
.cast-name { font-size:.72rem; font-weight:700; color:var(--text); line-height:1.3; }
.cast-char { font-size:.65rem; color:var(--text-muted); margin-top:.1rem; }

/* Sidebar */
.sidebar { position:sticky; top:80px; }
.poster-wrap { position:relative; width:100%; aspect-ratio:2/3; border-radius:10px; overflow:hidden; border:1px solid var(--border); margin-bottom:1rem; }
.poster { width:100%; height:100%; object-fit:cover; }
.poster-glow { position:absolute; inset:0; background:linear-gradient(to top,rgba(10,14,26,.7) 0%,transparent 50%); }
.badge-row { display:flex; gap:.4rem; flex-wrap:wrap; margin-bottom:.75rem; }
.badge-pink { padding:.22rem .65rem; border-radius:4px; font-size:.68rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; background:var(--pink); color:#fff; box-shadow:0 0 10px rgba(255,45,120,.5); }
.badge-outline { padding:.22rem .65rem; border-radius:4px; font-size:.68rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; border:1px solid var(--cyan-dim); color:var(--cyan); background:rgba(0,240,255,.07); }
.sb-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(1.3rem,3vw,1.8rem); line-height:1; letter-spacing:.04em; color:#fff; margin-bottom:1rem; }
.stats { display:flex; gap:1rem; margin-bottom:1rem; flex-wrap:wrap; }
.stat { display:flex; align-items:center; gap:.4rem; }
.stat-icon { color:var(--cyan); font-size:.8rem; }
.stat-icon.star { color:#ffd700; }
.stat div { display:flex; flex-direction:column; }
.stat-val { font-size:.88rem; font-weight:800; color:var(--text); line-height:1.2; }
.stat-lbl { font-size:.62rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:.08em; }
.detail-table { border-top:1px solid var(--border); padding-top:1rem; margin-bottom:1rem; }
.dt-row { display:flex; justify-content:space-between; padding:.4rem 0; border-bottom:1px solid rgba(255,255,255,.04); }
.dt-key { font-size:.72rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.07em; }
.dt-val { font-size:.78rem; font-weight:600; color:var(--text); text-align:right; }
.trailer-btn { display:inline-flex; align-items:center; gap:.4rem; padding:.5rem 1.1rem; background:rgba(255,45,120,.1); border:1px solid rgba(255,45,120,.4); border-radius:6px; color:var(--pink); font-size:.82rem; font-weight:700; text-decoration:none; transition:all .2s; width:100%; justify-content:center; }
.trailer-btn:hover { background:rgba(255,45,120,.2); }

/* Skeletons */
.sk-poster { width:100%; aspect-ratio:2/3; border-radius:10px; }
.sk-title  { height:24px; width:80%; margin:1rem 0 .5rem; border-radius:4px; }
.sk-line   { height:14px; width:100%; margin-bottom:.5rem; border-radius:4px; }
.skeleton  { background:linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size:200%; animation:shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

@media (max-width:1024px) {
  .layout { grid-template-columns:1fr; padding:0 1rem 3rem; }
  .sidebar { position:static; display:grid; grid-template-columns:160px 1fr; gap:1rem; align-items:start; }
  .poster-wrap { margin-bottom:0; }
  .detail-table { grid-column:1/-1; }
}
@media (max-width:640px) {
  .breadcrumb { padding:1rem 1rem .5rem; }
  .sidebar { grid-template-columns:1fr; }
  .cast-grid { grid-template-columns:repeat(auto-fill, minmax(70px,1fr)); }
}
</style>
