<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../store/auth.js'

const router = useRouter()
const route  = useRoute()
const { handleGoogleCallback } = useAuth()

onMounted(async () => {
  const token = route.query.token
  const error = route.query.error

  if (error || !token) {
    router.replace('/login?error=1')
    return
  }

  await handleGoogleCallback(token)
  router.replace('/')
})
</script>

<template>
  <div class="callback-page">
    <div class="spinner"></div>
    <p>Signing you in…</p>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  background: var(--bg, #0a0e1a);
  color: rgba(255,255,255,0.5);
  font-size: 0.95rem;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0,240,255,0.15);
  border-top-color: #00f0ff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
