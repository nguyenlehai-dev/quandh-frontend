/* eslint-disable camelcase */

import { API_BASE } from '../configs'

export const fetchMeetings = params => $api(API_BASE, { params })
export const fetchMyMeetings = params => $api('/my-meetings', { params })
export const fetchMyCalendar = params => $api(`${API_BASE}/my-calendar`, { params })
export const fetchMeeting = id => $api(`${API_BASE}/${id}`)
export const createMeeting = data => $api(API_BASE, { method: 'POST', body: data })
export const updateMeeting = (id, data) => $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
export const deleteMeeting = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
export const exportMeetings = params => $api(`${API_BASE}/export`, { params, responseType: 'blob' })
export const importMeetings = data => $api(`${API_BASE}/import`, { method: 'POST', body: data })
export const changeMeetingStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const setActiveAgenda = (meetingId, agendaId) => $api(`${API_BASE}/${meetingId}/agendas/${agendaId}/set-active`, { method: 'PATCH' })
export const fetchMeetingQrToken = meetingId => $api(`${API_BASE}/${meetingId}/qr-token`)
export const qrCheckinMeeting = (meetingId, qr_token) => $api(`${API_BASE}/${meetingId}/qr-checkin`, { method: 'POST', body: { qr_token } })
