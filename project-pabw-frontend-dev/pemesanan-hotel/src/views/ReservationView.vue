<template>
  <section class="reservation-page">
    <div class="container">
      <div class="page-header">
        <h1>Reservasi Saya</h1>
        <p>
          Halo, <strong>{{ auth.user?.name }}</strong> — berikut riwayat pemesanan Anda
        </p>
      </div>

      <div v-if="myBookings.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>Belum Ada Reservasi</h3>
        <p>Anda belum pernah melakukan pemesanan.</p>
        <RouterLink to="/hotels" class="btn btn-primary">
          Cari Hotel Sekarang
        </RouterLink>
      </div>

      <div class="booking-list" v-else>
        <div
          class="booking-card"
          v-for="(b, i) in myBookings"
          :key="bookingKey(b, i)"
          :class="statusClass(b)"
        >
          <div class="booking-card-header">
            <div>
              <span class="booking-ref">
                REF: {{ bookingReference(b, i) }}
              </span>

              <h3>{{ bookingRoomName(b) }}</h3>

              <p class="booking-hotel" v-if="bookingHotelName(b)">
                🏨 {{ bookingHotelName(b) }}
              </p>
            </div>

            <span :class="['status-badge', statusClass(b)]">
              {{ statusLabel(b) }}
            </span>
          </div>

          <div class="booking-card-body">
            <div class="booking-dates">
              <div class="date-block">
                <span class="date-label">CHECK IN</span>
                <span class="date-value">{{ formatDate(bookingCheckin(b)) }}</span>
              </div>

              <div class="date-divider">→</div>

              <div class="date-block">
                <span class="date-label">CHECK OUT</span>
                <span class="date-value">{{ formatDate(bookingCheckout(b)) }}</span>
              </div>
            </div>

            <div class="booking-meta-grid">
              <span>🌙 {{ bookingNights(b) }} malam</span>
              <span>👥 {{ bookingGuests(b) }} tamu</span>
              <span v-if="bookingRooms(b) > 1">🛏 {{ bookingRooms(b) }} kamar</span>

              <span
                v-if="Number(b.discountAmount || b.discount_amount || 0) > 0"
                style="color: var(--success-color)"
              >
                🎉 {{ b.discount || 'Diskon' }}
              </span>
            </div>
          </div>

          <div class="booking-card-footer">
            <div class="booking-total">
              <span>Total Pembayaran</span>
              <strong>{{ bookingStore.formatCurrency(bookingTotal(b)) }}</strong>
            </div>

            <button
              v-if="canGiveRating(b)"
              class="btn btn-primary btn-rating"
              @click="openRatingModal(b)"
            >
              BERI RATING
            </button>

            <span
              v-else-if="hasRated(b)"
              class="rating-note success-note"
            >
              Rating sudah dikirim
            </span>

            <span
              v-else-if="bookingStatus(b) === 'confirmed'"
              class="rating-note"
            >
              Rating tersedia setelah checkout
            </span>

            <span
              v-else-if="bookingStatus(b) === 'checkin'"
              class="rating-note"
            >
              Selesaikan checkout untuk memberi rating
            </span>

            <span
              v-else-if="isCancelledStatus(b)"
              class="rating-note danger-note"
            >
              Reservasi batal tidak bisa diberi rating
            </span>

            <span
              v-else
              class="rating-note"
            >
              Rating belum tersedia
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="ratingModalOpen"
      class="rating-modal"
      @click.self="closeRatingModal"
    >
      <div class="rating-modal-content">
        <button class="rating-close" type="button" @click="closeRatingModal">
          &times;
        </button>

        <h2>Beri Rating Hotel</h2>

        <p class="rating-hotel-name">
          {{ bookingHotelName(selectedBooking) }}
        </p>

        <p class="rating-room-name">
          {{ bookingRoomName(selectedBooking) }}
        </p>

        <div class="rating-stars">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star-button"
            :class="{ active: star <= ratingForm.score }"
            @click="ratingForm.score = star"
          >
            ★
          </button>
        </div>

        <textarea
          v-model="ratingForm.comment"
          rows="4"
          placeholder="Tuliskan pengalaman Anda..."
        ></textarea>

        <button
          class="btn btn-primary btn-full"
          type="button"
          :disabled="isSubmittingRating"
          @click="submitRating"
        >
          {{ isSubmittingRating ? 'Mengirim...' : 'Kirim Rating' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/booking'
import { apiPost } from '@/services/api'

const auth = useAuthStore()
const bookingStore = useBookingStore()

const ratingModalOpen = ref(false)
const selectedBooking = ref(null)
const isSubmittingRating = ref(false)

const ratingForm = ref({
  score: 0,
  comment: ''
})

const ratedBookingIds = ref(
  JSON.parse(localStorage.getItem('pabwRatedBookingIds') || '[]')
)

onMounted(async () => {
  if (auth.user?.id) {
    await bookingStore.syncBookingsFromBackend(auth.user.id)
  }
})

const myBookings = computed(() => {
  return [...bookingStore.getBookingsByUser(auth.user?.id)].reverse()
})

function normalizeStatus(status = '') {
  return String(status || '').toLowerCase().trim()
}

function bookingStatus(booking = {}) {
  return normalizeStatus(booking.status || booking.booking_status || booking.history_status)
}

function bookingKey(booking, index) {
  return booking.id_history || booking.id || booking.reference || index
}

function bookingReference(booking, index) {
  if (booking.reference) {
    return booking.reference
  }

  if (booking.id_history) {
    return `PABW${String(booking.id_history).padStart(6, '0')}`
  }

  return `PABW${String(index + 1).padStart(6, '0')}`
}

function bookingRoomName(booking = {}) {
  return booking.room || booking.type_room || booking.room_name || 'Kamar'
}

function bookingHotelName(booking = {}) {
  return booking.hotelName || booking.hotel_name || ''
}

function bookingHotelId(booking = {}) {
  return booking.hotelId || booking.id_list_hotel || booking.id_hotel || null
}

function bookingHistoryId(booking = {}) {
  return booking.id_history || booking.history_id || booking.id || null
}

function bookingCheckin(booking = {}) {
  return booking.checkin || booking.checkin_time || booking.checkinTime || ''
}

function bookingCheckout(booking = {}) {
  return booking.checkout || booking.checkout_time || booking.checkoutTime || ''
}

function bookingRooms(booking = {}) {
  return Number(booking.rooms || booking.jumlah_kamar || 1)
}

function bookingGuests(booking = {}) {
  const directGuest = Number(booking.guests || booking.guest_count || booking.jumlah_tamu || 0)

  if (directGuest > 0) {
    return directGuest
  }

  const rooms = bookingRooms(booking)
  const capacity = Number(booking.capacity || booking.room_capacity || 0)

  return rooms * capacity || rooms
}

function bookingNights(booking = {}) {
  const directNights = Number(booking.nights || booking.total_malam || 0)

  if (directNights > 0) {
    return directNights
  }

  const checkin = new Date(bookingCheckin(booking))
  const checkout = new Date(bookingCheckout(booking))

  if (Number.isNaN(checkin.getTime()) || Number.isNaN(checkout.getTime())) {
    return 0
  }

  const diff = Math.ceil((checkout.getTime() - checkin.getTime()) / 86400000)

  return diff > 0 ? diff : 0
}

function bookingTotal(booking = {}) {
  return Number(booking.total || booking.total_amount || booking.amount || 0)
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '-'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function isCancelledStatus(booking = {}) {
  const status = bookingStatus(booking)

  return status === 'cancelled' || status === 'canceled' || status === 'batal'
}

function statusClass(booking = {}) {
  const status = bookingStatus(booking)

  if (status === 'confirmed') {
    return 'upcoming'
  }

  if (status === 'checkin') {
    return 'ongoing'
  }

  if (status === 'checkout') {
    return 'completed'
  }

  if (isCancelledStatus(booking)) {
    return 'cancelled'
  }

  const checkout = new Date(bookingCheckout(booking))
  const checkin = new Date(bookingCheckin(booking))
  const now = new Date()

  if (!Number.isNaN(checkin.getTime()) && now < checkin) {
    return 'upcoming'
  }

  if (!Number.isNaN(checkout.getTime()) && now > checkout) {
    return 'completed'
  }

  return 'ongoing'
}

function statusLabel(booking = {}) {
  const status = bookingStatus(booking)

  if (status === 'confirmed') {
    return '🔜 Akan Datang'
  }

  if (status === 'checkin') {
    return '✅ Sedang Berlangsung'
  }

  if (status === 'checkout') {
    return '🏁 Selesai'
  }

  if (isCancelledStatus(booking)) {
    return '❌ Dibatalkan'
  }

  const className = statusClass(booking)

  const labels = {
    upcoming: '🔜 Akan Datang',
    ongoing: '✅ Sedang Berlangsung',
    completed: '🏁 Selesai',
    cancelled: '❌ Dibatalkan'
  }

  return labels[className] || 'Status Tidak Diketahui'
}

function hasRated(booking = {}) {
  if (booking.has_rating || booking.hasRated || booking.rating_score || booking.rating) {
    return true
  }

  const historyId = bookingHistoryId(booking)

  if (!historyId) {
    return false
  }

  return ratedBookingIds.value.includes(String(historyId))
}

function canGiveRating(booking = {}) {
  const status = bookingStatus(booking)

  return status === 'checkout' && !hasRated(booking)
}

function openRatingModal(booking) {
  if (!canGiveRating(booking)) {
    alert('Rating hanya dapat diberikan setelah checkout.')
    return
  }

  selectedBooking.value = booking

  ratingForm.value = {
    score: 0,
    comment: ''
  }

  ratingModalOpen.value = true
}

function closeRatingModal() {
  ratingModalOpen.value = false
  selectedBooking.value = null

  ratingForm.value = {
    score: 0,
    comment: ''
  }
}

async function submitRating() {
  if (!selectedBooking.value) {
    return
  }

  if (!canGiveRating(selectedBooking.value)) {
    alert('Rating hanya dapat diberikan setelah checkout.')
    return
  }

  if (!ratingForm.value.score) {
    alert('Pilih rating terlebih dahulu.')
    return
  }

  const hotelId = bookingHotelId(selectedBooking.value)
  const historyId = bookingHistoryId(selectedBooking.value)

  if (!hotelId || !historyId || !auth.user?.id) {
    alert('Data reservasi tidak lengkap untuk mengirim rating.')
    return
  }

  try {
    isSubmittingRating.value = true

    await apiPost(`/hotels/${hotelId}/ratings`, {
      id_user: auth.user.id,
      id_history: historyId,
      rating: ratingForm.value.score,
      comment: ratingForm.value.comment
    })

    if (!ratedBookingIds.value.includes(String(historyId))) {
      ratedBookingIds.value.push(String(historyId))
      localStorage.setItem('pabwRatedBookingIds', JSON.stringify(ratedBookingIds.value))
    }

    await bookingStore.syncBookingsFromBackend(auth.user.id)

    alert('Rating berhasil dikirim.')
    closeRatingModal()
  } catch (error) {
    alert(error.message || 'Gagal mengirim rating.')
  } finally {
    isSubmittingRating.value = false
  }
}
</script>

<style scoped>
.reservation-page {
  padding: 3rem 0;
}

.page-header {
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.3rem;
}

.page-header p {
  color: var(--text-light);
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.empty-state p {
  color: var(--text-light);
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border-left: 5px solid var(--border-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.booking-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.booking-card.upcoming {
  border-left-color: var(--accent-color);
}

.booking-card.ongoing {
  border-left-color: var(--success-color);
}

.booking-card.completed {
  border-left-color: var(--text-light);
}

.booking-card.cancelled {
  border-left-color: var(--danger-color, #dc3545);
}

.booking-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.3rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.booking-ref {
  font-size: 0.75rem;
  color: var(--text-light);
  font-weight: 600;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 0.3rem;
}

.booking-card-header h3 {
  font-size: 1.2rem;
  color: var(--primary-color);
}

.booking-hotel {
  color: var(--text-light);
  font-size: 0.88rem;
  margin-top: 0.2rem;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.upcoming {
  background: #e8f8fd;
  color: #0077b6;
}

.status-badge.ongoing {
  background: #eafaf1;
  color: var(--success-color);
}

.status-badge.completed {
  background: var(--bg-light);
  color: var(--text-light);
}

.status-badge.cancelled {
  background: #fdecec;
  color: var(--danger-color, #dc3545);
}

.booking-card-body {
  padding: 1.3rem 1.5rem;
}

.booking-dates {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.date-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text-light);
}

.date-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-color);
}

.date-divider {
  color: var(--accent-color);
  font-size: 1.3rem;
  font-weight: 300;
}

.booking-meta-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.booking-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-light);
}

.booking-total {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.booking-total span {
  font-size: 0.8rem;
  color: var(--text-light);
}

.booking-total strong {
  font-size: 1.15rem;
  color: var(--primary-color);
}

.btn-rating {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.rating-note {
  color: var(--text-light);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: right;
}

.success-note {
  color: var(--success-color);
}

.danger-note {
  color: var(--danger-color, #dc3545);
}

.rating-modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(11, 37, 69, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.rating-modal-content {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 60px rgba(11, 37, 69, 0.35);
}

.rating-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: transparent;
  font-size: 2rem;
  color: var(--text-light);
  cursor: pointer;
}

.rating-modal-content h2 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  text-align: center;
}

.rating-hotel-name {
  text-align: center;
  color: var(--primary-color);
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.rating-room-name {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.star-button {
  border: none;
  background: transparent;
  font-size: 2.2rem;
  color: #d9d9d9;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.2s ease;
}

.star-button.active {
  color: var(--accent-color);
}

.star-button:hover {
  transform: scale(1.12);
}

.rating-modal-content textarea {
  width: 100%;
  resize: vertical;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 12px;
  font-family: inherit;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.rating-modal-content textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(201, 132, 58, 0.12);
}

.btn-full {
  width: 100%;
}

.btn-full:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .booking-card-header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .booking-dates {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-divider {
    transform: rotate(90deg);
  }

  .booking-card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-note {
    text-align: left;
  }
}
</style>