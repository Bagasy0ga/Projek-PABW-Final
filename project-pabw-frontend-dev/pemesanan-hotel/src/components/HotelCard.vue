<template>
  <RouterLink :to="`/hotels/${hotel.id}`" class="hotel-card">
    <div class="hotel-image">
      <img :src="hotel.image" :alt="hotel.name" loading="lazy" />
      <div class="hotel-stars">
        <span v-for="i in hotel.stars" :key="i">⭐</span>
      </div>
      <div class="hotel-city">📍 {{ hotel.city }}</div>
    </div>
    <div class="hotel-body">
      <h3>{{ hotel.name }}</h3>
      <p class="hotel-address">{{ hotel.address }}</p>
      <p class="hotel-desc">{{ hotel.description.slice(0, 100) }}...</p>
      <div v-if="hotel.facilities?.length" class="hotel-facilities">
        <span v-for="facility in hotel.facilities.slice(0, 4)" :key="facility">
          {{ facility }}
        </span>
      </div>
      <div class="hotel-footer">
        <div class="hotel-rating">
          <span class="rating-score">{{ hotel.rating }}</span>
          <span class="rating-stars">★★★★★</span>
          <span class="rating-count">({{ hotel.reviewCount }} ulasan)</span>
        </div>
        <div class="hotel-price">
          <span class="price-label">Mulai dari</span>
          <span class="price-value">{{ formatCurrency(hotel.priceFrom) }}</span>
          <span class="price-night">/malam</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
defineProps({ hotel: { type: Object, required: true } })

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
</script>

<style scoped>
.hotel-card {
  display: flex; flex-direction: column;
  background: var(--bg-white); border-radius: 16px;
  overflow: hidden; box-shadow: var(--shadow);
  text-decoration: none; color: inherit;
  transition: all 0.35s cubic-bezier(0.68,-0.55,0.265,1.55);
  animation: cardIn 0.5s ease-out;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hotel-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 20px 50px rgba(11,37,69,0.18); }

.hotel-image { position: relative; height: 220px; overflow: hidden; }

.hotel-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }

.hotel-card:hover .hotel-image img { transform: scale(1.1); }

.hotel-stars {
  position: absolute; top: 12px; left: 12px;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem;
}

.hotel-city {
  position: absolute; bottom: 12px; left: 12px;
  background: rgba(11,37,69,0.8); backdrop-filter: blur(4px);
  color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
}

.hotel-body { padding: 1.3rem; display: flex; flex-direction: column; flex-grow: 1; }

.hotel-body h3 { font-size: 1.3rem; color: var(--primary); margin-bottom: 0.3rem; }

.hotel-address { color: var(--text-light); font-size: 0.82rem; margin-bottom: 0.6rem; }

.hotel-desc { color: var(--text-light); font-size: 0.88rem; line-height: 1.5; margin-bottom: 1rem; flex-grow: 1; }

.hotel-facilities { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }

.hotel-facilities span {
  background: var(--navy-50); color: var(--text-dark);
  padding: 3px 10px; border-radius: 20px; font-size: 0.78rem;
}

.hotel-footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--border); padding-top: 0.8rem; }

.hotel-rating { display: flex; align-items: center; gap: 0.3rem; }

.rating-score { background: var(--primary); color: white; font-weight: 700; font-size: 0.85rem; padding: 2px 8px; border-radius: 6px; }

.rating-stars { color: #f4c430; font-size: 0.75rem; }

.rating-count { color: var(--text-light); font-size: 0.78rem; }

.hotel-price { text-align: right; }

.price-label { display: block; color: var(--text-light); font-size: 0.75rem; }

.price-value {
  font-size: 1.1rem; font-weight: 700;
  background: linear-gradient(135deg, var(--navy-700), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.price-night { color: var(--text-light); font-size: 0.78rem; }
</style>