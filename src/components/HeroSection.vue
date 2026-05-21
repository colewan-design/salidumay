<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  hero: { type: Object, default: null },
  loading: { type: Boolean, default: true },
})

const router = useRouter()

function watchNow() {
  if (!props.hero) return
  router.push({ name: 'watch', params: { id: props.hero.id || 1, ep: 1 } })
}
</script>

<template>
  <section id="hero" class="hero">
    <!-- Parallax BG -->
    <div
      class="hero-bg"
      :style="hero ? `background-image: url('${hero.image}')` : ''"
    ></div>

    <!-- Scanline overlay -->
    <div class="scanlines"></div>

    <!-- Gradient overlays -->
    <div class="hero-gradient"></div>

    <!-- Japanese watermark -->
    <div class="jp-watermark" aria-hidden="true">進撃の巨人</div>

    <!-- Sakura petals -->
    <div class="petals" aria-hidden="true">
      <span v-for="n in 12" :key="n" class="petal" :style="`--i:${n}`"></span>
    </div>

    <div class="hero-content" v-if="hero && !loading">
      <h1 class="hero-title gradient-text">{{ hero.title }}</h1>
      <p class="hero-subtitle">{{ hero.subtitle }}</p>
      <p class="hero-synopsis">{{ hero.synopsis }}</p>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-icon">▶</span>
          <span>{{ hero.episodes }} Episodes</span>
        </div>
        <div class="stat">
          <span class="stat-icon star">★</span>
          <span>{{ hero.rating.toFixed(1) }}</span>
        </div>
        <div class="stat">
          <span class="stat-icon">🎬</span>
          <span>{{ hero.studio }}</span>
        </div>
      </div>

      <div class="hero-actions">
        <button class="btn-watch pulse-glow" @click="watchNow">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Watch Now
        </button>
        <button class="btn-list">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          Add to List
        </button>
      </div>
    </div>

    <!-- Skeleton loader -->
    <div class="hero-content" v-else>
      <div class="skeleton sk-badge"></div>
      <div class="skeleton sk-title"></div>
      <div class="skeleton sk-sub"></div>
      <div class="skeleton sk-synopsis"></div>
    </div>

    <!-- Bottom fade -->
    <div class="hero-bottom-fade"></div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  min-height: 620px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  background-color: #060b1a;
  transform: scale(1.06);
  animation: parallax-drift 20s ease-in-out infinite alternate;
}
@keyframes parallax-drift {
  from { transform: scale(1.06) translateY(0); }
  to   { transform: scale(1.06) translateY(-3%); }
}

.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0,0,0,0.12) 3px,
    rgba(0,0,0,0.12) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, rgba(10,14,26,0.55) 0%, rgba(10,14,26,0.85) 70%),
    linear-gradient(to top, rgba(10,14,26,1) 0%, transparent 50%);
  z-index: 2;
}

.jp-watermark {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: clamp(4rem, 12vw, 10rem);
  font-weight: 900;
  color: rgba(0, 240, 255, 0.04);
  writing-mode: vertical-rl;
  letter-spacing: 0.1em;
  user-select: none;
  z-index: 2;
}

/* Sakura petals */
.petals { position: absolute; inset: 0; pointer-events: none; z-index: 3; overflow: hidden; }
.petal {
  position: absolute;
  top: -20px;
  left: calc(var(--i) * 8%);
  width: 8px;
  height: 10px;
  background: linear-gradient(135deg, var(--pink), rgba(255,45,120,0.3));
  border-radius: 50% 0 50% 0;
  opacity: 0.6;
  animation: petal-fall calc(6s + var(--i) * 0.7s) linear infinite;
  animation-delay: calc(var(--i) * -0.5s);
}
@keyframes petal-fall {
  0%   { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0.7; }
  25%  { transform: translateY(25vh) rotate(90deg) translateX(20px); }
  50%  { transform: translateY(50vh) rotate(180deg) translateX(-15px); }
  75%  { transform: translateY(75vh) rotate(270deg) translateX(10px); }
  100% { transform: translateY(110vh) rotate(360deg) translateX(-5px); opacity: 0; }
}

.hero-content {
  position: relative;
  z-index: 4;
  max-width: 780px;
  width: 100%;
  padding: 0 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3rem, 8vw, 6.5rem);
  line-height: 0.92;
  letter-spacing: 0.03em;
  margin: 0 0 0.4rem;
}
.gradient-text {
  background: linear-gradient(135deg, #fff 20%, var(--cyan) 60%, var(--pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-subtitle {
  font-size: 0.95rem;
  color: var(--cyan);
  letter-spacing: 0.12em;
  margin: 0 0 1rem;
  font-weight: 500;
}
.hero-synopsis {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 0 1.5rem;
}

.hero-stats { display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
.stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--text-muted);
  font-weight: 600;
}
.stat-icon { color: var(--cyan); font-size: 0.75rem; }
.stat-icon.star { color: #ffd700; }

.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn-watch, .btn-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.8rem;
  border-radius: 6px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  border: none;
  transition: all 0.25s;
}
.btn-watch svg, .btn-list svg { width: 1rem; height: 1rem; }
.btn-watch {
  background: linear-gradient(135deg, var(--pink), #a50042);
  color: #fff;
  box-shadow: 0 0 24px rgba(255,45,120,0.4);
}
.btn-watch:hover { box-shadow: 0 0 40px rgba(255,45,120,0.7); transform: translateY(-2px); }
.btn-list {
  background: rgba(0,240,255,0.08);
  color: var(--cyan);
  border: 1px solid var(--cyan-dim);
}
.btn-list:hover { background: rgba(0,240,255,0.16); box-shadow: 0 0 16px rgba(0,240,255,0.2); }

@keyframes pulse-glow-anim {
  0%, 100% { box-shadow: 0 0 24px rgba(255,45,120,0.4); }
  50%       { box-shadow: 0 0 50px rgba(255,45,120,0.8), 0 0 80px rgba(255,45,120,0.3); }
}
.pulse-glow { animation: pulse-glow-anim 2.5s ease-in-out infinite; }

.hero-bottom-fade {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 120px;
  background: linear-gradient(to top, var(--bg) 0%, transparent 100%);
  z-index: 3;
}

/* Skeleton */
.skeleton { background: linear-gradient(90deg, #1a2240 25%, #222d4d 50%, #1a2240 75%); background-size: 200%; animation: shimmer 1.6s infinite; border-radius: 6px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.sk-badge { width: 120px; height: 24px; margin-bottom: 1.2rem; }
.sk-title { width: 70%; height: 80px; margin-bottom: 0.6rem; }
.sk-sub   { width: 40%; height: 20px; margin-bottom: 1rem; }
.sk-synopsis { width: 90%; height: 60px; }

@media (max-width: 768px) {
  .hero-content { padding: 0 1.5rem 5rem; }
  .jp-watermark { display: none; }
}
</style>
