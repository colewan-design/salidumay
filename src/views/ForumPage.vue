<script setup>
import AppFooter from '../components/AppFooter.vue'

const threads = [
  { title: 'What anime are you watching this season?', replies: 142, views: '3.2k', tag: 'Discussion', hot: true },
  { title: 'Best anime openings of all time — rank them', replies: 87, views: '1.8k', tag: 'Top Lists', hot: true },
  { title: 'Hidden gems you\'d recommend to anyone', replies: 64, views: '940', tag: 'Recommendations' },
  { title: 'Attack on Titan finale — your thoughts', replies: 211, views: '5.1k', tag: 'Spoilers' },
  { title: 'Underrated isekai that deserve more attention', replies: 39, views: '620', tag: 'Isekai' },
  { title: 'Which streaming service has the best anime library?', replies: 55, views: '1.1k', tag: 'Discussion' },
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Community</span>
        <h1 class="title">Anime <span class="accent">Forum</span></h1>
        <p class="sub">Discuss, debate, and discover with fellow fans.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="coming-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <div>
          <strong>Forum coming soon</strong>
          <p>Full forum functionality is in development. Here's a preview of what's coming.</p>
        </div>
      </div>

      <div class="threads">
        <div v-for="thread in threads" :key="thread.title" class="thread">
          <div class="thread-main">
            <span :class="['thread-tag', thread.tag === 'Spoilers' ? 'red' : thread.tag === 'Top Lists' ? 'purple' : '']">{{ thread.tag }}</span>
            <h3 class="thread-title">{{ thread.title }}</h3>
          </div>
          <div class="thread-meta">
            <span v-if="thread.hot" class="hot-badge">🔥 Hot</span>
            <span>{{ thread.replies }} replies</span>
            <span>{{ thread.views }} views</span>
          </div>
        </div>
      </div>

      <div class="cta">
        <p>Want to be notified when the forum launches?</p>
        <a href="/contact" class="cta-btn">Notify Me →</a>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.hero {
  position: relative; height: 32vh; min-height: 200px;
  display: flex; align-items: center; justify-content: center;
}
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 35% 55%, rgba(124,58,237,0.1) 0%, transparent 55%),
              radial-gradient(ellipse at 70% 35%, rgba(0,212,255,0.07) 0%, transparent 55%), var(--bg);
}
.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #00d4ff; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,7vw,4.5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #00d4ff; }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 860px; margin: 0 auto; padding: 2rem 2rem 5rem; }

.coming-banner {
  display: flex; align-items: flex-start; gap: 1rem;
  background: rgba(0,212,255,.07); border: 1px solid rgba(0,212,255,.2);
  border-radius: 10px; padding: 1.1rem 1.25rem; margin-bottom: 2rem;
  font-size: .88rem;
}
.coming-banner svg { width: 1.2rem; height: 1.2rem; color: #00d4ff; flex-shrink: 0; margin-top: .1rem; }
.coming-banner strong { display: block; color: var(--text); margin-bottom: .2rem; }
.coming-banner p { color: var(--text-muted); margin: 0; font-size: .83rem; }

.threads { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 3rem; }
.thread {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 1rem 1.25rem; transition: border-color .2s; opacity: .7; cursor: not-allowed;
}
.thread-main { flex: 1; min-width: 0; }
.thread-tag {
  display: inline-block; font-size: .62rem; font-weight: 800; letter-spacing: .08em;
  text-transform: uppercase; padding: .15rem .45rem; border-radius: 4px; margin-bottom: .4rem;
  background: rgba(0,212,255,.12); color: #00d4ff;
}
.thread-tag.red { background: rgba(255,45,120,.12); color: var(--pink); }
.thread-tag.purple { background: rgba(124,58,237,.15); color: #a78bfa; }
.thread-title { font-size: .9rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.thread-meta { display: flex; align-items: center; gap: .85rem; font-size: .75rem; color: var(--text-muted); flex-shrink: 0; }
.hot-badge { color: #f97316; font-size: .72rem; font-weight: 700; }

.cta { text-align: center; padding: 2rem; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.cta p { color: var(--text-muted); font-size: .9rem; margin-bottom: 1rem; }
.cta-btn { display: inline-block; padding: .6rem 1.5rem; background: #00d4ff; border-radius: 8px; color: #060e14; font-size: .88rem; font-weight: 800; text-decoration: none; }
.cta-btn:hover { background: #00b8dc; }
</style>
