<script setup>
defineProps({ items: { type: Array, default: () => [] }, loading: Boolean })
</script>

<template>
  <section id="top" class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <span class="section-tag pink">Hall of Fame</span>
        <h2 class="section-title">Top Anime <span class="accent">All Time</span></h2>
      </div>
      <a href="#" class="see-all">Full Rankings →</a>
    </div>

    <div class="top-list" v-if="!loading">
      <article
        v-for="anime in items"
        :key="anime.rank"
        class="top-item"
      >
        <span class="rank" :class="{ gold: anime.rank === 1, silver: anime.rank === 2, bronze: anime.rank === 3 }">
          {{ anime.rank <= 3 ? ['🥇','🥈','🥉'][anime.rank - 1] : `#${anime.rank}` }}
        </span>
        <img class="top-thumb" :src="anime.image" :alt="anime.title" loading="lazy" />
        <div class="top-info">
          <h3 class="top-title">{{ anime.title }}</h3>
          <span class="top-studio">{{ anime.studio }} · {{ anime.year }}</span>
        </div>
        <div class="top-score">
          <span class="score-value">{{ anime.score.toFixed(2) }}</span>
          <span class="score-label">Score</span>
        </div>
      </article>
    </div>

    <div class="top-list" v-else>
      <div v-for="n in 6" :key="n" class="top-item">
        <div class="skeleton" style="width:32px;height:32px;border-radius:4px"></div>
        <div class="skeleton top-thumb"></div>
        <div style="flex:1">
          <div class="skeleton" style="width:70%;height:16px;margin-bottom:.4rem"></div>
          <div class="skeleton" style="width:40%;height:12px"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.top-list { display: flex; flex-direction: column; gap: 0.75rem; }
.top-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.25s;
  cursor: pointer;
}
.top-item:hover {
  border-color: var(--cyan-dim);
  box-shadow: 0 0 24px rgba(0,240,255,0.1);
  transform: translateX(4px);
}

.rank {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  min-width: 2.5rem;
  text-align: center;
  color: var(--text-muted);
}
.rank.gold   { color: #ffd700; filter: drop-shadow(0 0 6px #ffd700); }
.rank.silver { color: #c0c0c0; }
.rank.bronze { color: #cd7f32; }

.top-thumb {
  width: 48px;
  height: 68px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.top-info { flex: 1; min-width: 0; }
.top-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 0.25rem;
}
.top-studio { font-size: 0.78rem; color: var(--text-muted); }

.top-score { text-align: right; }
.score-value {
  display: block;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  color: var(--cyan);
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(0,240,255,0.5));
}
.score-label { font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }

.skeleton { background:linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size:200%; animation:shimmer 1.6s infinite; border-radius:4px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
</style>
