import { getI18n } from '@/plugins/i18n'

const t = key => getI18n().global.t(key)

export const MEETING_STATUS_OPTIONS = [
  { title: t('meeting.status.draft'), value: 'draft', color: 'secondary' },
  { title: t('meeting.status.active'), value: 'active', color: 'success' },
  { title: t('meeting.status.in_progress'), value: 'in_progress', color: 'info' },
  { title: t('meeting.status.completed'), value: 'completed', color: 'primary' },
  { title: t('meeting.status.cancelled'), value: 'cancelled', color: 'error' },
]

export const CATALOG_STATUS_OPTIONS = [
  { title: t('meeting.catalogStatus.active'), value: 'active', color: 'success' },
  { title: t('meeting.catalogStatus.inactive'), value: 'inactive', color: 'secondary' },
]

export const MEETING_CATALOGS = {
  'meeting-types': {
    title: t('meeting.catalogs.meeting_types.title'),
    singularTitle: t('meeting.catalogs.meeting_types.singular'),
    icon: 'tabler-category',
    subject: 'MeetingType',
  },
  'attendee-groups': {
    title: t('meeting.catalogs.attendee_groups.title'),
    singularTitle: t('meeting.catalogs.attendee_groups.singular'),
    icon: 'tabler-users-group',
    subject: 'AttendeeGroup',
    usesMeetingType: true,
  },
  'meeting-document-types': {
    title: t('meeting.catalogs.meeting_document_types.title'),
    singularTitle: t('meeting.catalogs.meeting_document_types.singular'),
    icon: 'tabler-file-type-doc',
    subject: 'MeetingDocumentType',
    usesMeetingType: true,
  },
  'meeting-document-fields': {
    title: t('meeting.catalogs.meeting_document_fields.title'),
    singularTitle: t('meeting.catalogs.meeting_document_fields.singular'),
    icon: 'tabler-folder',
    subject: 'MeetingDocumentField',
  },
  'meeting-document-signers': {
    title: t('meeting.catalogs.meeting_document_signers.title'),
    singularTitle: t('meeting.catalogs.meeting_document_signers.singular'),
    icon: 'tabler-signature',
    subject: 'MeetingDocumentSigner',
    usesPosition: true,
  },
  'meeting-issuing-agencies': {
    title: t('meeting.catalogs.meeting_issuing_agencies.title'),
    singularTitle: t('meeting.catalogs.meeting_issuing_agencies.singular'),
    icon: 'tabler-building-bank',
    subject: 'MeetingIssuingAgency',
  },
}

export const MEETING_CHILD_TABS = [
  {
    key: 'participants',
    responseKey: 'participants',
    title: t('meeting.childTabs.participants'),
    icon: 'tabler-users',
    primaryField: 'position',
    requiredField: 'user_id',
    requiredLabel: t('meeting.fields.user_id'),
    statusOptions: [
      { title: t('meeting.childStatus.participants.pending'), value: 'pending', color: 'secondary' },
      { title: t('meeting.childStatus.participants.present'), value: 'present', color: 'success' },
      { title: t('meeting.childStatus.participants.absent'), value: 'absent', color: 'error' },
      { title: t('meeting.childStatus.participants.delegated'), value: 'delegated', color: 'warning' },
    ],
    fields: ['user_id', 'role', 'position', 'status', 'sort_order'],
  },
  {
    key: 'agendas',
    responseKey: 'agendas',
    title: t('meeting.childTabs.agendas'),
    icon: 'tabler-list-details',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: t('meeting.fields.title'),
    statusOptions: [
      { title: t('meeting.childStatus.agendas.pending'), value: 'pending', color: 'secondary' },
      { title: t('meeting.childStatus.agendas.in_progress'), value: 'in_progress', color: 'info' },
      { title: t('meeting.childStatus.agendas.completed'), value: 'completed', color: 'success' },
      { title: t('meeting.childStatus.agendas.cancelled'), value: 'cancelled', color: 'error' },
    ],
    fields: ['title', 'description', 'duration_minutes', 'status', 'sort_order'],
  },
  {
    key: 'documents',
    responseKey: 'documents',
    title: t('meeting.childTabs.documents'),
    icon: 'tabler-files',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: t('meeting.fields.document_title'),
    statusOptions: [
      { title: t('meeting.childStatus.documents.draft'), value: 'draft', color: 'secondary' },
      { title: t('meeting.childStatus.documents.active'), value: 'active', color: 'success' },
      { title: t('meeting.childStatus.documents.archived'), value: 'archived', color: 'warning' },
    ],
    fields: ['title', 'document_number', 'issued_at', 'description', 'status'],
  },
  {
    key: 'conclusions',
    responseKey: 'conclusions',
    title: t('meeting.childTabs.conclusions'),
    icon: 'tabler-checklist',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: t('meeting.fields.title'),
    fields: ['title', 'content'],
  },
  {
    key: 'speech-requests',
    responseKey: 'speechRequests',
    title: t('meeting.childTabs.speech_requests'),
    icon: 'tabler-microphone',
    primaryField: 'content',
    requiredField: 'content',
    requiredLabel: t('meeting.fields.content'),
    statusOptions: [
      { title: t('meeting.childStatus.speech_requests.pending'), value: 'pending', color: 'secondary' },
      { title: t('meeting.childStatus.speech_requests.approved'), value: 'approved', color: 'success' },
      { title: t('meeting.childStatus.speech_requests.rejected'), value: 'rejected', color: 'error' },
    ],
    fields: ['content', 'status', 'review_note'],
  },
  {
    key: 'votings',
    responseKey: 'votings',
    title: t('meeting.childTabs.votings'),
    icon: 'tabler-chart-bar',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: t('meeting.fields.title'),
    statusOptions: [
      { title: t('meeting.childStatus.votings.pending'), value: 'pending', color: 'secondary' },
      { title: t('meeting.childStatus.votings.open'), value: 'open', color: 'success' },
      { title: t('meeting.childStatus.votings.closed'), value: 'closed', color: 'warning' },
    ],
    fields: ['title', 'description', 'type', 'status'],
  },
  {
    key: 'personal-notes',
    responseKey: 'personalNotes',
    title: t('meeting.childTabs.personal_notes'),
    icon: 'tabler-notes',
    primaryField: 'content',
    requiredField: 'content',
    requiredLabel: t('meeting.fields.content'),
    fields: ['content'],
  },
  {
    key: 'reminders',
    responseKey: 'reminders',
    title: t('meeting.childTabs.reminders'),
    icon: 'tabler-bell',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: t('meeting.fields.title'),
    statusOptions: [
      { title: t('meeting.childStatus.reminders.pending'), value: 'pending', color: 'secondary' },
      { title: t('meeting.childStatus.reminders.sent'), value: 'sent', color: 'success' },
      { title: t('meeting.childStatus.reminders.cancelled'), value: 'cancelled', color: 'error' },
    ],
    fields: ['title', 'content', 'remind_at', 'status'],
  },
]

export const getOptionTitle = (options, value) => options.find(item => item.value === value)?.title ?? value ?? t('meeting.common.na')
export const getOptionColor = (options, value) => options.find(item => item.value === value)?.color ?? 'secondary'
