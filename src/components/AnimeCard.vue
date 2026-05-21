<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  anime:   { type: Object,  required: true },
  variant: { type: String,  default: 'default' },
})

function watchAnime() {
  router.push({ name: 'watch', params: { id: props.anime.id, ep: 1 } })
}
</script>

<template>
  <article class="card" :class="variant">
    <div class="card-img-wrap">
      <img :src="anime.image" :alt="anime.title" loading="lazy" />
      <div class="card-glitch-overlay"></div>

      <!-- Badges -->
      <span v-if="anime.new"    class="img-badge badge-new">NEW</span>
      <span v-if="anime.status" class="img-badge" :class="anime.status === 'Airing' ? 'badge-airing' : 'badge-done'">
        {{ anime.status === 'Airing' ? '● AIRING' : '✓ DONE' }}
      </span>

      <div class="card-hover-info">
        <button class="play-btn" aria-label="Watch" @click.stop="watchAnime">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="add-btn" aria-label="Add to list">+</button>
      </div>
    </div>

    <div class="card-body">
      <span class="card-genre">{{ anime.genre }}</span>
      <h3 class="card-title">{{ anime.title }}</h3>
      <div class="card-meta">
        <span class="card-eps">{{ anime.episodes }} ep</span>
        <span class="card-rating">★ {{ anime.rating }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(.175,.885,.32,1.275), box-shadow 0.3s;
  position: relative;
}
.card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 0 0 1px var(--cyan-dim), 0 8px 40px rgba(0,240,255,0.18), 0 0 60px rgba(0,240,255,0.08);
}
.card:hover .card-glitch-overlay { opacity: 1; }
.card:hover .card-hover-info { opacity: 1; }

.card-img-wrap {
  position: relative;
  padding-top: 140%;
  overflow: hidden;
  background: #0d1527;
}
.card-img-wrap img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.card:hover .card-img-wrap img { transform: scale(1.08); }

/* Glitch effect on hover */
.card-glitch-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  background: linear-gradient(135deg, rgba(0,240,255,0.06) 0%, transparent 60%, rgba(255,45,120,0.06) 100%);
  animation: glitch-flicker 0.15s step-end infinite;
}
@keyframes glitch-flicker {
  0%,100% { clip-path: inset(0 0 95% 0); transform: translateX(0); }
  20%      { clip-path: inset(40% 0 50% 0); transform: translateX(-2px); }
  40%      { clip-path: inset(70% 0 20% 0); transform: translateX(2px); }
  60%      { clip-path: inset(20% 0 70% 0); transform: translateX(-1px); }
  80%      { clip-path: inset(55% 0 35% 0); transform: translateX(1px); }
}

.img-badge {
  position: absolute;
  top: 8px; left: 8px;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.badge-new    { background: var(--pink); color: #fff; box-shadow: 0 0 8px rgba(255,45,120,0.5); }
.badge-airing { background: rgba(0,240,255,0.15); color: var(--cyan); border: 1px solid var(--cyan-dim); }
.badge-done   { background: rgba(100,255,100,0.12); color: #6eff6e; border: 1px solid rgba(100,255,100,0.3); }

.card-hover-info {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.25s;
  background: linear-gradient(to top, rgba(10,14,26,0.85) 0%, transparent 100%);
}
.play-btn {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--pink);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(255,45,120,0.6);
  transition: transform 0.2s;
}
.play-btn:hover { transform: scale(1.15); }
.play-btn svg { width: 18px; height: 18px; }
.add-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(0,240,255,0.15);
  border: 1px solid var(--cyan-dim);
  color: var(--cyan);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}
.add-btn:hover { background: rgba(0,240,255,0.3); }

.card-body { padding: 0.75rem; }
.card-genre {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pink);
}
.card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  margin: 0.25rem 0 0.5rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta { display: flex; justify-content: space-between; align-items: center; }
.card-eps   { font-size: 0.75rem; color: var(--text-muted); }
.card-rating { font-size: 0.78rem; color: #ffd700; font-weight: 700; }
</style>
