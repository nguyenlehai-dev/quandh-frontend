export const db = {
  permissions: [
    {
      id: 1,
      name: 'Xem tổng quan hệ thống',
      assignedTo: ['admin', 'maintainer'],
      createdDate: '05 Apr 2026, 12:39 PM',
    },
    {
      id: 2,
      name: 'Quản lý vai trò và phân quyền',
      assignedTo: ['admin'],
      createdDate: '05 Apr 2026, 02:15 PM',
    },
    {
      id: 3,
      name: 'Quản lý hồ sơ người dùng',
      assignedTo: ['admin', 'maintainer'],
      createdDate: '06 Apr 2026, 08:20 AM',
    },
    {
      id: 4,
      name: 'Theo dõi nhật ký hoạt động',
      assignedTo: ['admin', 'author', 'maintainer'],
      createdDate: '06 Apr 2026, 09:45 AM',
    },
    {
      id: 5,
      name: 'Quản lý cơ cấu tổ chức',
      assignedTo: ['admin', 'editor', 'maintainer'],
      createdDate: '06 Apr 2026, 10:10 AM',
    },
    {
      id: 6,
      name: 'Biên tập nội dung báo cáo',
      assignedTo: ['author', 'editor'],
      createdDate: '06 Apr 2026, 11:20 AM',
    },
    {
      id: 7,
      name: 'Xem dashboard nghiệp vụ',
      assignedTo: ['author', 'subscriber'],
      createdDate: '06 Apr 2026, 01:30 PM',
    },
    {
      id: 8,
      name: 'Cấu hình hệ thống',
      assignedTo: ['admin'],
      createdDate: '06 Apr 2026, 03:05 PM',
    },
    {
      id: 9,
      name: 'Xem hồ sơ cá nhân',
      assignedTo: ['admin', 'author', 'editor', 'maintainer', 'subscriber'],
      createdDate: '07 Apr 2026, 08:10 AM',
    },
  ],
}
