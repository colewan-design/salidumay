<script setup>
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Legal</span>
        <h1 class="title">Privacy <span class="accent">Policy</span></h1>
        <p class="sub">Last updated: May 2025</p>
      </div>
    </section>

    <main class="wrap">
      <div class="doc">
        <section class="doc-section">
          <h2>1. Information We Collect</h2>
          <p>When you create an account, we collect your name and email address. If you sign in with a third-party provider (e.g. Google), we receive only the profile information that provider shares with us.</p>
          <p>We also collect usage data such as watch history and library saves — solely to provide the features you use.</p>
        </section>

        <section class="doc-section">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide and improve the platform</li>
            <li>To personalize your experience (watch history, library)</li>
            <li>To communicate service updates or respond to your inquiries</li>
            <li>We do <strong>not</strong> sell your data to third parties</li>
          </ul>
        </section>

        <section class="doc-section">
          <h2>3. Cookies</h2>
          <p>We use essential cookies to keep you logged in and remember your preferences. We do not use advertising cookies or third-party tracking cookies.</p>
        </section>

        <section class="doc-section">
          <h2>4. Third-Party Services</h2>
          <p>Salidumay uses TMDB for film metadata and third-party embed players for streaming. These services have their own privacy policies — we encourage you to review them. We do not control what data those embed providers collect.</p>
        </section>

        <section class="doc-section">
          <h2>5. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting us.</p>
        </section>

        <section class="doc-section">
          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:hello@salidumay.com">hello@salidumay.com</a>.</p>
        </section>

        <section class="doc-section">
          <h2>7. Contact</h2>
          <p>Questions about this policy? <a href="/contact">Reach out to us</a>.</p>
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
.doc-section strong { color: var(--text); }
</style>
