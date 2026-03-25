export const routes = [
  {
    path: '/meetings',
    name: 'meetings-list',
    component: () => import('../views/MeetingListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/votes',
    name: 'meetings-votes',
    component: () => import('../views/VoteListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/documents',
    name: 'meetings-documents',
    component: () => import('../views/DocumentListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/conclusions',
    name: 'meetings-conclusions',
    component: () => import('../views/ConclusionListPage.vue'),
    meta: { action: 'read', subject: 'Meeting' },
  },
  {
    path: '/meetings/attendees',
    name: 'meetings-attendees',
    component: () => import('../views/AttendeeListPage.vue'),
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
]
