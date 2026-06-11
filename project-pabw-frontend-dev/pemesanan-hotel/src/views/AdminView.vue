<template>
  <div class="admin-page">

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileMenuOpen }">
      <div class="sidebar-header">
        <div class="brand">
          <span class="brand-icon">⬡</span>
          <span class="brand-text">PABW<b>Admin</b></span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '→' : '←' }}
        </button>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          :class="['nav-item', { active: activeTab === item.id }]"
          @click="navTo(item.id)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-badge">
          <span class="badge-avatar">A</span>
          <div class="badge-info">
            <span class="badge-name">Administrator</span>
            <span class="badge-role">Super Admin</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div class="sidebar-overlay" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = false"></div>

    <!-- Main Content -->
    <main class="admin-main">

      <!-- Top Bar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle Menu">
            <span></span><span></span><span></span>
          </button>
          <div>
            <h1 class="page-title">{{ currentPageTitle }}</h1>
            <span class="page-breadcrumb">Dashboard / {{ currentPageTitle }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <div class="stat-pill">
            <span>{{ admin.totalMitra }} Mitra</span>
          </div>
          <div class="stat-pill hide-xs">
            <span>{{ admin.totalReservasi }} Reservasi</span>
          </div>
        </div>
      </header>

      <!-- ══════════════════════════════════════════════ -->
      <!--  TAB 1: MANAJEMEN MITRA                       -->
      <!-- ══════════════════════════════════════════════ -->
      <section v-if="activeTab === 'mitra'" class="tab-content">

        <!-- Action bar -->
        <div class="action-bar">
          <div class="search-wrap">
            <span class="search-icon">⌕</span>
            <input
              v-model="mitraSearch"
              type="text"
              class="search-input"
              placeholder="Cari mitra..."
            />
          </div>
          <button class="btn-primary" @click="openTambahMitra">
            + Tambah Mitra
          </button>
        </div>

        <!-- Mitra table -->
        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama Mitra</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Hotel</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mitra, idx) in filteredMitra" :key="mitra.id">
                <td class="td-num">{{ idx + 1 }}</td>
                <td>
                  <div class="cell-with-avatar">
                    <div class="mini-avatar">{{ mitra.name.charAt(0) }}</div>
                    <span>{{ mitra.name }}</span>
                  </div>
                </td>
                <td class="td-muted">{{ mitra.email }}</td>
                <td class="td-muted">{{ mitra.phone }}</td>
                <td>{{ mitra.hotel }}</td>
                <td>
                  <span :class="['status-badge', mitra.status === 'aktif' ? 'status-aktif' : 'status-nonaktif']">
                    {{ mitra.status }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-icon btn-edit" title="Edit" @click="openEditMitra(mitra)">✎</button>
                    <button class="btn-icon btn-delete" title="Hapus" @click="konfirmasiHapus(mitra)">✕</button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredMitra.length === 0">
                <td colspan="7" class="empty-row">Tidak ada data mitra ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!--  TAB 2: LAPORAN RESERVASI                     -->
      <!-- ══════════════════════════════════════════════ -->
      <section v-if="activeTab === 'reservasi'" class="tab-content">

        <!-- Filter bar -->
        <div class="action-bar">
          <div class="filter-group">
            <label class="filter-label">Filter Hotel</label>
            <select v-model="selectedHotelFilter" class="filter-select" @change="loadReservasi">
              <option value="">Semua Hotel</option>
              <option v-for="h in hotelOptions" :key="h.id" :value="h.id">{{ h.name }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select v-model="statusFilter" class="filter-select">
              <option value="">Semua Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="stat-chips">
            <div class="stat-chip">
              <span class="chip-num">{{ filteredReservations.length }}</span>
              <span class="chip-lbl">Total</span>
            </div>
            <div class="stat-chip chip-green">
              <span class="chip-num">{{ filteredReservations.filter(r=>r.status==='confirmed').length }}</span>
              <span class="chip-lbl">Confirmed</span>
            </div>
            <div class="stat-chip chip-amber">
              <span class="chip-num">{{ filteredReservations.filter(r=>r.status==='pending').length }}</span>
              <span class="chip-lbl">Pending</span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="reservasiLoading" class="empty-state">
          <div class="loading-ring"></div>
          <p>Memuat data reservasi...</p>
        </div>

        <div v-else-if="filteredReservations.length === 0 && selectedHotelFilter" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>Data tidak tersedia untuk hotel yang dipilih.</p>
        </div>

        <div v-else-if="filteredReservations.length === 0 && !selectedHotelFilter" class="empty-state">
          <div class="empty-icon">🏨</div>
          <p>Pilih hotel untuk menampilkan data reservasi.</p>
        </div>

        <!-- Reservasi table -->
        <div v-else class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Referensi</th>
                <th>Tamu</th>
                <th>Hotel & Kamar</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Malam</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(res, idx) in filteredReservations" :key="res.id">
                <td class="td-num">{{ idx + 1 }}</td>
                <td><span class="ref-code">PABW{{ res.ref }}</span></td>
                <td>
                  <div class="cell-with-avatar">
                    <div class="mini-avatar mini-teal">{{ res.fullname.charAt(0) }}</div>
                    <div>
                      <div>{{ res.fullname }}</div>
                      <div class="td-muted" style="font-size:.75rem">{{ res.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>{{ res.hotelName }}</div>
                  <div class="td-muted" style="font-size:.75rem">{{ res.room }}</div>
                </td>
                <td class="td-muted">{{ formatDate(res.checkin) }}</td>
                <td class="td-muted">{{ formatDate(res.checkout) }}</td>
                <td class="td-center">{{ res.nights }}</td>
                <td class="td-price">{{ formatCurrency(res.total) }}</td>
                <td>
                  <span :class="['status-badge', `status-${res.status}`]">{{ res.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Summary footer -->
        <div v-if="filteredReservations.length > 0" class="summary-footer">
          <span>Total Pendapatan:</span>
          <strong>{{ formatCurrency(filteredReservations.reduce((s,r) => s + r.total, 0)) }}</strong>
        </div>
      </section>

    </main>

    <!-- ══════════════════════════════════════════════ -->
    <!--  MODAL: TAMBAH / EDIT MITRA                   -->
    <!-- ══════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showMitraModal" class="modal-overlay" @click.self="closeMitraModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2>{{ editMode ? 'Edit Mitra' : 'Tambah Mitra Baru' }}</h2>
            <button class="modal-close" @click="closeMitraModal">✕</button>
          </div>

          <!-- Notification: validation error -->
          <Transition name="notif">
            <div v-if="mitraError" class="notif notif-error">
              ✕ {{ mitraError }}
            </div>
          </Transition>

          <!-- Notification: success -->
          <Transition name="notif">
            <div v-if="mitraSuccess" class="notif notif-success">
              ✓ {{ mitraSuccess }}
            </div>
          </Transition>

          <form class="modal-form" @submit.prevent="submitMitra">
            <div class="form-grid">
              <div class="form-group">
                <label>Nama Lengkap <span class="req">*</span></label>
                <input v-model="mitraForm.name" type="text" placeholder="John Doe" required />
              </div>
              <div class="form-group">
                <label>Email <span class="req">*</span></label>
                <input v-model="mitraForm.email" type="email" placeholder="email@contoh.com" required />
              </div>
              <div class="form-group">
                <label>Telepon <span class="req">*</span></label>
                <input v-model="mitraForm.phone" type="tel" placeholder="+62 812 0000 0000" required />
              </div>
              <div class="form-group">
                <label>Hotel yang Dikelola <span class="req">*</span></label>
                <input
                  v-model="mitraForm.hotel"
                  type="text"
                  placeholder="Contoh: Grand Kalimantan Hotel"
                  required
                />
              </div>
              <div class="form-group">
                <label>Password <span class="req">*</span></label>
                <input
                  v-model="mitraForm.password"
                  type="password"
                  :placeholder="editMode ? 'Kosongkan jika tidak diubah' : 'Min. 6 karakter'"
                  :required="!editMode"
                  minlength="6"
                />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select v-model="mitraForm.status">
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="closeMitraModal">Batal</button>
              <button type="submit" class="btn-primary" :disabled="mitraSubmitting">
                {{ mitraSubmitting ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Tambah Mitra') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════════ -->
    <!--  MODAL: KONFIRMASI HAPUS MITRA                -->
    <!-- ══════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showHapusModal" class="modal-overlay" @click.self="showHapusModal = false">
        <div class="modal-box modal-sm">
          <div class="modal-header">
            <h2>Konfirmasi Penghapusan</h2>
            <button class="modal-close" @click="showHapusModal = false">✕</button>
          </div>

          <Transition name="notif">
            <div v-if="hapusError" class="notif notif-error">
              ✕ {{ hapusError }}
            </div>
          </Transition>

          <div class="hapus-body">
            <div class="hapus-icon">⚠</div>
            <p>Anda yakin ingin menghapus mitra <strong>{{ mitraToDelete?.name }}</strong>?</p>
            <p class="hapus-warn">Tindakan ini tidak dapat dibatalkan. Sistem akan mengecek apakah mitra masih memiliki reservasi aktif.</p>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" @click="showHapusModal = false">Batal</button>
            <button class="btn-danger" :disabled="hapusLoading" @click="eksekusiHapus">
              {{ hapusLoading ? 'Memeriksa...' : 'Ya, Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()

onMounted(() => {
  admin.loadDashboardData()
})

// ─── Nav ────────────────────────────────────────────────
const navItems = [
  { id: 'mitra',     icon: '◈', label: 'Manajemen Mitra' },
  { id: 'reservasi', icon: '◉', label: 'Laporan Reservasi' },
]
const activeTab        = ref('mitra')
const sidebarCollapsed = ref(false)
const mobileMenuOpen   = ref(false)

function navTo(id) {
  activeTab.value    = id
  mobileMenuOpen.value = false
}

const currentPageTitle = computed(() =>
  navItems.find(n => n.id === activeTab.value)?.label ?? 'Admin'
)

// ─── Mitra (dari adminStore — single source of truth) ───
const mitraList   = computed(() => admin.mitraList)
const mitraSearch = ref('')

const filteredMitra = computed(() => {
  const q = mitraSearch.value.toLowerCase()
  return mitraList.value.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.email.toLowerCase().includes(q) ||
    m.hotel.toLowerCase().includes(q)
  )
})

// ─── Form Tambah / Edit Mitra ────────────────────────────
const showMitraModal  = ref(false)
const editMode        = ref(false)
const mitraError      = ref('')
const mitraSuccess    = ref('')
const mitraSubmitting = ref(false)
const editingId       = ref(null)

const defaultForm = () => ({
  name: '', email: '', phone: '', hotel: '', password: '', status: 'aktif'
})
const mitraForm = reactive(defaultForm())

function openTambahMitra() {
  editMode.value  = false
  editingId.value = null
  Object.assign(mitraForm, defaultForm())
  mitraError.value   = ''
  mitraSuccess.value = ''
  showMitraModal.value = true
}

function openEditMitra(mitra) {
  editMode.value  = true
  editingId.value = mitra.id
  Object.assign(mitraForm, {
    name: mitra.name, email: mitra.email, phone: mitra.phone,
    hotel: mitra.hotel, password: '', status: mitra.status
  })
  mitraError.value   = ''
  mitraSuccess.value = ''
  showMitraModal.value = true
}

function closeMitraModal() {
  showMitraModal.value = false
}

async function submitMitra() {
  mitraError.value   = ''
  mitraSuccess.value = ''
  mitraSubmitting.value = true

  const result = editMode.value
    ? admin.editMitra(editingId.value, { ...mitraForm })
    : await admin.tambahMitra({ ...mitraForm })

  mitraSubmitting.value = false

  if (!result.success) {
    mitraError.value = result.message
    return
  }

  mitraSuccess.value = result.message
  setTimeout(() => {
    closeMitraModal()
    mitraSuccess.value = ''
  }, 1500)
}

// ─── Hapus Mitra ────────────────────────────────────────
const showHapusModal = ref(false)
const mitraToDelete  = ref(null)
const hapusError     = ref('')
const hapusLoading   = ref(false)

function konfirmasiHapus(mitra) {
  mitraToDelete.value = mitra
  hapusError.value    = ''
  showHapusModal.value = true
}

async function eksekusiHapus() {
  hapusError.value   = ''
  hapusLoading.value = true

  const result = await admin.hapusMitra(mitraToDelete.value?.id)
  hapusLoading.value = false

  if (!result.success) {
    hapusError.value = result.message
    return
  }

  showHapusModal.value = false
}

// ─── Reservasi ───────────────────────────────────────────
const selectedHotelFilter = ref('')
const statusFilter        = ref('')
const reservasiLoading    = ref(false)

// Data reservasi dari adminStore
const allReservations = computed(() => admin.allReservations)

// Hotel unik untuk filter dropdown reservasi (diambil langsung dari data reservasi)
const hotelOptions = computed(() => {
  const seen = new Set()
  return allReservations.value
    .filter(r => { if (seen.has(r.hotelId)) return false; seen.add(r.hotelId); return true })
    .map(r => ({ id: r.hotelId, name: r.hotelName }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

async function loadReservasi() {
  reservasiLoading.value = true
  try {
    await admin.loadAllReservations()
  } finally {
    reservasiLoading.value = false
  }
}

const filteredReservations = computed(() => {
  let data = allReservations.value
  if (selectedHotelFilter.value) {
    data = data.filter(r => r.hotelId === parseInt(selectedHotelFilter.value))
  }
  if (statusFilter.value) {
    data = data.filter(r => r.status === statusFilter.value)
  }
  return data
})

// ─── Helpers ─────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatCurrency(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
/* ════════════════════════════════════
   CSS Variables lokal AdminView
   (didefinisikan pada .admin-page agar
    tidak menimpa variabel global tema)
════════════════════════════════════ */
.admin-page {
  --adm-navy: #0b2545;
  --adm-navy-800: #0f3460;
  --adm-accent: #c9843a;
  --adm-accent-light: #e8a862;
  --adm-teal: #1a7a6e;
  --adm-teal-light: #e1f5ee;
  --adm-bg: #f4f6fb;
  --adm-white: #ffffff;
  --adm-border: #e2e8f0;
  --adm-text: #1e2a3a;
  --adm-muted: #64748b;
  --adm-red: #dc2626;
  --adm-red-light: #fef2f2;
  --adm-green: #16a34a;
  --adm-green-light: #f0fdf4;
  --adm-amber: #d97706;
  --adm-amber-light: #fffbeb;
  --adm-shadow: 0 2px 12px rgba(11,37,69,.08);
  --adm-shadow-lg: 0 8px 32px rgba(11,37,69,.14);
  --adm-sidebar-w: 240px;
  --adm-sidebar-collapsed: 64px;
}

/* ════════════════════════════════════
   Layout
════════════════════════════════════ */
.admin-page {
  display: flex;
  min-height: 100vh;
  background: var(--adm-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: var(--adm-text);
}

/* ────────────────
   Sidebar
──────────────── */
.sidebar {
  width: var(--adm-sidebar-w);
  background: var(--adm-navy);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width .3s ease;
  z-index: 100;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: var(--adm-sidebar-collapsed);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: .55rem;
  white-space: nowrap;
  overflow: hidden;
}

.brand-icon {
  font-size: 1.4rem;
  color: var(--adm-accent-light);
  flex-shrink: 0;
}

.brand-text {
  font-size: .95rem;
  color: rgba(255,255,255,.7);
  letter-spacing: 1px;
  font-weight: 300;
}

.brand-text b {
  color: #fff;
  font-weight: 700;
}

.collapse-btn {
  background: rgba(255,255,255,.08);
  border: none;
  color: rgba(255,255,255,.6);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  font-size: .8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .2s;
}

.collapse-btn:hover {
  background: rgba(255,255,255,.16);
  color: #fff;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem .6rem;
  display: flex;
  flex-direction: column;
  gap: .3rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem .8rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,.55);
  font-size: .88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.85);
}

.nav-item.active {
  background: var(--adm-accent);
  color: #fff;
}

.nav-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,.08);
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: .6rem;
  overflow: hidden;
}

.badge-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--adm-accent);
  color: #fff;
  font-weight: 700;
  font-size: .9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.badge-name {
  color: rgba(255,255,255,.85);
  font-size: .82rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-role {
  color: rgba(255,255,255,.4);
  font-size: .72rem;
}

/* ────────────────
   Main
──────────────── */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ────────────────
   Topbar
──────────────── */
.topbar {
  background: var(--adm-white);
  border-bottom: 1px solid var(--adm-border);
  padding: 1rem 1.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: var(--adm-shadow);
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--adm-navy);
  margin: 0;
}

.page-breadcrumb {
  font-size: .75rem;
  color: var(--adm-muted);
}

.topbar-right {
  display: flex;
  gap: .6rem;
  align-items: center;
}

.stat-pill {
  background: var(--adm-bg);
  border: 1px solid var(--adm-border);
  border-radius: 20px;
  padding: .3rem .85rem;
  font-size: .78rem;
  font-weight: 600;
  color: var(--adm-navy);
}

/* ────────────────
   Tab Content
──────────────── */
.tab-content {
  padding: 1.6rem 1.8rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex: 1;
}

/* ────────────────
   Action Bar
──────────────── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--adm-muted);
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: .55rem .9rem .55rem 2.4rem;
  border: 1.5px solid var(--adm-border);
  border-radius: 8px;
  font-size: .88rem;
  background: var(--adm-white);
  color: var(--adm-text);
  outline: none;
  transition: border-color .2s;
}

.search-input:focus {
  border-color: var(--adm-navy);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: .3rem;
}

.filter-label {
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  color: var(--adm-muted);
}

.filter-select {
  padding: .5rem .8rem;
  border: 1.5px solid var(--adm-border);
  border-radius: 8px;
  font-size: .88rem;
  background: var(--adm-white);
  color: var(--adm-text);
  outline: none;
  cursor: pointer;
  transition: border-color .2s;
  min-width: 180px;
}

.filter-select:focus {
  border-color: var(--adm-navy);
}

.stat-chips {
  display: flex;
  gap: .5rem;
  margin-left: auto;
}

.stat-chip {
  background: var(--adm-white);
  border: 1px solid var(--adm-border);
  border-radius: 10px;
  padding: .4rem .85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.chip-num {
  font-size: 1rem;
  font-weight: 700;
  color: var(--adm-navy);
  line-height: 1;
}

.chip-lbl {
  font-size: .65rem;
  color: var(--adm-muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}

.chip-green .chip-num { color: var(--adm-green); }
.chip-amber .chip-num { color: var(--adm-amber); }

/* ────────────────
   Buttons
──────────────── */
.btn-primary {
  background: var(--adm-navy);
  color: #fff;
  border: none;
  padding: .6rem 1.2rem;
  border-radius: 8px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, transform .15s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--adm-navy-800);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: .55;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--adm-white);
  color: var(--adm-text);
  border: 1.5px solid var(--adm-border);
  padding: .6rem 1.2rem;
  border-radius: 8px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
}

.btn-secondary:hover {
  border-color: var(--adm-navy);
  color: var(--adm-navy);
}

.btn-danger {
  background: var(--adm-red);
  color: #fff;
  border: none;
  padding: .6rem 1.2rem;
  border-radius: 8px;
  font-size: .88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: .55;
  cursor: not-allowed;
}

/* ────────────────
   Table
──────────────── */
.table-card {
  background: var(--adm-white);
  border-radius: 14px;
  border: 1px solid var(--adm-border);
  overflow: hidden;
  box-shadow: var(--adm-shadow);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--adm-navy);
  color: rgba(255,255,255,.8);
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  padding: .85rem 1rem;
  text-align: left;
}

.data-table td {
  padding: .9rem 1rem;
  font-size: .88rem;
  border-bottom: 1px solid var(--adm-border);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr {
  transition: background .15s;
}

.data-table tbody tr:hover {
  background: var(--adm-bg);
}

.td-num  { color: var(--adm-muted); font-size: .8rem; text-align: center; width: 40px; }
.td-muted { color: var(--adm-muted); }
.td-center { text-align: center; }
.td-price { font-weight: 700; color: var(--adm-navy); white-space: nowrap; }

.cell-with-avatar {
  display: flex;
  align-items: center;
  gap: .6rem;
}

.mini-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--adm-navy);
  color: #fff;
  font-size: .78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-teal {
  background: var(--adm-teal);
}

.status-badge {
  display: inline-block;
  padding: .22rem .7rem;
  border-radius: 20px;
  font-size: .72rem;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: .3px;
}

.status-aktif, .status-confirmed {
  background: var(--adm-green-light);
  color: var(--adm-green);
}

.status-nonaktif, .status-cancelled {
  background: var(--adm-red-light);
  color: var(--adm-red);
}

.status-pending {
  background: var(--adm-amber-light);
  color: var(--adm-amber);
}

.ref-code {
  font-family: monospace;
  font-size: .82rem;
  background: var(--adm-bg);
  padding: .15rem .5rem;
  border-radius: 5px;
  color: var(--adm-navy);
  font-weight: 700;
}

.action-btns {
  display: flex;
  gap: .4rem;
}

.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1.5px solid var(--adm-border);
  background: var(--adm-white);
  cursor: pointer;
  font-size: .85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s;
}

.btn-edit:hover {
  background: var(--adm-navy);
  border-color: var(--adm-navy);
  color: #fff;
}

.btn-delete:hover {
  background: var(--adm-red);
  border-color: var(--adm-red);
  color: #fff;
}

.empty-row {
  text-align: center;
  color: var(--adm-muted);
  padding: 2.5rem 1rem;
  font-size: .9rem;
}

/* ────────────────
   Summary Footer
──────────────── */
.summary-footer {
  background: var(--adm-white);
  border: 1px solid var(--adm-border);
  border-radius: 10px;
  padding: .9rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .8rem;
  font-size: .9rem;
  color: var(--adm-muted);
  box-shadow: var(--adm-shadow);
}

.summary-footer strong {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--adm-navy);
}

/* ────────────────
   Empty State
──────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .8rem;
  padding: 4rem 1rem;
  color: var(--adm-muted);
  font-size: .95rem;
}

.empty-icon {
  font-size: 3rem;
}

.loading-ring {
  width: 40px;
  height: 40px;
  border: 3px solid var(--adm-border);
  border-top-color: var(--adm-navy);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ────────────────
   Modal
──────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11,37,69,.6);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-box {
  background: var(--adm-white);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--adm-shadow-lg);
  border-top: 4px solid var(--adm-navy);
}

.modal-sm {
  max-width: 420px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--adm-border);
}

.modal-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--adm-navy);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--adm-muted);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s;
}

.modal-close:hover {
  background: var(--adm-bg);
  color: var(--adm-red);
}

.modal-form {
  padding: 1.3rem 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.form-group label {
  font-size: .8rem;
  font-weight: 700;
  color: var(--adm-navy);
  text-transform: uppercase;
  letter-spacing: .5px;
}

.req { color: var(--adm-red); }

.form-hint {
  font-size: .75rem;
  color: var(--adm-muted);
  margin-top: .15rem;
}

.form-hint-warn {
  color: var(--adm-amber);
  font-weight: 600;
}

.form-group input,
.form-group select {
  padding: .6rem .85rem;
  border: 1.5px solid var(--adm-border);
  border-radius: 8px;
  font-size: .9rem;
  background: var(--adm-white);
  color: var(--adm-text);
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--adm-navy);
  box-shadow: 0 0 0 3px rgba(11,37,69,.08);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: .7rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--adm-border);
}

/* ────────────────
   Hapus body
──────────────── */
.hapus-body {
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .7rem;
}

.hapus-icon {
  font-size: 2.5rem;
  color: var(--adm-amber);
}

.hapus-warn {
  font-size: .82rem;
  color: var(--adm-muted);
  line-height: 1.6;
}

/* ────────────────
   Notifications
──────────────── */
.notif {
  margin: .8rem 1.5rem 0;
  padding: .65rem 1rem;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 600;
}

.notif-error {
  background: var(--adm-red-light);
  color: var(--adm-red);
  border: 1px solid #fca5a5;
}

.notif-success {
  background: var(--adm-green-light);
  color: var(--adm-green);
  border: 1px solid #86efac;
}

/* ────────────────
   Transitions
──────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity .25s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.notif-enter-active,
.notif-leave-active { transition: all .3s ease; }
.notif-enter-from,
.notif-leave-to { opacity: 0; transform: translateY(-6px); }

/* ────────────────
   Hamburger
──────────────── */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--adm-bg);
  border-radius: 8px;
  cursor: pointer;
  padding: 6px;
  flex-shrink: 0;
}
.hamburger-btn span {
  display: block;
  height: 2px;
  background: var(--adm-navy);
  border-radius: 2px;
  transition: all .25s;
}

/* ────────────────
   Sidebar Overlay
──────────────── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 99;
  opacity: 0;
  transition: opacity .3s;
}

/* ────────────────
   Responsive
──────────────── */
@media (max-width: 900px) {
  .topbar-right .stat-pill.hide-xs { display: none; }
}

@media (max-width: 768px) {
  /* Hamburger visible */
  .hamburger-btn { display: flex; }

  /* Sidebar slide in dari kiri */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-110%);
    transition: transform .3s ease, width .3s ease;
    z-index: 200;
    width: var(--adm-sidebar-w) !important;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }

  /* Overlay */
  .sidebar-overlay {
    display: block;
  }
  .sidebar-overlay.active {
    opacity: 1;
    pointer-events: all;
  }

  /* Main content full width */
  .admin-main { width: 100%; }

  /* Topbar */
  .topbar {
    padding: .75rem 1rem;
    gap: .6rem;
  }
  .topbar-left {
    display: flex;
    align-items: center;
    gap: .7rem;
  }

  /* Tab content */
  .tab-content { padding: 1rem 1rem 3rem; }

  /* Action bar */
  .action-bar { flex-direction: column; align-items: stretch; }
  .search-wrap { max-width: 100%; }
  .stat-chips { margin-left: 0; justify-content: flex-start; flex-wrap: wrap; }
  .filter-select { min-width: unset; width: 100%; }

  /* Tables — horizontal scroll */
  .table-card { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .data-table { min-width: 600px; }

  /* Modal form grid */
  .form-grid { grid-template-columns: 1fr; }

  /* Hide breadcrumb on xs */
  .page-breadcrumb { display: none; }
}

@media (max-width: 480px) {
  .stat-pill { font-size: .72rem; padding: .25rem .65rem; }
  .page-title { font-size: 1rem; }
  .tab-content { padding: .75rem .75rem 3rem; }
}
</style>