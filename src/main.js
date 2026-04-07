import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)
  .then(() => {
    app.mount('#app')
  })
  .catch(error => {
    console.error('Failed to bootstrap app plugins.', error)
    app.mount('#app')
  })
