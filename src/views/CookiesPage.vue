<script setup>
import AppFooter from '../components/AppFooter.vue'

const cookies = [
  { name: 'session', purpose: 'Keeps you logged in across page loads', duration: 'Session', essential: true },
  { name: 'auth_token', purpose: 'Authenticates your requests to our API', duration: '7 days', essential: true },
  { name: 'theme_pref', purpose: 'Remembers your display preferences', duration: '1 year', essential: false },
]
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Legal</span>
        <h1 class="title">Cookie <span class="accent">Policy</span></h1>
        <p class="sub">Last updated: May 2025</p>
      </div>
    </section>

    <main class="wrap">
      <div class="doc">
        <section class="doc-section">
          <h2>What are cookies?</h2>
          <p>Cookies are small text files stored on your device by your browser. They allow websites to remember information about your visit, like whether you're logged in.</p>
        </section>

        <section class="doc-section">
          <h2>Cookies we use</h2>
          <p>We use only essential cookies required for the platform to function. We do <strong>not</strong> use advertising cookies, analytics tracking cookies, or any third-party marketing cookies.</p>

          <div class="cookie-table">
            <div class="table-head">
              <span>Cookie</span>
              <span>Purpose</span>
              <span>Duration</span>
              <span>Type</span>
            </div>
            <div v-for="c in cookies" :key="c.name" class="table-row">
              <span class="cookie-name">{{ c.name }}</span>
              <span>{{ c.purpose }}</span>
              <span>{{ c.duration }}</span>
              <span :class="['cookie-type', c.essential ? 'essential' : 'optional']">
                {{ c.essential ? 'Essential' : 'Optional' }}
              </span>
            </div>
          </div>
        </section>

        <section class="doc-section">
          <h2>Third-party cookies</h2>
          <p>Embedded video players from third-party providers (VidSrc, 2Embed, etc.) may set their own cookies when you play a video. These are outside our control — refer to each provider's cookie policy for details.</p>
        </section>

        <section class="doc-section">
          <h2>Managing cookies</h2>
          <p>You can control or delete cookies through your browser settings. Disabling essential cookies will prevent you from staying logged in. No other functionality will be affected.</p>
        </section>

        <section class="doc-section">
          <h2>Contact</h2>
          <p>Questions? <a href="/contact">Contact us</a>.</p>
        </section>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.hero {
  position: relative; height: 28vh; min-height: 180px;
  display: flex; align-items: center; justify-content: center;
}
.hero-bg { position: absolute; inset: 0; background: var(--bg); }
.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #00d4ff; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,7vw,4rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #00d4ff; }
.sub { font-size: .85rem; color: var(--text-muted); }

.wrap { max-width: 760px; margin: 0 auto; padding: 3rem 2rem 5rem; }
.doc { display: flex; flex-direction: column; gap: 2rem; }
.doc-section h2 { font-size: 1.05rem; font-weight: 700; color: var(--text); margin-bottom: .75rem; padding-bottom: .5rem; border-bottom: 1px solid var(--border); }
.doc-section p { font-size: .9rem; color: var(--text-muted); line-height: 1.75; margin-bottom: .65rem; }
.doc-section a { color: #00d4ff; text-decoration: none; }
.doc-section a:hover { text-decoration: underline; }
.doc-section strong { color: var(--text); }

.cookie-table { margin-top: 1rem; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.table-head { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr; padding: .65rem 1rem; background: rgba(255,255,255,.03); border-bottom: 1px solid var(--border); font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); }
.table-row { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr; padding: .75rem 1rem; border-bottom: 1px solid var(--border); font-size: .85rem; color: var(--text-muted); align-items: center; }
.table-row:last-child { border-bottom: none; }
.cookie-name { font-family: monospace; color: var(--text); font-size: .82rem; }
.cookie-type { font-size: .68rem; font-weight: 800; letter-spacing: .06em; padding: .2rem .5rem; border-radius: 4px; text-align: center; }
.cookie-type.essential { background: rgba(0,212,255,.12); color: #00d4ff; }
.cookie-type.optional { background: rgba(255,255,255,.06); color: var(--text-muted); }

@media (max-width: 560px) {
  .table-head, .table-row { grid-template-columns: 1fr 1fr; }
  .table-head span:nth-child(2), .table-row span:nth-child(2) { display: none; }
}
</style>
