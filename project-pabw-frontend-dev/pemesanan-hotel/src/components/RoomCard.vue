<template>
  <div :class="['room-card', { featured: room.featured }]">
    <div class="room-image">
      <img v-if="room.image" :src="room.image" :alt="room.name" loading="lazy" />

      <div v-else class="room-image-placeholder">
        Gambar kamar belum tersedia
      </div>

      <span v-if="room.featured" class="featured-badge">⭐ Unggulan</span>
      <span v-if="room.status === 'unavailable'" class="unavailable-badge">Tidak Tersedia</span>
    </div>

    <div class="room-content">
      <h3>{{ room.name }}</h3>

      <div class="room-stock">
        <span>{{ room.availableCount }} kamar tersedia</span>
        <small>dari {{ room.totalRooms }} kamar</small>
      </div>

      <div class="room-price">
        <span class="price-amount">{{ formatCurrency(room.price) }}</span>
        <span class="price-period"> / malam</span>
      </div>

      <p class="room-description">
        {{ room.description || 'Deskripsi kamar belum tersedia.' }}
      </p>

      <div class="room-detail-grid">
        <div>
          <strong>Kapasitas</strong>
          <span>{{ room.capacity }} tamu/kamar</span>
        </div>

        <div>
          <strong>Tidak tersedia</strong>
          <span>{{ room.unavailableCount }} kamar</span>
        </div>
      </div>

      <ul v-if="room.facilities?.length" class="room-facilities">
        <li v-for="facility in room.facilities" :key="facility">
          {{ facility }}
        </li>
      </ul>

      <p v-else class="empty-facilities">
        Fasilitas kamar belum diisi.
      </p>

      <button
        class="btn btn-primary book-btn"
        @click="openBooking"
        :disabled="room.availableCount <= 0"
      >
        {{ room.availableCount <= 0 ? 'Tidak Tersedia' : 'Pesan Sekarang' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  room: { type: Object, required: true },
  hotelId: { type: Number, default: null },
  hotelName: { type: String, default: '' }
})

const store = useBookingStore()
const auth = useAuthStore()
const router = useRouter()

function openBooking() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  store.setRoom({
    name: props.room.name,
    price: props.room.price,
    capacity: props.room.capacity,

    hotelId: props.hotelId,
    hotelName: props.hotelName,

    id_list_kamar: props.room.id_list_kamar,
    id_detail_kamar: props.room.id_detail_kamar,

    availableCount: props.room.availableCount,
    totalRooms: props.room.totalRooms,
    unavailableCount: props.room.unavailableCount,
    availableRoomIds: props.room.availableRoomIds || []
  })
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
</script>

<style scoped>
.room-card {
  background-color: var(--bg-white); border-radius: 15px;
  overflow: hidden; box-shadow: var(--shadow);
  transition: all 0.4s cubic-bezier(0.68,-0.55,0.265,1.55);
  display: flex; flex-direction: column;
  animation: cardFadeIn 0.6s ease-out;
}

@keyframes cardFadeIn {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.room-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 15px 40px rgba(11,37,69,0.2); }

.room-card.featured { border: 3px solid var(--amber-500); box-shadow: 0 8px 25px rgba(201,132,58,0.25); }

.room-image { position: relative; height: 220px; overflow: hidden; }

.room-image img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.68,-0.55,0.265,1.55);
}

.room-card:hover .room-image img { transform: scale(1.12) rotate(1deg); }

.room-image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-light);
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
}

.discount-badge, .featured-badge, .unavailable-badge {
  position: absolute; top: 12px; right: 12px;
  padding: 6px 14px; border-radius: 25px; font-size: 0.82rem;
  font-weight: 700; text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); backdrop-filter: blur(5px);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%,100% { transform: scale(1); } 50% { transform: scale(1.07); }
}

.discount-badge.early-bird { background: linear-gradient(135deg, var(--accent), #0077b6); color: white; }
.discount-badge.seasonal { background: linear-gradient(135deg, var(--navy-700), var(--primary)); color: white; }
.discount-badge.loyalty { background: linear-gradient(135deg, var(--amber-500), #a07830); color: white; }
.featured-badge { background: linear-gradient(135deg, var(--amber-500), #a07830); color: white; }
.unavailable-badge { background: rgba(0,0,0,0.6); color: white; animation: none; }

.room-content {
  padding: 1.3rem; display: flex; flex-direction: column; flex-grow: 1;
}

.room-content h3 { font-size: 1.4rem; color: var(--primary); margin-bottom: 0.7rem; }

.room-price { margin-bottom: 0.8rem; }

.price-amount {
  font-size: 1.7rem; font-weight: 700;
  background: linear-gradient(135deg, var(--navy-700), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.price-period { color: var(--text-light); font-size: 0.95rem; }

.room-description { color: var(--text-light); margin-bottom: 0.9rem; font-size: 0.9rem; line-height: 1.6; }

.room-facilities {
  list-style: none; margin-bottom: 1.2rem;
  display: grid; grid-template-columns: repeat(2,1fr); gap: 0.4rem; flex-grow: 1;
}

.room-facilities li {
  color: var(--text-dark); font-size: 0.85rem; padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.room-facilities li:hover { transform: translateX(6px); color: var(--accent); }

.empty-facilities {
  color: var(--text-light);
  font-size: 0.85rem;
  margin-bottom: 1.2rem;
  flex-grow: 1;
}

.book-btn { width: 100%; margin-top: auto; }

.book-btn:disabled {
  background: var(--text-light); box-shadow: none;
  cursor: not-allowed; transform: none;
}

.room-stock {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 0.7rem;
  color: var(--accent);
  font-weight: 700;
}

.room-stock small {
  color: var(--text-light);
  font-weight: 500;
}

.room-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.room-detail-grid div {
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.7rem;
}

.room-detail-grid strong {
  display: block;
  font-size: 0.78rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.room-detail-grid span {
  font-weight: 700;
  color: var(--primary);
}

.room-facilities {
  list-style: none;
  margin-bottom: 1.2rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  flex-grow: 1;
}

.room-facilities li {
  color: var(--text-dark);
  font-size: 0.85rem;
  padding: 0.25rem 0;
}

.empty-facilities {
  color: var(--text-light);
  font-size: 0.85rem;
  margin-bottom: 1.2rem;
  flex-grow: 1;
}

.room-image-placeholder {
  width: 100%;
  height: 100%;
  background: #e8eef5;
  color: #0b2545;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 480px) {
  .room-detail-grid {
    grid-template-columns: 1fr;
  }

  .room-facilities {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .room-facilities { grid-template-columns: 1fr; }
}
</style>