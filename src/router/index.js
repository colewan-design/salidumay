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
import LibraryPage  from '../views/LibraryPage.vue'
import HistoryPage  from '../views/HistoryPage.vue'
import FilmsPage         from '../views/FilmsPage.vue'
import FilmPlayer        from '../views/FilmPlayer.vue'
import FilmCategoryPage  from '../views/FilmCategoryPage.vue'
// Community
import ForumPage           from '../views/ForumPage.vue'
import ReviewsPage         from '../views/ReviewsPage.vue'
import WatchListsPage      from '../views/WatchListsPage.vue'
import RecommendationsPage from '../views/RecommendationsPage.vue'
// Company
import AboutPage   from '../views/AboutPage.vue'
import PressPage   from '../views/PressPage.vue'
import CareersPage from '../views/CareersPage.vue'
import ContactPage from '../views/ContactPage.vue'
// Legal
import PrivacyPage from '../views/PrivacyPage.vue'
import TermsPage   from '../views/TermsPage.vue'
import CookiesPage from '../views/CookiesPage.vue'

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
  { path: '/library',                 component: LibraryPage },
  { path: '/history',                 component: HistoryPage },
  { path: '/films',                            component: FilmsPage },
  { path: '/films/:category', name: 'film-category', component: FilmCategoryPage },
  { path: '/film/:id',        name: 'film',           component: FilmPlayer },
  // Community
  { path: '/forum',           component: ForumPage },
  { path: '/reviews',         component: ReviewsPage },
  { path: '/watchlists',      component: WatchListsPage },
  { path: '/recommendations', component: RecommendationsPage },
  // Company
  { path: '/about',    component: AboutPage },
  { path: '/press',    component: PressPage },
  { path: '/careers',  component: CareersPage },
  { path: '/contact',  component: ContactPage },
  // Legal
  { path: '/privacy',  component: PrivacyPage },
  { path: '/terms',    component: TermsPage },
  { path: '/cookies',  component: CookiesPage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
