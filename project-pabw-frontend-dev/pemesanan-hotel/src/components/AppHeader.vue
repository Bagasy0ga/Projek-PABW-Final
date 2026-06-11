<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <RouterLink to="/"><h1>PABW<span>Hotels</span></h1></RouterLink>
        </div>

        <nav :class="['nav', { active: mobileMenuOpen }]">
          <RouterLink to="/" @click="closeMenu">Beranda</RouterLink>
          <RouterLink to="/hotels" @click="closeMenu">Hotel</RouterLink>

          <template v-if="auth.isLoggedIn">
            <RouterLink v-if="!auth.isMitra" to="/reservations" @click="closeMenu">Reservasi Saya</RouterLink>
            <RouterLink v-if="auth.isAdmin" to="/admin" class="admin-link" @click="closeMenu">Admin Dashboard</RouterLink>
            <RouterLink v-if="auth.isMitra" to="/mitra" class="mitra-link" @click="closeMenu">Dashboard Mitra</RouterLink>
            <div class="user-menu" @click.stop="toggleUserMenu">
              <div class="user-avatar">{{ auth.user.name.charAt(0) }}</div>
              <span class="user-name">{{ auth.user.name.split(' ')[0] }}</span>
              <span class="chevron">▾</span>
              <Transition name="dropdown">
                <div class="user-dropdown" v-if="userMenuOpen">
                  <RouterLink to="/profile" @click="closeAll">👤 Profil Saya</RouterLink>
                  <RouterLink to="/reservations" @click="closeAll">📋 Reservasi</RouterLink>
                  <hr />
                  <button @click="handleLogout">🚪 Keluar</button>
                </div>
              </Transition>
            </div>
          </template>

          <template v-else>
            <RouterLink to="/login" class="btn-login" @click="closeMenu">
              Masuk / Daftar
            </RouterLink>
          </template>
        </nav>

        <button
          class="mobile-menu-toggle"
          :class="{ active: mobileMenuOpen }"
          @click="toggleMenu"
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

function toggleMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : 'auto'
}

function closeMenu() {
  mobileMenuOpen.value = false
  document.body.style.overflow = 'auto'
}

function toggleUserMenu(e) {
  e.stopPropagation()
  userMenuOpen.value = !userMenuOpen.value
}

function closeAll() {
  userMenuOpen.value = false
  closeMenu()
}

function handleLogout() {
  auth.logout()
  closeAll()
  router.push('/')
}

function onClickOutside() {
  userMenuOpen.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    closeMenu()
    userMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.header {
  background: var(--navy-900);
  border-bottom: 1px solid rgba(255,255,255,.06);
  position: sticky; top: 0; z-index: 1000;
  box-shadow: 0 2px 24px rgba(13,27,46,.3);
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.header-content {
  display: flex; justify-content: space-between;
  align-items: center; padding: .9rem 0;
}

.logo a { text-decoration: none; }

.logo h1 {
  font-family: var(--font-body);
  font-size: 1.5rem; font-weight: 800;
  letter-spacing: 3px; color: #fff;
}

.logo h1 span {
  font-weight: 300; font-size: 1.1rem;
  color: rgba(255,255,255,.5); letter-spacing: 1px;
}

.nav { display: flex; gap: 2rem; align-items: center; }

.nav > a {
  color: rgba(255,255,255,.6); text-decoration: none;
  font-weight: 500; font-size: .85rem;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: .4rem 0; position: relative;
  transition: color .3s;
}

.nav > a::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; width: 0; height: 1.5px;
  background: var(--accent);
  transition: width .3s ease;
}

.nav > a:hover,
.nav > a.router-link-active { color: #fff; }
.nav > a:hover::after,
.nav > a.router-link-active::after { width: 100%; }

.btn-login {
  background: var(--accent) !important;
  color: #fff !important;
  padding: .5rem 1.3rem !important;
  border-radius: 3px; font-size: .75rem !important;
  letter-spacing: 2px; font-weight: 700 !important;
  transition: all .3s !important;
}

.btn-login:hover {
  background: var(--accent-dark) !important;
  transform: translateY(-2px);
}

.btn-login::after { display: none !important; }

.admin-link {
  background: var(--accent) !important;
  color: #fff !important;
  padding: .5rem 1.3rem !important;
  border-radius: 3px;
  font-size: .75rem !important;
  letter-spacing: 2px;
  font-weight: 700 !important;
  transition: all .3s !important;
}

.admin-link:hover {
  background: var(--accent-dark) !important;
  transform: translateY(-2px);
}

.admin-link::after { display: none !important; }

.mitra-link {
  background: #1a7a6e !important;
  color: #fff !important;
  padding: .5rem 1.3rem !important;
  border-radius: 3px;
  font-size: .75rem !important;
  letter-spacing: 2px;
  font-weight: 700 !important;
  transition: all .3s !important;
}

.mitra-link:hover {
  background: #145f56 !important;
  transform: translateY(-2px);
}

.mitra-link::after { display: none !important; }

/* User menu */
.user-menu {
  display: flex; align-items: center; gap: .5rem;
  cursor: pointer; position: relative;
  padding: .35rem .9rem;
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 3px;
  transition: all .3s;
}

.user-menu:hover { border-color: var(--accent); background: rgba(201,132,58,.08); }

.user-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--accent);
  color: #fff; font-weight: 700; font-size: .85rem;
  display: flex; align-items: center; justify-content: center;
}

.user-name { color: rgba(255,255,255,.85); font-weight: 500; font-size: .85rem; }
.chevron   { color: rgba(255,255,255,.4); font-size: .7rem; }

.user-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  background: var(--bg-white); border: 1px solid var(--border);
  border-radius: 6px; min-width: 180px;
  box-shadow: var(--shadow-lg); overflow: hidden; z-index: 200;
}

.dropdown-enter-active, .dropdown-leave-active { transition: all .2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

.user-dropdown a,
.user-dropdown button {
  display: block; width: 100%; padding: .7rem 1rem;
  color: var(--text-dark); text-decoration: none;
  font-size: .88rem; text-align: left;
  background: none; border: none; cursor: pointer;
  transition: background .2s;
}

.user-dropdown a:hover,
.user-dropdown button:hover {
  background: var(--amber-50); color: var(--accent-dark);
}

.user-dropdown hr { border: none; border-top: 1px solid var(--border); margin: 0; }

.mobile-menu-toggle {
  display: none; flex-direction: column; gap: 5px;
  cursor: pointer; padding: .5rem;
  background: none; border: none;
}

.mobile-menu-toggle span {
  width: 24px; height: 2px;
  background: rgba(255,255,255,.8);
  border-radius: 2px; display: block;
  transition: all .3s;
}

@media (max-width: 768px) {
  .nav {
    position: fixed; top: 58px; left: -100%;
    width: 100%; height: calc(100vh - 58px);
    background: var(--navy-900);
    flex-direction: column; gap: 0; padding: 1rem 0;
    transition: left .35s ease; align-items: stretch;
    overflow-y: auto; z-index: 999;
    border-top: 1px solid rgba(255,255,255,.06);
  }

  .nav.active { left: 0; }

  .nav > a {
    padding: .9rem 1.5rem; font-size: .9rem;
    border-bottom: 1px solid rgba(255,255,255,.05);
    color: rgba(255,255,255,.7);
  }

  .nav > a::after { display: none; }

  .admin-link {
    background: var(--accent) !important;
    padding: .9rem 1.5rem !important;
    border-radius: 0 !important;
    border-bottom: 1px solid rgba(255,255,255,.05) !important;
    font-size: .9rem !important;
  }

  .mitra-link {
    background: #1a7a6e !important;
    padding: .9rem 1.5rem !important;
    border-radius: 0 !important;
    border-bottom: 1px solid rgba(255,255,255,.05) !important;
    font-size: .9rem !important;
  }

  .user-menu {
    padding: .9rem 1.5rem; border-radius: 0;
    border: none; border-bottom: 1px solid rgba(255,255,255,.05);
    flex-wrap: wrap;
  }

  .user-dropdown {
    position: static; border: none; border-radius: 0;
    box-shadow: none;
    background: rgba(255,255,255,.04);
  }

  .user-dropdown a,
  .user-dropdown button { color: rgba(255,255,255,.75); }

  .user-dropdown a:hover,
  .user-dropdown button:hover {
    background: rgba(201,132,58,.12); color: var(--amber-300);
  }

  .user-dropdown hr { border-color: rgba(255,255,255,.08); }

  .mobile-menu-toggle { display: flex; }
  .mobile-menu-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(7px,7px); }
  .mobile-menu-toggle.active span:nth-child(2) { opacity: 0; }
  .mobile-menu-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(6px,-6px); }
}
</style>