import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Gắn Pusher vào window object để Echo có thể sử dụng (bắt buộc)
window.Pusher = Pusher

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || '1nxjk05iqscnzrcfyffx',
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
  enabledTransports: ['ws', 'wss'],

  // Custom authorizer để gửi kèm Bearer Token và X-Organization-Id xác thực private channel
  authorizer: channel => {
    return {
      authorize: (socketId, callback) => {
        const cookies = document.cookie.split('; ').reduce((acc, current) => {
          const [key, value] = current.split('=')

          acc[key] = value

          return acc
        }, {})

        const token = cookies.accessToken || localStorage.getItem('accessToken') || ''
        const orgId = cookies.currentOrganizationId || localStorage.getItem('currentOrganizationId') || ''

        fetch(`${import.meta.env.VITE_API_BASE_URL}/broadcasting/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Organization-Id': orgId,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Authorization failed with status ${response.status}`)
            }

            return response.json()
          })
          .then(data => {
            callback(false, data)
          })
          .catch(error => {
            console.error('WebSocket Auth Error: ', error)
            callback(true, error)
          })
      },
    }
  },
})

window.Echo = echo

export default function install(app) {
  // Provide cho Vue App để dùng dạng inject('echo')
  app.provide('echo', echo)
}
