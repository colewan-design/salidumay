<script setup>
defineProps({ threads: { type: Array, default: () => [] }, loading: Boolean })

const tagColors = { Discussion: 'cyan', Analysis: 'pink', Rankings: 'gold' }
</script>

<template>
  <section id="community" class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <span class="section-tag cyan">Fans</span>
        <h2 class="section-title">Community <span class="accent">Buzz</span></h2>
      </div>
      <a href="#" class="see-all">Browse Forum →</a>
    </div>

    <div class="threads" v-if="!loading">
      <article v-for="thread in threads" :key="thread.id" class="thread">
        <img class="avatar" :src="thread.user.avatar" :alt="thread.user.name" loading="lazy" />

        <div class="thread-body">
          <div class="thread-top">
            <span class="thread-user">{{ thread.user.name }}</span>
            <span class="thread-tag" :class="`tag-${tagColors[thread.tag] || 'cyan'}`">{{ thread.tag }}</span>
            <span class="thread-time">{{ thread.time }}</span>
          </div>
          <h3 class="thread-title">{{ thread.title }}</h3>
          <p class="thread-preview">{{ thread.preview }}</p>
          <div class="thread-footer">
            <span class="thread-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ thread.replies }}
            </span>
            <span class="thread-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {{ thread.likes.toLocaleString() }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <div class="threads" v-else>
      <div v-for="n in 3" :key="n" class="thread">
        <div class="skeleton" style="width:48px;height:48px;border-radius:50%;flex-shrink:0"></div>
        <div style="flex:1">
          <div class="skeleton" style="width:40%;height:14px;margin-bottom:.5rem"></div>
          <div class="skeleton" style="width:80%;height:18px;margin-bottom:.4rem"></div>
          <div class="skeleton" style="width:95%;height:12px"></div>
        </div>
      </div>
    </div>

    <div class="community-cta">
      <p>Join <strong>140,000+</strong> anime fans discussing the latest episodes, theories, and more.</p>
      <a href="#" class="cta-btn">Join the Community</a>
    </div>
  </section>
</template>

<style scoped>
.threads { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.thread {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.25s;
  cursor: pointer;
}
.thread:hover {
  border-color: var(--cyan-dim);
  box-shadow: 0 0 24px rgba(0,240,255,0.08);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.thread:hover .avatar { border-color: var(--cyan-dim); }

.thread-body { flex: 1; min-width: 0; }
.thread-top { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.thread-user { font-weight: 700; font-size: 0.875rem; color: var(--text); }
.thread-tag {
  padding: 0.1rem 0.5rem;
  border-radius: 100px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tag-cyan  { background: rgba(0,240,255,0.1);  color: var(--cyan);  border: 1px solid var(--cyan-dim); }
.tag-pink  { background: rgba(255,45,120,0.1); color: var(--pink);  border: 1px solid rgba(255,45,120,0.3); }
.tag-gold  { background: rgba(255,215,0,0.1);  color: #ffd700;       border: 1px solid rgba(255,215,0,0.3); }

.thread-time { font-size: 0.75rem; color: var(--text-muted); margin-left: auto; }
.thread-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.35rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.thread-preview {
  font-size: 0.83rem;
  color: var(--text-muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.75rem;
}
.thread-footer { display: flex; gap: 1.25rem; }
.thread-stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.thread-stat svg { width: 14px; height: 14px; }

.community-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(0,240,255,0.05), rgba(255,45,120,0.05));
  border: 1px solid var(--border);
  border-radius: 12px;
  flex-wrap: wrap;
}
.community-cta p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
.community-cta strong { color: var(--cyan); }
.cta-btn {
  padding: 0.65rem 1.5rem;
  background: linear-gradient(135deg, var(--pink), #a50042);
  color: #fff;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 0 20px rgba(255,45,120,0.3);
  transition: all 0.2s;
}
.cta-btn:hover { box-shadow: 0 0 35px rgba(255,45,120,0.6); transform: translateY(-1px); }

.skeleton { background:linear-gradient(90deg,#1a2240 25%,#222d4d 50%,#1a2240 75%); background-size:200%; animation:shimmer 1.6s infinite; border-radius:4px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
</style>
