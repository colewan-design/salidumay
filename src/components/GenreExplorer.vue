<script setup>
import { ref } from 'vue'
defineProps({ genres: { type: Array, default: () => [] }, loading: Boolean })
const active = ref(null)
</script>

<template>
  <section id="genres" class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <span class="section-tag cyan">Discover</span>
        <h2 class="section-title">Genre <span class="accent">Explorer</span></h2>
      </div>
    </div>

    <div class="genre-grid" v-if="!loading">
      <button
        v-for="g in genres"
        :key="g.name"
        class="genre-pill"
        :class="{ active: active === g.name }"
        @click="active = active === g.name ? null : g.name"
      >
        <span class="genre-icon">{{ g.icon }}</span>
        <span class="genre-name">{{ g.name }}</span>
        <span class="genre-count">{{ g.count }}</span>
      </button>
    </div>

    <div class="genre-grid" v-else>
      <div v-for="n in 12" :key="n" class="skeleton" style="height:52px;border-radius:100px"></div>
    </div>
  </section>
</template>

<style scoped>
.genre-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.genre-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.22s;
  position: relative;
  overflow: hidden;
}
.genre-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,240,255,0.08), rgba(255,45,120,0.06));
  opacity: 0;
  transition: opacity 0.22s;
}
.genre-pill:hover, .genre-pill.active {
  border-color: var(--cyan-dim);
  color: var(--cyan);
  box-shadow: 0 0 20px rgba(0,240,255,0.15), inset 0 0 20px rgba(0,240,255,0.05);
}
.genre-pill:hover::before, .genre-pill.active::before { opacity: 1; }
.genre-pill.active { border-color: var(--cyan); background: rgba(0,240,255,0.08); }

.genre-icon { font-size: 1rem; }
.genre-name { font-weight: 700; }
.genre-count {
  font-size: 0.7rem;
  color: var(--text-muted);
  background: rgba(255,255,255,0.06);
  padding: 0.1rem 0.4rem;
  border-radius: 100px;
  margin-left: 0.25rem;
}
.genre-pill.active .genre-count { color: var(--cyan); }

.skeleton { background:linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size:200%; animation:shimmer 1.6s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
</style>
