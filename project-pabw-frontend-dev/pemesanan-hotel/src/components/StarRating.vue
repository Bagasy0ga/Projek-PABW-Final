<template>
  <div class="star-rating">
    <button
      v-for="i in 5" :key="i"
      class="star"
      :class="{ active: i <= (hovered || modelValue), filled: i <= modelValue }"
      @mouseenter="hovered = i"
      @mouseleave="hovered = 0"
      @click="$emit('update:modelValue', i)"
      type="button"
    >★</button>
    <span class="score-label" v-if="modelValue > 0">{{ labels[modelValue - 1] }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ modelValue: { type: Number, default: 0 } })
defineEmits(['update:modelValue'])

const hovered = ref(0)
const labels = ['Buruk', 'Kurang', 'Cukup', 'Bagus', 'Luar Biasa']
</script>

<style scoped>
.star-rating { display: flex; align-items: center; gap: 0.3rem; }

.star {
  background: none; border: none; cursor: pointer;
  font-size: 2rem; color: #ddd; transition: all 0.15s ease;
  line-height: 1;
}

.star.active { color: #f4c430; transform: scale(1.2); }
.star.filled { color: #f4c430; }

.score-label {
  margin-left: 0.5rem; color: var(--text-dark);
  font-weight: 600; font-size: 0.95rem;
}
</style>