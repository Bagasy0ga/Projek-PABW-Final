import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiGet, apiPost, apiDelete } from '@/services/api'

function mapMitraRow(row) {
  return {
    id: row.id_company_profile,
    name: row.company_name,
    email: row.email,
    phone: row.phone_number,
    hotel: row.hotel_name || row.company_name,
    status: 'aktif',
    joinDate: new Date().toISOString().split('T')[0]
  }
}

function mapReservationRow(row, index) {
  const checkin = row.checkin_time ? new Date(row.checkin_time) : null
  const checkout = row.checkout_time ? new Date(row.checkout_time) : null
  const nights = checkin && checkout
    ? Math.max(1, Math.ceil((checkout - checkin) / 86400000))
    : 1

  return {
    id: row.id_history || index + 1,
    ref: String(row.id_history || '').padStart(8, '0'),
    fullname: row.user_name,
    email: row.user_email,
    hotelName: row.hotel_name,
    hotelId: row.id_list_hotel,
    room: row.type_room || row.room_number,
    checkin: row.checkin_time,
    checkout: row.checkout_time,
    nights,
    total: Number(row.amount) || 0,
    status: row.status
  }
}

export const useAdminStore = defineStore('admin', () => {
  const mitraList = ref([])
  const allReservations = ref([])
  const loading = ref(false)

  const totalMitra = computed(() => mitraList.value.length)
  const totalReservasi = computed(() => allReservations.value.length)

  async function loadMitraList() {
    const response = await apiGet('/mitra')
    const rows = Array.isArray(response?.data) ? response.data : []
    mitraList.value = rows.map(mapMitraRow)
    return mitraList.value
  }

  async function loadAllReservations() {
    const response = await apiGet('/reservations?limit=200&offset=0')
    const rows = Array.isArray(response?.data) ? response.data : []
    allReservations.value = rows.map(mapReservationRow)
    return allReservations.value
  }

  async function loadDashboardData() {
    loading.value = true
    try {
      await Promise.all([loadMitraList(), loadAllReservations()])
    } finally {
      loading.value = false
    }
  }

  async function tambahMitra(data) {
    if (!data.name || !data.email || !data.phone || !data.hotel || !data.password) {
      return { success: false, message: 'Semua field wajib diisi.' }
    }

    try {
      const username = data.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
      await apiPost('/mitra', {
        company_name: data.name.trim(),
        address: data.hotel.trim(),
        phone_number: data.phone.trim(),
        email: data.email.trim(),
        username,
        password: data.password
      })

      await loadMitraList()
      return { success: true, message: 'Mitra baru berhasil ditambahkan!' }
    } catch (error) {
      return { success: false, message: error.message || 'Gagal menambahkan mitra.' }
    }
  }

  function editMitra(id, data) {
    const idx = mitraList.value.findIndex(m => m.id === id)
    if (idx === -1) return { success: false, message: 'Mitra tidak ditemukan.' }

    if (mitraList.value.find(m => m.email === data.email && m.id !== id)) {
      return { success: false, message: 'Email sudah digunakan oleh mitra lain.' }
    }

    mitraList.value[idx] = {
      ...mitraList.value[idx],
      name: data.name,
      email: data.email,
      phone: data.phone,
      hotel: data.hotel.trim(),
      status: data.status ?? mitraList.value[idx].status
    }

    return {
      success: true,
      message: 'Data mitra diperbarui di tampilan. Perubahan detail mitra di server belum didukung API.'
    }
  }

  async function hapusMitra(id) {
    try {
      await apiDelete(`/mitra/${id}`)
      await loadMitraList()
      return { success: true, message: 'Mitra berhasil dihapus.' }
    } catch (error) {
      return { success: false, message: error.message || 'Mitra tidak dapat dihapus.' }
    }
  }

  function getReservasiByHotel(hotelId) {
    if (!hotelId) return []
    return allReservations.value.filter(r => r.hotelId === parseInt(hotelId))
  }

  return {
    mitraList,
    allReservations,
    loading,
    totalMitra,
    totalReservasi,
    loadMitraList,
    loadAllReservations,
    loadDashboardData,
    tambahMitra,
    editMitra,
    hapusMitra,
    getReservasiByHotel
  }
})
