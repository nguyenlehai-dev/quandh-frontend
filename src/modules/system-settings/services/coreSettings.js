import { coreApi } from '@/modules/core/services/coreApi'

export const getCoreSettings = () => coreApi('/settings')

export const getPublicCoreSettings = () => coreApi('/settings/public')

export const getCoreSetting = key => coreApi(`/settings/${key}`)

export const updateCoreSettings = payload => coreApi('/settings', {
  method: 'PATCH',
  body: payload,
})

