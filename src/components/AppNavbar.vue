<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '../store/auth.js'

const route  = useRoute()
const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()

const collapsed  = ref(false)
const mobileOpen = ref(false)

async function handleLogout() {
  await logout()
  router.push('/')
}

const navItems = [
  { label: 'Home',         to: '/',          icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Trending',     to: '/trending',  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { label: 'Seasonal',     to: '/seasonal',  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Rankings',     to: '/rankings',  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Genres',       to: '/genre',     icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
]

const contentItems = [
  { label: 'Anime Movies', to: '/movies',             icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
  { label: 'All Films',    to: '/films',              icon: 'M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.899L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { label: 'Coming Soon',  to: '/films/coming-soon',  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Action',       to: '/films/action',       icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'Watch',        to: '/watch',              icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const accountItems = [
  { label: 'Library',  to: '/library',  icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label: 'History',  to: '/history',  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <!-- Mobile toggle -->
  <button class="mob-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menu">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <path v-if="!mobileOpen" d="M4 6h16M4 12h16M4 18h16"/>
      <path v-else d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>

  <!-- Overlay -->
  <div v-if="mobileOpen" class="mob-overlay" @click="mobileOpen = false"></div>

  <!-- Sidebar -->
  <aside :class="['sidebar', { collapsed, 'mob-open': mobileOpen }]">

    <!-- Logo -->
    <RouterLink to="/" class="logo" @click="mobileOpen = false">
      <span class="logo-kanji">サ</span>
      <span class="logo-text">Salidumay</span>
    </RouterLink>

    <nav class="nav">
      <!-- Discover -->
      <p class="nav-label">Discover</p>
      <RouterLink
        v-for="item in navItems" :key="item.to"
        :to="item.to"
        :class="['nav-item', { active: isActive(item.to) }]"
        @click="mobileOpen = false"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path :d="item.icon" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-label-text">{{ item.label }}</span>
      </RouterLink>

      <!-- Content -->
      <p class="nav-label">Content</p>
      <RouterLink
        v-for="item in contentItems" :key="item.to"
        :to="item.to"
        :class="['nav-item', { active: isActive(item.to) }]"
        @click="mobileOpen = false"
      >
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path :d="item.icon" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-label-text">{{ item.label }}</span>
      </RouterLink>

      <!-- Account -->
      <template v-if="isLoggedIn">
        <p class="nav-label">Account</p>
        <RouterLink
          v-for="item in accountItems" :key="item.to"
          :to="item.to"
          :class="['nav-item', { active: isActive(item.to) }]"
          @click="mobileOpen = false"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path :d="item.icon" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="nav-label-text">{{ item.label }}</span>
        </RouterLink>
      </template>
    </nav>

    <!-- Bottom: user / sign in -->
    <div class="sidebar-bottom">
      <template v-if="isLoggedIn">
        <div class="user-row">
          <div class="user-avatar">
            <img v-if="user?.avatar" :src="user.avatar" :alt="user.name" />
            <span v-else>{{ user?.name?.[0]?.toUpperCase() || 'U' }}</span>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user?.name }}</span>
            <span class="user-email">{{ user?.email }}</span>
          </div>
        </div>
        <button class="signout-btn" @click="handleLogout">Sign Out</button>
      </template>
      <template v-else>
        <RouterLink to="/login"    class="auth-btn primary" @click="mobileOpen = false">Sign In</RouterLink>
        <RouterLink to="/register" class="auth-btn"         @click="mobileOpen = false">Register</RouterLink>
      </template>
    </div>
  </aside>
</template>

<style scoped>
/* ── Mobile toggle ── */
.mob-toggle {
  display: none;
  position: fixed;
  top: 1rem; left: 1rem;
  z-index: 300;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: .5rem;
  color: var(--text);
  cursor: pointer;
}
.mob-toggle svg { width: 1.2rem; height: 1.2rem; display: block; }

.mob-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  z-index: 150;
  backdrop-filter: blur(2px);
}

/* ── Sidebar ── */
.sidebar {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: 220px;
  background: #060e14;
  border-right: 1px solid rgba(0,212,255,0.15);
  display: flex;
  flex-direction: column;
  z-index: 200;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: 1.5rem 1.25rem 1rem;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-kanji {
  font-size: 1.8rem;
  color: #00d4ff;
  filter: drop-shadow(0 0 12px rgba(0,212,255,.7));
  line-height: 1;
  flex-shrink: 0;
}
.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.15rem;
  letter-spacing: .1em;
  color: var(--text);
}

/* ── Nav ── */
.nav {
  flex: 1;
  padding: 0 .6rem;
  display: flex;
  flex-direction: column;
  gap: .1rem;
}
.nav-label {
  font-size: .62rem;
  font-weight: 800;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(255,255,255,.25);
  padding: .85rem .65rem .3rem;
  pointer-events: none;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .5rem .65rem;
  border-radius: 8px;
  color: rgba(255,255,255,.5);
  text-decoration: none;
  font-size: .84rem;
  font-weight: 600;
  transition: background .18s, color .18s;
  white-space: nowrap;
}
.nav-item:hover { background: rgba(0,212,255,.07); color: rgba(255,255,255,.85); }
.nav-item.active { background: rgba(0,212,255,.12); color: #00d4ff; }
.nav-item.active .nav-icon { color: #00d4ff; }
.nav-icon { width: 1.05rem; height: 1.05rem; flex-shrink: 0; color: rgba(255,255,255,.35); transition: color .18s; }
.nav-item:hover .nav-icon { color: rgba(255,255,255,.7); }
.nav-label-text { flex: 1; }

/* ── Bottom ── */
.sidebar-bottom {
  padding: 1rem .85rem;
  border-top: 1px solid rgba(0,212,255,.15);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.user-row { display: flex; align-items: center; gap: .6rem; }
.user-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0,212,255,.4);
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700; color: #00d4ff;
  background: rgba(0,212,255,.1);
  flex-shrink: 0;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-info { flex: 1; min-width: 0; }
.user-name  { display: block; font-size: .78rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-email { display: block; font-size: .65rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.signout-btn {
  width: 100%;
  padding: .4rem;
  background: none;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: .75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  text-align: center;
}
.signout-btn:hover { border-color: #ef4444; color: #ef4444; }
.auth-btn {
  display: block;
  text-align: center;
  padding: .45rem;
  border-radius: 6px;
  font-size: .78rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,.1);
  color: var(--text-muted);
  transition: all .2s;
}
.auth-btn:hover { border-color: rgba(0,212,255,.35); color: var(--text); }
.auth-btn.primary { background: #00d4ff; border-color: #00d4ff; color: #060e14; }
.auth-btn.primary:hover { background: #00b8dc; border-color: #00b8dc; }

/* ── Mobile ── */
@media (max-width: 768px) {
  .mob-toggle  { display: flex; }
  .mob-overlay { display: block; }
  .sidebar {
    transform: translateX(-100%);
    transition: transform .28s cubic-bezier(.4,0,.2,1);
  }
  .sidebar.mob-open {
    transform: translateX(0);
    box-shadow: 8px 0 40px rgba(0,0,0,.6);
  }
}
</style>
