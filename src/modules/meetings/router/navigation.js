export const navigation = {
  title: 'Quản lý Cuộc họp',
  icon: { icon: 'tabler-calendar-event' },
  children: [
    { title: 'Lịch họp của tôi', to: 'meetings-my-calendar', action: 'read', subject: 'Meeting' },
    { title: 'Danh sách Cuộc họp', to: 'meetings-list', action: 'read', subject: 'Meeting' },
    { title: 'Danh sách Biểu quyết', to: 'meetings-votes-list', action: 'read', subject: 'Meeting' },
    { title: 'Danh sách Tài liệu', to: 'meetings-documents-list', action: 'read', subject: 'Document' },
    { title: 'Danh sách Kết luận', to: 'meetings-conclusions-list', action: 'read', subject: 'Meeting' },
    {
      title: 'Danh mục',
      icon: { icon: 'tabler-folders' },
      action: 'read',
      subject: 'Meeting',
      children: [
        { title: 'Người dự họp', to: 'meetings-attendees-list', action: 'read', subject: 'MeetingParticipant' },
        { title: 'Nhóm người dự họp', to: 'meetings-attendee-groups', action: 'read', subject: 'AttendeeGroup' },
        { title: 'Loại tài liệu', to: 'meetings-document-types', action: 'read', subject: 'DocumentType' },
        { title: 'Loại cuộc họp', to: 'meetings-meeting-types', action: 'read', subject: 'MeetingType' },
      ],
    },
  ],
}
