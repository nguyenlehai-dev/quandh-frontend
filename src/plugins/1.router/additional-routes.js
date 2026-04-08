import { isStoredLoggedIn } from '@/modules/auth/services/authStorage'

const emailRouteComponent = () => import('@/pages/apps/email/index.vue')
const logisticsDashboardComponent = () => import('@/pages/apps/logistics/dashboard.vue')
const academyDashboardComponent = () => import('@/pages/apps/academy/dashboard.vue')
const systemOverviewDashboardComponent = () => import('@/modules/dashboard/views/system-overview.vue')
const businessOverviewDashboardComponent = () => import('@/modules/dashboard/views/business-overview.vue')
const organizationsComponent = () => import('@/modules/organization/views/list/index.vue')
const activityLogComponent = () => import('@/modules/activity-log/views/index.vue')
const systemSettingsComponent = () => import('@/modules/system-settings/views/index.vue')
const currentProfileComponent = () => import('@/modules/auth/views/profile.vue')
const meetingListComponent = () => import('@/modules/meeting/views/list/index.vue')
const meetingDetailComponent = () => import('@/modules/meeting/views/detail/index.vue')
const meetingCatalogComponent = () => import('@/modules/meeting/views/catalog/index.vue')
const meetingChildListComponent = () => import('@/modules/meeting/views/child-list/index.vue')

// 👉 Redirects
export const redirects = [
  {
    path: '/',
    name: 'index',
    redirect: to => {
      const isLoggedIn = isStoredLoggedIn()

      if (isLoggedIn)
        return { name: 'dashboards-overview' }

      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/pages/user-profile',
    name: 'pages-user-profile',
    redirect: () => ({ name: 'pages-user-profile-tab', params: { tab: 'profile' } }),
  },
  {
    path: '/pages/account-settings',
    name: 'pages-account-settings',
    redirect: () => ({ name: 'pages-account-settings-tab', params: { tab: 'account' } }),
  },
]
export const routes = [
  // Email filter
  {
    path: '/apps/email/filter/:filter',
    name: 'apps-email-filter',
    component: emailRouteComponent,
    meta: {
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },

  // Email label
  {
    path: '/apps/email/label/:label',
    name: 'apps-email-label',
    component: emailRouteComponent,
    meta: {
      // contentClass: 'email-application',
      navActiveLink: 'apps-email',
      layoutWrapperClasses: 'layout-content-height-fixed',
    },
  },
  {
    path: '/dashboards/logistics',
    name: 'dashboards-logistics',
    component: logisticsDashboardComponent,
  },
  {
    path: '/dashboards/overview',
    name: 'dashboards-overview',
    component: systemOverviewDashboardComponent,
  },
  {
    path: '/dashboards/business',
    name: 'dashboards-business',
    component: businessOverviewDashboardComponent,
  },
  {
    path: '/dashboards/academy',
    name: 'dashboards-academy',
    component: academyDashboardComponent,
  },
  {
    path: '/apps/ecommerce/dashboard',
    name: 'apps-ecommerce-dashboard',
    component: () => import('@/pages/dashboards/ecommerce.vue'),
  },
  {
    path: '/apps/activity-log',
    name: 'apps-activity-log',
    component: activityLogComponent,
  },
  {
    path: '/apps/organizations',
    name: 'apps-organizations',
    component: organizationsComponent,
  },
  {
    path: '/apps/system-settings',
    name: 'apps-system-settings',
    component: systemSettingsComponent,
  },
  {
    path: '/apps/system-settings/general',
    name: 'apps-system-settings-general',
    component: systemSettingsComponent,
    meta: {
      activeSettingGroup: 'general',
      navActiveLink: 'apps-system-settings-general',
      action: 'read',
      subject: 'Setting',
    },
  },
  {
    path: '/apps/system-settings/notification',
    name: 'apps-system-settings-notification',
    component: systemSettingsComponent,
    meta: {
      activeSettingGroup: 'email',
      navActiveLink: 'apps-system-settings-notification',
      action: 'read',
      subject: 'Setting',
    },
  },
  {
    path: '/apps/profile',
    name: 'apps-profile',
    component: currentProfileComponent,
  },
  {
    path: '/apps/meetings',
    name: 'apps-meetings',
    component: meetingListComponent,
    meta: {
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meetings/:id',
    name: 'apps-meetings-detail',
    component: meetingDetailComponent,
    meta: {
      navActiveLink: 'apps-meetings',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/votings',
    name: 'apps-meeting-votings',
    component: meetingChildListComponent,
    meta: {
      title: 'Danh sách Biểu quyết',
      description: 'Quản trị tập trung danh sách biểu quyết theo toàn bộ cuộc họp.',
      icon: 'tabler-chart-bar',
      meetingChildKey: 'votings',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/documents',
    name: 'apps-meeting-documents',
    component: meetingChildListComponent,
    meta: {
      title: 'Danh sách Tài liệu',
      description: 'Quản trị tập trung danh sách tài liệu theo toàn bộ cuộc họp.',
      icon: 'tabler-files',
      meetingChildKey: 'documents',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/conclusions',
    name: 'apps-meeting-conclusions',
    component: meetingChildListComponent,
    meta: {
      title: 'Danh sách Kết luận',
      description: 'Quản trị tập trung danh sách kết luận theo toàn bộ cuộc họp.',
      icon: 'tabler-checklist',
      meetingChildKey: 'conclusions',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/attendees',
    name: 'apps-meeting-attendees',
    component: meetingChildListComponent,
    meta: {
      title: 'Người dự họp',
      description: 'Quản trị tập trung danh sách người dự họp theo toàn bộ cuộc họp.',
      icon: 'tabler-users',
      meetingChildKey: 'participants',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/attendee-groups',
    name: 'apps-meeting-catalog-attendee-groups',
    component: meetingCatalogComponent,
    meta: {
      meetingCatalogResource: 'attendee-groups',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/meeting-document-types',
    name: 'apps-meeting-catalog-meeting-document-types',
    component: meetingCatalogComponent,
    meta: {
      meetingCatalogResource: 'meeting-document-types',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/meeting-document-fields',
    name: 'apps-meeting-catalog-meeting-document-fields',
    component: meetingCatalogComponent,
    meta: {
      meetingCatalogResource: 'meeting-document-fields',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/meeting-types',
    name: 'apps-meeting-catalog-meeting-types',
    component: meetingCatalogComponent,
    meta: {
      meetingCatalogResource: 'meeting-types',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/meeting-document-signers',
    name: 'apps-meeting-catalog-meeting-document-signers',
    component: meetingCatalogComponent,
    meta: {
      meetingCatalogResource: 'meeting-document-signers',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/meeting-issuing-agencies',
    name: 'apps-meeting-catalog-meeting-issuing-agencies',
    component: meetingCatalogComponent,
    meta: {
      meetingCatalogResource: 'meeting-issuing-agencies',
      action: 'read',
      subject: 'Meeting',
    },
  },
  {
    path: '/apps/meeting/catalog/:resource',
    name: 'apps-meeting-catalog',
    component: meetingCatalogComponent,
    meta: {
      action: 'read',
      subject: 'Meeting',
    },
  },
]
