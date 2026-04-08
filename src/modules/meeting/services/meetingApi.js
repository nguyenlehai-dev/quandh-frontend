import { buildCoreCollectionQuery, coreApi, downloadCoreFile } from '@/modules/core/services/coreApi'

export const getMeetings = params => coreApi('/meetings', {
  query: buildCoreCollectionQuery(params),
})

export const getMeetingStats = params => coreApi('/meetings/stats', {
  query: buildCoreCollectionQuery(params),
})

export const getMeeting = meetingId => coreApi(`/meetings/${meetingId}`)

export const createMeeting = payload => coreApi('/meetings', {
  method: 'POST',
  body: payload,
})

export const updateMeeting = (meetingId, payload) => coreApi(`/meetings/${meetingId}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteMeeting = meetingId => coreApi(`/meetings/${meetingId}`, {
  method: 'DELETE',
})

export const bulkDeleteMeetings = ids => coreApi('/meetings/bulk-delete', {
  method: 'POST',
  body: { ids },
})

export const bulkUpdateMeetingStatus = (ids, status) => coreApi('/meetings/bulk-status', {
  method: 'PATCH',
  body: { ids, status },
})

export const changeMeetingStatus = (meetingId, status) => coreApi(`/meetings/${meetingId}/status`, {
  method: 'PATCH',
  body: { status },
})

export const regenerateMeetingQrToken = meetingId => coreApi(`/meetings/${meetingId}/qr-token/regenerate`, {
  method: 'POST',
})

export const checkInMeetingByQr = payload => coreApi('/meetings/check-in', {
  method: 'POST',
  body: payload,
})

export const importMeetings = file => {
  const formData = new FormData()

  formData.append('file', file)

  return coreApi('/meetings/import', {
    method: 'POST',
    body: formData,
  })
}

export const downloadMeetingsExport = query => downloadCoreFile({
  path: '/meetings/export',
  query: buildCoreCollectionQuery(query),
  fileName: `meetings-${new Date().toISOString().slice(0, 10)}.xlsx`,
})

export const getMeetingPublicOptions = resource => coreApi(`/${resource}/public-options`)

export const getMeetingCatalog = (resource, params) => coreApi(`/${resource}`, {
  query: buildCoreCollectionQuery(params),
})

export const getMeetingCatalogStats = (resource, params) => coreApi(`/${resource}/stats`, {
  query: buildCoreCollectionQuery(params),
})

export const createMeetingCatalog = (resource, payload) => coreApi(`/${resource}`, {
  method: 'POST',
  body: payload,
})

export const updateMeetingCatalog = (resource, id, payload) => coreApi(`/${resource}/${id}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteMeetingCatalog = (resource, id) => coreApi(`/${resource}/${id}`, {
  method: 'DELETE',
})

export const bulkDeleteMeetingCatalog = (resource, ids) => coreApi(`/${resource}/bulk-delete`, {
  method: 'POST',
  body: { ids },
})

export const bulkUpdateMeetingCatalogStatus = (resource, ids, status) => coreApi(`/${resource}/bulk-status`, {
  method: 'PATCH',
  body: { ids, status },
})

export const changeMeetingCatalogStatus = (resource, id, status) => coreApi(`/${resource}/${id}/status`, {
  method: 'PATCH',
  body: { status },
})

export const getMeetingChildren = (meetingId, child, params) => coreApi(`/meetings/${meetingId}/${child}`, {
  query: buildCoreCollectionQuery(params),
})

export const createMeetingChild = (meetingId, child, payload) => coreApi(`/meetings/${meetingId}/${child}`, {
  method: 'POST',
  body: payload,
})

export const updateMeetingChild = (meetingId, child, childId, payload) => coreApi(`/meetings/${meetingId}/${child}/${childId}`, {
  method: 'PATCH',
  body: payload,
})

export const deleteMeetingChild = (meetingId, child, childId) => coreApi(`/meetings/${meetingId}/${child}/${childId}`, {
  method: 'DELETE',
})
