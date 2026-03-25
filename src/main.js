import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import { installModules } from '@/modules/_loader'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)

// Register plugins
registerPlugins(app)

// Register modules
installModules(app)

// Mount vue app
app.mount('#app')

// Dọn dẹp Mock Service Worker trên trình duyệt khách nếu nó còn tồn tại (cho an toàn triệt để)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      if (registration.active?.scriptURL.includes('mockServiceWorker')) {
        registration.unregister().then(() => {
          console.log('MSW (Mock Service Worker) has been successfully unregistered.');
        });
      }
    }
  });
}
