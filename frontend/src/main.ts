import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(Router.getRouter())
app.mount('#app')
