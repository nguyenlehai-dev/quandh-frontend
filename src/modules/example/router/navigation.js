// [ModuleName] Navigation
//
// Menu items se tu dong merge vao sidebar nho _loader.js
// Doi title, icon, to cho phu hop voi module cua ban
//
// Icon list: https://tabler.io/icons
// Route name phai trung voi name trong routes.js
export const navigation = {
  title: 'Nhan vien',
  icon: { icon: 'tabler-users' },
  children: [
    { title: 'Danh sach', to: 'apps-employee-list' },
  ],
}
