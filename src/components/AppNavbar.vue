<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const scrolled = ref(false)
const menuOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const navLinks = [
  { label: 'Home',      to: { path: '/', hash: '#hero' } },
  { label: 'Seasonal',  to: { path: '/', hash: '#seasonal' } },
  { label: 'Genres',    to: { path: '/', hash: '#genres' } },
  { label: 'Community', to: { path: '/', hash: '#community' } },
  { label: 'Top Anime', to: { path: '/', hash: '#top' } },
]

const isOnWatch = () => route.path.startsWith('/watch')

function submitSearch() {
  if (searchQuery.value.trim()) {
    router.push('/watch')
    searchOpen.value = false
  }
}
</script>

<template>
  <nav :class="['navbar', { scrolled }]">
    <div class="nav-inner">
      <!-- Logo -->
      <RouterLink to="/" class="logo">
        <span class="logo-kanji">サ</span>
      </RouterLink>

      <!-- Desktop links -->
      <ul class="nav-links">
        <li v-for="link in navLinks" :key="link.label">
          <RouterLink :to="link.to" class="nav-link">{{ link.label }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/watch" :class="['nav-link', 'nav-link-watch', { active: isOnWatch() }]">Watch</RouterLink>
        </li>
      </ul>

      <!-- Right controls -->
      <div class="nav-right">
        <div :class="['search-wrap', { open: searchOpen }]">
          <input
            v-if="searchOpen"
            v-model="searchQuery"
            class="search-input"
            placeholder="Search anime…"
            autofocus
            @keydown.esc="searchOpen = false"
            @keydown.enter="submitSearch"
          />
          <button class="icon-btn" @click="searchOpen = !searchOpen" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <button class="icon-btn hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
          <span :class="{ open: menuOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="menuOpen" class="mobile-menu">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="mobile-link"
          @click="menuOpen = false"
        >{{ link.label }}</RouterLink>
        <RouterLink to="/watch" :class="['mobile-link', 'mobile-link-watch', { active: isOnWatch() }]" @click="menuOpen = false">Watch</RouterLink>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  transition: background 0.3s, box-shadow 0.3s;
}
.navbar.scrolled {
  background: rgba(10, 14, 26, 0.88);
  backdrop-filter: blur(16px);
  box-shadow: 0 2px 32px rgba(0,240,255,0.06);
}
.nav-inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-kanji {
  font-size: 2.2rem;
  color: var(--cyan);
  filter: drop-shadow(0 0 12px var(--cyan)) drop-shadow(0 0 24px rgba(0,240,255,0.4));
  line-height: 1;
}
.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.12em;
  color: var(--text);
}
.logo-accent { color: var(--pink); }

.nav-links {
  display: flex;
  list-style: none;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  flex: 1;
}
.nav-link {
  position: relative;
  padding: 0.4rem 0.75rem;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0.75rem; right: 0.75rem;
  height: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--pink));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s;
  border-radius: 2px;
}
.nav-link:hover { color: var(--cyan); }
.nav-link:hover::after { transform: scaleX(1); }
.nav-link-watch { color: var(--pink); }
.nav-link-watch::after { background: var(--pink); }
.nav-link-watch:hover { color: var(--pink); filter: brightness(1.2); }
.nav-link-watch.active { color: var(--pink); filter: brightness(1.2); }
.nav-link-watch.active::after { transform: scaleX(1); }

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}
.search-wrap { display: flex; align-items: center; gap: 0.4rem; }
.search-input {
  background: rgba(0,240,255,0.07);
  border: 1px solid var(--cyan-dim);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  color: var(--text);
  font-size: 0.875rem;
  width: 180px;
  outline: none;
  transition: border 0.2s;
}
.search-input:focus { border-color: var(--cyan); }

.icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.icon-btn svg { width: 1.15rem; height: 1.15rem; }
.icon-btn:hover { color: var(--cyan); }


/* Hamburger */
.hamburger { display: none; flex-direction: column; gap: 4px; padding: 0.5rem; }
.hamburger span,
.hamburger span::before,
.hamburger span::after {
  display: block; width: 20px; height: 2px;
  background: var(--text-muted);
  transition: all 0.25s;
}
.hamburger span { position: relative; }
.hamburger span::before,
.hamburger span::after { content: ''; position: absolute; }
.hamburger span::before { top: -6px; }
.hamburger span::after  { top: 6px; }
.hamburger span.open { background: transparent; }
.hamburger span.open::before { transform: rotate(45deg) translate(4px, 4px); }
.hamburger span.open::after  { transform: rotate(-45deg) translate(4px, -4px); }

/* Mobile menu */
.mobile-menu {
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem;
  background: rgba(10, 14, 26, 0.97);
  border-top: 1px solid var(--border);
}
.mobile-link {
  padding: 0.8rem 0;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  transition: color 0.2s;
}
.mobile-link:hover { color: var(--cyan); }
.mobile-link-watch { color: var(--pink); }
.mobile-link-watch:hover, .mobile-link-watch.active { color: var(--pink); filter: brightness(1.2); }


/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .hamburger { display: flex; }
}
</style>
