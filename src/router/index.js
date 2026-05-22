import { createRouter, createWebHistory } from 'vue-router'
import Home        from '../views/Home.vue'
import WatchPage   from '../views/WatchPage.vue'
import VideoPlayer from '../views/VideoPlayer.vue'
import TrendingPage from '../views/TrendingPage.vue'
import SeasonalPage from '../views/SeasonalPage.vue'
import RankingsPage from '../views/RankingsPage.vue'
import GenrePage    from '../views/GenrePage.vue'
import MoviesPage   from '../views/MoviesPage.vue'
import LoginPage    from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import AuthCallback from '../views/AuthCallback.vue'

const routes = [
  { path: '/',                        component: Home },
  { path: '/watch',                   component: WatchPage },
  { path: '/watch/:id/ep/:ep', name: 'watch', component: VideoPlayer },
  { path: '/trending',                component: TrendingPage },
  { path: '/seasonal',                component: SeasonalPage },
  { path: '/rankings',                component: RankingsPage },
  { path: '/genre/:genre', name: 'genre', component: GenrePage },
  { path: '/genre',                   component: GenrePage },
  { path: '/movies',                  component: MoviesPage },
  { path: '/login',                   component: LoginPage },
  { path: '/register',                component: RegisterPage },
  { path: '/auth/callback',           component: AuthCallback },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
