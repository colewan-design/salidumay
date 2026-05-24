<script setup>
import { ref } from 'vue'
import AppFooter from '../components/AppFooter.vue'

const form = ref({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)
const sending = ref(false)

async function submit() {
  if (!form.value.name || !form.value.email || !form.value.message) return
  sending.value = true
  await new Promise(r => setTimeout(r, 900))
  sending.value = false
  sent.value = true
}
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <span class="tag">Get in Touch</span>
        <h1 class="title">Contact <span class="accent">Us</span></h1>
        <p class="sub">We'd love to hear from you.</p>
      </div>
    </section>

    <main class="wrap">
      <div class="layout">
        <div class="info-col">
          <h2 class="col-title">How can we help?</h2>
          <p class="col-body">Whether you have a bug report, a feature idea, a partnership inquiry, or just want to say hi — drop us a message and we'll get back to you.</p>

          <div class="contact-items">
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <div>
                <span class="item-label">Email</span>
                <span class="item-value">hello@salidumay.com</span>
              </div>
            </div>
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2H3v16h5l3 3 3-3h7V2z"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/></svg>
              <div>
                <span class="item-label">Discord</span>
                <span class="item-value">discord.gg/salidumay</span>
              </div>
            </div>
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 7v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              <div>
                <span class="item-label">Twitter / X</span>
                <span class="item-value">@salidumay</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-col">
          <div v-if="sent" class="success-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <strong>Message sent!</strong>
              <p>We'll get back to you as soon as possible.</p>
            </div>
          </div>

          <form v-else @submit.prevent="submit" class="form">
            <div class="field-row">
              <div class="field">
                <label>Name</label>
                <input v-model="form.name" type="text" placeholder="Your name" required />
              </div>
              <div class="field">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div class="field">
              <label>Subject</label>
              <input v-model="form.subject" type="text" placeholder="What's this about?" />
            </div>
            <div class="field">
              <label>Message</label>
              <textarea v-model="form.message" rows="5" placeholder="Your message…" required></textarea>
            </div>
            <button type="submit" class="submit-btn" :disabled="sending">
              <span v-if="sending" class="spin"></span>
              <span v-else>Send Message</span>
            </button>
          </form>
        </div>
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
  background: radial-gradient(ellipse at 60% 50%, rgba(0,212,255,0.09) 0%, transparent 60%), var(--bg);
}
.hero-content { position: relative; z-index: 2; text-align: center; padding: 2rem; }
.tag { font-size: .7rem; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #00d4ff; }
.title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.5rem,7vw,4.5rem); line-height: 1; color: #fff; margin: .3rem 0 .5rem; }
.accent { color: #00d4ff; }
.sub { font-size: .95rem; color: var(--text-muted); }

.wrap { max-width: 1100px; margin: 0 auto; padding: 3rem 2rem 5rem; }
.layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 4rem; }

.col-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: .08em; color: var(--text); margin-bottom: 1rem; }
.col-body { color: var(--text-muted); font-size: .9rem; line-height: 1.7; margin-bottom: 2rem; }

.contact-items { display: flex; flex-direction: column; gap: 1.25rem; }
.contact-item { display: flex; align-items: flex-start; gap: .85rem; }
.contact-item svg { width: 1.1rem; height: 1.1rem; color: #00d4ff; flex-shrink: 0; margin-top: .15rem; }
.item-label { display: block; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--text-muted); margin-bottom: .15rem; }
.item-value { display: block; font-size: .88rem; color: var(--text); }

.form { display: flex; flex-direction: column; gap: 1rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: .35rem; }
.field label { font-size: .78rem; font-weight: 700; color: var(--text-muted); letter-spacing: .05em; }
.field input, .field textarea {
  background: rgba(255,255,255,.04); border: 1px solid var(--border);
  border-radius: 8px; padding: .6rem .85rem; color: var(--text); font-size: .88rem;
  outline: none; transition: border-color .2s; resize: vertical; font-family: inherit;
}
.field input::placeholder, .field textarea::placeholder { color: rgba(255,255,255,.2); }
.field input:focus, .field textarea:focus { border-color: rgba(0,212,255,.4); }

.submit-btn {
  padding: .7rem 2rem; background: #00d4ff; border: none; border-radius: 8px;
  color: #060e14; font-size: .9rem; font-weight: 800; cursor: pointer;
  transition: background .2s; align-self: flex-start; display: flex; align-items: center; gap: .5rem;
}
.submit-btn:hover { background: #00b8dc; }
.submit-btn:disabled { opacity: .6; cursor: default; }
.spin { width: 16px; height: 16px; border: 2px solid rgba(6,14,20,.3); border-top-color: #060e14; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.success-box {
  display: flex; align-items: flex-start; gap: 1rem;
  background: rgba(0,212,255,.08); border: 1px solid rgba(0,212,255,.25);
  border-radius: 12px; padding: 1.5rem;
}
.success-box svg { width: 1.4rem; height: 1.4rem; color: #00d4ff; flex-shrink: 0; margin-top: .1rem; }
.success-box strong { display: block; color: var(--text); font-size: 1rem; margin-bottom: .25rem; }
.success-box p { color: var(--text-muted); font-size: .88rem; margin: 0; }

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; gap: 2.5rem; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
