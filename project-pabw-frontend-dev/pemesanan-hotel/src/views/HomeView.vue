<template>
  <div class="home">

    <section class="hero">
      <div class="hero-bg" :style="{ backgroundImage: `url('/images/hero-bg.jpg')` }"></div>
      <div class="hero-overlay"></div>

      <div class="hero-particles">
        <span v-for="i in 6" :key="i" :class="`particle p${i}`"></span>
      </div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-line"></span>
          <span class="eyebrow-text">Platform Hotel Terpercaya Kalimantan</span>
          <span class="eyebrow-line"></span>
        </div>

        <h1 class="hero-title">
          <span class="title-small">Temukan Hotel</span>
          <span class="title-large"><em>Terbaik</em></span>
          <span class="title-small">untuk Anda</span>
        </h1>

        <p class="hero-sub">
          Ratusan pilihan hotel mitra pilihan di seluruh Kalimantan
        </p>

        <div class="hero-stats">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <span class="stat-number">
              <span class="counter" :data-target="s.target" :data-suffix="s.suffix">0</span>
            </span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>

        <div class="hero-actions">
          <button class="cta-primary" @click="scrollToHotels">
            <span>Jelajahi Hotel</span>
            <span class="cta-arrow">↓</span>
          </button>
          <RouterLink v-if="!auth.isLoggedIn" to="/login" class="cta-ghost">
            Daftar Gratis
          </RouterLink>
        </div>
      </div>

      <div class="scroll-mouse">
        <div class="mouse-wheel"></div>
      </div>
    </section>

    <section class="hotels-section" id="hotels-section" ref="hotelsSectionRef">
      <div class="container">

        <div class="search-pill">
          <div class="search-field">
            <span class="field-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <div class="field-inner">
              <label>Kota</label>
              <select v-model="search.city">
                <option value="">Semua Kota</option>
                <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="search-sep"></div>

          <div class="search-field">
            <span class="field-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <div class="field-inner">
              <label>Check-in</label>
              <input type="date" v-model="search.checkin" :min="today" />
            </div>
          </div>

          <div class="search-sep"></div>

          <div class="search-field">
            <span class="field-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <div class="field-inner">
              <label>Check-out</label>
              <input type="date" v-model="search.checkout" :min="minCheckout" />
            </div>
          </div>

          <div class="search-sep"></div>

          <div class="search-field">
            <span class="field-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </span>
            <div class="field-inner">
              <label>Tamu</label>
              <select v-model="search.guests">
                <option v-for="n in 6" :key="n" :value="n">{{ n }} Tamu</option>
              </select>
            </div>
          </div>

          <RouterLink :to="searchLink" class="search-submit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span>Cari</span>
          </RouterLink>
        </div>

        <div class="section-head">
          <div>
            <p class="section-eyebrow">Pilihan Terbaik</p>
            <h2 class="section-title">Hotel Unggulan Mitra Kami</h2>
          </div>
          <RouterLink to="/hotels" class="link-all">
            Lihat Semua Hotel &rarr;
          </RouterLink>
        </div>

        <div class="hotels-grid">
          <HotelCard
            v-for="(hotel, i) in hotelStore.hotels"
            :key="hotel.id"
            :hotel="hotel"
            :style="{ animationDelay: `${i * 0.12}s` }"
          />
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useHotelStore } from '@/stores/hotel'
import HotelCard from '@/components/HotelCard.vue'

const auth        = useAuthStore()
const hotelStore  = useHotelStore()

const today           = new Date().toISOString().split('T')[0]
const minCheckout     = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])
const hotelsSectionRef = ref(null)
const search = ref({ city: '', checkin: '', checkout: '', guests: 2 })

const cities = computed(() => [...new Set(hotelStore.hotels.map(h => h.city))])

const searchLink = computed(() => {
  const q = new URLSearchParams()
  if (search.value.city)   q.set('city',   search.value.city)
  if (search.value.guests) q.set('guests', search.value.guests)
  return `/hotels?${q.toString()}`
})

const stats = computed(() => [
  { target: hotelStore.hotels.length, suffix: '',  label: 'Hotel Mitra'   },
  { target: 1200,                      suffix: '+',  label: 'Tamu Puas'     },
  { target: 4,                         suffix: '',   label: 'Kota'          },
  { target: 24,                        suffix: '/7', label: 'Layanan'       },
])

function scrollToHotels() {
  hotelsSectionRef.value?.scrollIntoView({ behavior: 'smooth' })
}

function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target    = parseInt(el.dataset.target)
    const suffix    = el.dataset.suffix || ''
    const duration  = 1800
    const step      = 16
    const increment = target / (duration / step)
    let current     = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      el.textContent = Math.floor(current).toLocaleString('id-ID') + suffix
    }, step)
  })
}

onMounted(async () => {
  await hotelStore.loadHotels()
  setTimeout(animateCounters, 900)
})
</script>

<style scoped>
/* ─── Reset lokal ─── */
.home { overflow-x: hidden; }

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
.hero {
  position: relative;
  height: 100vh; min-height: 640px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}

/* Background */
.hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  animation: bgZoom 20s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes bgZoom {
  from { transform: scale(1); }
  to   { transform: scale(1.08); }
}

/* Overlay — navy gelap, konsisten dengan header */
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    170deg,
    rgba(13, 27, 46, 0.60) 0%,
    rgba(13, 27, 46, 0.78) 55%,
    rgba(13, 27, 46, 0.94) 100%
  );
}

/* Partikel dekoratif amber */
.hero-particles { position: absolute; inset: 0; pointer-events: none; }

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(201, 132, 58, 0.10);
  border: 1px solid rgba(201, 132, 58, 0.22);
  animation: floatParticle linear infinite;
}

.p1 { width: 6px;  height: 6px;  left: 15%; top: 20%; animation-duration: 8s;  animation-delay: 0s;   }
.p2 { width: 10px; height: 10px; left: 80%; top: 15%; animation-duration: 11s; animation-delay: 2s;   }
.p3 { width: 5px;  height: 5px;  left: 60%; top: 70%; animation-duration: 9s;  animation-delay: 1s;   }
.p4 { width: 8px;  height: 8px;  left: 25%; top: 75%; animation-duration: 13s; animation-delay: 3s;   }
.p5 { width: 4px;  height: 4px;  left: 45%; top: 30%; animation-duration: 7s;  animation-delay: 0.5s; }
.p6 { width: 12px; height: 12px; left: 72%; top: 55%; animation-duration: 15s; animation-delay: 4s;   }

@keyframes floatParticle {
  0%   { transform: translateY(0) rotate(0deg);     opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(-120px) rotate(360deg); opacity: 0; }
}

/* Konten hero */
.hero-content {
  position: relative; z-index: 2;
  text-align: center; color: white;
  padding: 2rem; max-width: 820px;
}

/* Eyebrow */
.hero-eyebrow {
  display: flex; align-items: center; justify-content: center;
  gap: 1rem; margin-bottom: 2.5rem;
  animation: fadeSlideDown 1s 0.2s both;
}

@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.eyebrow-line {
  display: block; width: 40px; height: 1px;
  background: linear-gradient(90deg, transparent, #dfa255);
}
.eyebrow-line:last-child {
  background: linear-gradient(90deg, #dfa255, transparent);
}

.eyebrow-text {
  font-family: var(--font-body);
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 3px; text-transform: uppercase;
  color: #dfa255;
}

/* Judul */
.hero-title {
  display: flex; flex-direction: column; align-items: center;
  margin-bottom: 1.5rem; line-height: 1;
  animation: fadeSlideUp 1.1s 0.4s both;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}

.title-small {
  font-family: var(--font-body);
  font-size: clamp(0.9rem, 2.5vw, 1.2rem);
  font-weight: 300; letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.60);
  display: block;
}

.title-large {
  font-family: var(--font-display);
  font-size: clamp(5rem, 12vw, 9rem);
  font-weight: 300; letter-spacing: -2px;
  display: block; line-height: 0.88;
}

/* Aksen amber — konsisten satu warna */
.title-large em {
  font-style: italic;
  background: linear-gradient(135deg, #eec27a, #c9843a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Subtitle */
.hero-sub {
  font-family: var(--font-body);
  font-size: 0.95rem; font-weight: 300;
  letter-spacing: 1.5px; color: rgba(255, 255, 255, 0.50);
  margin-bottom: 3rem;
  animation: fadeSlideUp 1.1s 0.6s both;
}

/* Stats */
.hero-stats {
  display: inline-flex;
  border: 1px solid rgba(201, 132, 58, 0.20);
  border-radius: 3px;
  margin-bottom: 3.5rem;
  overflow: hidden;
  animation: fadeSlideUp 1.1s 0.75s both;
}

.stat-item {
  display: flex; flex-direction: column; align-items: center;
  padding: 1.2rem 2.5rem;
  border-right: 1px solid rgba(201, 132, 58, 0.14);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  transition: background 0.3s;
}

.stat-item:last-child { border-right: none; }
.stat-item:hover      { background: rgba(201, 132, 58, 0.08); }

.stat-number {
  font-family: var(--font-display);
  font-size: 2.2rem; font-weight: 600;
  color: #eec27a; line-height: 1.1;
  letter-spacing: -0.5px;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 0.65rem; font-weight: 500;
  letter-spacing: 2.5px; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
  margin-top: 0.35rem;
}

/* Tombol CTA */
.hero-actions {
  display: flex; gap: 1.2rem;
  justify-content: center; align-items: center;
  flex-wrap: wrap;
  animation: fadeSlideUp 1.1s 0.9s both;
}

/* CTA utama — amber solid, sama dengan .btn-primary global */
.cta-primary {
  display: inline-flex; align-items: center; gap: 0.7rem;
  background: #c9843a;
  color: white; border: none; cursor: pointer;
  padding: 1rem 2.8rem;
  font-family: var(--font-body);
  font-size: 0.78rem; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase;
  border-radius: 3px;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 32px rgba(201, 132, 58, 0.32);
  position: relative; overflow: hidden;
}

.cta-primary::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(255, 255, 255, 0.12);
  opacity: 0; transition: opacity 0.3s;
}
.cta-primary:hover::after { opacity: 1; }
.cta-primary:hover {
  background: #a0621a;
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(201, 132, 58, 0.45);
}

.cta-arrow {
  display: inline-block;
  animation: arrowBounce 2s ease-in-out infinite;
}

@keyframes arrowBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(5px); }
}

/* CTA ghost  outline tipis, hover amber */
.cta-ghost {
  display: inline-flex; align-items: center;
  padding: 1rem 2.2rem;
  font-family: var(--font-body);
  font-size: 0.78rem; font-weight: 500;
  letter-spacing: 2px; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.60);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 3px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-ghost:hover {
  border-color: #c9843a;
  color: #eec27a;
  background: rgba(201, 132, 58, 0.08);
}

/* Scroll mouse indicator */
.scroll-mouse {
  position: absolute; bottom: 2.5rem; left: 50%;
  transform: translateX(-50%); z-index: 2;
  width: 26px; height: 42px;
  border: 1.5px solid rgba(255, 255, 255, 0.20);
  border-radius: 13px;
  display: flex; justify-content: center; padding-top: 7px;
}

.mouse-wheel {
  width: 4px; height: 8px;
  background: rgba(201, 132, 58, 0.65);
  border-radius: 4px;
  animation: mouseScroll 2.5s ease-in-out infinite;
}

@keyframes mouseScroll {
  0%   { transform: translateY(0);   opacity: 1; }
  80%  { transform: translateY(12px); opacity: 0; }
  100% { transform: translateY(0);   opacity: 0; }
}

/* ══════════════════════════════════════════
   HOTELS SECTION
══════════════════════════════════════════ */
.hotels-section {
  background: #eef2f7;
  padding: 5rem 0 6rem;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* Search bar pill */
.search-pill {
  display: flex; align-items: center;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(13, 27, 46, 0.10);
  border: 1px solid rgba(13, 27, 46, 0.07);
  margin-bottom: 4rem;
  overflow: hidden;
}

.search-field {
  flex: 1; display: flex; align-items: center;
  gap: 0.75rem; padding: 1.2rem 1.4rem;
  min-width: 0;
  transition: background 0.2s;
}

.search-field:hover { background: #fdf6ec; }

.field-icon {
  color: #8faabf; flex-shrink: 0;
  display: flex; align-items: center;
}

.field-inner { display: flex; flex-direction: column; min-width: 0; }

.field-inner label {
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.8px;
  color: #8faabf; margin-bottom: 0.25rem;
}

.field-inner input,
.field-inner select {
  border: none; outline: none;
  font-family: var(--font-body);
  font-size: 0.9rem; font-weight: 600;
  color: #0d1b2e; background: transparent;
  width: 100%; cursor: pointer;
}

/* Ganti warna option agar tetap terbaca */
.field-inner select option { color: #0d1b2e; background: #fff; }

.search-sep {
  width: 1px; height: 36px;
  background: #dde3ef; flex-shrink: 0;
}

/* Tombol Cari — navy solid, hover ke amber */
.search-submit {
  display: flex; align-items: center; gap: 0.55rem;
  background: #0d1b2e;
  color: white; text-decoration: none;
  padding: 1.4rem 2rem;
  font-family: var(--font-body);
  font-size: 0.75rem; font-weight: 700;
  letter-spacing: 2px; text-transform: uppercase;
  flex-shrink: 0;
  transition: background 0.3s ease;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.search-submit:hover { background: #c9843a; }

/* Section header */
.section-head {
  display: flex; align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.section-eyebrow {
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  color: #c9843a; margin-bottom: 0.45rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: 2.3rem; font-weight: 400;
  color: #0d1b2e; letter-spacing: -0.5px;
  line-height: 1.1;
}

.link-all {
  font-size: 0.75rem; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: #3d5a87; text-decoration: none;
  padding-bottom: 3px;
  border-bottom: 1.5px solid #c4cedf;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.link-all:hover { color: #c9843a; border-color: #c9843a; }

/* Grid hotel */
.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  gap: 1.8rem;
}

:deep(.hotel-card) {
  animation: cardUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 900px) {
  .search-pill    { flex-direction: column; border-radius: 8px; }
  .search-field   { width: 100%; border-bottom: 1px solid #dde3ef; }
  .search-field:last-of-type { border-bottom: none; }
  .search-sep     { display: none; }
  .search-submit  { width: 100%; justify-content: center; padding: 1.1rem; border-left: none; border-top: 1px solid #dde3ef; }
  .stat-item      { padding: 1rem 1.5rem; }
  .stat-number    { font-size: 1.8rem; }
  .hero-stats     { flex-wrap: wrap; }
}

@media (max-width: 600px) {
  .title-large    { font-size: 4.2rem; }
  .hero-stats     { flex-direction: column; }
  .stat-item      { border-right: none; border-bottom: 1px solid rgba(201, 132, 58, 0.14); }
  .stat-item:last-child { border-bottom: none; }
  .section-head   { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .hotels-grid    { grid-template-columns: 1fr; }
  .hero-sub       { font-size: 0.85rem; }
}
</style>