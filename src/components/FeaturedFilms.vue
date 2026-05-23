<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addToLibrary, removeFromLibrary, getLibrary } from '../services/userdata.js'

const props = defineProps({
  items:    { type: Array,  default: () => [] },
  loading:  { type: Boolean },
  title:    { type: String, default: 'Featured Films' },
  accent:   { type: String, default: '' },
  tag:      { type: String, default: 'Cinema' },
  tagColor: { type: String, default: 'pink' },
  link:     { type: String, default: '/films' },
  linkLabel:{ type: String, default: 'View All →' },
})
const router = useRouter()
const libraryIds = ref(new Set(getLibrary().map(a => String(a.id))))

async function toggleLibrary(e, film) {
  e.stopPropagation()
  const id = String(film.id)
  if (libraryIds.value.has(id)) {
    await removeFromLibrary(film.id)
    libraryIds.value.delete(id)
  } else {
    await addToLibrary(film, 'film')
    libraryIds.value.add(id)
  }
  libraryIds.value = new Set(libraryIds.value)
}
</script>

<template>
  <section class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <span :class="['section-tag', tagColor]">{{ tag }}</span>
        <h2 class="section-title">
          {{ title }}<template v-if="accent"> <span class="accent">{{ accent }}</span></template>
        </h2>
      </div>
      <router-link :to="link" class="see-all">{{ linkLabel }}</router-link>
    </div>

    <div class="scroll-container" v-if="!loading">
      <div
        v-for="film in items" :key="film.id"
        class="film-card scroll-card"
        @click="router.push({ name: 'film', params: { id: film.id } })"
      >
        <div class="card-img">
          <img v-if="film.image" :src="film.image" :alt="film.title" loading="lazy" />
          <div v-else class="card-placeholder">🎬</div>
          <div class="card-overlay">
            <div class="play-btn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <button
              :class="['add-btn', { saved: libraryIds.has(String(film.id)) }]"
              :title="libraryIds.has(String(film.id)) ? 'Remove from library' : 'Add to library'"
              @click="toggleLibrary($event, film)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <path v-if="!libraryIds.has(String(film.id))" d="M12 5v14M5 12h14" stroke-linecap="round"/>
                <path v-else d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <span class="film-badge">FILM</span>
          <span class="rating-badge">★ {{ film.rating?.toFixed(1) }}</span>
        </div>
        <div class="card-info">
          <p class="card-title">{{ film.title }}</p>
          <p class="card-year">{{ film.year }}</p>
        </div>
      </div>
    </div>

    <div class="scroll-container" v-else>
      <div v-for="n in 8" :key="n" class="skeleton-card">
        <div class="skeleton sk-img"></div>
        <div class="skeleton sk-line" style="width:70%; margin-top:.5rem"></div>
        <div class="skeleton sk-line" style="width:40%"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scroll-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--pink) transparent;
  scroll-snap-type: x mandatory;
}
.scroll-container::-webkit-scrollbar { height: 4px; }
.scroll-container::-webkit-scrollbar-track { background: transparent; }
.scroll-container::-webkit-scrollbar-thumb { background: var(--pink); border-radius: 2px; }

.scroll-card { flex: 0 0 160px; scroll-snap-align: start; }
.skeleton-card { flex: 0 0 160px; }

.film-card { cursor: pointer; border-radius: 8px; overflow: hidden; transition: transform .25s; }
.film-card:hover { transform: translateY(-4px); }
.film-card:hover .card-overlay { opacity: 1; }
.film-card:hover .card-img img { transform: scale(1.06); }

.card-img { position: relative; width: 100%; padding-top: 150%; overflow: hidden; background: #0d1527; border-radius: 8px; }
.card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .35s; }
.card-placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2rem; }

.card-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: .4rem; background: linear-gradient(to top, rgba(10,14,26,.85) 0%, transparent 60%); opacity: 0; transition: opacity .25s; z-index: 2; }
.play-btn { width: 38px; height: 38px; border-radius: 50%; background: var(--pink); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(255,45,120,.5); }
.play-btn svg { width: 16px; height: 16px; color: #fff; }
.add-btn { width: 30px; height: 30px; border-radius: 50%; background: rgba(0,240,255,.15); border: 1px solid rgba(0,240,255,.35); color: var(--cyan); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
.add-btn:hover { background: rgba(0,240,255,.3); }
.add-btn.saved { background: rgba(110,255,110,.15); border-color: rgba(110,255,110,.4); color: #6eff6e; }
.add-btn.saved:hover { background: rgba(110,255,110,.28); }

.film-badge { position: absolute; top: 7px; left: 7px; background: rgba(255,45,120,.25); color: var(--pink); border: 1px solid rgba(255,45,120,.45); font-size: .55rem; font-weight: 800; padding: .15rem .35rem; border-radius: 4px; z-index: 3; letter-spacing: .08em; }
.rating-badge { position: absolute; bottom: 7px; right: 7px; background: rgba(0,0,0,.7); color: #ffd700; font-size: .65rem; font-weight: 700; padding: .15rem .4rem; border-radius: 4px; z-index: 3; }

.card-info { padding: .45rem .1rem 0; }
.card-title { font-size: .8rem; font-weight: 700; color: var(--text); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0 0 .2rem; }
.card-year { font-size: .7rem; color: var(--text-muted); }

.skeleton { background: linear-gradient(90deg, #1a2240 25%, #222d4d 50%, #1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; border-radius: 6px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.sk-img  { padding-top: 150%; margin-bottom: 0.4rem; }
.sk-line { height: 13px; margin-bottom: 0.3rem; border-radius: 4px; }

@media (max-width: 480px) { .scroll-card, .skeleton-card { flex: 0 0 130px; } }
</style>
