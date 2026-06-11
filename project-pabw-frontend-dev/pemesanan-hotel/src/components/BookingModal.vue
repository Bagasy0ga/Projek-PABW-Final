<template>
  <div class="modal" @click.self="store.closeBookingModal">
    <div class="modal-content">
      <span class="close" @click="store.closeBookingModal">&times;</span>
      <h2>Form Pemesanan</h2>

      <div class="modal-room-info" id="modalRoomInfo">
        <h3>{{ currentRoom.name }}</h3>

        <p>
          <strong>Harga:</strong> {{ store.formatCurrency(currentRoom.price) }} per malam
          &nbsp;|&nbsp;
          <strong>Kapasitas:</strong> {{ currentRoom.capacity }} tamu/kamar
        </p>

        <p class="room-stock-info">
          <strong>Tersedia:</strong> {{ currentRoom.availableCount || 1 }} kamar
          <span v-if="currentRoom.totalRooms">
            dari {{ currentRoom.totalRooms }} total kamar
          </span>
        </p>
      </div>

      <form class="booking-form" @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>Check-In</label>
            <input
              type="date"
              v-model="form.checkin"
              :min="today"
              required
              @change="onCheckinChange"
            />
          </div>

          <div class="form-group">
            <label>Check-Out</label>
            <input
              type="date"
              v-model="form.checkout"
              :min="minCheckout"
              required
              @change="calculateTotal"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Kamar</label>

            <div class="room-count-wrapper">
              <div class="room-capacity-info">
                🛏 {{ currentRoom.name }} · tersedia {{ maxBookableRooms }} kamar · maks. {{ currentRoom.capacity }} orang/kamar
              </div>

              <select v-model.number="form.rooms">
                <option
                  v-for="n in maxBookableRooms"
                  :key="n"
                  :value="n"
                >
                  {{ n }} kamar, maks. {{ n * currentRoom.capacity }} orang
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Diskon</label>

            <select v-model="form.discount" @change="calculateTotal">
              <option value="">Tidak ada diskon</option>
              <option value="early">Pemesanan Awal 15%</option>
              <option value="seasonal">Musiman 20%</option>
              <option value="loyalty">Loyalitas 10%</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              v-model="form.fullname"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="form.email"
              placeholder="john@email.com"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Telepon</label>
            <input
              type="tel"
              v-model="form.phone"
              placeholder="+62 812 3456 7890"
              required
            />
          </div>

          <div class="form-group">
            <label>Negara</label>

            <select v-model="form.country" required>
              <option value="">Pilih Negara</option>
              <option value="ID">Indonesia</option>
              <option value="MY">Malaysia</option>
              <option value="SG">Singapura</option>
              <option value="AU">Australia</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Permintaan Khusus</label>
          <textarea
            v-model="form.requests"
            rows="3"
            placeholder="Lantai tinggi, extra bed, dll..."
          ></textarea>
        </div>

        <div class="price-summary">
          <div class="summary-row">
            <span>Tarif/malam</span>
            <span>{{ store.formatCurrency(summary.roomRate) }}</span>
          </div>

          <div class="summary-row">
            <span>Jumlah Kamar</span>
            <span>{{ summary.rooms }} kamar</span>
          </div>

          <div class="summary-row">
            <span>Kapasitas Maksimal</span>
            <span>{{ summary.guests }} tamu</span>
          </div>

          <div class="summary-row">
            <span>Jumlah Malam</span>
            <span>{{ summary.nights }}</span>
          </div>

          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ store.formatCurrency(summary.subtotal) }}</span>
          </div>

          <div class="summary-row discount-row" v-if="summary.discountAmount > 0">
            <span>Diskon</span>
            <span>{{ store.formatCurrency(summary.discountAmount) }}</span>
          </div>

          <div class="summary-row total-row">
            <span>Total</span>
            <span>{{ store.formatCurrency(summary.total) }}</span>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Memproses...' : 'Konfirmasi Pemesanan' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { apiPost } from '@/services/api'

const auth = useAuthStore()
const store = useBookingStore()

const isSubmitting = ref(false)

const currentRoom = computed(() => {
  return store.currentRoom || {}
})

const today = new Date().toISOString().split('T')[0]
const minCheckout = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])

const form = reactive({
  checkin: '',
  checkout: '',
  rooms: 1,
  discount: '',
  fullname: '',
  email: '',
  phone: '',
  country: '',
  requests: ''
})

const maxBookableRooms = computed(() => {
  const available = Number(currentRoom.value.availableCount) || 1
  return Math.max(1, available)
})

const summary = reactive({
  roomRate: 0,
  nights: 0,
  rooms: 1,
  guests: 0,
  subtotal: 0,
  discountAmount: 0,
  total: 0
})

function onCheckinChange() {
  if (!form.checkin) {
    return
  }

  const checkinDate = new Date(form.checkin)
  checkinDate.setDate(checkinDate.getDate() + 1)

  minCheckout.value = checkinDate.toISOString().split('T')[0]

  if (form.checkout && new Date(form.checkout) <= new Date(form.checkin)) {
    form.checkout = minCheckout.value
  }

  calculateTotal()
}

function calculateTotal() {
  const roomRate = Number(currentRoom.value.price) || 0
  const roomCapacity = Number(currentRoom.value.capacity) || 0

  if (Number(form.rooms) > maxBookableRooms.value) {
    form.rooms = maxBookableRooms.value
  }

  if (Number(form.rooms) < 1) {
    form.rooms = 1
  }

  const selectedRooms = Number(form.rooms) || 1
  const guests = selectedRooms * roomCapacity

  let nights = 0

  if (form.checkin && form.checkout) {
    const checkinDate = new Date(form.checkin)
    const checkoutDate = new Date(form.checkout)

    if (checkoutDate > checkinDate) {
      nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / 86400000)
    }
  }

  const discountMap = {
    early: 15,
    seasonal: 20,
    loyalty: 10
  }

  const discountPercent = discountMap[form.discount] || 0
  const subtotal = roomRate * nights * selectedRooms
  const discountAmount = subtotal * (discountPercent / 100)

  Object.assign(summary, {
    roomRate,
    nights,
    rooms: selectedRooms,
    guests,
    subtotal,
    discountAmount,
    total: subtotal - discountAmount
  })
}

function buildReservationPayload() {
  const payload = {
    id_user: auth.user.id,
    jumlah_kamar: Number(form.rooms) || 1,
    checkin_time: `${form.checkin} 00:00:00`,
    checkout_time: `${form.checkout} 00:00:00`
  }

  if (currentRoom.value.hotelId && currentRoom.value.id_detail_kamar) {
    payload.id_list_hotel = currentRoom.value.hotelId
    payload.id_detail_kamar = currentRoom.value.id_detail_kamar
    return payload
  }

  if (currentRoom.value.id_list_kamar) {
    payload.id_list_kamar = currentRoom.value.id_list_kamar
    return payload
  }

  return payload
}

function handleSubmit() {
  const checkinDate = new Date(form.checkin)
  const checkoutDate = new Date(form.checkout)
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / 86400000)

  if (nights <= 0) {
    alert('Pilih tanggal yang valid.')
    return
  }

  if (Number(form.rooms) > maxBookableRooms.value) {
    alert(`Jumlah kamar maksimal yang dapat dipesan adalah ${maxBookableRooms.value} kamar.`)
    return
  }

  if (!auth.user?.id) {
    alert('Anda harus login terlebih dahulu.')
    return
  }

  const discountNames = {
    early: 'Pemesanan Awal 15%',
    seasonal: 'Musiman 20%',
    loyalty: 'Loyalitas 10%'
  }

  const guestCount = (Number(form.rooms) || 1) * (Number(currentRoom.value.capacity) || 0)

  const saveLocalBooking = (reservationData = {}) => {
    store.saveBooking({
      id_history: reservationData.id_history,
      history_ids: reservationData.history_ids || [],
      room: reservationData.type_room || currentRoom.value.name,
      hotelId: reservationData.id_list_hotel || currentRoom.value.hotelId,
      hotelName: reservationData.hotel_name || currentRoom.value.hotelName,
      userId: auth.user?.id || null,
      ...form,
      rooms: Number(form.rooms) || 1,
      guests: guestCount,
      nights: reservationData.total_malam || nights,
      discount: discountNames[form.discount] || 'Tidak ada',
      roomRate: summary.roomRate,
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      total: reservationData.total_amount || reservationData.amount || summary.total,
      bookingDate: new Date().toISOString(),
      status: reservationData.status || 'confirmed'
    })
  }

  isSubmitting.value = true

  apiPost('/reservations/book', buildReservationPayload())
    .then(response => {
      saveLocalBooking(response?.data || {})
    })
    .catch(error => {
      alert(error.message || 'Pemesanan gagal diproses ke backend.')
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    store.closeBookingModal()
  }
}

watch(
  () => [
    form.checkin,
    form.checkout,
    form.rooms,
    form.discount,
    currentRoom.value.price,
    currentRoom.value.capacity,
    currentRoom.value.availableCount
  ],
  () => {
    calculateTotal()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'

  if (auth.user) {
    form.fullname = auth.user.name || auth.user.fullname || ''
    form.email = auth.user.email || ''
    form.phone = auth.user.phone || ''
  }

  calculateTotal()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.modal {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: fixed;
  z-index: 2000;
  inset: 0;
  background-color: rgba(11,37,69,0.75);
  backdrop-filter: blur(5px);
  animation: modalFadeIn 0.3s ease-out;
  overflow-y: auto;
  padding: 3% 0;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background-color: var(--bg-white);
  padding: 2rem;
  border-radius: 15px;
  width: 90%;
  max-width: 700px;
  position: relative;
  animation: modalSlideIn 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
  box-shadow: 0 20px 60px rgba(11,37,69,0.35);
  border-top: 4px solid var(--accent);
}

@keyframes modalSlideIn {
  from { transform: translateY(-50px) scale(0.9); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--text-light);
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close:hover {
  color: var(--accent);
  background: rgba(201,132,58,0.1);
  transform: rotate(90deg);
}

.modal-content h2 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal-room-info {
  background: linear-gradient(135deg, var(--primary), var(--navy-700));
  color: white;
  padding: 1rem 1.2rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.modal-room-info h3 {
  color: white;
  margin-bottom: 0.3rem;
}

.modal-room-info p {
  color: rgba(255,255,255,0.85);
  font-size: 0.9rem;
}

.room-stock-info {
  margin-top: 0.35rem;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-dark);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(201,132,58,0.12);
  transform: translateY(-2px);
}

.room-count-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.room-capacity-info {
  font-size: 0.78rem;
  color: var(--accent);
  background: rgba(201,132,58,0.08);
  border: 1px solid rgba(201,132,58,0.2);
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.price-summary {
  background: linear-gradient(135deg, var(--navy-50), #dde6f0);
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 1rem;
  border-left: 4px solid var(--navy-700);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.summary-row:last-child {
  border-bottom: none;
}

.discount-row {
  color: var(--success);
  font-weight: 600;
}

.total-row {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary);
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid var(--primary);
}

.btn-full {
  width: 100%;
}

.btn-full:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>