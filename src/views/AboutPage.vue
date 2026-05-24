<script setup>
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Our Story</span>
        <h1 class="title">About <span class="accent">Salidumay</span></h1>
        <p class="sub">A song of hope for every anime fan.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="section">
        <h2 class="section-title">What is Salidumay?</h2>
        <p class="body-text">Salidumay is an anime and film discovery platform built for fans who are tired of hunting across a dozen sites. We bring together trending anime, seasonal picks, top rankings, community reviews, and film discovery — all in one place, with a clean experience that gets out of your way.</p>
        <p class="body-text">The name comes from a traditional Filipino folk song — a hopeful melody passed down through generations. For us, it represents the universal language of storytelling that anime and film speak across every culture.</p>
      </div>

      <div class="cards">
        <div class="card">
          <div class="card-icon">🎌</div>
          <h3>Built for Fans</h3>
          <p>Every feature is designed around how anime fans actually watch — tracking episodes, exploring genres, finding hidden gems.</p>
        </div>
        <div class="card">
          <div class="card-icon">🎬</div>
          <h3>Anime & Film</h3>
          <p>We cover both anime and mainstream cinema. Whether it's the latest seasonal or a classic Hollywood blockbuster, you'll find it here.</p>
        </div>
        <div class="card">
          <div class="card-icon">🌏</div>
          <h3>Community First</h3>
          <p>Reviews, watch lists, and recommendations from real fans — not algorithms trying to sell you something.</p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Our Mission</h2>
        <p class="body-text">We believe great storytelling deserves a great home. Our mission is to make anime and film discovery effortless — helping you spend less time searching and more time watching.</p>
      </div>

      <div class="section">
        <h2 class="section-title">Built With</h2>
        <div class="tech-row">
          <span class="tech-badge">Vue 3</span>
          <span class="tech-badge">Laravel</span>
          <span class="tech-badge">TMDB</span>
          <span class="tech-badge">Consumet</span>
          <span class="tech-badge">HLS.js</span>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.hero {
  position: relative; height: 34vh; min-height: 220px;
  display: flex; align-items: center; justify-content: center;
}
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 40% 60%, rgba(0,212,255,0.1) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 30%, rgba(124,58,237,0.08) 0%, transparent 55%), var(--bg);
}
.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #00d4ff; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,7vw,4.5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #00d4ff; }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 900px; margin: 0 auto; padding: 3rem 2rem 5rem; }

.section { margin-bottom: 3rem; }
.section-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: .08em; color: var(--text); margin-bottom: 1rem; }
.body-text { color: var(--text-muted); font-size: .95rem; line-height: 1.8; margin-bottom: 1rem; }

.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 3rem; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.75rem 1.5rem; transition: border-color .2s; }
.card:hover { border-color: rgba(0,212,255,.3); }
.card-icon { font-size: 2rem; margin-bottom: .75rem; }
.card h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
.card p { font-size: .85rem; color: var(--text-muted); line-height: 1.6; }

.tech-row { display: flex; flex-wrap: wrap; gap: .6rem; }
.tech-badge { padding: .35rem .9rem; background: rgba(0,212,255,.08); border: 1px solid rgba(0,212,255,.2); border-radius: 999px; font-size: .8rem; font-weight: 700; color: #00d4ff; }
</style>
