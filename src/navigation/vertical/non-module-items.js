/**
 * Non-Module Navigation Items
 *
 * Các menu items không thuộc module nào — Pages, Auth, UI, Forms, Charts, Others.
 * Được merge vào sidebar sau phần module navigation.
 */
export default [
  // ─── Pages ──────────────────────────────────────────────
  {
    title: 'Pages',
    icon: { icon: 'tabler-file' },
    children: [
      { title: 'User Profile', to: { name: 'pages-user-profile-tab', params: { tab: 'profile' } } },
      { title: 'Account Settings', to: { name: 'pages-account-settings-tab', params: { tab: 'account' } } },
      { title: 'Pricing', to: 'pages-pricing' },
      { title: 'FAQ', to: 'pages-faq' },
      {
        title: 'Miscellaneous',
        children: [
          { title: 'Coming Soon', to: 'pages-misc-coming-soon', target: '_blank' },
          { title: 'Under Maintenance', to: 'pages-misc-under-maintenance', target: '_blank' },
          { title: 'Page Not Found - 404', to: { path: '/pages/misc/not-found' }, target: '_blank' },
          { title: 'Not Authorized - 401', to: { path: '/pages/misc/not-authorized' }, target: '_blank' },
        ],
      },
    ],
  },

  // ─── Authentication ─────────────────────────────────────
  {
    title: 'Authentication',
    icon: { icon: 'tabler-shield-lock' },
    children: [
      {
        title: 'Login',
        children: [
          { title: 'Login v1', to: 'pages-authentication-login-v1', target: '_blank' },
          { title: 'Login v2', to: 'pages-authentication-login-v2', target: '_blank' },
        ],
      },
      {
        title: 'Register',
        children: [
          { title: 'Register v1', to: 'pages-authentication-register-v1', target: '_blank' },
          { title: 'Register v2', to: 'pages-authentication-register-v2', target: '_blank' },
          { title: 'Register Multi-Steps', to: 'pages-authentication-register-multi-steps', target: '_blank' },
        ],
      },
      {
        title: 'Verify Email',
        children: [
          { title: 'Verify Email v1', to: 'pages-authentication-verify-email-v1', target: '_blank' },
          { title: 'Verify Email v2', to: 'pages-authentication-verify-email-v2', target: '_blank' },
        ],
      },
      {
        title: 'Forgot Password',
        children: [
          { title: 'Forgot Password v1', to: 'pages-authentication-forgot-password-v1', target: '_blank' },
          { title: 'Forgot Password v2', to: 'pages-authentication-forgot-password-v2', target: '_blank' },
        ],
      },
      {
        title: 'Reset Password',
        children: [
          { title: 'Reset Password v1', to: 'pages-authentication-reset-password-v1', target: '_blank' },
          { title: 'Reset Password v2', to: 'pages-authentication-reset-password-v2', target: '_blank' },
        ],
      },
      {
        title: 'Two Steps',
        children: [
          { title: 'Two Steps v1', to: 'pages-authentication-two-steps-v1', target: '_blank' },
          { title: 'Two Steps v2', to: 'pages-authentication-two-steps-v2', target: '_blank' },
        ],
      },
    ],
  },

  // ─── Wizard Examples ────────────────────────────────────
  {
    title: 'Wizard Examples',
    icon: { icon: 'tabler-dots' },
    children: [
      { title: 'Checkout', to: { name: 'wizard-examples-checkout' } },
      { title: 'Property Listing', to: { name: 'wizard-examples-property-listing' } },
      { title: 'Create Deal', to: { name: 'wizard-examples-create-deal' } },
    ],
  },

  // ─── Dialog Examples ────────────────────────────────────
  {
    title: 'Dialog Examples',
    icon: { icon: 'tabler-square' },
    to: 'pages-dialog-examples',
  },

  // ─── UI Elements ────────────────────────────────────────
  { heading: 'UI Elements' },
  {
    title: 'Typography',
    icon: { icon: 'tabler-typography' },
    to: 'pages-typography',
  },
  {
    title: 'Icons',
    icon: { icon: 'tabler-brand-tabler' },
    to: 'pages-icons',
  },
  {
    title: 'Cards',
    icon: { icon: 'tabler-id' },
    children: [
      { title: 'Basic', to: 'pages-cards-card-basic' },
      { title: 'Advance', to: 'pages-cards-card-advance' },
      { title: 'Statistics', to: 'pages-cards-card-statistics' },
      { title: 'Widgets', to: 'pages-cards-card-widgets' },
      { title: 'Actions', to: 'pages-cards-card-actions' },
    ],
  },
  {
    title: 'Components',
    icon: { icon: 'tabler-atom' },
    children: [
      { title: 'Alert', to: 'components-alert' },
      { title: 'Avatar', to: 'components-avatar' },
      { title: 'Badge', to: 'components-badge' },
      { title: 'Button', to: 'components-button' },
      { title: 'Chip', to: 'components-chip' },
      { title: 'Dialog', to: 'components-dialog' },
      { title: 'Expansion Panel', to: 'components-expansion-panel' },
      { title: 'List', to: 'components-list' },
      { title: 'Menu', to: 'components-menu' },
      { title: 'Pagination', to: 'components-pagination' },
      { title: 'Progress Circular', to: 'components-progress-circular' },
      { title: 'Progress Linear', to: 'components-progress-linear' },
      { title: 'Snackbar', to: 'components-snackbar' },
      { title: 'Tabs', to: 'components-tabs' },
      { title: 'Timeline', to: 'components-timeline' },
      { title: 'Tooltip', to: 'components-tooltip' },
    ],
  },
  {
    title: 'Extensions',
    icon: { icon: 'tabler-box' },
    children: [
      { title: 'Tour', to: 'extensions-tour' },
      { title: 'Swiper', to: 'extensions-swiper' },
    ],
  },

  // ─── Forms & Tables ─────────────────────────────────────
  { heading: 'Forms & Tables' },
  {
    title: 'Form Elements',
    icon: { icon: 'tabler-checkbox' },
    children: [
      { title: 'Autocomplete', to: 'forms-autocomplete' },
      { title: 'Checkbox', to: 'forms-checkbox' },
      { title: 'Combobox', to: 'forms-combobox' },
      { title: 'Date Time Picker', to: 'forms-date-time-picker' },
      { title: 'Editors', to: 'forms-editors' },
      { title: 'File Input', to: 'forms-file-input' },
      { title: 'Radio', to: 'forms-radio' },
      { title: 'Custom Input', to: 'forms-custom-input' },
      { title: 'Range Slider', to: 'forms-range-slider' },
      { title: 'Rating', to: 'forms-rating' },
      { title: 'Select', to: 'forms-select' },
      { title: 'Slider', to: 'forms-slider' },
      { title: 'Switch', to: 'forms-switch' },
      { title: 'Textarea', to: 'forms-textarea' },
      { title: 'Textfield', to: 'forms-textfield' },
    ],
  },
  {
    title: 'Form Layouts',
    icon: { icon: 'tabler-layout' },
    to: 'forms-form-layouts',
  },
  {
    title: 'Form Wizard',
    icon: { icon: 'tabler-git-merge' },
    children: [
      { title: 'Numbered', to: 'forms-form-wizard-numbered' },
      { title: 'Icons', to: 'forms-form-wizard-icons' },
    ],
  },
  {
    title: 'Form Validation',
    icon: { icon: 'tabler-checkup-list' },
    to: 'forms-form-validation',
  },
  {
    title: 'Tables',
    icon: { icon: 'tabler-table' },
    children: [
      { title: 'Simple Table', to: 'tables-simple-table' },
      { title: 'Data Table', to: 'tables-data-table' },
    ],
  },

  // ─── Charts ─────────────────────────────────────────────
  { heading: 'Charts' },
  {
    title: 'Charts',
    icon: { icon: 'tabler-chart-donut-2' },
    children: [
      { title: 'Apex Chart', to: 'charts-apex-chart' },
      { title: 'Chartjs', to: 'charts-chartjs' },
    ],
  },

  // ─── Others ─────────────────────────────────────────────
  { heading: 'Others' },
  {
    title: 'Access Control',
    icon: { icon: 'tabler-command' },
    to: 'access-control',
    action: 'read',
    subject: 'AclDemo',
  },
  {
    title: 'Nav Levels',
    icon: { icon: 'tabler-menu-2' },
    children: [
      {
        title: 'Level 2.1',
        to: null,
      },
      {
        title: 'Level 2.2',
        children: [
          { title: 'Level 3.1', to: null },
          { title: 'Level 3.2', to: null },
        ],
      },
    ],
  },
  {
    title: 'Disabled Menu',
    to: null,
    icon: { icon: 'tabler-eye-off' },
    disable: true,
  },
  {
    title: 'Raise Support',
    href: 'https://pixinvent.ticksy.com/',
    icon: { icon: 'tabler-headphones' },
    target: '_blank',
  },
  {
    title: 'Documentation',
    href: 'https://demos.pixinvent.com/vuexy-vuejs-admin-template/documentation/',
    icon: { icon: 'tabler-file-text' },
    target: '_blank',
  },
]
