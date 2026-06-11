<template>
  <section class="booking-history">
    <div class="container">
      <div class="section-header">
        <h2>Riwayat Pemesanan</h2>
        <p>Daftar semua pemesanan yang telah Anda buat</p>
      </div>

      <div v-if="store.bookings.length === 0" class="empty-state">
        <p>📭 Belum ada pemesanan.</p>
        <RouterLink to="/rooms" class="btn btn-primary">Lihat Kamar</RouterLink>
      </div>

      <div class="booking-list" v-else>
        <div class="booking-item" v-for="(b, i) in reversedBookings" :key="i">
          <div class="booking-header">
            <h3>{{ b.room }}</h3>
            <span class="booking-total">{{ store.formatCurrency(b.total) }}</span>
          </div>
          <div class="booking-meta">
            <p>👤 {{ b.fullname }}</p>
            <p>📅 {{ formatDate(b.checkin) }} → {{ formatDate(b.checkout) }}</p>
            <p>🌙 {{ b.nights }} malam · 👥 {{ b.guests }} tamu</p>
            <p v-if="b.discountAmount > 0" style="color: var(--success-color);">
              🎉 Diskon: {{ b.discount }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'

const store = useBookingStore()

const reversedBookings = computed(() => [...store.bookings].reverse())

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.booking-history { padding: 4rem 0; }

.section-header { text-align: center; margin-bottom: 3rem; }
.section-header h2 { font-size: 2.5rem; color: var(--primary-color); margin-bottom: 0.5rem; }
.section-header p  { font-size: 1.1rem; color: var(--text-light); }

.empty-state {
  text-align: center; padding: 4rem;
  color: var(--text-light); font-size: 1.2rem;
  display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
}

.booking-list { display: flex; flex-direction: column; gap: 1.5rem; }

.booking-item {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border-left: 4px solid var(--accent-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.booking-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.booking-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}

.booking-header h3 { font-size: 1.4rem; color: var(--primary-color); }

.booking-total {
  font-size: 1.3rem; font-weight: 700;
  background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.booking-meta { display: flex; flex-direction: column; gap: 0.4rem; color: var(--text-dark); }
.booking-meta p { font-size: 0.95rem; }
</style>