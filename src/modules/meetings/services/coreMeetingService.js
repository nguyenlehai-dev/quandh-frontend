/* eslint-disable camelcase */

import * as XLSX from 'xlsx'
import { API_ADMIN_MEETINGS, API_BASE, API_PARTICIPANT } from '../configs'

export const fetchMeetings = params => $api(API_BASE, { params })
export const fetchMeetingsStats = params => $api(`${API_BASE}/stats`, { params })
export const fetchAdminDashboard = params => $api(`${API_ADMIN_MEETINGS}/dashboard`, { params })
export const fetchAdminReports = params => $api(`${API_ADMIN_MEETINGS}/reports`, { params })
export const fetchAdminMeetings = params => $api(API_ADMIN_MEETINGS, { params })
export const fetchMyMeetings = params => $api(`${API_PARTICIPANT}/my-meetings`, { params })
export const fetchMyCalendar = params => $api(`${API_PARTICIPANT}/my-meetings`, { params })
export const fetchMeeting = id => $api(`${API_ADMIN_MEETINGS}/${id}`)
export const fetchAdminMeetingLive = id => $api(`${API_ADMIN_MEETINGS}/${id}/live`)
export const fetchParticipantMeeting = id => $api(`${API_PARTICIPANT}/meetings/${id}`)
export const createMeeting = data => $api(API_BASE, { method: 'POST', body: data })
export const updateMeeting = (id, data) => $api(`${API_BASE}/${id}`, { method: 'PUT', body: data })
export const deleteMeeting = id => $api(`${API_BASE}/${id}`, { method: 'DELETE' })
export const exportMeetings = params => $api(`${API_BASE}/export`, { params, responseType: 'blob' })
export const importMeetings = data => $api(`${API_BASE}/import`, { method: 'POST', body: data })
export const downloadMeetingImportTemplate = () => {
  const rows = [
    {
      title: 'Hop giao ban tuan 1',
      code: 'HOP-0001',
      description: 'Cuoc hop giao ban noi bo',
      location: 'Phong hop A',
      meeting_type_id: 1,
      start_at: '2026-04-10 08:30:00',
      end_at: '2026-04-10 10:30:00',
      status: 'draft',
    },
    {
      title: 'Hop thong qua ke hoach quy 2',
      code: 'HOP-0002',
      description: 'Thong qua noi dung trien khai quy 2',
      location: 'Phong hop B',
      meeting_type_id: 1,
      start_at: '2026-04-15 14:00:00',
      end_at: '2026-04-15 16:30:00',
      status: 'active',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['title', 'code', 'description', 'location', 'meeting_type_id', 'start_at', 'end_at', 'status'],
  })

  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 32 },
    { wch: 18 },
    { wch: 36 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 16 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Meetings')
  XLSX.writeFile(workbook, 'meetings-import-template.xlsx')
}

export const changeMeetingStatus = (id, status) => $api(`${API_BASE}/${id}/status`, { method: 'PATCH', body: { status } })
export const setActiveAgenda = (meetingId, agendaId) => $api(`${API_BASE}/${meetingId}/agendas/${agendaId}/set-active`, { method: 'PATCH' })
export const fetchMeetingQrToken = meetingId => $api(`${API_ADMIN_MEETINGS}/${meetingId}/qr-token`)
export const fetchParticipantCandidates = meetingId => $api(`${API_ADMIN_MEETINGS}/${meetingId}/participant-candidates`)
export const adminQrCheckinMeeting = (meetingId, token) => $api(`${API_ADMIN_MEETINGS}/${meetingId}/qr-checkin`, { method: 'POST', body: { token } })
export const qrCheckinMeeting = (meetingId, token) => $api(`${API_PARTICIPANT}/meetings/${meetingId}/qr-checkin`, { method: 'POST', body: { token } })
