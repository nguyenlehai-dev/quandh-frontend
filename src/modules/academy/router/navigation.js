export const navigation = {
  title: 'Academy',
  icon: { icon: 'tabler-school' },
  action: 'read',
  subject: 'Academy',
  children: [
    { title: 'Dashboard', to: 'apps-academy-dashboard', action: 'read', subject: 'Academy' },
    { title: 'My Course', to: 'apps-academy-my-course', action: 'read', subject: 'Academy' },
    { title: 'Course Details', to: 'apps-academy-course-details', action: 'read', subject: 'Academy' },
  ],
}
