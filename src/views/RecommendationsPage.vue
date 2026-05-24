<script setup>
import AppFooter from '../components/AppFooter.vue'

const picks = [
  { title: 'Vinland Saga', reason: 'If you loved Attack on Titan', rating: 9.0, genre: 'Historical' },
  { title: 'Mushishi', reason: 'If you want something calm and beautiful', rating: 8.7, genre: 'Slice of Life' },
  { title: 'Hunter x Hunter', reason: 'If you like Naruto but want better writing', rating: 9.1, genre: 'Adventure' },
  { title: 'Mob Psycho 100', reason: 'If you enjoyed One Punch Man', rating: 8.9, genre: 'Action' },
  { title: 'Steins;Gate', reason: 'If you love sci-fi and time travel', rating: 9.2, genre: 'Sci-Fi' },
  { title: 'Made in Abyss', reason: 'If you want adventure with real stakes', rating: 8.8, genre: 'Adventure' },
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Community</span>
        <h1 class="title">Anime <span class="accent">Recommendations</span></h1>
        <p class="sub">Find your next obsession, curated by fans.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="coming-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div>
          <strong>Personalized recommendations coming soon</strong>
          <p>AI-powered and community-driven picks based on your watch history. For now, enjoy these fan-curated suggestions.</p>
        </div>
      </div>

      <h2 class="section-title">"If you liked ___, watch ___"</h2>
      <div class="picks-grid">
        <div v-for="pick in picks" :key="pick.title" class="pick-card">
          <div class="pick-reason">{{ pick.reason }}</div>
          <h3 class="pick-title">{{ pick.title }}</h3>
          <div class="pick-meta">
            <span class="pick-genre">{{ pick.genre }}</span>
            <span class="pick-rating">★ {{ pick.rating }}</span>
          </div>
        </div>
      </div>

      <div class="cta">
        <p>Have a great recommendation to share?</p>
        <a href="/contact" class="cta-btn">Submit a Pick →</a>
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
  background: radial-gradient(ellipse at 60% 45%, rgba(124,58,237,0.1) 0%, transparent 55%),
              radial-gradient(ellipse at 30% 60%, rgba(0,212,255,0.07) 0%, transparent 55%), var(--bg);
}
.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #00d4ff; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2rem,6vw,4rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #00d4ff; }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 1000px; margin: 0 auto; padding: 2rem 2rem 5rem; }

.coming-banner {
  display: flex; align-items: flex-start; gap: 1rem;
  background: rgba(0,212,255,.07); border: 1px solid rgba(0,212,255,.2);
  border-radius: 10px; padding: 1.1rem 1.25rem; margin-bottom: 2.5rem; font-size: .88rem;
}
.coming-banner svg { width: 1.2rem; height: 1.2rem; color: #00d4ff; flex-shrink: 0; margin-top: .1rem; }
.coming-banner strong { display: block; color: var(--text); margin-bottom: .2rem; }
.coming-banner p { color: var(--text-muted); margin: 0; font-size: .83rem; }

.section-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: .08em; color: var(--text); margin-bottom: 1.25rem; }

.picks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 3rem; }
.pick-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 1.25rem; transition: border-color .2s;
}
.pick-card:hover { border-color: rgba(0,212,255,.3); }
.pick-reason { font-size: .72rem; color: #00d4ff; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: .5rem; }
.pick-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: .6rem; }
.pick-meta { display: flex; justify-content: space-between; font-size: .78rem; }
.pick-genre { color: var(--text-muted); }
.pick-rating { color: #ffd700; font-weight: 700; }

.cta { text-align: center; padding: 2rem; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.cta p { color: var(--text-muted); font-size: .9rem; margin-bottom: 1rem; }
.cta-btn { display: inline-block; padding: .6rem 1.5rem; background: #00d4ff; border-radius: 8px; color: #060e14; font-size: .88rem; font-weight: 800; text-decoration: none; }
.cta-btn:hover { background: #00b8dc; }
</style>
