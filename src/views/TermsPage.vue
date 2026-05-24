<script setup>
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Legal</span>
        <h1 class="title">Terms of <span class="accent">Service</span></h1>
        <p class="sub">Last updated: May 2025</p>
      </div>
    </section>

    <main class="wrap">
      <div class="doc">
        <section class="doc-section">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Salidumay, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>

        <section class="doc-section">
          <h2>2. Use of the Platform</h2>
          <p>Salidumay is provided for personal, non-commercial use. You agree not to:</p>
          <ul>
            <li>Attempt to bypass or circumvent any security measures</li>
            <li>Scrape, crawl, or harvest data from the platform without permission</li>
            <li>Use the platform to distribute malware or harmful content</li>
            <li>Impersonate other users or create fraudulent accounts</li>
          </ul>
        </section>

        <section class="doc-section">
          <h2>3. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account and for all activities that occur under it. Notify us immediately at <a href="mailto:hello@salidumay.com">hello@salidumay.com</a> if you suspect unauthorized access.</p>
        </section>

        <section class="doc-section">
          <h2>4. Third-Party Content</h2>
          <p>Salidumay aggregates publicly available stream embeds and metadata from third-party sources (TMDB, embed players). We are not responsible for the content, availability, or legality of third-party streams. We do not host any video content ourselves.</p>
        </section>

        <section class="doc-section">
          <h2>5. Intellectual Property</h2>
          <p>All original content, design, and code on Salidumay is owned by Salidumay. Anime titles, film titles, and associated artwork belong to their respective rights holders. Metadata is provided by TMDB under their terms.</p>
        </section>

        <section class="doc-section">
          <h2>6. Disclaimers</h2>
          <p>The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or that all streams will be available at all times.</p>
        </section>

        <section class="doc-section">
          <h2>7. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>

        <section class="doc-section">
          <h2>8. Contact</h2>
          <p>For questions about these terms, <a href="/contact">contact us</a>.</p>
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
.doc-section ul { padding-left: 1.25rem; display: flex; flex-direction: column; gap: .4rem; }
.doc-section li { font-size: .9rem; color: var(--text-muted); line-height: 1.6; }
.doc-section a { color: #00d4ff; text-decoration: none; }
.doc-section a:hover { text-decoration: underline; }
</style>
