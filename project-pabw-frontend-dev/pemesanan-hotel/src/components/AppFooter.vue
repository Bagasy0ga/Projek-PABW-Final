<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>PABW<span>Hotels</span></h3>
          <p class="brand-desc">Platform pemesanan hotel terpercaya di Kalimantan. Menghubungkan traveler dengan hotel-hotel terbaik pilihan.</p>
          <div class="brand-contact">
            <p>📞 +62 21 1234 5678</p>
            <p>✉️ info@pabwhotels.com</p>
            <p>📍 Balikpapan, Kalimantan Timur</p>
          </div>
        </div>

        <div class="footer-col">
          <h4>Navigasi</h4>
          <RouterLink to="/">Beranda</RouterLink>
          <RouterLink to="/hotels">Daftar Hotel</RouterLink>
          <RouterLink to="/reservations" v-if="auth.isLoggedIn">Reservasi Saya</RouterLink>
          <RouterLink to="/admin" v-if="auth.isAdmin" class="admin-nav">Admin Dashboard</RouterLink>
          <RouterLink to="/profile" v-if="auth.isLoggedIn">Profil</RouterLink>
          <RouterLink to="/login" v-else>Masuk / Daftar</RouterLink>
        </div>

        <div class="footer-col">
          <h4>Destinasi</h4>
          <a href="/hotels?city=Balikpapan">Balikpapan</a>
          <a href="/hotels?city=Samarinda">Samarinda</a>
          <a href="/hotels?city=Tenggarong">Tenggarong</a>
        </div>

        <div class="footer-col">
          <h4>Bantuan</h4>
          <a href="#">Syarat &amp; Ketentuan</a>
          <a href="#">Kebijakan Privasi</a>
          <a href="#">FAQ</a>
          <a href="#">Hubungi Kami</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ year }} PABW Hotels. Hak cipta dilindungi.</p>
        <p class="footer-tagline">Dibuat untuk kemudahan perjalanan Anda</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--navy-900, #0b1f3a);
  color: white;
  padding: 3.5rem 0 1.5rem;
  margin-top: 4rem;
  border-top: 1px solid rgba(255,255,255,.06);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2.5rem;
  margin-bottom: 2rem;
}

/* Brand kolom */
.footer-brand h3 {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: #fff;
  margin-bottom: 0.8rem;
}

.footer-brand h3 span {
  font-weight: 300;
  font-size: 1rem;
  color: rgba(255,255,255,.5);
  letter-spacing: 1px;
}

.brand-desc {
  opacity: 0.75;
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.brand-contact p {
  margin-bottom: 0.4rem;
  opacity: 0.8;
  font-size: 0.85rem;
}

/* Kolom link */
.footer-col h4 {
  margin-bottom: 1rem;
  color: rgba(255,255,255,.9);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.footer-col a {
  display: block;
  color: rgba(255,255,255,.65);
  text-decoration: none;
  margin-bottom: 0.6rem;
  font-size: 0.88rem;
  transition: all 0.3s ease;
}

.footer-col a:hover {
  color: var(--accent, #c9843a);
  transform: translateX(5px);
}

/* Admin link - sama dengan link lain, tanpa perbedaan warna mencolok */
.admin-nav {
  color: rgba(255,255,255,.65) !important;
  font-weight: 600 !important;
}

.admin-nav:hover {
  color: var(--accent, #c9843a) !important;
}

/* Footer bottom */
.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,.1);
  opacity: 0.7;
}

.footer-tagline {
  font-size: 0.82rem;
  margin-top: 0.3rem;
}

@media (max-width: 900px) {
  .footer-content { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 500px) {
  .footer-content { grid-template-columns: 1fr; }
}
</style>