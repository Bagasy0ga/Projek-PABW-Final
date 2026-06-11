<template>
  <div v-if="isLoaded && hotel" class="hotel-detail">

    <!-- Hero -->
    <div class="detail-hero">
      <img :src="hotel.image" :alt="hotel.name" />
      <div class="detail-hero-overlay">
        <div class="container">
          <div class="detail-hero-content">
            <div class="detail-stars">
              <span v-for="i in hotel.stars" :key="i">⭐</span>
            </div>
            <h1>{{ hotel.name }}</h1>
            <p class="hotel-address-hero">📍 {{ hotel.address }}</p>
            <div class="detail-rating">
              <span class="rating-badge">{{ hotel.rating }} ★</span>
              <span>{{ hotel.reviewCount }} ulasan</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">

      <!-- Info Bar (ganti aside sticky) -->
      <div class="info-bar">
        <div class="info-bar-left">
          <div class="info-chip">
            <span class="chip-label">Mulai dari</span>
            <span class="chip-value">{{ formatCurrency(hotel.priceFrom) }}<small>/malam</small></span>
          </div>
          <div class="info-chip">
            <span class="chip-label">Rating</span>
            <span class="chip-value">{{ hotel.rating }} ★ <small>({{ hotel.reviewCount }} ulasan)</small></span>
          </div>
          <div class="info-chip">
            <span class="chip-label">Kelas</span>
            <span class="chip-value">{{ hotel.stars }} Bintang</span>
          </div>
          <div class="info-chip">
            <span class="chip-label">Tipe Kamar</span>
            <span class="chip-value">{{ hotel.rooms.length }} tipe</span>
          </div>
        </div>
        <a href="#rooms" class="btn btn-primary">Pilih Kamar ↓</a>
      </div>

      <!-- Konten utama (full width, tidak ada grid 2 kolom) -->
      <div class="detail-main">

        <!-- Deskripsi -->
        <section class="detail-section">
          <h2>Tentang Hotel</h2>
          <p>{{ hotel.description }}</p>
        </section>

        <!-- Fasilitas -->
        <section class="detail-section">
          <h2>Fasilitas</h2>

          <div v-if="hotel.facilities?.length" class="facilities-grid">
            <span
              v-for="facility in hotel.facilities"
              :key="facility"
              class="facility-tag"
            >
              {{ facility }}
            </span>
          </div>

          <p v-else class="empty-info">
            Fasilitas hotel belum diisi.
          </p>
        </section>

        <!-- Kamar Tersedia -->
        <section class="detail-section" id="rooms">
          <h2>Kamar Tersedia</h2>
          <div class="rooms-grid">
            <RoomCard
              v-for="room in hotel.rooms"
              :key="room.id"
              :room="room"
              :hotel-id="hotel.id"
              :hotel-name="hotel.name"
            />
          </div>
        </section>
      </div>
    </div>
  </div>

  <div v-else-if="isLoaded" class="not-found container">
    <p>Hotel tidak ditemukan.</p>
    <RouterLink to="/hotels" class="btn btn-primary">Kembali</RouterLink>
  </div>

  <div v-else class="not-found container">
    <p>Memuat detail hotel...</p>
  </div>

  <BookingModal v-if="bookingStore.showBookingModal" />
  <ConfirmationModal v-if="bookingStore.showConfirmationModal" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHotelStore } from '@/stores/hotel'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/booking'
import { apiPost } from '@/services/api'
import RoomCard from '@/components/RoomCard.vue'
import StarRating from '@/components/StarRating.vue'
import BookingModal from '@/components/BookingModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const route       = useRoute()
const hotelStore  = useHotelStore()
const auth        = useAuthStore()
const bookingStore = useBookingStore()
const isLoaded = ref(false)

const hotel = computed(() => hotelStore.getHotelById(route.params.id))

const myRating     = ref({ score: 0, comment: '' })
const ratingSuccess = ref(false)

onMounted(async () => {
  await hotelStore.loadHotelById(route.params.id)
  isLoaded.value = true

  if (auth.isLoggedIn && hotel.value) {
    const existing = hotelStore.getRatingByUser(hotel.value.id, auth.user.id)
    if (existing) {
      myRating.value.score   = existing.score
      myRating.value.comment = existing.comment
    }
  }
})

const totalAvailableRooms = computed(() => {
  return hotel.value?.rooms?.reduce((total, room) => {
    return total + (Number(room.availableCount) || 0)
  }, 0) || 0
})

function submitRating() {
  if (myRating.value.score === 0) return alert('Pilih bintang terlebih dahulu.')

  const booking = bookingStore.getLatestBookingForHotel(hotel.value.id)

  if (auth.user?.id && booking?.id_history) {
    apiPost('/ratings/hotel', {
      id_user: auth.user.id,
      id_list_hotel: hotel.value.id,
      id_history: booking.id_history,
      rating: myRating.value.score,
      review: myRating.value.comment
    })
      .then(() => {
        hotelStore.addRating(hotel.value.id, auth.user.id, myRating.value.score, myRating.value.comment)
        ratingSuccess.value = true
        setTimeout(() => ratingSuccess.value = false, 3000)
      })
      .catch((error) => alert(error.message || 'Gagal mengirim rating ke backend.'))
    return
  }

  hotelStore.addRating(hotel.value.id, auth.user.id, myRating.value.score, myRating.value.comment)
  ratingSuccess.value = true
  setTimeout(() => ratingSuccess.value = false, 3000)
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(amount)
</script>

<style scoped>
/* Hero */
.detail-hero {
  position: relative; height: 420px; overflow: hidden;
}
.detail-hero img {
  width: 100%; height: 100%; object-fit: cover;
}
.detail-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(11,37,69,0.88) 0%, rgba(11,37,69,0.25) 55%, transparent 100%);
  display: flex; align-items: flex-end;
}
.detail-hero-content {
  padding-bottom: 2.5rem; color: white;
}
.detail-stars { font-size: 1rem; margin-bottom: 0.5rem; }
.detail-hero-content h1 {
  font-size: 2.4rem; font-weight: 800; margin-bottom: 0.4rem;
}
.hotel-address-hero { opacity: 0.85; margin-bottom: 0.8rem; font-size: 0.95rem; }
.detail-rating { display: flex; align-items: center; gap: 0.7rem; }
.rating-badge {
  background: var(--accent-color); color: white;
  padding: 4px 12px; border-radius: 20px;
  font-weight: 700; font-size: 0.9rem;
}

/* Container */
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* ── INFO BAR (pengganti aside sticky) ── */
.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: white;
  border-radius: 16px;
  padding: 1.2rem 1.8rem;
  margin: 2rem 0;
  box-shadow: var(--shadow);
  border-left: 5px solid var(--accent-color);
}

.info-bar-left {
  display: flex; gap: 2rem; flex-wrap: wrap; align-items: center;
}

.info-chip {
  display: flex; flex-direction: column; gap: 2px;
}

.chip-label {
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  color: var(--text-light);
}

.chip-value {
  font-size: 1.05rem; font-weight: 700; color: var(--primary-color);
}

.chip-value small {
  font-size: 0.8rem; font-weight: 400; color: var(--text-light); margin-left: 2px;
}

/* Divider vertikal antar chip */
.info-chip + .info-chip {
  padding-left: 2rem;
  border-left: 1px solid var(--border-color);
}

/* Main content */
.detail-main { padding-bottom: 4rem; }

.detail-section { margin-bottom: 3rem; }

.detail-section h2 {
  font-size: 1.4rem; color: var(--primary-color);
  margin-bottom: 1rem; padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.detail-section > p {
  color: var(--text-light); line-height: 1.9; font-size: 0.97rem;
}

/* Fasilitas */
.facilities-grid { display: flex; flex-wrap: wrap; gap: 0.7rem; }

.facility-tag {
  background: var(--bg-light); padding: 6px 16px;
  border-radius: 25px; font-size: 0.88rem;
  color: var(--text-dark); border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.facility-tag:hover {
  background: var(--primary-color); color: white; border-color: var(--primary-color);
}

.empty-info {
  color: var(--text-light);
  font-size: 0.95rem;
}

/* Rooms */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Rating */
.rating-form { display: flex; flex-direction: column; gap: 1rem; max-width: 500px; }

.rating-form textarea {
  padding: 12px; border: 2px solid var(--border-color);
  border-radius: 8px; font-family: inherit; font-size: 0.95rem;
  resize: vertical; transition: border-color 0.3s;
}

.rating-form textarea:focus {
  outline: none; border-color: var(--accent-color);
}

.success-msg {
  color: var(--success-color); font-weight: 600; font-size: 0.9rem;
}

.rating-login-prompt { color: var(--text-light); }
.rating-login-prompt a { color: var(--accent-color); font-weight: 600; }

/* Not found */
.not-found { text-align: center; padding: 5rem 0; }

/* Responsive */
@media (max-width: 768px) {
  .detail-hero { height: 280px; }
  .detail-hero-content h1 { font-size: 1.7rem; }

  .info-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.2rem;
  }

  .info-bar-left { gap: 1.2rem; }

  .info-chip + .info-chip {
    padding-left: 1.2rem;
  }

  .info-bar .btn { width: 100%; text-align: center; }

  .rooms-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .info-bar-left { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
  .info-chip + .info-chip { padding-left: 0; border-left: none; border-top: 1px solid var(--border-color); padding-top: 0.8rem; }
}
</style>