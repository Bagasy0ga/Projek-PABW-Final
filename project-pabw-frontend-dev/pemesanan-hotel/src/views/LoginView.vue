<template>
  <section class="auth-page">
    <div class="auth-card">
      <div
        v-if="mode !== 'forgot' && !(mode === 'login' && loginStep === 'otp')"
        class="auth-tabs"
      >
        <button
          :class="['tab', { active: mode === 'login' }]"
          @click="switchMode('login')"
        >
          Masuk
        </button>

        <button
          :class="['tab', { active: mode === 'register' }]"
          @click="switchMode('register')"
        >
          Daftar
        </button>
      </div>

      <form
        v-if="mode === 'login' && loginStep === 'password'"
        @submit.prevent="handleLogin"
        class="auth-form"
      >
        <div class="auth-header">
          <h2>Selamat Datang Kembali</h2>
          <p>Masuk untuk melakukan reservasi</p>
        </div>

        <div class="form-group">
          <label>Email atau ID Mitra</label>
          <input
            type="text"
            v-model="loginForm.email"
            placeholder="email@contoh.com atau ID Mitra"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>

          <div class="input-password">
            <input
              :type="showLoginPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              placeholder="Password"
              required
            />

            <button
              type="button"
              class="toggle-pass"
              @click="showLoginPassword = !showLoginPassword"
            >
              {{ showLoginPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-row-end">
          <button type="button" class="link-btn" @click="switchMode('forgot')">
            Lupa password?
          </button>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <form
        v-else-if="mode === 'login' && loginStep === 'otp'"
        @submit.prevent="handleLoginOtpVerify"
        class="auth-form login-otp-form"
      >
        <button type="button" class="forgot-back" @click="backToLoginPassword">
          <span class="forgot-back-icon">←</span>
          <span>Kembali ke Login</span>
        </button>

        <div class="forgot-icon">🔑</div>

        <div class="auth-header forgot-header">
          <h2>Verifikasi Login</h2>
          <p>Kode OTP login sudah dikirim ke {{ loginOtpEmail }}.</p>
        </div>

        <div class="form-group">
          <label>Kode OTP Login</label>
          <input
            type="text"
            v-model="loginOtp"
            placeholder="Masukkan 6 digit OTP"
            maxlength="6"
            required
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

        <button type="submit" class="btn btn-primary btn-full forgot-submit" :disabled="loading">
          {{ loading ? 'Memverifikasi...' : 'Verifikasi OTP' }}
        </button>
      </form>

      <form
        v-else-if="mode === 'register'"
        @submit.prevent="handleRegister"
        class="auth-form"
      >
        <div class="auth-header">
          <h2>Buat Akun Baru</h2>
        </div>

        <div class="form-group">
          <label>Nama Lengkap</label>
          <input
            type="text"
            v-model="regForm.name"
            placeholder="Nama lengkap"
            required
          />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="regForm.email"
            placeholder="email@contoh.com"
            required
          />
        </div>

        <div class="form-group">
          <label>No. Telepon</label>
          <input
            type="tel"
            v-model="regForm.phone"
            placeholder="0812 3456 7890"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>

          <div class="input-password">
            <input
              :type="showRegisterPassword ? 'text' : 'password'"
              v-model="regForm.password"
              placeholder="Minimal 6 karakter"
              required
              minlength="6"
            />

            <button
              type="button"
              class="toggle-pass"
              @click="showRegisterPassword = !showRegisterPassword"
            >
              {{ showRegisterPassword ? '🙈' : '👁' }}
            </button>
          </div>

          <div v-if="regForm.password.length > 0" class="password-strength">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="passwordStrength.className"
                :style="{ width: passwordStrength.percent + '%' }"
              ></div>
            </div>

            <p :class="['strength-text', passwordStrength.className]">
              {{ passwordStrength.label }}
            </p>
          </div>
        </div>

        <div class="form-group">
          <label>Konfirmasi Password</label>

          <div class="input-password">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="regForm.confirm"
              placeholder="Ulangi password"
              required
              :class="{
                'input-error': passwordMismatch,
                'input-success': passwordMatched
              }"
            />

            <button
              type="button"
              class="toggle-pass"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁' }}
            </button>
          </div>

          <p
            v-if="confirmPasswordMessage"
            :class="passwordMismatch ? 'field-error' : 'field-success'"
          >
            {{ confirmPasswordMessage }}
          </p>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :disabled="loading || passwordMismatch"
        >
          {{ loading ? 'Mengirim OTP...' : 'Submit' }}
        </button>
      </form>

      <form
        v-else-if="mode === 'verify'"
        @submit.prevent="handleVerifyEmail"
        class="auth-form"
      >
        <div class="auth-header">
          <h2>Verifikasi Email</h2>
          <p>Kode OTP sudah dikirim ke {{ verificationEmail }}</p>
        </div>

        <div class="form-group">
          <label>Kode OTP</label>
          <input
            type="text"
            v-model="otpForm.otp"
            placeholder="Masukkan 6 digit OTP"
            maxlength="6"
            required
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Memverifikasi...' : 'Verifikasi Email' }}
        </button>

        <button type="button" class="link-btn" @click="handleResendOtp" :disabled="loading">
          Kirim ulang OTP
        </button>

        <button type="button" class="link-btn" @click="switchMode('login')">
          Kembali ke Login
        </button>
      </form>

      <div v-else class="auth-form forgot-form">
        <button type="button" class="forgot-back" @click="switchMode('login')">
          <span class="forgot-back-icon">←</span>
          <span>Kembali ke Login</span>
        </button>

        <div v-if="forgotStep === 'request'" class="forgot-box">
          <div class="forgot-icon">🔐</div>

          <div class="auth-header forgot-header">
            <h2>Lupa Password?</h2>
            <p>Masukkan email akun Anda. Kami akan mengirim kode OTP untuk reset password.</p>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="forgotEmail"
              placeholder="Masukkan email akun Anda"
            />
          </div>

          <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
          <p v-if="forgotSuccess" class="success-msg">Kode OTP sudah dikirim ke email.</p>

          <button
            type="button"
            class="btn btn-primary btn-full forgot-submit"
            @click="handleForgotRequest"
            :disabled="forgotLoading"
          >
            {{ forgotLoading ? 'Mengirim OTP...' : 'Kirim Kode OTP' }}
          </button>
        </div>

        <div v-else-if="forgotStep === 'otp'" class="forgot-box">
          <div class="forgot-icon">🔑</div>

          <div class="auth-header forgot-header">
            <h2>Verifikasi OTP</h2>
            <p>Masukkan kode OTP yang dikirim ke {{ forgotEmail }}.</p>
          </div>

          <div class="form-group">
            <label>Kode OTP</label>
            <input
              type="text"
              v-model="forgotOtp"
              placeholder="Masukkan 6 digit OTP"
              maxlength="6"
            />
          </div>

          <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
          <p v-if="forgotSuccess" class="success-msg">OTP berhasil diverifikasi.</p>

          <button
            type="button"
            class="btn btn-primary btn-full forgot-submit"
            @click="handleForgotOtpVerify"
            :disabled="forgotLoading"
          >
            {{ forgotLoading ? 'Memverifikasi...' : 'Verifikasi OTP' }}
          </button>

          <button type="button" class="forgot-secondary" @click="handleBackToForgotEmail">
            Gunakan email lain
          </button>
        </div>

        <div v-else class="forgot-box">
          <div class="forgot-icon">🔒</div>

          <div class="auth-header forgot-header">
            <h2>Buat Password Baru</h2>
            <p>OTP sudah benar. Sekarang buat password baru untuk akun Anda.</p>
          </div>

          <div class="form-group">
            <label>Password Baru</label>

            <div class="input-password">
              <input
                :type="showForgotPassword ? 'text' : 'password'"
                v-model="forgotPassword"
                placeholder="Minimal 6 karakter"
                minlength="6"
              />

              <button
                type="button"
                class="toggle-pass"
                @click="showForgotPassword = !showForgotPassword"
              >
                {{ showForgotPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Konfirmasi Password Baru</label>

            <div class="input-password">
              <input
                :type="showForgotConfirmPassword ? 'text' : 'password'"
                v-model="forgotConfirmPassword"
                placeholder="Ulangi password baru"
                minlength="6"
              />

              <button
                type="button"
                class="toggle-pass"
                @click="showForgotConfirmPassword = !showForgotConfirmPassword"
              >
                {{ showForgotConfirmPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <p v-if="forgotError" class="error-msg">{{ forgotError }}</p>
          <p v-if="forgotSuccess" class="success-msg">Password berhasil direset.</p>

          <button
            type="button"
            class="btn btn-primary btn-full forgot-submit"
            @click="handleForgotConfirm"
            :disabled="forgotLoading"
          >
            {{ forgotLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiPost } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref('login')
const error = ref('')
const successMessage = ref('')
const loading = ref(false)

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

const loginStep = ref('password')
const loginOtpEmail = ref('')
const loginOtpRole = ref('customer')
const loginOtp = ref('')

const forgotStep = ref('request')
const forgotEmail = ref('')
const forgotOtp = ref('')
const forgotResetToken = ref('')
const forgotPassword = ref('')
const forgotConfirmPassword = ref('')
const forgotSuccess = ref(false)
const forgotError = ref('')
const forgotLoading = ref(false)

const showForgotPassword = ref(false)
const showForgotConfirmPassword = ref(false)

const verificationEmail = ref('')

const loginForm = ref({
  email: '',
  password: ''
})

const regForm = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: ''
})

const otpForm = ref({
  otp: ''
})

const passwordMismatch = computed(() => {
  return regForm.value.confirm.length > 0 &&
    regForm.value.password !== regForm.value.confirm
})

const passwordMatched = computed(() => {
  return regForm.value.confirm.length > 0 &&
    regForm.value.password === regForm.value.confirm
})

const confirmPasswordMessage = computed(() => {
  if (regForm.value.confirm.length === 0) {
    return ''
  }

  if (passwordMismatch.value) {
    return 'Konfirmasi password tidak sama.'
  }

  return 'Konfirmasi password sudah sesuai.'
})

const passwordStrength = computed(() => {
  const password = regForm.value.password

  let score = 0

  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (password.length === 0) {
    return {
      label: '',
      className: '',
      percent: 0
    }
  }

  if (score <= 2) {
    return {
      label: 'Password lemah',
      className: 'weak',
      percent: 33
    }
  }

  if (score <= 4) {
    return {
      label: 'Password sedang',
      className: 'medium',
      percent: 66
    }
  }

  return {
    label: 'Password kuat',
    className: 'strong',
    percent: 100
  }
})

function switchMode(nextMode) {
  mode.value = nextMode
  error.value = ''
  successMessage.value = ''
  forgotError.value = ''
  forgotSuccess.value = false

  if (nextMode !== 'login') {
    loginStep.value = 'password'
    loginOtp.value = ''
    loginOtpEmail.value = ''
    loginOtpRole.value = 'customer'
  }

  if (nextMode !== 'forgot') {
    forgotStep.value = 'request'
    forgotEmail.value = ''
    forgotOtp.value = ''
    forgotResetToken.value = ''
    forgotPassword.value = ''
    forgotConfirmPassword.value = ''
  }
}

function redirectAfterLogin() {
  const role = auth.user?.role

  if (role === 'mitra') {
    router.push('/mitra')
    return
  }

  if (role === 'admin') {
    router.push('/admin')
    return
  }

  router.push(route.query.redirect || '/')
}

async function handleLogin() {
  error.value = ''
  successMessage.value = ''
  loading.value = true

  const result = await auth.login(loginForm.value.email, loginForm.value.password)

  loading.value = false

  if (result.success && result.requiresOtp) {
    loginOtpEmail.value = result.email
    loginOtpRole.value = result.role || 'customer'
    loginStep.value = 'otp'
    successMessage.value = result.message || 'Kode OTP login sudah dikirim ke email.'
    return
  }

  if (result.success) {
    redirectAfterLogin()
    return
  }

  if (result.payload?.requires_verification) {
    verificationEmail.value = result.payload.email || loginForm.value.email
    mode.value = 'verify'
    return
  }

  error.value = result.message
}

async function handleLoginOtpVerify() {
  error.value = ''
  successMessage.value = ''

  if (!loginOtp.value || loginOtp.value.trim() === '') {
    error.value = 'Kode OTP login wajib diisi.'
    return
  }

  loading.value = true

  const result = await auth.verifyLoginOtp(
    loginOtpEmail.value,
    loginOtp.value,
    loginOtpRole.value
  )

  loading.value = false

  if (result.success) {
    loginStep.value = 'password'
    loginOtp.value = ''
    loginOtpEmail.value = ''
    loginOtpRole.value = 'customer'
    redirectAfterLogin()
    return
  }

  error.value = result.message
}

function backToLoginPassword() {
  loginStep.value = 'password'
  loginOtp.value = ''
  loginOtpEmail.value = ''
  loginOtpRole.value = 'customer'
  successMessage.value = ''
  error.value = ''
}

async function handleRegister() {
  error.value = ''
  successMessage.value = ''

  if (regForm.value.password.length < 6) {
    error.value = 'Password minimal 6 karakter.'
    return
  }

  if (passwordMismatch.value || regForm.value.password !== regForm.value.confirm) {
    error.value = 'Konfirmasi password tidak sama.'
    return
  }

  loading.value = true

  const result = await auth.register(
    regForm.value.name,
    regForm.value.email,
    regForm.value.password,
    regForm.value.phone
  )

  loading.value = false

  if (result.success) {
    verificationEmail.value = result.email
    successMessage.value = 'Kode OTP sudah dikirim ke email.'
    mode.value = 'verify'
    return
  }

  error.value = result.message
}

async function handleVerifyEmail() {
  error.value = ''
  successMessage.value = ''

  if (!verificationEmail.value) {
    error.value = 'Email verifikasi tidak ditemukan. Silakan daftar ulang.'
    return
  }

  if (!otpForm.value.otp) {
    error.value = 'Kode OTP wajib diisi.'
    return
  }

  loading.value = true

  const result = await auth.verifyEmail(verificationEmail.value, otpForm.value.otp)

  loading.value = false

  if (result.success) {
    redirectAfterLogin()
    return
  }

  error.value = result.message
}

async function handleResendOtp() {
  error.value = ''
  successMessage.value = ''

  if (!verificationEmail.value) {
    error.value = 'Email verifikasi tidak ditemukan.'
    return
  }

  loading.value = true

  const result = await auth.resendVerification(verificationEmail.value)

  loading.value = false

  if (result.success) {
    successMessage.value = result.message || 'Kode OTP baru sudah dikirim.'
    return
  }

  error.value = result.message
}

async function handleForgotRequest() {
  forgotError.value = ''
  forgotSuccess.value = false

  if (!forgotEmail.value || forgotEmail.value.trim() === '') {
    forgotError.value = 'Email wajib diisi.'
    return
  }

  forgotLoading.value = true

  try {
    await apiPost('/auth/forgot-password', {
      email: forgotEmail.value,
      user_type: 'customer'
    })

    forgotSuccess.value = true

    setTimeout(() => {
      forgotSuccess.value = false
      forgotStep.value = 'otp'
    }, 700)
  } catch (error) {
    forgotError.value = error.message || 'Gagal mengirim OTP reset password.'
  } finally {
    forgotLoading.value = false
  }
}

async function handleForgotOtpVerify() {
  forgotError.value = ''
  forgotSuccess.value = false

  if (!forgotOtp.value || forgotOtp.value.trim() === '') {
    forgotError.value = 'Kode OTP wajib diisi.'
    return
  }

  forgotLoading.value = true

  try {
    const response = await apiPost('/auth/reset-password/verify-otp', {
      email: forgotEmail.value,
      otp: forgotOtp.value,
      user_type: 'customer'
    })

    forgotResetToken.value = response?.reset_token || ''
    forgotSuccess.value = true

    setTimeout(() => {
      forgotSuccess.value = false
      forgotStep.value = 'newPassword'
    }, 700)
  } catch (error) {
    forgotError.value = error.message || 'Verifikasi OTP gagal.'
  } finally {
    forgotLoading.value = false
  }
}

async function handleForgotConfirm() {
  forgotError.value = ''
  forgotSuccess.value = false

  if (!forgotResetToken.value) {
    forgotError.value = 'Token reset password tidak ditemukan. Silakan verifikasi OTP ulang.'
    return
  }

  if (!forgotPassword.value || forgotPassword.value.trim() === '') {
    forgotError.value = 'Password baru wajib diisi.'
    return
  }

  if (forgotPassword.value.length < 6) {
    forgotError.value = 'Password baru minimal 6 karakter.'
    return
  }

  if (forgotPassword.value !== forgotConfirmPassword.value) {
    forgotError.value = 'Konfirmasi password baru tidak sama.'
    return
  }

  forgotLoading.value = true

  try {
    await apiPost('/auth/reset-password/confirm', {
      reset_token: forgotResetToken.value,
      new_password: forgotPassword.value
    })

    forgotSuccess.value = true

    setTimeout(() => {
      forgotStep.value = 'request'
      forgotEmail.value = ''
      forgotOtp.value = ''
      forgotResetToken.value = ''
      forgotPassword.value = ''
      forgotConfirmPassword.value = ''
      switchMode('login')
    }, 1500)
  } catch (error) {
    forgotError.value = error.message || 'Reset password gagal.'
  } finally {
    forgotLoading.value = false
  }
}

function handleBackToForgotEmail() {
  forgotStep.value = 'request'
  forgotOtp.value = ''
  forgotResetToken.value = ''
  forgotPassword.value = ''
  forgotConfirmPassword.value = ''
  forgotError.value = ''
  forgotSuccess.value = false
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-light);
}

.auth-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 460px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border-top: 4px solid var(--accent-color);
}

.auth-tabs {
  display: flex;
}

.tab {
  flex: 1;
  padding: 1rem;
  border: none;
  background: var(--bg-light);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-light);
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab.active {
  background: white;
  color: var(--primary-color);
  border-bottom-color: var(--accent-color);
}

.auth-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.auth-header h2 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}

.auth-header p {
  color: var(--text-light);
  font-size: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(0,180,216,0.12);
}

.input-password {
  position: relative;
}

.input-password input {
  width: 100%;
  padding-right: 50px;
}

.toggle-pass {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
}

.form-row-end {
  display: flex;
  justify-content: flex-end;
}

.link-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent-color);
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  background: #fdf0f0;
  padding: 0.7rem;
  border-radius: 8px;
}

.success-msg {
  color: var(--success-color);
  font-size: 0.9rem;
  text-align: center;
  background: #f0fdf4;
  padding: 0.7rem;
  border-radius: 8px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2;
}

.input-success {
  border-color: #16a34a !important;
  background-color: #f0fdf4;
}

.field-error {
  margin-top: 6px;
  font-size: 13px;
  color: #dc2626;
}

.field-success {
  margin-top: 6px;
  font-size: 13px;
  color: #16a34a;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background-color: #e5e7eb;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}

.strength-fill.weak {
  background-color: #dc2626;
}

.strength-fill.medium {
  background-color: #f59e0b;
}

.strength-fill.strong {
  background-color: #16a34a;
}

.strength-text {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
}

.strength-text.weak {
  color: #dc2626;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #16a34a;
}

.forgot-form {
  padding-top: 0;
}

.login-otp-form {
  padding-top: 1.5rem;
}

.forgot-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  margin: 8px 0 24px;
  padding: 9px 14px;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  background: #f8fafc;
  color: #1f3b63;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.forgot-back:hover {
  background: #fff7ed;
  border-color: #d08436;
  color: #d08436;
  transform: translateX(-2px);
}

.forgot-back-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #e8eef7;
  font-size: 14px;
  font-weight: 800;
}

.forgot-back:hover .forgot-back-icon {
  background: #fde8d0;
}

.forgot-box {
  width: 100%;
}

.forgot-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #f3f6fb;
  font-size: 28px;
}

.forgot-header {
  margin-bottom: 24px;
  text-align: center;
}

.forgot-header h2 {
  margin-bottom: 10px;
  color: #07162f;
  font-size: 26px;
  font-weight: 800;
}

.forgot-header p {
  max-width: 340px;
  margin: 0 auto;
  color: #4b638d;
  font-size: 14px;
  line-height: 1.65;
}

.forgot-secondary {
  width: 100%;
  margin-top: 14px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  color: #23416f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.forgot-secondary:hover {
  color: #d08436;
}

.forgot-box .form-group {
  margin-bottom: 22px;
}

.forgot-box input,
.login-otp-form input {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 14px 16px;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
}

.forgot-box input:focus,
.login-otp-form input:focus {
  outline: none;
  border-color: #d08436;
  box-shadow: 0 0 0 3px rgba(208, 132, 54, 0.16);
}

.forgot-submit {
  margin-top: 8px;
  height: 48px;
  border-radius: 8px;
}

@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }

  .auth-form {
    padding: 1.6rem;
  }

  .forgot-header h2 {
    font-size: 23px;
  }

  .forgot-icon {
    width: 52px;
    height: 52px;
    font-size: 24px;
  }

  .forgot-header p {
    font-size: 13px;
  }
}
</style>