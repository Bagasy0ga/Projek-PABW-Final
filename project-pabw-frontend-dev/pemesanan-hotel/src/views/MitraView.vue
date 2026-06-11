<template>
<div class="mitra-page">
<aside class="sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
<div class="sidebar-header">
<div class="brand"><span class="brand-icon">⬡</span><span class="brand-text">PABW<b>Mitra</b></span></div>
</div>
<nav class="sidebar-nav">
<button v-for="item in navItems" :key="item.id" :class="['nav-item', { active: activeTab === item.id }]" @click="navTo(item.id)">
<span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ item.label }}</span>
</button>
</nav>
<div class="sidebar-footer">
<div class="admin-badge"><span class="badge-avatar">M</span><div class="badge-info"><span class="badge-name">{{ mitraData.company_name }}</span><span class="badge-role">Mitra</span></div></div>
</div>
</aside>
<div class="sidebar-overlay" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = false"></div>

<main class="admin-main">
<header class="topbar">
<div class="topbar-left">
<button class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen"><span></span><span></span><span></span></button>
<div><h1 class="page-title">{{ currentPageTitle }}</h1><span class="page-breadcrumb">Mitra / {{ currentPageTitle }}</span></div>
</div>
<div class="topbar-right">
<div class="stat-pill"><span>{{ dashboardStats.totalReservasi }} Reservasi</span></div>
<div class="stat-pill hide-xs"><span>{{ dashboardStats.kamarTersedia }} Kamar</span></div>
</div>
</header>

<!-- DASHBOARD -->
<section v-if="activeTab === 'dashboard'" class="tab-content">
<div class="stats-grid">
<div class="stat-card" v-for="s in statCards" :key="s.label"><div :class="['stat-card-icon', s.cls]">{{ s.icon }}</div><div class="stat-card-info"><span class="stat-card-num">{{ s.value }}</span><span class="stat-card-label">{{ s.label }}</span></div></div>
</div>
<div class="table-card" style="margin-top:1rem">
<div style="padding:1rem 1.2rem;border-bottom:1px solid var(--adm-border)"><strong>Reservasi Terbaru</strong></div>
<table class="data-table"><thead><tr><th>#</th><th>Tamu</th><th>Kamar</th><th>Check-In</th><th>Status</th></tr></thead>
<tbody><tr v-for="(r,i) in reservasiList.slice(0,5)" :key="r.id"><td class="td-num">{{ i+1 }}</td><td>{{ r.customer_name }}</td><td>{{ r.room_number }}</td><td class="td-muted">{{ formatDate(r.checkin_time) }}</td><td><span :class="['status-badge','status-'+r.status]">{{ r.status }}</span></td></tr></tbody>
</table></div>
</section>

<!-- HOTEL SAYA -->
<section v-if="activeTab === 'hotel'" class="tab-content">
<div class="action-bar"><h2 class="section-title">Informasi Hotel</h2><button class="btn-primary" @click="showHotelModal=true">✎ Edit Deskripsi</button></div>
<div class="detail-card">
<div class="detail-row" v-for="f in hotelFields" :key="f.key"><span class="detail-label">{{ f.label }}</span><span>{{ hotelData[f.key] || '-' }}</span></div>
</div>
</section>

<!-- KAMAR -->
<section v-if="activeTab === 'kamar'" class="tab-content">
<div class="action-bar">
<div class="search-wrap"><span class="search-icon">⌕</span><input v-model="kamarSearch" type="text" class="search-input" placeholder="Cari kamar..." /></div>
<select v-model="kamarStatusFilter" class="filter-select"><option value="">Semua Status</option><option value="available">Available</option><option value="not available">Not Available</option></select>
</div>
<div class="table-card"><table class="data-table">
<thead><tr><th>#</th><th>No. Kamar</th><th>Tipe</th><th>Harga</th><th>Kapasitas</th><th>Fasilitas</th><th>Status</th><th>Aksi</th></tr></thead>
<tbody>
<tr v-for="(k,i) in filteredKamar" :key="k.id"><td class="td-num">{{ i+1 }}</td><td>{{ k.room_number }}</td><td><span class="ref-code">{{ k.type_room }}</span></td><td class="td-price">{{ formatCurrency(k.price) }}</td><td class="td-center">{{ k.capacity }}</td><td class="td-muted td-facility">{{ k.facility }}</td>
<td><span :class="['status-badge',k.status==='available'?'status-aktif':'status-nonaktif']">{{ k.status }}</span></td>
<td><div class="action-btns"><button class="btn-icon btn-edit" @click="openEditKamar(k)">✎</button><button class="btn-icon" :class="k.status==='available'?'btn-delete':'btn-activate'" @click="toggleKamarStatus(k)">{{ k.status==='available'?'✕':'✓' }}</button></div></td>
</tr><tr v-if="filteredKamar.length===0"><td colspan="8" class="empty-row">Tidak ada data kamar.</td></tr>
</tbody></table></div>
</section>

<!-- RESERVASI -->
<section v-if="activeTab === 'reservasi'" class="tab-content">
<div class="action-bar">
<div class="search-wrap"><span class="search-icon">⌕</span><input v-model="resSearch" type="text" class="search-input" placeholder="Cari reservasi..." /></div>
<select v-model="resStatusFilter" class="filter-select"><option value="">Semua Status</option><option value="confirmed">Confirmed</option><option value="checked_in">Checked In</option><option value="checked_out">Checked Out</option><option value="cancelled">Cancelled</option></select>
<div class="stat-chips">
<div class="stat-chip"><span class="chip-num">{{ filteredReservasi.length }}</span><span class="chip-lbl">Total</span></div>
<div class="stat-chip chip-green"><span class="chip-num">{{ filteredReservasi.filter(r=>r.status==='confirmed').length }}</span><span class="chip-lbl">Confirmed</span></div>
</div>
</div>
<div class="table-card"><table class="data-table">
<thead><tr><th>#</th><th>Tamu</th><th>Kamar</th><th>Check-In</th><th>Check-Out</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
<tbody>
<tr v-for="(r,i) in filteredReservasi" :key="r.id"><td class="td-num">{{ i+1 }}</td>
<td><div class="cell-with-avatar"><div class="mini-avatar mini-teal">{{ r.customer_name.charAt(0) }}</div><div><div>{{ r.customer_name }}</div><div class="td-muted" style="font-size:.75rem">{{ r.customer_email }}</div></div></div></td>
<td>{{ r.room_number }}</td><td class="td-muted">{{ formatDate(r.checkin_time) }}</td><td class="td-muted">{{ formatDate(r.checkout_time) }}</td><td class="td-price">{{ formatCurrency(r.amount) }}</td>
<td><span :class="['status-badge','status-'+r.status]">{{ r.status }}</span></td>
<td><div class="action-btns">
<button v-if="r.status==='confirmed'" class="btn-sm btn-checkin" @click="prosesCheckin(r)">Check-In</button>
<button v-if="r.status==='checked_in'" class="btn-sm btn-checkout" @click="prosesCheckout(r)">Check-Out</button>
<button class="btn-icon btn-edit" @click="showCustomerDetail(r)" title="Detail">◉</button>
</div></td>
</tr><tr v-if="filteredReservasi.length===0"><td colspan="8" class="empty-row">Tidak ada reservasi.</td></tr>
</tbody></table></div>
</section>

<!-- PENDAPATAN -->
<section v-if="activeTab === 'pendapatan'" class="tab-content">
<div class="stats-grid">
<div class="stat-card"><div class="stat-card-icon sc-green">💰</div><div class="stat-card-info"><span class="stat-card-num">{{ formatCurrency(totalPendapatan) }}</span><span class="stat-card-label">Total Pendapatan</span></div></div>
<div class="stat-card"><div class="stat-card-icon sc-blue">📊</div><div class="stat-card-info"><span class="stat-card-num">{{ formatCurrency(avgPendapatan) }}</span><span class="stat-card-label">Rata-rata / Bulan</span></div></div>
</div>
<div class="table-card" style="margin-top:.5rem">
<div style="padding:1rem 1.2rem;border-bottom:1px solid var(--adm-border)"><strong>Pendapatan Per Bulan</strong></div>
<table class="data-table"><thead><tr><th>Bulan</th><th>Jumlah Reservasi</th><th>Pendapatan</th></tr></thead>
<tbody><tr v-for="p in pendapatanBulanan" :key="p.bulan"><td>{{ p.bulan }}</td><td class="td-center">{{ p.jumlah }}</td><td class="td-price">{{ formatCurrency(p.total) }}</td></tr></tbody></table>
</div>
<div class="table-card" style="margin-top:1rem">
<div style="padding:1rem 1.2rem;border-bottom:1px solid var(--adm-border)"><strong>Rincian Per Reservasi</strong></div>
<table class="data-table"><thead><tr><th>#</th><th>Tamu</th><th>Kamar</th><th>Tanggal</th><th>Amount</th><th>Status</th></tr></thead>
<tbody><tr v-for="(r,i) in reservasiList.filter(r=>r.status!=='cancelled')" :key="r.id"><td class="td-num">{{ i+1 }}</td><td>{{ r.customer_name }}</td><td>{{ r.room_number }}</td><td class="td-muted">{{ formatDate(r.checkin_time) }}</td><td class="td-price">{{ formatCurrency(r.amount) }}</td><td><span :class="['status-badge','status-'+r.status]">{{ r.status }}</span></td></tr></tbody></table>
</div>
<div class="summary-footer"><span>Total Keseluruhan:</span><strong>{{ formatCurrency(totalPendapatan) }}</strong></div>
</section>

</main>

<!-- MODAL: EDIT HOTEL -->
<Transition name="modal-fade">
<div v-if="showHotelModal" class="modal-overlay" @click.self="showHotelModal=false">
<div class="modal-box"><div class="modal-header"><h2>Edit Deskripsi Hotel</h2><button class="modal-close" @click="showHotelModal=false">✕</button></div>
<Transition name="notif"><div v-if="hotelSuccess" class="notif notif-success">✓ {{ hotelSuccess }}</div></Transition>
<form class="modal-form" @submit.prevent="saveHotel">
<div class="form-grid">
<div class="form-group"><label>Nama Hotel</label><input v-model="hotelForm.hotel_name" required /></div>
<div class="form-group"><label>Lokasi</label><input v-model="hotelForm.location" required /></div>
<div class="form-group"><label>Contact Person</label><input v-model="hotelForm.contact_person" /></div>
<div class="form-group"><label>Email Kontak</label><input v-model="hotelForm.contact_email" type="email" /></div>
<div class="form-group"><label>Telepon Kontak</label><input v-model="hotelForm.contact_phone" /></div>
<div class="form-group"><label>Deskripsi</label><textarea v-model="hotelForm.description" rows="3" class="form-textarea"></textarea></div>
</div>
<div class="modal-actions"><button type="button" class="btn-secondary" @click="showHotelModal=false">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
</form></div></div>
</Transition>

<!-- MODAL: EDIT KAMAR -->
<Transition name="modal-fade">
<div v-if="showKamarModal" class="modal-overlay" @click.self="showKamarModal=false">
<div class="modal-box modal-sm"><div class="modal-header"><h2>Edit Kategori Kamar</h2><button class="modal-close" @click="showKamarModal=false">✕</button></div>
<Transition name="notif"><div v-if="kamarSuccess" class="notif notif-success">✓ {{ kamarSuccess }}</div></Transition>
<form class="modal-form" @submit.prevent="saveKamar">
<div class="form-group" style="margin-bottom:1rem"><label>Kamar</label><input :value="editingKamar?.room_number" disabled /></div>
<div class="form-group" style="margin-bottom:1rem"><label>Tipe Kamar</label><select v-model="kamarForm.type_room"><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Superior</option><option>Family</option></select></div>
<div class="form-group" style="margin-bottom:1rem"><label>Harga</label><input v-model.number="kamarForm.price" type="number" /></div>
<div class="modal-actions"><button type="button" class="btn-secondary" @click="showKamarModal=false">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
</form></div></div>
</Transition>

<!-- MODAL: DETAIL CUSTOMER -->
<Transition name="modal-fade">
<div v-if="showCustomerModal" class="modal-overlay" @click.self="showCustomerModal=false">
<div class="modal-box modal-sm"><div class="modal-header"><h2>Detail Customer</h2><button class="modal-close" @click="showCustomerModal=false">✕</button></div>
<div class="detail-card" style="margin:1rem">
<div class="detail-row"><span class="detail-label">Nama</span><span>{{ selectedReservasi?.customer_name }}</span></div>
<div class="detail-row"><span class="detail-label">Email</span><span>{{ selectedReservasi?.customer_email }}</span></div>
<div class="detail-row"><span class="detail-label">Telepon</span><span>{{ selectedReservasi?.customer_phone }}</span></div>
<div class="detail-row"><span class="detail-label">Kamar</span><span>{{ selectedReservasi?.room_number }}</span></div>
<div class="detail-row"><span class="detail-label">Check-In</span><span>{{ formatDate(selectedReservasi?.checkin_time) }}</span></div>
<div class="detail-row"><span class="detail-label">Check-Out</span><span>{{ formatDate(selectedReservasi?.checkout_time) }}</span></div>
<div class="detail-row"><span class="detail-label">Total</span><span class="td-price">{{ formatCurrency(selectedReservasi?.amount) }}</span></div>
<div class="detail-row"><span class="detail-label">Status</span><span :class="['status-badge','status-'+selectedReservasi?.status]">{{ selectedReservasi?.status }}</span></div>
</div></div></div>
</Transition>

</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { apiGet, apiPut } from '@/services/api'

const auth = useAuthStore()

const navItems = [
  { id: 'dashboard',  icon: '◈', label: 'Dashboard' },
  { id: 'hotel',      icon: '🏨', label: 'Hotel Saya' },
  { id: 'kamar',      icon: '🛏️', label: 'Kamar' },
  { id: 'reservasi',  icon: '📋', label: 'Reservasi' },
  { id: 'pendapatan', icon: '💰', label: 'Pendapatan' },
]
const activeTab = ref('dashboard')
const mobileMenuOpen = ref(false)
const loading = ref(false)

function navTo(id) { activeTab.value = id; mobileMenuOpen.value = false }
const currentPageTitle = computed(() => navItems.find(n => n.id === activeTab.value)?.label ?? 'Mitra')

const mitraData = reactive({
  id: null,
  company_name: '',
  alamat: '',
  email: '',
  phone_number: '',
  username: ''
})

const hotelData = reactive({
  id: null,
  hotel_name: '',
  location: '',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
  description: ''
})

const hotelFields = [
  { key: 'hotel_name', label: 'Nama Hotel' }, { key: 'location', label: 'Lokasi' },
  { key: 'contact_person', label: 'Contact Person' }, { key: 'contact_email', label: 'Email' },
  { key: 'contact_phone', label: 'Telepon' }, { key: 'description', label: 'Deskripsi' },
]

const kamarList = ref([])
const reservasiList = ref([])

function normalizeStatus(status) {
  if (status === 'checkin') return 'checked_in'
  if (status === 'checkout') return 'checked_out'
  return status
}

function toBackendStatus(status) {
  if (status === 'checked_in') return 'checkin'
  if (status === 'checked_out') return 'checkout'
  return status
}

async function loadMitraProfile() {
  const mitraId = auth.user?.id
  if (!mitraId) return

  Object.assign(mitraData, {
    id: mitraId,
    company_name: auth.user?.name || '',
    alamat: auth.user?.address || '',
    email: auth.user?.email || '',
    phone_number: auth.user?.phone || '',
    username: auth.user?.email || ''
  })
}

async function loadHotelData() {
  const mitraId = auth.user?.id
  if (!mitraId) return

  const response = await apiGet(`/hotel/company/${mitraId}`)
  const hotels = Array.isArray(response?.data) ? response.data : []
  const hotel = hotels[0]

  if (!hotel) return

  Object.assign(hotelData, {
    id: hotel.id_list_hotel,
    hotel_name: hotel.hotel_name || '',
    location: hotel.location || '',
    contact_person: hotel.contact_person || '',
    contact_email: hotel.contact_email || '',
    contact_phone: hotel.contact_phone || '',
    description: hotel.description || ''
  })
}

async function loadKamarList() {
  const mitraId = auth.user?.id
  if (!mitraId) return

  const response = await apiGet(`/mitra/${mitraId}/availability?include_rooms=true`)
  const rooms = response?.data?.rooms || []

  kamarList.value = rooms.map(room => ({
    id: room.id_list_kamar,
    id_detail_kamar: room.id_detail_kamar,
    room_number: room.room_number,
    type_room: room.type_room,
    price: Number(room.price) || 0,
    status: room.status,
    capacity: room.capacity || 0,
    facility: room.facility || '-'
  }))
}

async function loadReservasiList() {
  const mitraId = auth.user?.id
  if (!mitraId) return

  const response = await apiGet(`/mitra/${mitraId}/history?limit=100&offset=0`)
  const rows = Array.isArray(response?.data) ? response.data : []

  reservasiList.value = rows.map(row => ({
    id: row.id_history,
    id_history: row.id_history,
    id_user: row.id_user,
    customer_name: row.customerName || row.customer_name || '-',
    customer_email: row.customerEmail || row.customer_email || '-',
    customer_phone: row.customer_phone || '-',
    room_number: row.room_number,
    purchase_date: row.purchase_date,
    checkin_time: row.checkin_time,
    checkout_time: row.checkout_time,
    amount: Number(row.amount) || 0,
    status: normalizeStatus(row.status)
  }))
}

async function loadDashboard() {
  loading.value = true
  try {
    await Promise.all([
      loadMitraProfile(),
      loadHotelData(),
      loadKamarList(),
      loadReservasiList()
    ])
  } catch (error) {
    console.error('Gagal memuat data mitra:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)

const kamarSearch = ref('')
const kamarStatusFilter = ref('')
const filteredKamar = computed(() => {
  let data = kamarList.value
  const q = kamarSearch.value.toLowerCase()
  if (q) data = data.filter(k => k.room_number.includes(q) || k.type_room.toLowerCase().includes(q))
  if (kamarStatusFilter.value) data = data.filter(k => k.status === kamarStatusFilter.value)
  return data
})

const resSearch = ref('')
const resStatusFilter = ref('')
const filteredReservasi = computed(() => {
  let data = reservasiList.value
  const q = resSearch.value.toLowerCase()
  if (q) data = data.filter(r => r.customer_name.toLowerCase().includes(q) || r.room_number.includes(q))
  if (resStatusFilter.value) data = data.filter(r => r.status === resStatusFilter.value)
  return data
})

const dashboardStats = computed(() => ({
  totalPendapatan: reservasiList.value.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.amount, 0),
  totalReservasi: reservasiList.value.length,
  kamarTersedia: kamarList.value.filter(k => k.status === 'available').length,
  tamuAktif: reservasiList.value.filter(r => r.status === 'checked_in').length,
}))

const statCards = computed(() => [
  { icon: '💰', label: 'Total Pendapatan', value: formatCurrency(dashboardStats.value.totalPendapatan), cls: 'sc-green' },
  { icon: '📋', label: 'Total Reservasi', value: dashboardStats.value.totalReservasi, cls: 'sc-blue' },
  { icon: '🛏️', label: 'Kamar Tersedia', value: dashboardStats.value.kamarTersedia, cls: 'sc-teal' },
  { icon: '👤', label: 'Tamu Aktif', value: dashboardStats.value.tamuAktif, cls: 'sc-amber' },
])

const pendapatanBulanan = computed(() => {
  const map = {}
  reservasiList.value.filter(r => r.status !== 'cancelled').forEach(r => {
    const d = new Date(r.checkin_time)
    const key = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!map[key]) map[key] = { bulan: key, jumlah: 0, total: 0 }
    map[key].jumlah++
    map[key].total += r.amount
  })
  return Object.values(map)
})
const totalPendapatan = computed(() => reservasiList.value.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.amount, 0))
const avgPendapatan = computed(() => pendapatanBulanan.value.length ? totalPendapatan.value / pendapatanBulanan.value.length : 0)

const showHotelModal = ref(false)
const hotelSuccess = ref('')
const hotelForm = reactive({ ...hotelData })

function saveHotel() {
  if (!hotelData.id) return

  apiPut(`/mitra/hotels/${hotelData.id}/description`, {
    id_company_profile: auth.user?.id,
    hotel_name: hotelForm.hotel_name,
    location: hotelForm.location,
    contact_person: hotelForm.contact_person,
    contact_email: hotelForm.contact_email,
    contact_phone: hotelForm.contact_phone
  })
    .then(() => {
      Object.assign(hotelData, hotelForm)
      hotelSuccess.value = 'Deskripsi hotel berhasil diperbarui!'
      setTimeout(() => { showHotelModal.value = false; hotelSuccess.value = '' }, 1200)
    })
    .catch(error => alert(error.message || 'Gagal memperbarui hotel.'))
}

const showKamarModal = ref(false)
const kamarSuccess = ref('')
const editingKamar = ref(null)
const kamarForm = reactive({ type_room: '', price: 0 })

function openEditKamar(k) {
  editingKamar.value = k
  kamarForm.type_room = k.type_room
  kamarForm.price = k.price
  kamarSuccess.value = ''
  showKamarModal.value = true
}

function saveKamar() {
  if (!editingKamar.value?.id_detail_kamar) return

  apiPut(`/mitra/room-categories/${editingKamar.value.id_detail_kamar}`, {
    id_company_profile: auth.user?.id,
    type_room: kamarForm.type_room
  })
    .then(() => {
      editingKamar.value.type_room = kamarForm.type_room
      editingKamar.value.price = kamarForm.price
      kamarSuccess.value = 'Kategori kamar berhasil diubah!'
      setTimeout(() => { showKamarModal.value = false; kamarSuccess.value = '' }, 1200)
    })
    .catch(error => alert(error.message || 'Gagal memperbarui kamar.'))
}

function toggleKamarStatus(k) {
  const newStatus = k.status === 'available' ? 'not available' : 'available'

  apiPut(`/mitra/rooms/${k.id}/status`, {
    id_company_profile: auth.user?.id,
    status: newStatus
  })
    .then(() => { k.status = newStatus })
    .catch(error => alert(error.message || 'Gagal mengubah status kamar.'))
}

function prosesCheckin(r) {
  apiPut(`/booking/reservasi/${r.id_history}/checkin`, {
    id_user: r.id_user,
    checkin_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  })
    .then(() => { r.status = 'checked_in' })
    .catch(error => alert(error.message || 'Check-in gagal.'))
}

function prosesCheckout(r) {
  apiPut(`/checkout/reservasi/${r.id_history}/checkout`, {
    checkout_time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  })
    .then(() => { r.status = 'checked_out' })
    .catch(error => alert(error.message || 'Check-out gagal.'))
}

const showCustomerModal = ref(false)
const selectedReservasi = ref(null)
function showCustomerDetail(r) { selectedReservasi.value = r; showCustomerModal.value = true }

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
function formatCurrency(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0) }
</script>

<style scoped>
/* CSS Variables - matching AdminView pattern */
.mitra-page {
  --adm-navy: #0b2545; --adm-navy-800: #0f3460;
  --adm-accent: #1a7a6e; --adm-accent-light: #2dd4a8;
  --adm-teal: #1a7a6e; --adm-teal-light: #e1f5ee;
  --adm-bg: #f4f6fb; --adm-white: #ffffff; --adm-border: #e2e8f0;
  --adm-text: #1e2a3a; --adm-muted: #64748b;
  --adm-red: #dc2626; --adm-red-light: #fef2f2;
  --adm-green: #16a34a; --adm-green-light: #f0fdf4;
  --adm-amber: #d97706; --adm-amber-light: #fffbeb;
  --adm-shadow: 0 2px 12px rgba(11,37,69,.08);
  --adm-shadow-lg: 0 8px 32px rgba(11,37,69,.14);
  --adm-sidebar-w: 240px; --adm-sidebar-collapsed: 64px;
}

/* Layout */
.mitra-page { display:flex; min-height:100vh; background:var(--adm-bg); font-family:'Segoe UI',system-ui,sans-serif; color:var(--adm-text); }

/* Sidebar */
.sidebar { width:var(--adm-sidebar-w); background:var(--adm-navy); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; z-index:100; overflow:hidden; flex-shrink:0; }
.sidebar-header { display:flex; align-items:center; justify-content:space-between; padding:1.1rem 1rem; border-bottom:1px solid rgba(255,255,255,.08); }
.brand { display:flex; align-items:center; gap:.55rem; white-space:nowrap; overflow:hidden; }
.brand-icon { font-size:1.4rem; color:var(--adm-accent-light); flex-shrink:0; }
.brand-text { font-size:.95rem; color:rgba(255,255,255,.7); letter-spacing:1px; font-weight:300; }
.brand-text b { color:#fff; font-weight:700; }
.collapse-btn { display:none; }
.sidebar-nav { flex:1; padding:1rem .6rem; display:flex; flex-direction:column; gap:.3rem; }
.nav-item { display:flex; align-items:center; gap:.75rem; padding:.65rem .8rem; border-radius:8px; border:none; background:transparent; color:rgba(255,255,255,.55); font-size:.88rem; font-weight:500; cursor:pointer; transition:all .2s; width:100%; white-space:nowrap; overflow:hidden; }
.nav-item:hover { background:rgba(255,255,255,.08); color:rgba(255,255,255,.85); }
.nav-item.active { background:var(--adm-accent); color:#fff; }
.nav-icon { font-size:1.1rem; flex-shrink:0; width:20px; text-align:center; }
.sidebar-footer { padding:1rem; border-top:1px solid rgba(255,255,255,.08); }
.admin-badge { display:flex; align-items:center; gap:.6rem; overflow:hidden; }
.badge-avatar { width:34px; height:34px; border-radius:50%; background:var(--adm-accent); color:#fff; font-weight:700; font-size:.9rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.badge-info { display:flex; flex-direction:column; overflow:hidden; }
.badge-name { color:rgba(255,255,255,.85); font-size:.82rem; font-weight:600; white-space:nowrap; }
.badge-role { color:rgba(255,255,255,.4); font-size:.72rem; }

/* Main */
.admin-main { flex:1; display:flex; flex-direction:column; min-width:0; }

/* Topbar */
.topbar { background:var(--adm-white); border-bottom:1px solid var(--adm-border); padding:1rem 1.8rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; box-shadow:var(--adm-shadow); position:sticky; top:0; z-index:50; }
.page-title { font-size:1.15rem; font-weight:700; color:var(--adm-navy); margin:0; }
.page-breadcrumb { font-size:.75rem; color:var(--adm-muted); }
.topbar-right { display:flex; gap:.6rem; align-items:center; }
.stat-pill { background:var(--adm-bg); border:1px solid var(--adm-border); border-radius:20px; padding:.3rem .85rem; font-size:.78rem; font-weight:600; color:var(--adm-navy); }

/* Tab Content */
.tab-content { padding:1.6rem 1.8rem 3rem; display:flex; flex-direction:column; gap:1.2rem; flex:1; }

/* Stats Grid */
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
.stat-card { background:var(--adm-white); border:1px solid var(--adm-border); border-radius:14px; padding:1.2rem; display:flex; align-items:center; gap:1rem; box-shadow:var(--adm-shadow); transition:transform .2s; }
.stat-card:hover { transform:translateY(-2px); }
.stat-card-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0; }
.sc-green { background:var(--adm-green-light); }
.sc-blue { background:#eff6ff; }
.sc-teal { background:var(--adm-teal-light); }
.sc-amber { background:var(--adm-amber-light); }
.stat-card-info { display:flex; flex-direction:column; }
.stat-card-num { font-size:1.15rem; font-weight:700; color:var(--adm-navy); }
.stat-card-label { font-size:.75rem; color:var(--adm-muted); text-transform:uppercase; letter-spacing:.5px; }

/* Detail Card */
.detail-card { background:var(--adm-white); border:1px solid var(--adm-border); border-radius:14px; overflow:hidden; box-shadow:var(--adm-shadow); }
.detail-row { display:flex; padding:.9rem 1.2rem; border-bottom:1px solid var(--adm-border); gap:1rem; align-items:flex-start; }
.detail-row:last-child { border-bottom:none; }
.detail-label { font-size:.8rem; font-weight:700; color:var(--adm-navy); text-transform:uppercase; letter-spacing:.5px; min-width:140px; flex-shrink:0; }
.section-title { font-size:1rem; font-weight:700; color:var(--adm-navy); margin:0; }

/* Action Bar */
.action-bar { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
.search-wrap { position:relative; flex:1; max-width:340px; }
.search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--adm-muted); font-size:1.1rem; }
.search-input { width:100%; padding:.55rem .9rem .55rem 2.4rem; border:1.5px solid var(--adm-border); border-radius:8px; font-size:.88rem; background:var(--adm-white); color:var(--adm-text); outline:none; transition:border-color .2s; }
.search-input:focus { border-color:var(--adm-navy); }
.filter-group { display:flex; flex-direction:column; gap:.3rem; }
.filter-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:var(--adm-muted); }
.filter-select { padding:.5rem .8rem; border:1.5px solid var(--adm-border); border-radius:8px; font-size:.88rem; background:var(--adm-white); color:var(--adm-text); outline:none; cursor:pointer; min-width:160px; }
.stat-chips { display:flex; gap:.5rem; margin-left:auto; }
.stat-chip { background:var(--adm-white); border:1px solid var(--adm-border); border-radius:10px; padding:.4rem .85rem; display:flex; flex-direction:column; align-items:center; min-width:60px; }
.chip-num { font-size:1rem; font-weight:700; color:var(--adm-navy); line-height:1; }
.chip-lbl { font-size:.65rem; color:var(--adm-muted); text-transform:uppercase; letter-spacing:.5px; }
.chip-green .chip-num { color:var(--adm-green); }

/* Buttons */
.btn-primary { background:var(--adm-navy); color:#fff; border:none; padding:.6rem 1.2rem; border-radius:8px; font-size:.88rem; font-weight:600; cursor:pointer; transition:background .2s,transform .15s; white-space:nowrap; }
.btn-primary:hover { background:var(--adm-navy-800); transform:translateY(-1px); }
.btn-secondary { background:var(--adm-white); color:var(--adm-text); border:1.5px solid var(--adm-border); padding:.6rem 1.2rem; border-radius:8px; font-size:.88rem; font-weight:600; cursor:pointer; }
.btn-secondary:hover { border-color:var(--adm-navy); color:var(--adm-navy); }
.btn-sm { padding:.3rem .7rem; border-radius:6px; font-size:.75rem; font-weight:700; border:none; cursor:pointer; transition:all .2s; }
.btn-checkin { background:var(--adm-green-light); color:var(--adm-green); }
.btn-checkin:hover { background:var(--adm-green); color:#fff; }
.btn-checkout { background:var(--adm-amber-light); color:var(--adm-amber); }
.btn-checkout:hover { background:var(--adm-amber); color:#fff; }

/* Table */
.table-card { background:var(--adm-white); border-radius:14px; border:1px solid var(--adm-border); overflow:hidden; box-shadow:var(--adm-shadow); }
.data-table { width:100%; border-collapse:collapse; }
.data-table th { background:var(--adm-navy); color:rgba(255,255,255,.8); font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.7px; padding:.85rem 1rem; text-align:left; }
.data-table td { padding:.9rem 1rem; font-size:.88rem; border-bottom:1px solid var(--adm-border); vertical-align:middle; }
.data-table tr:last-child td { border-bottom:none; }
.data-table tbody tr { transition:background .15s; }
.data-table tbody tr:hover { background:var(--adm-bg); }
.td-num { color:var(--adm-muted); font-size:.8rem; text-align:center; width:40px; }
.td-muted { color:var(--adm-muted); }
.td-center { text-align:center; }
.td-price { font-weight:700; color:var(--adm-navy); white-space:nowrap; }
.td-facility { max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cell-with-avatar { display:flex; align-items:center; gap:.6rem; }
.mini-avatar { width:30px; height:30px; border-radius:50%; background:var(--adm-navy); color:#fff; font-size:.78rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.mini-teal { background:var(--adm-teal); }
.ref-code { font-family:monospace; font-size:.82rem; background:var(--adm-bg); padding:.15rem .5rem; border-radius:5px; color:var(--adm-navy); font-weight:700; }

/* Status Badges */
.status-badge { display:inline-block; padding:.22rem .7rem; border-radius:20px; font-size:.72rem; font-weight:700; text-transform:capitalize; letter-spacing:.3px; }
.status-aktif,.status-confirmed,.status-available { background:var(--adm-green-light); color:var(--adm-green); }
.status-nonaktif,.status-cancelled { background:var(--adm-red-light); color:var(--adm-red); }
.status-checked_in { background:#eff6ff; color:#2563eb; }
.status-checked_out { background:var(--adm-amber-light); color:var(--adm-amber); }
.status-pending { background:var(--adm-amber-light); color:var(--adm-amber); }

/* Action Buttons */
.action-btns { display:flex; gap:.4rem; align-items:center; }
.btn-icon { width:30px; height:30px; border-radius:7px; border:1.5px solid var(--adm-border); background:var(--adm-white); cursor:pointer; font-size:.85rem; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.btn-edit:hover { background:var(--adm-navy); border-color:var(--adm-navy); color:#fff; }
.btn-delete:hover { background:var(--adm-red); border-color:var(--adm-red); color:#fff; }
.btn-activate:hover { background:var(--adm-green); border-color:var(--adm-green); color:#fff; }
.empty-row { text-align:center; color:var(--adm-muted); padding:2.5rem 1rem; font-size:.9rem; }

/* Summary Footer */
.summary-footer { background:var(--adm-white); border:1px solid var(--adm-border); border-radius:10px; padding:.9rem 1.4rem; display:flex; align-items:center; justify-content:flex-end; gap:.8rem; font-size:.9rem; color:var(--adm-muted); box-shadow:var(--adm-shadow); }
.summary-footer strong { font-size:1.05rem; font-weight:700; color:var(--adm-navy); }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(11,37,69,.6); backdrop-filter:blur(4px); z-index:500; display:flex; align-items:center; justify-content:center; padding:1.5rem; }
.modal-box { background:var(--adm-white); border-radius:16px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; box-shadow:var(--adm-shadow-lg); border-top:4px solid var(--adm-navy); }
.modal-sm { max-width:420px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.2rem 1.5rem; border-bottom:1px solid var(--adm-border); }
.modal-header h2 { font-size:1.05rem; font-weight:700; color:var(--adm-navy); margin:0; }
.modal-close { background:none; border:none; font-size:1rem; cursor:pointer; color:var(--adm-muted); width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all .2s; }
.modal-close:hover { background:var(--adm-bg); color:var(--adm-red); }
.modal-form { padding:1.3rem 1.5rem; }
.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.3rem; }
.form-group { display:flex; flex-direction:column; gap:.35rem; }
.form-group label { font-size:.8rem; font-weight:700; color:var(--adm-navy); text-transform:uppercase; letter-spacing:.5px; }
.form-group input,.form-group select,.form-textarea { padding:.6rem .85rem; border:1.5px solid var(--adm-border); border-radius:8px; font-size:.9rem; background:var(--adm-white); color:var(--adm-text); outline:none; transition:border-color .2s,box-shadow .2s; font-family:inherit; }
.form-group input:focus,.form-group select:focus,.form-textarea:focus { border-color:var(--adm-navy); box-shadow:0 0 0 3px rgba(11,37,69,.08); }
.form-textarea { resize:vertical; min-height:80px; }
.modal-actions { display:flex; justify-content:flex-end; gap:.7rem; padding:1rem 1.5rem; border-top:1px solid var(--adm-border); }

/* Notifications */
.notif { margin:.8rem 1.5rem 0; padding:.65rem 1rem; border-radius:8px; font-size:.85rem; font-weight:600; }
.notif-success { background:var(--adm-green-light); color:var(--adm-green); border:1px solid #86efac; }

/* Transitions */
.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity .25s ease; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0; }
.notif-enter-active,.notif-leave-active { transition:all .3s ease; }
.notif-enter-from,.notif-leave-to { opacity:0; transform:translateY(-6px); }

/* Hamburger */
.hamburger-btn { display:none; flex-direction:column; justify-content:center; gap:5px; width:36px; height:36px; border:none; background:var(--adm-bg); border-radius:8px; cursor:pointer; padding:6px; flex-shrink:0; }
.hamburger-btn span { display:block; height:2px; background:var(--adm-navy); border-radius:2px; }
.sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:99; opacity:0; transition:opacity .3s; }

/* Responsive */
@media (max-width:900px) { .topbar-right .stat-pill.hide-xs { display:none; } }
@media (max-width:768px) {
  .hamburger-btn { display:flex; }
  .sidebar { position:fixed; left:0; top:0; height:100vh; transform:translateX(-110%); transition:transform .3s ease,width .3s ease; z-index:200; width:var(--adm-sidebar-w) !important; }
  .sidebar.mobile-open { transform:translateX(0); }
  .sidebar-overlay { display:block; }
  .sidebar-overlay.active { opacity:1; pointer-events:all; }
  .admin-main { width:100%; }
  .topbar { padding:.75rem 1rem; gap:.6rem; }
  .topbar-left { display:flex; align-items:center; gap:.7rem; }
  .tab-content { padding:1rem 1rem 3rem; }
  .action-bar { flex-direction:column; align-items:stretch; }
  .search-wrap { max-width:100%; }
  .stat-chips { margin-left:0; justify-content:flex-start; flex-wrap:wrap; }
  .filter-select { min-width:unset; width:100%; }
  .table-card { overflow-x:auto; -webkit-overflow-scrolling:touch; }
  .data-table { min-width:600px; }
  .form-grid { grid-template-columns:1fr; }
  .page-breadcrumb { display:none; }
  .stats-grid { grid-template-columns:1fr 1fr; }
}
@media (max-width:480px) {
  .stat-pill { font-size:.72rem; padding:.25rem .65rem; }
  .page-title { font-size:1rem; }
  .tab-content { padding:.75rem .75rem 3rem; }
  .stats-grid { grid-template-columns:1fr; }
}
</style>
