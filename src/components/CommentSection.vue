<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '../store/auth.js'

const props = defineProps({ animeId: { type: [String, Number], required: true } })

const router = useRouter()
const { isLoggedIn, user, authHeaders } = useAuth()

const BASE = (import.meta.env.VITE_API_URL || '/api/anime').replace('/anime', '')

const comments    = ref([])
const nextPageUrl = ref(null)
const totalCount  = ref(0)
const loadingList = ref(false)
const loadingMore = ref(false)
const submitting  = ref(false)
const body        = ref('')
const error       = ref('')

async function fetchComments(url = null) {
  if (!url) {
    loadingList.value = true
    comments.value    = []
  } else {
    loadingMore.value = true
  }
  try {
    const endpoint = url || `${BASE}/comments/${props.animeId}`
    const { data } = await axios.get(endpoint)
    comments.value  = url ? [...comments.value, ...data.data] : data.data
    nextPageUrl.value = data.next_page_url
    totalCount.value  = data.total
  } catch (_) {}
  loadingList.value = false
  loadingMore.value = false
}

async function submitComment() {
  if (!body.value.trim()) return
  error.value    = ''
  submitting.value = true
  try {
    const { data } = await axios.post(
      `${BASE}/comments/${props.animeId}`,
      { body: body.value.trim() },
      { headers: authHeaders() },
    )
    comments.value.unshift(data)
    totalCount.value++
    body.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to post comment.'
  }
  submitting.value = false
}

async function deleteComment(comment) {
  try {
    await axios.delete(
      `${BASE}/comments/${props.animeId}/${comment.id}`,
      { headers: authHeaders() },
    )
    comments.value   = comments.value.filter(c => c.id !== comment.id)
    totalCount.value--
  } catch (_) {}
}

function formatDate(iso) {
  const d = new Date(iso)
  const diff = (Date.now() - d) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return d.toLocaleDateString()
}

onMounted(() => fetchComments())
watch(() => props.animeId, () => fetchComments())
</script>

<template>
  <section class="comments-section">
    <h3 class="comments-title">
      Comments
      <span v-if="totalCount" class="comments-count">{{ totalCount }}</span>
    </h3>

    <!-- Compose box -->
    <div v-if="isLoggedIn" class="compose-box">
      <img v-if="user?.avatar" :src="user.avatar" class="compose-avatar" alt="avatar" />
      <div v-else class="compose-avatar compose-avatar-init">{{ user?.name?.[0]?.toUpperCase() || 'U' }}</div>
      <div class="compose-right">
        <textarea
          v-model="body"
          class="compose-input"
          placeholder="Share your thoughts…"
          rows="2"
          maxlength="1000"
          @keydown.ctrl.enter="submitComment"
        ></textarea>
        <div class="compose-footer">
          <span v-if="error" class="compose-error">{{ error }}</span>
          <span class="compose-hint">Ctrl+Enter to post</span>
          <button class="btn-post" :disabled="submitting || !body.trim()" @click="submitComment">
            {{ submitting ? 'Posting…' : 'Post' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Guest CTA -->
    <div v-else class="guest-cta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="cta-icon">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <p>Join the conversation</p>
      <div class="cta-actions">
        <button class="btn-cta-primary" @click="router.push('/login')">Sign In</button>
        <button class="btn-cta-secondary" @click="router.push('/register')">Create Account</button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loadingList" class="comments-list">
      <div v-for="n in 3" :key="n" class="comment-skeleton">
        <div class="sk-avatar skeleton"></div>
        <div class="sk-body">
          <div class="sk-line skeleton" style="width:30%"></div>
          <div class="sk-line skeleton" style="width:90%"></div>
          <div class="sk-line skeleton" style="width:70%"></div>
        </div>
      </div>
    </div>

    <!-- Comments list -->
    <div v-else class="comments-list">
      <div v-if="!comments.length" class="comments-empty">
        No comments yet. Be the first!
      </div>

      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <img v-if="comment.user?.avatar" :src="comment.user.avatar" class="comment-avatar" alt="avatar" />
        <div v-else class="comment-avatar comment-avatar-init">
          {{ comment.user?.name?.[0]?.toUpperCase() || 'U' }}
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user?.name }}</span>
            <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
            <button
              v-if="isLoggedIn && user?.id === comment.user?.id"
              class="btn-delete"
              title="Delete comment"
              @click="deleteComment(comment)"
            >✕</button>
          </div>
          <p class="comment-text">{{ comment.body }}</p>
        </div>
      </div>

      <!-- Load more -->
      <button v-if="nextPageUrl" class="btn-load-more" :disabled="loadingMore" @click="fetchComments(nextPageUrl)">
        {{ loadingMore ? 'Loading…' : 'Load more comments' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.comments-section {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.comments-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.comments-count {
  background: rgba(0,240,255,0.12);
  color: #00f0ff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
}

/* Compose */
.compose-box {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.compose-avatar, .comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.compose-avatar-init, .comment-avatar-init {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,240,255,0.15);
  border: 1px solid rgba(0,240,255,0.25);
  color: #00f0ff;
  font-size: 0.85rem;
  font-weight: 700;
}
.compose-right { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.compose-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  color: #fff;
  font-size: 0.9rem;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border 0.2s;
  box-sizing: border-box;
}
.compose-input:focus { border-color: rgba(0,240,255,0.45); }
.compose-input::placeholder { color: rgba(255,255,255,0.25); }
.compose-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.compose-hint { font-size: 0.75rem; color: rgba(255,255,255,0.25); margin-right: auto; }
.compose-error { font-size: 0.8rem; color: #ff6b6b; }
.btn-post {
  padding: 0.4rem 1.1rem;
  background: linear-gradient(135deg, #00f0ff, #b06aff);
  border: none;
  border-radius: 6px;
  color: #000;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-post:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-post:not(:disabled):hover { opacity: 0.85; }

/* Guest CTA */
.guest-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  margin-bottom: 1.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(0,240,255,0.15);
  border-radius: 12px;
  text-align: center;
}
.cta-icon { width: 32px; height: 32px; color: rgba(0,240,255,0.5); }
.guest-cta p { margin: 0; color: rgba(255,255,255,0.55); font-size: 0.95rem; }
.cta-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
.btn-cta-primary {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #00f0ff, #b06aff);
  border: none;
  border-radius: 7px;
  color: #000;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-cta-primary:hover { opacity: 0.85; }
.btn-cta-secondary {
  padding: 0.5rem 1.25rem;
  background: none;
  border: 1px solid rgba(0,240,255,0.35);
  border-radius: 7px;
  color: #00f0ff;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cta-secondary:hover { background: rgba(0,240,255,0.08); }

/* Skeleton */
.comment-skeleton { display: flex; gap: 0.75rem; padding: 0.75rem 0; }
.sk-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.sk-body { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; padding-top: 0.2rem; }
.sk-line { height: 12px; border-radius: 4px; }
.skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Comment items */
.comments-list { display: flex; flex-direction: column; gap: 0; }
.comments-empty { color: rgba(255,255,255,0.3); font-size: 0.9rem; text-align: center; padding: 2rem 0; }
.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.comment-item:last-of-type { border-bottom: none; }
.comment-body { flex: 1; min-width: 0; }
.comment-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
.comment-author { font-size: 0.88rem; font-weight: 700; color: #fff; }
.comment-time { font-size: 0.78rem; color: rgba(255,255,255,0.3); }
.btn-delete {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(255,255,255,0.2);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.2s;
}
.btn-delete:hover { color: #ff6b6b; }
.comment-text { font-size: 0.9rem; color: rgba(255,255,255,0.75); line-height: 1.55; white-space: pre-wrap; word-break: break-word; margin: 0; }

.btn-load-more {
  width: 100%;
  margin-top: 1rem;
  padding: 0.65rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: rgba(255,255,255,0.5);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-load-more:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; }
.btn-load-more:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
