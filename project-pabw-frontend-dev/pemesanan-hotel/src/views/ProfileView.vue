<template>
  <section class="profile-page">
    <div class="container">
      <div class="profile-layout">

        <aside class="profile-sidebar">
          <div class="avatar-wrap">
            <div class="avatar-circle">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="avatar-ring"></div>
          </div>

          <h3 class="sidebar-name">{{ auth.user?.name }}</h3>
          <p class="sidebar-email">{{ auth.user?.email }}</p>

          <div class="info-chips">
            <div class="info-chip">
              <span class="chip-icon"></span>
              <span>{{ auth.user?.phone || '-' }}</span>
            </div>

            <div class="info-chip">
              <span class="chip-icon"></span>
              <span>{{ auth.user?.role || 'Member' }}</span>
            </div>
          </div>

          <div class="sidebar-menu">
            <button
              :class="['menu-btn', { active: tab === 'profile' }]"
              @click="switchTab('profile')"
            >
              <span class="menu-icon"></span>
              <span>Edit Profil</span>
            </button>

            <button
              :class="['menu-btn', { active: tab === 'password' }]"
              @click="switchTab('password')"
            >
              <span class="menu-icon"></span>
              <span>Ubah Password</span>
            </button>
          </div>
        </aside>

        <div class="profile-content">

          <div v-if="tab === 'profile'" class="content-card">
            <div class="card-header">
              <div class="card-icon"></div>

              <div>
                <h2>Edit Profil</h2>
                <p class="card-subtitle">Perbarui informasi pribadi Anda</p>
              </div>
            </div>

            <Transition name="notif">
              <div v-if="profileSuccess" class="notif notif-success">
                Profil berhasil diperbarui!
              </div>
            </Transition>

            <Transition name="notif">
              <div v-if="profileError" class="notif notif-error">
                {{ profileError }}
              </div>
            </Transition>

            <form @submit.prevent="saveProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Nama Lengkap <span class="req">*</span></label>
                  <input
                    type="text"
                    v-model="profileForm.name"
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div class="form-group">
                  <label>Email <span class="req">*</span></label>
                  <input
                    type="email"
                    v-model="profileForm.email"
                    disabled
                    class="input-disabled"
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>No. Telepon</label>
                <input
                  type="tel"
                  v-model="profileForm.phone"
                  placeholder="+62 812 0000 0000"
                />
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="profileLoading"
                >
                  <span></span>
                  {{ profileLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else class="content-card">
            <div class="card-header">
              <div class="card-icon"></div>

              <div>
                <h2>Ubah Password</h2>
                <p class="card-subtitle">
                  Password baru akan disimpan setelah verifikasi OTP email
                </p>
              </div>
            </div>

            <Transition name="notif">
              <div v-if="passError" class="notif notif-error">
                {{ passError }}
              </div>
            </Transition>

            <Transition name="notif">
              <div v-if="passSuccess" class="notif notif-success">
                {{ passSuccess }}
              </div>
            </Transition>

            <form
              v-if="passwordStep === 'form'"
              @submit.prevent="requestChangePasswordOtp"
              class="profile-form"
            >
              <div class="form-group">
                <label>Password Lama <span class="req">*</span></label>

                <div class="input-password">
                  <input
                    :type="showOldPassword ? 'text' : 'password'"
                    v-model="passForm.old"
                    required
                    placeholder="Password saat ini"
                  />

                  <button
                    type="button"
                    class="toggle-pass"
                    @click="showOldPassword = !showOldPassword"
                  >
                    {{ showOldPassword ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Password Baru <span class="req">*</span></label>

                  <div class="input-password">
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      v-model="passForm.new"
                      required
                      placeholder="Min. 6 karakter"
                      minlength="6"
                    />

                    <button
                      type="button"
                      class="toggle-pass"
                      @click="showNewPassword = !showNewPassword"
                    >
                      {{ showNewPassword ? '🙈' : '👁' }}
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Konfirmasi Password <span class="req">*</span></label>

                  <div class="input-password">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      v-model="passForm.confirm"
                      required
                      placeholder="Ulangi password baru"
                    />

                    <button
                      type="button"
                      class="toggle-pass"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      {{ showConfirmPassword ? '🙈' : '👁' }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="passForm.new" class="strength-wrap">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :style="{ width: strengthPct + '%', background: strengthColor }"
                  ></div>
                </div>

                <span class="strength-label" :style="{ color: strengthColor }">
                  {{ strengthLabel }}
                </span>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="passwordLoading"
                >
                  <span></span>
                  {{ passwordLoading ? 'Mengirim OTP...' : 'Submit' }}
                </button>
              </div>
            </form>

            <form
              v-else
              @submit.prevent="confirmChangePasswordOtp"
              class="profile-form"
            >
              <div class="otp-box">
                <div class="otp-icon">🔐</div>

                <div>
                  <h3>Verifikasi OTP</h3>
                  <p>
                    Kode OTP sudah dikirim ke email akun Anda. Masukkan kode tersebut untuk menyimpan password baru.
                  </p>
                </div>
              </div>

              <div class="form-group">
                <label>Kode OTP <span class="req">*</span></label>
                <input
                  type="text"
                  v-model="passForm.otp"
                  required
                  maxlength="6"
                  placeholder="Masukkan 6 digit OTP"
                />
              </div>

              <div class="form-actions password-actions">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="cancelChangePasswordOtp"
                  :disabled="passwordLoading"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="passwordLoading"
                >
                  {{ passwordLoading ? 'Memverifikasi...' : 'Konfirmasi Ganti Password' }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { apiPost } from '@/services/api'
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const tab = ref('profile')

const profileSuccess = ref(false)
const profileError = ref('')
const profileLoading = ref(false)

const passwordStep = ref('form')
const passwordLoading = ref(false)
const passError = ref('')
const passSuccess = ref('')
const pendingNewPassword = ref('')

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = reactive({
  name: '',
  email: '',
  phone: ''
})

const passForm = reactive({
  old: '',
  new: '',
  confirm: '',
  otp: ''
})

onMounted(() => {
  profileForm.name = auth.user?.name || ''
  profileForm.email = auth.user?.email || ''
  profileForm.phone = auth.user?.phone || ''
})

function switchTab(nextTab) {
  tab.value = nextTab
  profileError.value = ''
  profileSuccess.value = false

  if (nextTab !== 'password') {
    resetPasswordForm()
  }
}

async function saveProfile() {
  profileSuccess.value = false
  profileError.value = ''
  profileLoading.value = true

  try {
    await auth.updateProfile({
      name: profileForm.name,
      phone: profileForm.phone
    })

    profileForm.name = auth.user?.name || profileForm.name
    profileForm.email = auth.user?.email || profileForm.email
    profileForm.phone = auth.user?.phone || profileForm.phone

    profileSuccess.value = true

    setTimeout(() => {
      profileSuccess.value = false
    }, 3000)
  } catch (error) {
    profileError.value = error.message || 'Gagal memperbarui profil.'
  } finally {
    profileLoading.value = false
  }
}

async function requestChangePasswordOtp() {
  passError.value = ''
  passSuccess.value = ''

  if (!passForm.old || passForm.old.trim() === '') {
    passError.value = 'Password lama wajib diisi.'
    return
  }

  if (!passForm.new || passForm.new.trim() === '') {
    passError.value = 'Password baru wajib diisi.'
    return
  }

  if (passForm.new.length < 6) {
    passError.value = 'Password baru minimal 6 karakter.'
    return
  }

  if (passForm.new !== passForm.confirm) {
    passError.value = 'Konfirmasi password baru tidak sama.'
    return
  }

  passwordLoading.value = true

  try {
    await apiPost('/auth/change-password', {
      old_password: passForm.old,
      new_password: passForm.new
    })

    pendingNewPassword.value = passForm.new
    passwordStep.value = 'otp'
    passSuccess.value = 'Kode OTP ganti password sudah dikirim ke email.'
  } catch (error) {
    passError.value = error.message || 'Gagal mengirim OTP ganti password.'
  } finally {
    passwordLoading.value = false
  }
}

async function confirmChangePasswordOtp() {
  passError.value = ''
  passSuccess.value = ''

  if (!passForm.otp || passForm.otp.trim() === '') {
    passError.value = 'Kode OTP wajib diisi.'
    return
  }

  if (!pendingNewPassword.value) {
    passError.value = 'Password baru tidak ditemukan. Silakan ulangi proses.'
    return
  }

  passwordLoading.value = true

  try {
    await apiPost('/auth/change-password/confirm', {
      otp: passForm.otp,
      new_password: pendingNewPassword.value
    })

    passSuccess.value = 'Password berhasil diubah.'
    resetPasswordForm(false)

    setTimeout(() => {
      passSuccess.value = ''
    }, 3000)
  } catch (error) {
    passError.value = error.message || 'Konfirmasi ganti password gagal.'
  } finally {
    passwordLoading.value = false
  }
}

function cancelChangePasswordOtp() {
  passwordStep.value = 'form'
  passForm.otp = ''
  pendingNewPassword.value = ''
  passError.value = ''
  passSuccess.value = ''
}

function resetPasswordForm(clearMessage = true) {
  passwordStep.value = 'form'
  passwordLoading.value = false
  pendingNewPassword.value = ''

  passForm.old = ''
  passForm.new = ''
  passForm.confirm = ''
  passForm.otp = ''

  showOldPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false

  if (clearMessage) {
    passError.value = ''
    passSuccess.value = ''
  }
}

const strengthPct = computed(() => {
  const p = passForm.new

  if (!p) return 0

  let score = 0

  if (p.length >= 6) score += 25
  if (p.length >= 10) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9!@#$%^&*]/.test(p)) score += 25

  return score
})

const strengthLabel = computed(() => {
  const s = strengthPct.value

  if (s <= 25) return 'Lemah'
  if (s <= 50) return 'Cukup'
  if (s <= 75) return 'Kuat'

  return 'Sangat Kuat'
})

const strengthColor = computed(() => {
  const s = strengthPct.value

  if (s <= 25) return '#ef4444'
  if (s <= 50) return '#f59e0b'
  if (s <= 75) return '#3b82f6'

  return '#22c55e'
})

function formatDate(d) {
  if (!d) return '-'

  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.profile-page {
  padding: 2.5rem 0 4rem;
  min-height: 80vh;
  background: var(--bg-light, #f4f6fb);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

.profile-sidebar {
  background: #fff;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 24px rgba(11,37,69,.09);
  text-align: center;
  position: sticky;
  top: 90px;
  border: 1px solid #e8edf5;
}

.avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 1.2rem;
}

.avatar-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0b2545 0%, #1a7a6e 100%);
  color: #fff;
  font-size: 2.4rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -1px;
  position: relative;
  z-index: 1;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 3px solid transparent;
  background: linear-gradient(135deg, #c9843a, #1a7a6e) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}

.sidebar-name {
  color: #0b2545;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 .3rem;
  line-height: 1.3;
}

.sidebar-email {
  color: #64748b;
  font-size: .83rem;
  margin: 0 0 1.2rem;
  word-break: break-all;
}

.info-chips {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-bottom: 1.5rem;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: .5rem;
  background: #f4f6fb;
  border-radius: 10px;
  padding: .5rem .85rem;
  font-size: .82rem;
  color: #334155;
  text-align: left;
}

.chip-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  border-top: 1px solid #e8edf5;
  padding-top: 1.2rem;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .75rem 1rem;
  border: 1.5px solid #e8edf5;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  font-size: .92rem;
  color: #334155;
  font-weight: 600;
  transition: all .2s ease;
  width: 100%;
  text-align: left;
}

.menu-btn:hover {
  border-color: #0b2545;
  color: #0b2545;
  background: #eef2f8;
}

.menu-btn.active {
  background: #0b2545;
  color: #fff;
  border-color: #0b2545;
}

.menu-icon {
  font-size: 1.1rem;
}

.content-card {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(11,37,69,.09);
  border: 1px solid #e8edf5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
  padding-bottom: 1.2rem;
  border-bottom: 2px solid #f0f4fa;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0b2545 0%, #0f3460 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.card-header h2 {
  color: #0b2545;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 .2rem;
}

.card-subtitle {
  color: #64748b;
  font-size: .84rem;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.form-group label {
  font-weight: 700;
  color: #0b2545;
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.req {
  color: #dc2626;
}

.form-group input {
  width: 100%;
  padding: .7rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: .95rem;
  font-family: inherit;
  color: #1e2a3a;
  background: #f8fafc;
  outline: none;
  transition: all .2s ease;
}

.form-group input:focus {
  border-color: #0b2545;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(11,37,69,.08);
}

.input-password {
  position: relative;
}

.input-password input {
  padding-right: 48px;
}

.toggle-pass {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
}

.strength-wrap {
  display: flex;
  align-items: center;
  gap: .75rem;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .4s ease, background .3s;
}

.strength-label {
  font-size: .78rem;
  font-weight: 700;
  white-space: nowrap;
}

.otp-box {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f4f6fb;
  border: 1px solid #e8edf5;
  border-radius: 14px;
}

.otp-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff7ed;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.otp-box h3 {
  margin: 0 0 .35rem;
  color: #0b2545;
  font-size: 1rem;
}

.otp-box p {
  margin: 0;
  color: #64748b;
  font-size: .88rem;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: .75rem;
  padding-top: .5rem;
  border-top: 1px solid #f0f4fa;
  margin-top: .5rem;
}

.password-actions {
  justify-content: space-between;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .7rem 1.5rem;
  border-radius: 10px;
  font-size: .92rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all .2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #0b2545 0%, #0f3460 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(11,37,69,.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(11,37,69,.3);
}

.btn-secondary {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:hover {
  background: #d1d5db;
}

button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

button:disabled:hover {
  transform: none;
}

.notif {
  padding: .75rem 1.1rem;
  border-radius: 10px;
  font-size: .9rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.notif-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #86efac;
}

.notif-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.notif-enter-active,
.notif-leave-active {
  transition: all .3s ease;
}

.notif-enter-from,
.notif-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.input-disabled {
  background: #eef2f7 !important;
  color: #64748b !important;
  cursor: not-allowed;
}

@media (max-width: 860px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    position: static;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0 1.5rem;
    text-align: left;
    align-items: start;
  }

  .avatar-wrap {
    margin: 0;
  }

  .info-chips {
    margin-bottom: .8rem;
  }

  .sidebar-name {
    margin-top: .3rem;
  }

  .sidebar-menu {
    grid-column: 1 / -1;
    flex-direction: row;
    flex-wrap: wrap;
    padding-top: 1rem;
  }

  .menu-btn {
    flex: 1;
    min-width: 140px;
  }
}

@media (max-width: 560px) {
  .profile-page {
    padding: 1.5rem 0 3rem;
  }

  .container {
    padding: 0 1rem;
  }

  .profile-sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .content-card {
    padding: 1.4rem 1.1rem;
  }

  .card-header {
    gap: .8rem;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }

  .card-header h2 {
    font-size: 1.1rem;
  }

  .sidebar-email {
    font-size: .8rem;
  }

  .form-actions,
  .password-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>