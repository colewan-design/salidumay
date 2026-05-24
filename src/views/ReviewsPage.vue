<script setup>
import AppFooter from '../components/AppFooter.vue'

const reviews = [
  { title: 'Frieren: Beyond Journey\'s End', score: 9.8, author: 'animefan_ph', excerpt: 'A masterclass in slow, meaningful storytelling. Frieren redefines what a fantasy adventure can be.', genre: 'Fantasy', type: 'anime' },
  { title: 'Demon Slayer: Infinity Castle Arc', score: 9.5, author: 'otaku_reviews', excerpt: 'The animation quality alone makes this a landmark moment in anime history.', genre: 'Action', type: 'anime' },
  { title: 'Dune: Part Two', score: 9.1, author: 'filmcritic22', excerpt: 'Villeneuve delivers an epic that feels both intimate and universe-spanning.', genre: 'Sci-Fi', type: 'film' },
  { title: 'Solo Leveling', score: 8.7, author: 'levelup_reviews', excerpt: 'The power fantasy done right. Visually stunning from start to finish.', genre: 'Action', type: 'anime' },
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Community</span>
        <h1 class="title">Anime & Film <span class="accent">Reviews</span></h1>
        <p class="sub">Honest reviews from real fans.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="coming-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <div>
          <strong>Reviews coming soon</strong>
          <p>User-submitted reviews are on the way. Here's a preview of the format.</p>
        </div>
      </div>

      <div class="review-list">
        <div v-for="r in reviews" :key="r.title" class="review-card">
          <div class="review-header">
            <div>
              <span :class="['type-badge', r.type]">{{ r.type === 'film' ? 'FILM' : 'ANIME' }}</span>
              <h3 class="review-title">{{ r.title }}</h3>
              <span class="review-genre">{{ r.genre }}</span>
            </div>
            <div class="score-ring">
              <span class="score-val">{{ r.score }}</span>
            </div>
          </div>
          <p class="review-excerpt">"{{ r.excerpt }}"</p>
          <span class="review-author">— {{ r.author }}</span>
        </div>
      </div>

      <div class="cta">
        <p>Want to write reviews when the feature launches?</p>
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
  background: radial-gradient(ellipse at 55% 50%, rgba(255,45,120,0.08) 0%, transparent 55%),
              radial-gradient(ellipse at 25% 40%, rgba(0,212,255,0.07) 0%, transparent 55%), var(--bg);
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
  border-radius: 10px; padding: 1.1rem 1.25rem; margin-bottom: 2rem; font-size: .88rem;
}
.coming-banner svg { width: 1.2rem; height: 1.2rem; color: #00d4ff; flex-shrink: 0; margin-top: .1rem; }
.coming-banner strong { display: block; color: var(--text); margin-bottom: .2rem; }
.coming-banner p { color: var(--text-muted); margin: 0; font-size: .83rem; }

.review-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem; }
.review-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 1.25rem 1.5rem; opacity: .75;
}
.review-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: .75rem; }
.type-badge { display: inline-block; font-size: .6rem; font-weight: 800; letter-spacing: .1em; padding: .15rem .45rem; border-radius: 4px; margin-bottom: .3rem; }
.type-badge.anime { background: rgba(0,212,255,.12); color: #00d4ff; }
.type-badge.film { background: rgba(255,45,120,.12); color: var(--pink); }
.review-title { font-size: .95rem; font-weight: 700; color: var(--text); display: block; }
.review-genre { font-size: .75rem; color: var(--text-muted); }
.score-ring {
  width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
  background: conic-gradient(#00d4ff calc(var(--p,98) * 1%), rgba(255,255,255,.06) 0);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 3px rgba(0,212,255,.15);
}
.score-val { font-size: .85rem; font-weight: 800; color: #00d4ff; }
.review-excerpt { font-size: .88rem; color: var(--text-muted); line-height: 1.6; font-style: italic; margin-bottom: .5rem; }
.review-author { font-size: .75rem; color: rgba(255,255,255,.35); }

.cta { text-align: center; padding: 2rem; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.cta p { color: var(--text-muted); font-size: .9rem; margin-bottom: 1rem; }
.cta-btn { display: inline-block; padding: .6rem 1.5rem; background: #00d4ff; border-radius: 8px; color: #060e14; font-size: .88rem; font-weight: 800; text-decoration: none; }
.cta-btn:hover { background: #00b8dc; }
</style>
