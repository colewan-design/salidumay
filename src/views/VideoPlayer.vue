<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import { getAnimeDetail, getEpisodes, getRelated, getStreamingLinks } from '../services/api.js'
import { hiAnimeEnabled, hiSearch, hiEpisodes, hiStream, bestMatch } from '../services/hiAnime.js'
import { animexSearch, animexBestMatch, animexEpisodeSources } from '../services/animex.js'

const route  = useRoute()
const router = useRouter()

const animeId   = computed(() => route.params.id)
const currentEp = ref(Number(route.params.ep) || 1)

const anime          = ref(null)
const episodes       = ref([])
const related        = ref([])
const streamingLinks = ref([])
const loading        = ref(true)
const activeTab      = ref('episodes')
const audioMode      = ref('sub') // 'sub' | 'dub'

/* ── Streaming state ── */
const streamSrc     = ref('')
const streamIsHls   = ref(false)
const streamLoading = ref(false)
const streamError   = ref('')
const showTrailer   = ref(false)
const subtitleTracks = ref([])

const hiId  = ref(null)   // HiAnime anime slug
const hiEps = ref([])     // HiAnime episode list

const animexId      = ref(null)  // AnimeX anilist ID
const animexSources = ref([])    // all iframe sources for current episode
const animexSrc     = ref('')    // currently displayed iframe URL

let hlsInstance = null

/* ── Video player refs ── */
const videoEl    = ref(null)
const playerWrap = ref(null)

const isPlaying     = ref(false)
const isMuted       = ref(false)
const isFullscreen  = ref(false)
const volume        = ref(1)
const currentTime   = ref(0)
const duration      = ref(0)
const buffered      = ref(0)
const showControls  = ref(true)
const showIntroSkip = ref(false)
const playWhenReady = ref(false)
const speed         = ref(1)
const showSpeedMenu = ref(false)
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

let hideTimer = null

/* ── Computed ── */
const currentEpisode = computed(() => episodes.value.find(e => e.number === currentEp.value) || null)
const hasNext = computed(() => episodes.value.some(e => e.number === currentEp.value + 1))
const hasPrev = computed(() => episodes.value.some(e => e.number === currentEp.value - 1))
const progressPct = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
const bufferedPct = computed(() => duration.value ? (buffered.value / duration.value) * 100 : 0)
const timeDisplay = computed(() => `${fmt(currentTime.value)} / ${fmt(duration.value)}`)
const hasHlsStream    = computed(() => !!streamSrc.value)
const hasIframeStream = computed(() => !!animexSrc.value)
const hasStream       = computed(() => hasHlsStream.value || hasIframeStream.value)

function fmt(s) {
  const m  = Math.floor(s / 60)
  const ss = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
}

const serviceIcons = {
  Crunchyroll: '🟠', Netflix: '🔴', Funimation: '🟣',
  'Amazon Prime Video': '🔵', 'Disney+': '🔷', HIDIVE: '🟦', Hulu: '🟢',
}

/* ── HLS helpers ── */
function destroyHls() {
  if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null }
}

async function applyStream(src, isHls) {
  if (!videoEl.value) return
  destroyHls()
  showTrailer.value = false

  if (isHls) {
    const Hls = (await import('hls.js')).default
    if (Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, maxBufferLength: 30 })
      hlsInstance.loadSource(src)
      hlsInstance.attachMedia(videoEl.value)
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        videoEl.value?.play().catch(() => {})
      })
      hlsInstance.on(Hls.Events.ERROR, (_, d) => {
        if (d.fatal) { destroyHls(); showTrailer.value = !!anime.value?.trailerUrl }
      })
    } else if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.value.src = src
      videoEl.value.play().catch(() => {})
    } else {
      showTrailer.value = !!anime.value?.trailerUrl
    }
  } else {
    videoEl.value.src = src
    videoEl.value.play().catch(() => {})
  }

  // Attach subtitle tracks if available
  if (subtitleTracks.value.length && videoEl.value) {
    subtitleTracks.value.forEach(t => {
      const track = document.createElement('track')
      track.kind    = 'subtitles'
      track.label   = t.label || 'English'
      track.srclang = t.lang || 'en'
      track.src     = t.file
      if (t.default) track.default = true
      videoEl.value.appendChild(track)
    })
  }
}

/* ── HiAnime: find anime + load stream ── */
async function findHiAnime(title) {
  if (!hiAnimeEnabled) return
  try {
    const results = await hiSearch(title)
    const match   = bestMatch(results, title)
    if (!match) return
    hiId.value  = match.id
    hiEps.value = await hiEpisodes(match.id)
  } catch { /* silent */ }
}

/* ── AnimeX: find anime by title ── */
async function findAnimex(title) {
  try {
    const results = await animexSearch(title)
    const match   = animexBestMatch(results, title)
    if (match) animexId.value = match.id
  } catch { /* silent */ }
}

/* ── Select an AnimeX source from the server picker ── */
function selectSource(src) {
  animexSrc.value = src.url
}

async function loadEpisodeStream(epNum) {
  streamSrc.value     = ''
  animexSrc.value     = ''
  animexSources.value = []
  streamError.value   = ''
  showTrailer.value   = false

  // ── 1. Try HiAnime (HLS) ──
  if (hiAnimeEnabled && hiId.value) {
    streamLoading.value = true
    try {
      const hiEp = hiEps.value.find(e => e.number === epNum)
      if (!hiEp) throw new Error(`episode ${epNum} not on HiAnime`)

      const streamData = await hiStream(hiEp.episodeId, audioMode.value)
      if (!streamData) throw new Error('no stream data')

      const src   = streamData.sources?.[0]?.url
      const isHls = streamData.sources?.[0]?.type === 'hls'
      if (!src) throw new Error('no source URL')

      subtitleTracks.value = (streamData.tracks || []).filter(t => t.kind === 'captions' || t.kind === 'thumbnails' || !t.kind)
      streamSrc.value   = src
      streamIsHls.value = isHls

      await nextTick()
      await applyStream(src, isHls)
      streamLoading.value = false
      return
    } catch (e) {
      streamError.value = e.message
    }
    streamLoading.value = false
  }

  // ── 2. Fall back to AnimeX iframes ──
  if (animexId.value) {
    streamLoading.value = true
    try {
      const { sources } = await animexEpisodeSources(animexId.value, epNum)
      if (!sources.length) throw new Error('no AnimeX sources')

      animexSources.value = sources
      // Pick best for current audio mode (prefer 1080p)
      const forLang  = sources.filter(s => s.lang?.toLowerCase() === audioMode.value)
      const best     = forLang.find(s => s.quality === '1080p') || forLang[0] || sources[0]
      animexSrc.value = best.url
      streamLoading.value = false
      return
    } catch (e) {
      streamError.value = (streamError.value ? streamError.value + '; ' : '') + e.message
    }
    streamLoading.value = false
  }

  // ── 3. Final fallback: trailer ──
  showTrailer.value = !!anime.value?.trailerUrl
}

/* ── Video player controls ── */
function togglePlay() {
  if (!videoEl.value) return
  if (isPlaying.value) videoEl.value.pause()
  else videoEl.value.play().catch(() => {})
}
function onPlay()    { isPlaying.value = true }
function onPause()   { isPlaying.value = false }
function onCanPlay() { if (playWhenReady.value) { playWhenReady.value = false; videoEl.value?.play().catch(() => {}) } }
function onTimeUpdate() {
  if (!videoEl.value) return
  currentTime.value = videoEl.value.currentTime
  showIntroSkip.value = currentTime.value < 90
  if (videoEl.value.buffered.length)
    buffered.value = videoEl.value.buffered.end(videoEl.value.buffered.length - 1)
}
function onLoadedMeta() { if (videoEl.value) duration.value = videoEl.value.duration }
function seek(e) {
  if (!videoEl.value || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  videoEl.value.currentTime = ((e.clientX - rect.left) / rect.width) * duration.value
}
function setVolume(e) {
  const v = parseFloat(e.target.value)
  volume.value = v
  if (videoEl.value) videoEl.value.volume = v
  isMuted.value = v === 0
}
function toggleMute() { if (!videoEl.value) return; isMuted.value = !isMuted.value; videoEl.value.muted = isMuted.value }
function skipIntro()  { if (videoEl.value) videoEl.value.currentTime = 90; showIntroSkip.value = false }
function setSpeed(s)  { speed.value = s; if (videoEl.value) videoEl.value.playbackRate = s; showSpeedMenu.value = false }
function toggleFullscreen() {
  if (!playerWrap.value) return
  if (!document.fullscreenElement) playerWrap.value.requestFullscreen()
  else document.exitFullscreen()
}
function onFullscreenChange() { isFullscreen.value = !!document.fullscreenElement }
function skip(s) { if (videoEl.value) videoEl.value.currentTime = Math.max(0, videoEl.value.currentTime + s) }
function resetHideTimer() {
  showControls.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { if (isPlaying.value) showControls.value = false }, 3000)
}
function onMouseLeave() { if (isPlaying.value) showControls.value = false }
function onKeydown(e) {
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.code === 'Space')      { e.preventDefault(); togglePlay() }
  if (e.code === 'ArrowRight') skip(10)
  if (e.code === 'ArrowLeft')  skip(-10)
  if (e.code === 'ArrowUp')    { volume.value = Math.min(1, volume.value + 0.1); if (videoEl.value) videoEl.value.volume = volume.value }
  if (e.code === 'ArrowDown')  { volume.value = Math.max(0, volume.value - 0.1); if (videoEl.value) videoEl.value.volume = volume.value }
  if (e.code === 'KeyF')       toggleFullscreen()
  if (e.code === 'KeyM')       toggleMute()
}

/* ── Episode navigation ── */
function watchEp(ep) {
  currentEp.value = ep.number
  router.push({ name: 'watch', params: { id: animeId.value, ep: ep.number } })
  loadEpisodeStream(ep.number)
}
function nextEpisode() { const n = episodes.value.find(e => e.number === currentEp.value + 1); if (n) watchEp(n) }
function prevEpisode() { const p = episodes.value.find(e => e.number === currentEp.value - 1); if (p) watchEp(p) }

function switchAudio(mode) {
  audioMode.value = mode
  loadEpisodeStream(currentEp.value)
}

/* ── Data fetch ── */
async function fetchData() {
  loading.value  = true
  destroyHls()
  streamSrc.value     = ''
  animexSrc.value     = ''
  animexSources.value = []
  showTrailer.value   = false
  hiId.value    = null
  hiEps.value   = []
  animexId.value = null

  const [ad, ep, rel, sl] = await Promise.allSettled([
    getAnimeDetail(animeId.value),
    getEpisodes(animeId.value),
    getRelated(animeId.value),
    getStreamingLinks(animeId.value),
  ])
  if (ad.status  === 'fulfilled') anime.value          = ad.value.data
  if (ep.status  === 'fulfilled') episodes.value       = ep.value.data
  if (rel.status === 'fulfilled') related.value        = rel.value.data
  if (sl.status  === 'fulfilled') streamingLinks.value = sl.value.data
  loading.value = false

  if (anime.value?.title) {
    await Promise.allSettled([
      findHiAnime(anime.value.title),
      findAnimex(anime.value.title),
    ])
    await loadEpisodeStream(currentEp.value)
  } else {
    showTrailer.value = !!anime.value?.trailerUrl
  }
}

watch(() => route.params.id, () => { currentEp.value = 1; fetchData() })

onMounted(async () => {
  await fetchData()
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  await nextTick()
  if (videoEl.value) videoEl.value.volume = volume.value
})

onUnmounted(() => {
  destroyHls()
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  clearTimeout(hideTimer)
})
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
          <div class="audio-toggle" v-if="hiAnimeEnabled || animexId">
            <button :class="['audio-btn', { active: audioMode === 'sub' }]" @click="switchAudio('sub')">SUB</button>
            <button :class="['audio-btn', { active: audioMode === 'dub' }]" @click="switchAudio('dub')">DUB</button>
          </div>
          <button class="ep-nav-btn" :disabled="!hasNext" @click="nextEpisode">
            Next
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14 5.03 3.6L8 17.14V9.86zM16 6h2v12h-2z"/></svg>
          </button>
        </div>

        <!-- ── Player ── -->
        <div
          ref="playerWrap"
          :class="['player-wrap', { 'hide-cursor': isPlaying && !showControls && hasHlsStream }]"
          @mousemove="hasHlsStream && resetHideTimer()"
          @mouseleave="hasHlsStream && onMouseLeave()"
        >
          <!-- Native video (HiAnime HLS stream) -->
          <video
            v-show="hasHlsStream && !showTrailer"
            ref="videoEl"
            class="video-el"
            preload="metadata"
            @play="onPlay"
            @pause="onPause"
            @canplay="onCanPlay"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMeta"
            @ended="nextEpisode"
            @click="togglePlay"
          ></video>

          <!-- AnimeX iframe stream -->
          <iframe
            v-if="hasIframeStream"
            class="video-el"
            :src="animexSrc"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
            frameborder="0"
            scrolling="no"
          ></iframe>

          <!-- YouTube trailer fallback -->
          <iframe
            v-if="showTrailer && anime?.trailerUrl"
            class="video-el"
            :src="anime.trailerUrl"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
            frameborder="0"
          ></iframe>

          <!-- Stream loading -->
          <div v-if="streamLoading" class="overlay-center">
            <div class="spin"></div>
            <p>Loading stream…</p>
          </div>

          <!-- No stream, no trailer -->
          <div v-if="!streamLoading && !hasStream && !showTrailer" class="overlay-center">
            <div class="no-video-icon">▶</div>
            <p>{{ !hiAnimeEnabled && !animexId ? 'No stream source configured' : 'Stream unavailable for this episode' }}</p>
          </div>

          <!-- Skip intro -->
          <Transition name="fade">
            <button v-if="showIntroSkip && isPlaying && hasHlsStream" class="skip-intro" @click="skipIntro">
              Skip Intro ⟶
            </button>
          </Transition>

          <!-- Big play button -->
          <Transition name="fade">
            <div v-if="!isPlaying && hasHlsStream && !showTrailer && !streamLoading" class="big-play" @click="togglePlay">
              <div class="big-play-btn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </Transition>

          <!-- Controls overlay (only for native video) -->
          <Transition name="ctrl-fade">
            <div v-if="hasHlsStream && !showTrailer && (showControls || !isPlaying)" class="controls">
              <div class="ctrl-top">
                <span class="ctrl-title">{{ anime?.title }}</span>
                <span class="ctrl-ep" v-if="currentEpisode">EP {{ currentEp }} — {{ currentEpisode.title }}</span>
              </div>

              <div class="progress-wrap" @click="seek">
                <div class="progress-track">
                  <div class="progress-buffered" :style="{ width: bufferedPct + '%' }"></div>
                  <div class="progress-fill" :style="{ width: progressPct + '%' }">
                    <div class="progress-thumb"></div>
                  </div>
                </div>
              </div>

              <div class="ctrl-bottom">
                <div class="ctrl-left">
                  <button class="ctrl-btn" :disabled="!hasPrev" @click="prevEpisode">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                  </button>
                  <button class="ctrl-btn play-pause" @click="togglePlay">
                    <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  </button>
                  <button class="ctrl-btn" :disabled="!hasNext" @click="nextEpisode">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14 5.03 3.6L8 17.14V9.86zM16 6h2v12h-2z"/></svg>
                  </button>
                  <button class="ctrl-btn" @click="skip(-10)">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                  </button>
                  <button class="ctrl-btn" @click="skip(10)">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z"/></svg>
                  </button>
                  <div class="volume-wrap">
                    <button class="ctrl-btn" @click="toggleMute">
                      <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </button>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.05" :value="isMuted ? 0 : volume" @input="setVolume" />
                  </div>
                  <span class="ctrl-time">{{ timeDisplay }}</span>
                </div>

                <div class="ctrl-right">
                  <div class="menu-wrap">
                    <button class="ctrl-btn ctrl-text" @click="showSpeedMenu = !showSpeedMenu">{{ speed }}x</button>
                    <div v-if="showSpeedMenu" class="popup-menu">
                      <button v-for="s in speeds" :key="s" :class="['menu-item', { active: speed === s }]" @click="setSpeed(s)">{{ s }}x</button>
                    </div>
                  </div>
                  <button class="ctrl-btn" @click="toggleFullscreen">
                    <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- AnimeX server picker -->
        <div v-if="animexSources.length" class="server-bar">
          <span class="server-label">Server</span>
          <button
            v-for="src in animexSources"
            :key="src.url"
            :class="['server-btn', { active: animexSrc === src.url }]"
            @click="selectSource(src)"
          >
            {{ src.lang?.toUpperCase() }} {{ src.quality }}
          </button>
        </div>

        <!-- Keyboard shortcuts (only when HLS streaming) -->
        <div v-if="hasHlsStream" class="shortcuts-bar">
          <span class="shortcut"><kbd>Space</kbd> Play/Pause</span>
          <span class="shortcut"><kbd>←</kbd><kbd>→</kbd> ±10s</span>
          <span class="shortcut"><kbd>↑</kbd><kbd>↓</kbd> Volume</span>
          <span class="shortcut"><kbd>F</kbd> Fullscreen</span>
          <span class="shortcut"><kbd>M</kbd> Mute</span>
        </div>

        <!-- Trailer notice when showing fallback -->
        <div v-if="showTrailer && anime?.trailerUrl" class="trailer-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="notice-icon">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ !hiAnimeEnabled && !animexId ? 'Add VITE_HIANIME_API or configure AnimeX for streaming.' : 'Stream unavailable — showing official trailer.' }}
          <span v-if="streamError" class="error-detail">({{ streamError }})</span>
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
          <p class="sidebar-synopsis">{{ anime.synopsis }}</p>
          <div class="series-progress" v-if="anime.episodes && typeof anime.episodes === 'number'">
            <div class="sp-header"><span class="sp-label">Progress</span><span class="sp-val">{{ currentEp }} / {{ anime.episodes }}</span></div>
            <div class="sp-track"><div class="sp-fill" :style="{ width: ((currentEp / anime.episodes) * 100) + '%' }"></div></div>
          </div>
          <div class="details-table">
            <div class="dt-row" v-if="anime.status"><span class="dt-key">Status</span><span :class="['dt-val', anime.status === 'Airing' ? 'text-cyan' : 'text-green']">{{ anime.status }}</span></div>
            <div class="dt-row" v-if="anime.year"><span class="dt-key">Year</span><span class="dt-val">{{ anime.year }}</span></div>
            <div class="dt-row" v-if="anime.studio"><span class="dt-key">Studio</span><span class="dt-val">{{ anime.studio }}</span></div>
            <div class="dt-row" v-if="anime.genre"><span class="dt-key">Genre</span><span class="dt-val">{{ anime.genre }}</span></div>
            <div class="dt-row" v-if="hiAnimeEnabled || animexId">
              <span class="dt-key">Stream</span>
              <span :class="['dt-val', hiId ? 'text-cyan' : animexId ? 'text-green' : 'text-muted']">
                {{ hiId ? 'HiAnime ✓' : animexId ? 'AnimeX ✓' : 'Not matched' }}
              </span>
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
.sidebar-synopsis { font-size:.85rem; color:var(--text-muted); line-height:1.7; margin-bottom:1.25rem; display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; }
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
