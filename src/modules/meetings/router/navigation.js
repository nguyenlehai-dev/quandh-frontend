export const navigation = {
  title: 'Quản lý Cuộc họp',
  icon: { icon: 'tabler-calendar-event' },
  children: [
    { title: 'Danh sách Cuộc họp', to: 'meetings-list', action: 'read', subject: 'Meeting' },
    {
      title: 'Danh mục',
      icon: { icon: 'tabler-folders' },
      action: 'read',
      subject: 'Meeting',
      children: [
        { title: 'Người dự họp', to: 'meetings-attendees-list', action: 'read', subject: 'Meeting' },
        { title: 'Nhóm người dự họp', to: 'meetings-attendee-groups', action: 'read', subject: 'Meeting' },
        { title: 'Loại tài liệu', to: 'meetings-document-types', action: 'read', subject: 'Meeting' },
        { title: 'Loại cuộc họp', to: 'meetings-meeting-types', action: 'read', subject: 'Meeting' },
      ],
    },
  ],
}
