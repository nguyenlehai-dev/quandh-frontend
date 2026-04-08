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
    path: '/apps/meeting/catalog/:resource',
    name: 'apps-meeting-catalog',
    component: meetingCatalogComponent,
    meta: {
      navActiveLink: 'apps-meetings',
      action: 'read',
      subject: 'Meeting',
    },
  },
]
