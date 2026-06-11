<template>
  <section class="rooms-page">
    <div class="container">
      <div class="section-header">
        <h2>Semua Kamar</h2>
        <p>Pilih kamar yang paling sesuai untuk Anda</p>
      </div>

      <div class="filter-bar">
        <label>Filter kapasitas:</label>
        <select v-model="capacityFilter" class="select-input">
          <option :value="0">Semua</option>
          <option :value="1">1+ Tamu</option>
          <option :value="2">2+ Tamu</option>
          <option :value="3">3+ Tamu</option>
          <option :value="4">4+ Tamu</option>
        </select>
      </div>

      <p v-if="loading" class="no-rooms">
        Memuat data kamar...
      </p>

      <div v-else class="rooms-grid">
        <RoomCard
          v-for="room in filteredRooms"
          :key="room.id"
          :room="room"
          :hotel-id="room.hotelId"
          :hotel-name="room.hotelName"
        />
      </div>

      <p v-if="!loading && filteredRooms.length === 0" class="no-rooms">
        Tidak ada kamar untuk kapasitas tersebut.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RoomCard from '@/components/RoomCard.vue'
import { useHotelStore } from '@/stores/hotel'

const hotelStore = useHotelStore()
const capacityFilter = ref(0)
const loading = ref(true)

onMounted(async () => {
  await hotelStore.loadHotels(true)
  loading.value = false
})

const rooms = computed(() => {
  return hotelStore.hotels.flatMap(hotel => {
    return hotel.rooms.map(room => ({
      ...room,
      hotelId: hotel.id,
      hotelName: hotel.name
    }))
  })
})

const filteredRooms = computed(() => {
  if (capacityFilter.value === 0) {
    return rooms.value
  }

  return rooms.value.filter(room => room.capacity >= capacityFilter.value)
})
</script>

<style scoped>
.rooms-page { padding: 4rem 0; }

.section-header { text-align: center; margin-bottom: 2rem; }
.section-header h2 { font-size: 2.5rem; color: var(--primary); margin-bottom: 0.5rem; }
.section-header p { font-size: 1.1rem; color: var(--text-light); }

.filter-bar {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 2rem; justify-content: flex-end;
}

.filter-bar label { font-weight: 600; color: var(--text-dark); }

.select-input {
  padding: 10px 16px; border: 2px solid var(--border);
  border-radius: 8px; font-size: 1rem;
  transition: all 0.3s ease; background: white;
}

.select-input:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(201,132,58,0.12);
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.no-rooms { text-align: center; color: var(--text-light); padding: 2rem; font-size: 1.1rem; }

@media (max-width: 768px) {
  .rooms-grid { grid-template-columns: 1fr; }
  .filter-bar { justify-content: flex-start; }
}
</style>