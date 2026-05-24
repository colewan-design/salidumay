<script setup>
import AppFooter from '../components/AppFooter.vue'
import { useAuth } from '../store/auth.js'
import { RouterLink } from 'vue-router'

const { isLoggedIn } = useAuth()
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Community</span>
        <h1 class="title">Watch <span class="accent">Lists</span></h1>
        <p class="sub">Curated anime & film lists from the community.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="coming-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        <div>
          <strong>Public watch lists coming soon</strong>
          <p>Share your anime and film lists with the community. In the meantime, use your personal Library to save titles.</p>
        </div>
      </div>

      <div class="preview-lists">
        <div class="list-card">
          <div class="list-header">
            <div class="list-avatar">M</div>
            <div>
              <span class="list-name">Must-watch before you die</span>
              <span class="list-author">by mikasa_fan</span>
            </div>
            <span class="list-count">24 titles</span>
          </div>
          <div class="list-tags"><span>Action</span><span>Drama</span><span>Classic</span></div>
        </div>
        <div class="list-card">
          <div class="list-header">
            <div class="list-avatar">S</div>
            <div>
              <span class="list-name">Best anime for newcomers</span>
              <span class="list-author">by senpai_guide</span>
            </div>
            <span class="list-count">12 titles</span>
          </div>
          <div class="list-tags"><span>Beginner</span><span>Popular</span></div>
        </div>
        <div class="list-card">
          <div class="list-header">
            <div class="list-avatar">R</div>
            <div>
              <span class="list-name">Cry your eyes out — sad anime</span>
              <span class="list-author">by realhuman_tears</span>
            </div>
            <span class="list-count">18 titles</span>
          </div>
          <div class="list-tags"><span>Drama</span><span>Romance</span></div>
        </div>
      </div>

      <div class="cta-split">
        <RouterLink v-if="isLoggedIn" to="/library" class="cta-btn primary">
          Go to My Library →
        </RouterLink>
        <template v-else>
          <RouterLink to="/register" class="cta-btn primary">Create Account</RouterLink>
          <RouterLink to="/login" class="cta-btn">Sign In</RouterLink>
        </template>
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
  background: radial-gradient(ellipse at 45% 55%, rgba(0,212,255,0.09) 0%, transparent 60%), var(--bg);
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

.preview-lists { display: flex; flex-direction: column; gap: .85rem; margin-bottom: 2.5rem; }
.list-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 1rem 1.25rem; opacity: .75;
}
.list-header { display: flex; align-items: center; gap: .85rem; margin-bottom: .6rem; }
.list-avatar { width: 34px; height: 34px; border-radius: 50%; background: rgba(0,212,255,.15); border: 1px solid rgba(0,212,255,.3); display: flex; align-items: center; justify-content: center; font-size: .85rem; font-weight: 700; color: #00d4ff; flex-shrink: 0; }
.list-name { display: block; font-size: .9rem; font-weight: 700; color: var(--text); }
.list-author { display: block; font-size: .72rem; color: var(--text-muted); }
.list-count { margin-left: auto; font-size: .75rem; color: var(--text-muted); flex-shrink: 0; }
.list-tags { display: flex; gap: .4rem; flex-wrap: wrap; }
.list-tags span { font-size: .68rem; padding: .15rem .5rem; background: rgba(255,255,255,.05); border: 1px solid var(--border); border-radius: 999px; color: var(--text-muted); }

.cta-split { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
.cta-btn { display: inline-block; padding: .65rem 1.75rem; border-radius: 8px; font-size: .88rem; font-weight: 800; text-decoration: none; transition: background .2s; border: 1px solid rgba(255,255,255,.1); color: var(--text-muted); }
.cta-btn.primary { background: #00d4ff; border-color: #00d4ff; color: #060e14; }
.cta-btn.primary:hover { background: #00b8dc; }
.cta-btn:not(.primary):hover { border-color: rgba(0,212,255,.4); color: var(--text); }
</style>
