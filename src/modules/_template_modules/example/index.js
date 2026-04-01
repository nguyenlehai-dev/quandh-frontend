/**
 * [ModuleName] Module
 *
 * Day la module mau (example). Khi tao module moi:
 * 1. Copy folder `example` -> dat ten module moi (vd: `product`)
 * 2. Rename tat ca "Employee/employee" -> ten entity cua ban
 * 3. Doi `navOrder` de xac dinh vi tri tren sidebar
 * 4. Done! Module se tu dong duoc nhan dien boi _loader.js
 *
 * Luu y: folder `example` bi exclude trong _loader.js
 * nen khong hien thi tren sidebar.
 */
import { routes } from './router/routes'
import { navigation } from './router/navigation'

export default {
  routes,
  navigation,

  // Thu tu hien thi tren sidebar (so nho = hien truoc)
  // Buoc nhay 10 de de chen module moi vao giua
  // Ví du: 15 se nam giua ecommerce(10) va academy(20)
  navOrder: 999,

  // Optional: Dang ky global components, directives cho module
  // install(app) {
  //   app.component('EmployeeBadge', EmployeeBadge)
  // },
}
