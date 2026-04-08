export const normalizeCollectionResponse = response => ({
  data: response?.data ?? [],
  meta: response?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: response?.data?.length ?? 0,
    total: response?.data?.length ?? 0,
  },
})

export const mapMeetingToViewModel = item => ({
  id: item.id,
  meetingTypeId: item.meeting_type_id,
  meetingTypeName: item.meeting_type?.name ?? 'N/A',
  code: item.code ?? '',
  title: item.title ?? 'N/A',
  description: item.description ?? '',
  location: item.location ?? '',
  startAt: item.start_at ?? '',
  endAt: item.end_at ?? '',
  status: item.status ?? 'draft',
  qrToken: item.qr_token ?? '',
  participantsCount: item.participants_count ?? item.participants?.length ?? 0,
  agendasCount: item.agendas_count ?? item.agendas?.length ?? 0,
  documentsCount: item.documents_count ?? item.documents?.length ?? 0,
  conclusionsCount: item.conclusions_count ?? item.conclusions?.length ?? 0,
  votingsCount: item.votings_count ?? item.votings?.length ?? 0,
  participants: item.participants ?? [],
  agendas: item.agendas ?? [],
  documents: item.documents ?? [],
  conclusions: item.conclusions ?? [],
  speechRequests: item.speech_requests ?? [],
  votings: item.votings ?? [],
  personalNotes: item.personal_notes ?? [],
  reminders: item.reminders ?? [],
  createdBy: item.created_by ?? 'N/A',
  updatedBy: item.updated_by ?? 'N/A',
  createdAt: item.created_at ?? 'N/A',
  updatedAt: item.updated_at ?? 'N/A',
})

export const mapCatalogToViewModel = item => ({
  id: item.id,
  meetingTypeId: item.meeting_type_id,
  meetingTypeName: item.meeting_type?.name ?? 'N/A',
  name: item.name ?? 'N/A',
  position: item.position ?? '',
  description: item.description ?? '',
  status: item.status ?? 'active',
  createdBy: item.created_by ?? 'N/A',
  updatedBy: item.updated_by ?? 'N/A',
  createdAt: item.created_at ?? 'N/A',
  updatedAt: item.updated_at ?? 'N/A',
})

export const toMeetingPayload = formData => ({
  meeting_type_id: formData.meetingTypeId || null,
  code: formData.code || null,
  title: formData.title,
  description: formData.description || null,
  location: formData.location || null,
  start_at: formData.startAt,
  end_at: formData.endAt || null,
  status: formData.status || 'draft',
})

export const toCatalogPayload = formData => ({
  meeting_type_id: formData.meetingTypeId || null,
  name: formData.name,
  position: formData.position || null,
  description: formData.description || null,
  status: formData.status || 'active',
})
