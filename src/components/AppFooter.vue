<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="logo">
          <span class="logo-kanji">サ</span>
        </div>
        <p class="footer-tagline">Salidumay — a song of hope for every anime fan.</p>
        <div class="socials">
          <a href="#" class="social" aria-label="Twitter/X">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" class="social" aria-label="Discord">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          </a>
          <a href="#" class="social" aria-label="Reddit">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
          </a>
          <a href="#" class="social" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-links-group">
        <h4>Browse</h4>
        <ul>
          <li><RouterLink to="/trending">Trending</RouterLink></li>
          <li><RouterLink to="/seasonal">Seasonal</RouterLink></li>
          <li><RouterLink to="/rankings">Top Anime</RouterLink></li>
          <li><RouterLink to="/genre">Genres</RouterLink></li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h4>Community</h4>
        <ul>
          <li><RouterLink to="/forum">Forum</RouterLink></li>
          <li><RouterLink to="/reviews">Reviews</RouterLink></li>
          <li><RouterLink to="/watchlists">Watch Lists</RouterLink></li>
          <li><RouterLink to="/recommendations">Recommendations</RouterLink></li>
        </ul>
      </div>

      <div class="footer-links-group">
        <h4>Company</h4>
        <ul>
          <li><RouterLink to="/about">About Us</RouterLink></li>
          <li><RouterLink to="/press">Press Kit</RouterLink></li>
          <li><RouterLink to="/careers">Careers</RouterLink></li>
          <li><RouterLink to="/contact">Contact</RouterLink></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2025 Salidumay. Built for anime fans, by anime fans.</span>
      <div class="legal-links">
        <RouterLink to="/privacy">Privacy</RouterLink>
        <RouterLink to="/terms">Terms</RouterLink>
        <RouterLink to="/cookies">Cookies</RouterLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #060b14;
  border-top: 1px solid var(--border);
  margin-top: 4rem;
}
.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
}
.logo { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; text-decoration: none; }
.logo-kanji { font-size: 2.4rem; color: var(--cyan); filter: drop-shadow(0 0 12px var(--cyan)) drop-shadow(0 0 24px rgba(0,240,255,0.4)); }
.logo-text { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 0.12em; color: var(--text); }
.logo-accent { color: var(--pink); }

.footer-tagline { color: var(--text-muted); font-size: 0.85rem; line-height: 1.6; max-width: 260px; margin-bottom: 1.5rem; }

.socials { display: flex; gap: 0.75rem; }
.social {
  width: 38px; height: 38px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
  transition: all 0.2s;
}
.social svg { width: 16px; height: 16px; }
.social:hover { color: var(--cyan); border-color: var(--cyan-dim); box-shadow: 0 0 14px rgba(0,240,255,0.2); }

.footer-links-group h4 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.12em;
  color: var(--text);
  margin-bottom: 1rem;
}
.footer-links-group ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
.footer-links-group a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.footer-links-group a:hover { color: var(--cyan); }

.footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}
.legal-links { display: flex; gap: 1.5rem; }
.legal-links a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
.legal-links a:hover { color: var(--cyan); }

@media (max-width: 900px) { .footer-inner { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .footer-inner { grid-template-columns: 1fr; gap: 2rem; } }
</style>
