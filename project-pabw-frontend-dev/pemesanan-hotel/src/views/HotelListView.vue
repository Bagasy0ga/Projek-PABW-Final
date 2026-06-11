<template>
  <section class="hotel-list-page">
    <div class="container">
      <div class="page-header">
        <h1>Semua Hotel Mitra</h1>

        <p v-if="loading">
          Memuat data hotel...
        </p>

        <p v-else>
          {{ filtered.length }} hotel ditemukan
        </p>
      </div>

      <div class="filter-panel">
        <div class="filter-group">
          <label>🏙 Kota</label>

          <select v-model="filter.city" class="select-input">
            <option value="">Semua Kota</option>

            <option
              v-for="city in cities"
              :key="city"
              :value="city"
            >
              {{ city }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>⭐ Bintang</label>

          <select v-model.number="filter.stars" class="select-input">
            <option :value="0">Semua</option>
            <option :value="3">3 Bintang</option>
            <option :value="4">4 Bintang</option>
            <option :value="5">5 Bintang</option>
          </select>
        </div>

        <div class="filter-group">
          <label>💰 Urutkan</label>

          <select v-model="filter.sort" class="select-input">
            <option value="rating">Rating Tertinggi</option>
            <option value="price_asc">Harga Termurah</option>
            <option value="price_desc">Harga Termahal</option>
          </select>
        </div>

        <button class="btn btn-secondary" type="button" @click="resetFilter">
          Reset
        </button>
      </div>

      <div v-if="loading" class="empty-state">
        <p>Memuat hotel dari database...</p>
      </div>

      <div v-else-if="filtered.length > 0" class="hotels-grid">
        <HotelCard
          v-for="hotel in filtered"
          :key="hotel.id"
          :hotel="hotel"
        />
      </div>

      <div v-else class="empty-state">
        <p>😕 Tidak ada hotel yang cocok dengan filter Anda.</p>

        <button class="btn btn-primary" type="button" @click="resetFilter">
          Reset Filter
        </button>
      </div>
    </div>

    <button
      class="llm-floating-button"
      type="button"
      @click="openLlmPanel"
      aria-label="Buka rekomendasi hotel AI"
    >
      🤖
      <span>Rekomendasi AI</span>
    </button>

    <div
      v-if="llmPanelOpen"
      class="llm-overlay"
      @click.self="closeLlmPanel"
    >
      <div class="llm-panel">
        <button
          class="llm-close"
          type="button"
          @click="closeLlmPanel"
        >
          &times;
        </button>

        <div class="llm-header">
          <h2>Rekomendasi Hotel AI</h2>

          <p>
            Tulis kebutuhan Anda. Sistem akan mencari hotel yang punya kamar tersedia dari database, lalu memberi rekomendasi hotel.
          </p>
        </div>

        <div class="llm-example-list">
          <button
            type="button"
            @click="setPrompt('Saya ingin hotel murah untuk 2 orang di Lombok, budget maksimal 900000, dengan WiFi dan parkir.')"
          >
            Hotel murah untuk 2 orang
          </button>

          <button
            type="button"
            @click="setPrompt('Rekomendasikan hotel keluarga untuk 4 orang di pulau Jawa dengan fasilitas WiFi.')"
          >
            Hotel keluarga
          </button>

          <button
            type="button"
            @click="setPrompt('Saya butuh hotel terbaik berdasarkan rating, harga masih masuk akal, untuk 2 tamu.')"
          >
            Rating terbaik
          </button>
        </div>

        <div class="llm-form">
          <label>Prompt</label>

          <textarea
            v-model="llmPrompt"
            rows="5"
            placeholder="Contoh: Saya ingin hotel di Kalimantan untuk keluarga 4 orang, budget maksimal Rp 900.000 per malam, fasilitas WiFi dan parkir."
          ></textarea>

          <button
            type="button"
            class="btn btn-primary btn-full"
            :disabled="llmLoading || !llmPrompt.trim()"
            @click="askHotelRecommendation"
          >
            {{ llmLoading ? 'Memproses...' : 'Cari Rekomendasi' }}
          </button>
        </div>

        <div v-if="llmError" class="llm-error">
          {{ llmError }}
        </div>

        <div v-if="llmAnswer" class="llm-answer">
          <h3>Hasil Rekomendasi</h3>
          <p>{{ llmAnswer }}</p>
        </div>

        <div v-if="llmRecommendedHotels.length > 0" class="llm-recommendation-list">
          <h3>Hotel yang Direkomendasikan</h3>

          <RouterLink
            v-for="hotel in llmRecommendedHotels"
            :key="hotel.id"
            :to="`/hotels/${hotel.id}`"
            class="llm-hotel-item"
            @click="closeLlmPanel"
          >
            <img :src="hotel.image" :alt="hotel.name" />

            <div>
              <strong>{{ hotel.name }}</strong>

              <span>
                {{ hotel.location || hotel.city }}
              </span>

              <small>
                Mulai {{ formatCurrency(hotel.priceFrom) }} per malam
              </small>

              <p v-if="hotel.availableRoomCount" class="llm-hotel-meta">
                {{ hotel.availableRoomCount }} kamar tersedia
              </p>

              <p v-if="hotel.availableRoomTypes" class="llm-hotel-meta">
                Tipe kamar: {{ hotel.availableRoomTypes }}
              </p>

              <p v-if="hotel.maxCapacity" class="llm-hotel-meta">
                Kapasitas maksimal {{ hotel.maxCapacity }} tamu
              </p>

              <p v-if="hotel.score" class="llm-hotel-score">
                Skor rekomendasi {{ hotel.score }}
              </p>

              <p v-if="hotel.reason" class="llm-hotel-reason">
                {{ hotel.reason }}
              </p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useHotelStore } from '@/stores/hotel'
import HotelCard from '@/components/HotelCard.vue'
import { apiPost } from '@/services/api'

const hotelStore = useHotelStore()
const route = useRoute()

const loading = ref(true)

const filter = ref({
  city: '',
  stars: 0,
  sort: 'rating'
})

const llmPanelOpen = ref(false)
const llmPrompt = ref('')
const llmLoading = ref(false)
const llmError = ref('')
const llmAnswer = ref('')
const llmRecommendedHotels = ref([])

onMounted(async () => {
  if (route.query.city) {
    filter.value.city = route.query.city
  }

  await hotelStore.loadHotels(true)

  loading.value = false
})

const cities = computed(() => {
  const cityList = hotelStore.hotels
    .map(hotel => hotel.city)
    .filter(Boolean)

  return [...new Set(cityList)]
})

const filtered = computed(() => {
  let list = [...hotelStore.hotels]

  if (filter.value.city) {
    list = list.filter(hotel => hotel.city === filter.value.city)
  }

  if (Number(filter.value.stars) > 0) {
    list = list.filter(hotel => Number(hotel.stars) === Number(filter.value.stars))
  }

  if (filter.value.sort === 'rating') {
    list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
  }

  if (filter.value.sort === 'price_asc') {
    list.sort((a, b) => Number(a.priceFrom || 0) - Number(b.priceFrom || 0))
  }

  if (filter.value.sort === 'price_desc') {
    list.sort((a, b) => Number(b.priceFrom || 0) - Number(a.priceFrom || 0))
  }

  return list
})

function resetFilter() {
  filter.value = {
    city: '',
    stars: 0,
    sort: 'rating'
  }
}

function openLlmPanel() {
  llmPanelOpen.value = true
  llmError.value = ''
}

function closeLlmPanel() {
  llmPanelOpen.value = false
}

function setPrompt(prompt) {
  llmPrompt.value = prompt
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount) || 0)
}

function mapBackendHotelToRecommendation(item) {
  const matchedHotel = hotelStore.hotels.find(hotel => {
    return Number(hotel.id) === Number(item.id_list_hotel)
  })

  return {
    id: item.id_list_hotel,

    name: item.hotel_name || matchedHotel?.name || 'Hotel',
    hotelName: item.hotel_name || matchedHotel?.name || 'Hotel',

    location: item.location || matchedHotel?.address || '',
    city: matchedHotel?.city || item.location || '',

    image: matchedHotel?.image || '/images/hotel-1.jpg',

    priceFrom: Number(item.price_from || item.min_price || 0),
    minPrice: Number(item.min_price || item.price_from || 0),
    maxPrice: Number(item.max_price || 0),

    availableRoomCount: Number(item.available_room_count || 0),
    availableRoomTypes: item.available_room_types || '',
    maxCapacity: Number(item.max_capacity || 0),

    avgRating: Number(item.avg_rating || 0),
    totalRating: Number(item.total_rating || 0),

    score: Number(item.score || 0),
    reason: item.reason || '',

    originalHotel: matchedHotel || null
  }
}

async function askHotelRecommendation() {
  if (!llmPrompt.value.trim()) {
    return
  }

  llmLoading.value = true
  llmError.value = ''
  llmAnswer.value = ''
  llmRecommendedHotels.value = []

  try {
    const response = await apiPost('/llm/recommendations/hotel', {
      prompt: llmPrompt.value,
      limit: 30
    })

    const result = response?.data || {}

    const recommendedHotels = Array.isArray(result.recommended_hotels)
      ? result.recommended_hotels
      : []

    llmAnswer.value = result.summary || response?.message || 'Rekomendasi berhasil dibuat.'
    llmRecommendedHotels.value = recommendedHotels.map(mapBackendHotelToRecommendation)

    if (llmRecommendedHotels.value.length === 0) {
      llmError.value = 'Tidak ada hotel yang direkomendasikan dari database.'
    }
  } catch (error) {
    llmRecommendedHotels.value = []
    llmAnswer.value = ''
    llmError.value = error.message || 'Request rekomendasi gagal. Pastikan backend, database, dan Ollama sedang berjalan.'
    console.error('Gagal meminta rekomendasi LLM:', error)
  } finally {
    llmLoading.value = false
  }
}
</script>

<style scoped>
.hotel-list-page {
  padding: 3rem 0;
  position: relative;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--primary);
}

.page-header p {
  color: var(--text-light);
}

.filter-panel {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 2.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-width: 140px;
}

.filter-group label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.select-input {
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.3s ease;
}

.select-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(0,180,216,0.12);
}

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-light);
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.llm-floating-button {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1500;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--navy-700));
  color: white;
  padding: 0.9rem 1.1rem;
  border-radius: 999px;
  box-shadow: 0 12px 35px rgba(11, 37, 69, 0.35);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 800;
  letter-spacing: 0.5px;
  transition: all 0.25s ease;
}

.llm-floating-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 45px rgba(11, 37, 69, 0.42);
}

.llm-floating-button span {
  font-size: 0.9rem;
}

.llm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(11, 37, 69, 0.75);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

.llm-panel {
  width: min(500px, 100%);
  height: 100%;
  background: white;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.18);
  animation: llmSlideIn 0.25s ease;
}

@keyframes llmSlideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.llm-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 2rem;
  cursor: pointer;
}

.llm-header {
  padding-right: 2rem;
  margin-bottom: 1.2rem;
}

.llm-header h2 {
  color: var(--primary);
  margin-bottom: 0.4rem;
}

.llm-header p {
  color: var(--text-light);
  font-size: 0.92rem;
  line-height: 1.6;
}

.llm-example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.llm-example-list button {
  border: 1px solid var(--border);
  background: var(--bg-light);
  color: var(--text-dark);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.llm-example-list button:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.llm-form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.llm-form label {
  font-weight: 700;
  color: var(--primary);
}

.llm-form textarea {
  width: 100%;
  resize: vertical;
  min-height: 130px;
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  font-family: inherit;
  font-size: 0.95rem;
}

.llm-form textarea:focus {
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

.llm-error {
  margin-top: 1rem;
  background: #fff8e6;
  border: 1px solid #f1d08a;
  color: #8a5a00;
  padding: 0.8rem;
  border-radius: 10px;
  font-size: 0.88rem;
  line-height: 1.5;
}

.llm-answer {
  margin-top: 1.3rem;
  background: var(--bg-light);
  border-left: 4px solid var(--accent-color);
  border-radius: 10px;
  padding: 1rem;
}

.llm-answer h3 {
  color: var(--primary);
  margin-bottom: 0.4rem;
}

.llm-answer p {
  color: var(--text-dark);
  line-height: 1.6;
}

.llm-recommendation-list {
  margin-top: 1.3rem;
}

.llm-recommendation-list h3 {
  color: var(--primary);
  margin-bottom: 0.8rem;
}

.llm-hotel-item {
  display: flex;
  gap: 0.8rem;
  text-decoration: none;
  color: inherit;
  padding: 0.8rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 0.7rem;
  transition: all 0.2s ease;
}

.llm-hotel-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  border-color: var(--accent-color);
}

.llm-hotel-item img {
  width: 82px;
  height: 74px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

.llm-hotel-item div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.llm-hotel-item strong {
  color: var(--primary);
}

.llm-hotel-item span {
  color: var(--text-light);
  font-size: 0.85rem;
}

.llm-hotel-item small {
  color: var(--accent-color);
  font-weight: 700;
}

.llm-hotel-meta {
  color: var(--text-dark);
  font-size: 0.8rem;
  margin-top: 0.1rem;
}

.llm-hotel-score {
  color: var(--success-color);
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 0.1rem;
}

.llm-hotel-reason {
  color: var(--text-light);
  font-size: 0.78rem;
  line-height: 1.4;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .filter-panel {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .hotels-grid {
    grid-template-columns: 1fr;
  }

  .llm-floating-button {
    right: 1rem;
    bottom: 1rem;
    padding: 0.85rem;
  }

  .llm-floating-button span {
    display: none;
  }

  .llm-panel {
    width: 100%;
  }
}
</style>