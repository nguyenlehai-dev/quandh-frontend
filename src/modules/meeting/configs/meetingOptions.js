export const MEETING_STATUS_OPTIONS = [
  { title: 'Bản nháp', value: 'draft', color: 'secondary' },
  { title: 'Hoạt động', value: 'active', color: 'success' },
  { title: 'Đang diễn ra', value: 'in_progress', color: 'info' },
  { title: 'Hoàn thành', value: 'completed', color: 'primary' },
  { title: 'Đã hủy', value: 'cancelled', color: 'error' },
]

export const CATALOG_STATUS_OPTIONS = [
  { title: 'Hoạt động', value: 'active', color: 'success' },
  { title: 'Tạm tắt', value: 'inactive', color: 'secondary' },
]

export const MEETING_CATALOGS = {
  'meeting-types': {
    title: 'Loại cuộc họp',
    singularTitle: 'loại cuộc họp',
    icon: 'tabler-category',
    subject: 'MeetingType',
  },
  'attendee-groups': {
    title: 'Nhóm người dự họp',
    singularTitle: 'nhóm người dự họp',
    icon: 'tabler-users-group',
    subject: 'AttendeeGroup',
    usesMeetingType: true,
  },
  'meeting-document-types': {
    title: 'Loại tài liệu',
    singularTitle: 'loại tài liệu',
    icon: 'tabler-file-type-doc',
    subject: 'MeetingDocumentType',
    usesMeetingType: true,
  },
  'meeting-document-fields': {
    title: 'Lĩnh vực tài liệu',
    singularTitle: 'lĩnh vực tài liệu',
    icon: 'tabler-folder',
    subject: 'MeetingDocumentField',
  },
  'meeting-document-signers': {
    title: 'Người ký tài liệu',
    singularTitle: 'người ký tài liệu',
    icon: 'tabler-signature',
    subject: 'MeetingDocumentSigner',
    usesPosition: true,
  },
  'meeting-issuing-agencies': {
    title: 'Cơ quan ban hành',
    singularTitle: 'cơ quan ban hành',
    icon: 'tabler-building-bank',
    subject: 'MeetingIssuingAgency',
  },
}

export const MEETING_CHILD_TABS = [
  {
    key: 'participants',
    responseKey: 'participants',
    title: 'Người tham dự',
    icon: 'tabler-users',
    primaryField: 'position',
    requiredField: 'user_id',
    requiredLabel: 'ID người dùng',
    statusOptions: [
      { title: 'Chờ xác nhận', value: 'pending', color: 'secondary' },
      { title: 'Có mặt', value: 'present', color: 'success' },
      { title: 'Vắng mặt', value: 'absent', color: 'error' },
      { title: 'Ủy quyền', value: 'delegated', color: 'warning' },
    ],
    fields: ['user_id', 'role', 'position', 'status', 'sort_order'],
  },
  {
    key: 'agendas',
    responseKey: 'agendas',
    title: 'Chương trình',
    icon: 'tabler-list-details',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: 'Tiêu đề',
    statusOptions: [
      { title: 'Chờ xử lý', value: 'pending', color: 'secondary' },
      { title: 'Đang diễn ra', value: 'in_progress', color: 'info' },
      { title: 'Hoàn thành', value: 'completed', color: 'success' },
      { title: 'Đã hủy', value: 'cancelled', color: 'error' },
    ],
    fields: ['title', 'description', 'duration_minutes', 'status', 'sort_order'],
  },
  {
    key: 'documents',
    responseKey: 'documents',
    title: 'Tài liệu',
    icon: 'tabler-files',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: 'Tiêu đề tài liệu',
    statusOptions: [
      { title: 'Bản nháp', value: 'draft', color: 'secondary' },
      { title: 'Hoạt động', value: 'active', color: 'success' },
      { title: 'Lưu trữ', value: 'archived', color: 'warning' },
    ],
    fields: ['title', 'document_number', 'issued_at', 'description', 'status'],
  },
  {
    key: 'conclusions',
    responseKey: 'conclusions',
    title: 'Kết luận',
    icon: 'tabler-checklist',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: 'Tiêu đề',
    fields: ['title', 'content'],
  },
  {
    key: 'speech-requests',
    responseKey: 'speechRequests',
    title: 'Phát biểu',
    icon: 'tabler-microphone',
    primaryField: 'content',
    requiredField: 'content',
    requiredLabel: 'Nội dung',
    statusOptions: [
      { title: 'Chờ duyệt', value: 'pending', color: 'secondary' },
      { title: 'Đã duyệt', value: 'approved', color: 'success' },
      { title: 'Từ chối', value: 'rejected', color: 'error' },
    ],
    fields: ['content', 'status', 'review_note'],
  },
  {
    key: 'votings',
    responseKey: 'votings',
    title: 'Biểu quyết',
    icon: 'tabler-chart-bar',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: 'Tiêu đề',
    statusOptions: [
      { title: 'Chờ mở', value: 'pending', color: 'secondary' },
      { title: 'Đang mở', value: 'open', color: 'success' },
      { title: 'Đã đóng', value: 'closed', color: 'warning' },
    ],
    fields: ['title', 'description', 'type', 'status'],
  },
  {
    key: 'personal-notes',
    responseKey: 'personalNotes',
    title: 'Ghi chú',
    icon: 'tabler-notes',
    primaryField: 'content',
    requiredField: 'content',
    requiredLabel: 'Nội dung',
    fields: ['content'],
  },
  {
    key: 'reminders',
    responseKey: 'reminders',
    title: 'Nhắc việc',
    icon: 'tabler-bell',
    primaryField: 'title',
    requiredField: 'title',
    requiredLabel: 'Tiêu đề',
    statusOptions: [
      { title: 'Chờ gửi', value: 'pending', color: 'secondary' },
      { title: 'Đã gửi', value: 'sent', color: 'success' },
      { title: 'Đã hủy', value: 'cancelled', color: 'error' },
    ],
    fields: ['title', 'content', 'remind_at', 'status'],
  },
]

export const getOptionTitle = (options, value) => options.find(item => item.value === value)?.title ?? value ?? 'N/A'
export const getOptionColor = (options, value) => options.find(item => item.value === value)?.color ?? 'secondary'
