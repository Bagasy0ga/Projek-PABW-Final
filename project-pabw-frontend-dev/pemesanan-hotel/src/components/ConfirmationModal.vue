<template>
  <div class="modal" @click.self="store.closeConfirmationModal">
    <div class="modal-content">
      <div class="confirmation-content">
        <div class="confirmation-icon">✓</div>
        <h2>Pemesanan Berhasil!</h2>
        <p class="confirm-sub">
          Terima kasih, <strong>{{ booking?.fullname }}</strong>.<br>
          Konfirmasi dikirim ke <strong>{{ booking?.email }}</strong>.
        </p>

        <div class="confirmation-details" v-if="booking">
          <div class="detail-row">
            <span>Referensi</span>
            <strong>PABW{{ refId }}</strong>
          </div>
          <div class="detail-row" v-if="booking.hotelName">
            <span>Hotel</span>
            <strong>{{ booking.hotelName }}</strong>
          </div>
          <div class="detail-row">
            <span>Kamar</span>
            <strong>{{ booking.room }}</strong>
          </div>
          <div class="detail-row">
            <span>Check-In</span>
            <strong>{{ formatDate(booking.checkin) }}</strong>
          </div>
          <div class="detail-row">
            <span>Check-Out</span>
            <strong>{{ formatDate(booking.checkout) }}</strong>
          </div>
          <div class="detail-row">
            <span>Durasi</span>
            <strong>{{ booking.nights }} malam · {{ booking.guests }} tamu</strong>
          </div>
          <div class="detail-divider"></div>
          <div class="detail-row">
            <span>Tarif/malam</span>
            <strong>{{ store.formatCurrency(booking.roomRate) }}</strong>
          </div>
          <div class="detail-row">
            <span>Subtotal</span>
            <strong>{{ store.formatCurrency(booking.subtotal) }}</strong>
          </div>
          <div class="detail-row discount" v-if="booking.discountAmount > 0">
            <span>Diskon ({{ booking.discount }})</span>
            <strong>- {{ store.formatCurrency(booking.discountAmount) }}</strong>
          </div>
          <div class="detail-row total">
            <span>Total</span>
            <strong>{{ store.formatCurrency(booking.total) }}</strong>
          </div>
        </div>

        <p class="confirmation-note">⏰ Staf hotel akan menghubungi Anda dalam 24 jam.</p>

        <div class="confirm-actions">
          <RouterLink to="/reservations" class="btn btn-secondary" @click="store.closeConfirmationModal">
            Lihat Reservasi
          </RouterLink>
          <button class="btn btn-primary" @click="store.closeConfirmationModal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'

const store = useBookingStore()
const booking = computed(() => store.lastBooking)
const refId = Date.now().toString().slice(-8)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  })
}
</script>

<style scoped>
.modal {
  display: flex; align-items: center; justify-content: center;
  position: fixed; z-index: 2000; inset: 0;
  background-color: rgba(11,37,69,0.75); backdrop-filter: blur(5px);
  animation: modalFadeIn 0.3s ease-out; padding: 2rem;
}

@keyframes modalFadeIn { from { opacity:0; } to { opacity:1; } }

.modal-content {
  background-color: var(--bg-white); padding: 2.5rem; border-radius: 20px;
  width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
  animation: modalSlideIn 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
  box-shadow: 0 20px 60px rgba(11,37,69,0.35);
  border-top: 4px solid var(--success-color);
}

@keyframes modalSlideIn {
  from { transform: translateY(-40px) scale(0.92); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.confirmation-content { text-align: center; }

.confirmation-icon {
  width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1.2rem;
  background: linear-gradient(135deg, var(--success-color), #229954);
  color: white; font-size: 2.8rem;
  display: flex; align-items: center; justify-content: center;
  animation: checkmarkPop 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);
  box-shadow: 0 8px 25px rgba(39,174,96,0.4);
}

@keyframes checkmarkPop {
  0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
  50%  { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.confirmation-content h2 { color: var(--primary-color); font-size: 1.6rem; margin-bottom: 0.5rem; }

.confirm-sub { color: var(--text-light); line-height: 1.7; margin-bottom: 1.5rem; }

.confirmation-details {
  background: var(--bg-light); border-radius: 12px;
  padding: 1.3rem; margin-bottom: 1.5rem; text-align: left;
  border-left: 4px solid var(--accent-color);
}

.detail-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.45rem 0; font-size: 0.92rem;
  border-bottom: 1px dashed var(--border-color);
}

.detail-row:last-child { border-bottom: none; }

.detail-row span  { color: var(--text-light); }
.detail-row strong { color: var(--text-dark); }

.detail-divider { border-top: 2px solid var(--border-color); margin: 0.7rem 0; }

.detail-row.discount strong { color: var(--success-color); }

.detail-row.total {
  font-size: 1.1rem; padding-top: 0.7rem; border-top: 2px solid var(--primary-color); border-bottom: none;
}

.detail-row.total span,
.detail-row.total strong { color: var(--primary-color); font-weight: 700; }

.confirmation-note { color: var(--text-light); font-style: italic; font-size: 0.88rem; margin-bottom: 1.5rem; }

.confirm-actions { display: flex; gap: 1rem; justify-content: center; }

.confirm-actions a { text-decoration: none; }
</style>