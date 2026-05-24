<script setup>
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Join the Team</span>
        <h1 class="title">Careers at <span class="accent">Salidumay</span></h1>
        <p class="sub">Help us build the best anime and film platform on the web.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="values-grid">
        <div class="value">
          <span class="value-icon">🎌</span>
          <h3>Passion-driven</h3>
          <p>We're fans first. Everyone here watches anime and cares deeply about the product.</p>
        </div>
        <div class="value">
          <span class="value-icon">🌐</span>
          <h3>Remote-first</h3>
          <p>Work from anywhere. We believe great work happens wherever you're most comfortable.</p>
        </div>
        <div class="value">
          <span class="value-icon">🚀</span>
          <h3>Ship fast</h3>
          <p>Small team, big impact. No endless meetings — just building things people love.</p>
        </div>
      </div>

      <div class="no-openings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
        <h2>No open positions right now</h2>
        <p>We're a small team and hire rarely — but when we do, we look for people who are genuinely obsessed with anime and building great software.</p>
        <p>Drop us your details and we'll reach out if something comes up.</p>
        <a href="/contact" class="notify-btn">Get Notified →</a>
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
  background: radial-gradient(ellipse at 40% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), var(--bg);
}
.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #00d4ff; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,7vw,4.5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #00d4ff; }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 900px; margin: 0 auto; padding: 3rem 2rem 5rem; }

.values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 3.5rem; }
.value { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.75rem 1.5rem; }
.value-icon { font-size: 2rem; display: block; margin-bottom: .75rem; }
.value h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
.value p { font-size: .85rem; color: var(--text-muted); line-height: 1.6; }

.no-openings {
  text-align: center; padding: 3.5rem 2rem;
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
}
.no-openings svg { width: 3rem; height: 3rem; color: rgba(0,212,255,.4); margin-bottom: 1.25rem; }
.no-openings h2 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: .75rem; }
.no-openings p { font-size: .9rem; color: var(--text-muted); line-height: 1.7; max-width: 480px; margin: 0 auto .5rem; }
.notify-btn {
  display: inline-block; margin-top: 1.5rem;
  padding: .65rem 1.75rem; background: #00d4ff; border-radius: 8px;
  color: #060e14; font-size: .88rem; font-weight: 800; text-decoration: none;
  transition: background .2s;
}
.notify-btn:hover { background: #00b8dc; }
</style>
