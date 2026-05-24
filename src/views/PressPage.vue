<script setup>
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Media</span>
        <h1 class="title">Press <span class="accent">Kit</span></h1>
        <p class="sub">Resources for journalists, bloggers, and content creators.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="section">
        <h2 class="section-title">About Salidumay</h2>
        <p class="body-text">Salidumay is a free anime and film discovery platform serving fans worldwide. We provide a unified browsing experience for trending anime, seasonal charts, top rankings, and mainstream cinema — all backed by community-driven content.</p>
        <p class="body-text">The platform is built with Vue 3 and Laravel, powered by data from TMDB and anime databases, and designed to be fast, clean, and accessible on any device.</p>
      </div>

      <div class="stats-row">
        <div class="stat">
          <span class="stat-num">13,000+</span>
          <span class="stat-label">Films in Library</span>
        </div>
        <div class="stat">
          <span class="stat-num">Free</span>
          <span class="stat-label">Always</span>
        </div>
        <div class="stat">
          <span class="stat-num">2025</span>
          <span class="stat-label">Founded</span>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Brand Assets</h2>
        <p class="body-text">Use these assets when writing about or featuring Salidumay. Please do not modify the logo or use it in a misleading context.</p>
        <div class="assets-grid">
          <div class="asset-card">
            <div class="asset-preview logo-preview">
              <span class="logo-kanji">サ</span>
              <span class="logo-name">Salidumay</span>
            </div>
            <div class="asset-meta">
              <span class="asset-name">Primary Logo</span>
              <span class="asset-format">SVG / PNG</span>
            </div>
          </div>
          <div class="asset-card">
            <div class="asset-preview icon-preview">
              <span class="logo-kanji">サ</span>
            </div>
            <div class="asset-meta">
              <span class="asset-name">Icon Mark</span>
              <span class="asset-format">SVG / PNG</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Press Contact</h2>
        <p class="body-text">For press inquiries, interview requests, or partnership opportunities:</p>
        <a href="/contact" class="contact-link">press@salidumay.com →</a>
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
  background: radial-gradient(ellipse at 50% 60%, rgba(0,212,255,0.09) 0%, transparent 60%), var(--bg);
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

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
.stat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; text-align: center; }
.stat-num { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: #00d4ff; letter-spacing: .05em; }
.stat-label { display: block; font-size: .78rem; color: var(--text-muted); margin-top: .25rem; }

.assets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
.asset-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.asset-preview { height: 140px; display: flex; align-items: center; justify-content: center; gap: .75rem; background: #060e14; }
.logo-preview { flex-direction: row; }
.logo-kanji { font-size: 2.5rem; color: #00d4ff; filter: drop-shadow(0 0 12px rgba(0,212,255,.7)); }
.logo-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; color: #fff; letter-spacing: .1em; }
.icon-preview .logo-kanji { font-size: 3.5rem; }
.asset-meta { padding: .75rem 1rem; display: flex; justify-content: space-between; align-items: center; }
.asset-name { font-size: .85rem; font-weight: 700; color: var(--text); }
.asset-format { font-size: .72rem; color: var(--text-muted); }

.contact-link { color: #00d4ff; font-size: .95rem; font-weight: 700; text-decoration: none; }
.contact-link:hover { text-decoration: underline; }
</style>
