import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin
const broadcastingAuthUrl = `${apiOrigin}/broadcasting/auth`

export const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  forceTLS: false,
  enabledTransports: ['ws'],
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

        fetch(broadcastingAuthUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(orgId ? { 'X-Organization-Id': orgId } : {}),
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(response => {
            if (!response.ok)
              throw new Error(`Authorization failed with status ${response.status}`)

            return response.json()
          })
          .then(data => {
            callback(false, data)
          })
          .catch(error => {
            callback(true, error)
          })
      },
    }
  },
})
