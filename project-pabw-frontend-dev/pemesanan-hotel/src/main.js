import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)


const pinia = createPinia()
app.use(pinia)

import router from './router'
app.use(router)

import './assets/styles/global.css'

app.mount('#app')