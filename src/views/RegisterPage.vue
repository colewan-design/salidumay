<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth.js'

const router = useRouter()
const { register, loginWithGoogle, loading, error } = useAuth()

const name                 = ref('')
const email                = ref('')
const password             = ref('')
const passwordConfirmation = ref('')

async function submit() {
  const result = await register(name.value, email.value, password.value, passwordConfirmation.value)
  if (result.success) router.push('/')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="logo-kanji">サ</span>
        <span class="auth-title">Create Account</span>
      </div>

      <button class="btn-google" @click="loginWithGoogle">
        <svg viewBox="0 0 24 24" class="google-icon">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>

      <div class="divider"><span>or</span></div>

      <form @submit.prevent="submit" class="auth-form">
        <div v-if="error" class="auth-error">{{ error }}</div>

        <div class="form-group">
          <label>Name</label>
          <input v-model="name" type="text" placeholder="Your name" required autocomplete="name" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="you@example.com" required autocomplete="email" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Min. 8 characters" required autocomplete="new-password" />
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input v-model="passwordConfirmation" type="password" placeholder="••••••••" required autocomplete="new-password" />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-switch">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg, #0a0e1a);
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}
.logo-kanji {
  font-size: 2rem;
  color: #00f0ff;
  filter: drop-shadow(0 0 10px #00f0ff);
}
.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #fff;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.btn-google:hover { opacity: 0.92; transform: translateY(-1px); }
.google-icon { width: 20px; height: 20px; flex-shrink: 0; }
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255,255,255,0.3);
  font-size: 0.8rem;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.1);
}
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.auth-error {
  background: rgba(255,60,60,0.15);
  border: 1px solid rgba(255,60,60,0.3);
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  color: #ff6b6b;
  font-size: 0.875rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.form-group input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border 0.2s;
}
.form-group input:focus { border-color: #00f0ff; }
.form-group input::placeholder { color: rgba(255,255,255,0.25); }
.btn-primary {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #00f0ff, #b06aff);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-top: 0.25rem;
}
.btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-switch {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.45);
  margin-top: 0.25rem;
}
.auth-switch a { color: #00f0ff; text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
</style>
