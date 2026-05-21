import { createRouter, createWebHistory } from 'vue-router'
import Home        from '../views/Home.vue'
import WatchPage   from '../views/WatchPage.vue'
import VideoPlayer from '../views/VideoPlayer.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/watch', component: WatchPage },
  { path: '/watch/:id/ep/:ep', name: 'watch', component: VideoPlayer },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
