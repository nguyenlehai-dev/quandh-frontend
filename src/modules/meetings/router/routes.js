export const routes = [
  {
    path: '/meetings',
    name: 'meetings-list',
    component: () => import('../views/MeetingListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/attendee-groups',
    name: 'meetings-attendee-groups',
    component: () => import('../views/AttendeeGroupListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/document-types',
    name: 'meetings-document-types',
    component: () => import('../views/DocumentTypeListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/meeting-types',
    name: 'meetings-meeting-types',
    component: () => import('../views/MeetingTypeListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/live/:id',
    name: 'meetings-live-controller',
    component: () => import('../views/admin/live/LiveMeetingController.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/edit/:id?',
    name: 'meetings-edit',
    component: () => import('../views/admin/edit/MeetingEditPage.vue'),
    meta: { action: 'update', subject: 'Meeting' },
  },
  {
    path: '/my-meetings',
    name: 'meetings-participant-my-meetings',
    component: () => import('../views/participant/MyMeetingsPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/my-meetings/:id',
    name: 'meetings-participant-details',
    component: () => import('../views/participant/details/MeetingDetailsPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
]
