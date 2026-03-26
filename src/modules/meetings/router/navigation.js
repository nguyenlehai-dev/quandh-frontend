export const navigation = {
  title: 'Quản lý cuộc họp',
  icon: { icon: 'tabler-calendar-event' },
  action: 'read',
  subject: 'Meeting',
  children: [
    { title: 'Danh sách Cuộc họp', to: 'meetings-list', action: 'read', subject: 'Meeting' },
    {
      title: 'Danh mục',
      action: 'read',
      subject: 'Meeting',
      children: [
        { title: 'Nhóm người dự họp', to: 'meetings-attendee-groups', action: 'read', subject: 'Meeting' },
        { title: 'Loại tài liệu', to: 'meetings-document-types', action: 'read', subject: 'Meeting' },
        { title: 'Loại cuộc họp', to: 'meetings-meeting-types', action: 'read', subject: 'Meeting' },
      ],
    },
    { title: 'Cuộc họp của tôi', to: 'meetings-participant-my-meetings', action: 'read', subject: 'Meeting' },
  ],
}
