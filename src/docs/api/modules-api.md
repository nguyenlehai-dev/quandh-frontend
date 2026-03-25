# API Documentation — Danh sách API đã kết nối

> Tài liệu mô tả tất cả các API endpoints mà frontend đang sử dụng, phân nhóm theo module.
> Base URL: `VITE_API_BASE_URL` (mặc định `/api`)

---

## 1. Authentication

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập → trả `accessToken`, `userData`, `userAbilityRules` |

**Service**: `src/services/auth.js`

---

## 2. User (`/users`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/users` | `fetchUsers(params)` | Danh sách users (có phân trang, filter) |
| GET | `/users/:id` | `fetchUser(id)` | Chi tiết user |
| POST | `/users` | `createUser(data)` | Tạo user mới |
| PUT | `/users/:id` | `updateUser(id, data)` | Cập nhật user |
| DELETE | `/users/:id` | `deleteUser(id)` | Xóa user |
| GET | `/users/export` | `exportUsers(params)` | Xuất file Excel |
| PUT | `/users/:id/status` | `updateUserStatus(id, status)` | Đổi trạng thái user |

**Service**: `src/modules/user/services/userService.js`

---

## 3. Roles (`/roles`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/roles` | `fetchRoles(params)` | Danh sách roles |
| GET | `/roles/:id` | `fetchRole(id)` | Chi tiết role |
| POST | `/roles` | `createRole(data)` | Tạo role mới |
| PUT | `/roles/:id` | `updateRole(id, data)` | Cập nhật role |
| DELETE | `/roles/:id` | `deleteRole(id)` | Xóa role |
| PUT | `/roles/:id/permissions` | `assignPermissions(id, perms)` | Gán quyền cho role |

**Service**: `src/modules/roles/services/roleService.js`

---

## 4. Permissions (`/permissions`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/permissions` | `fetchPermissions(params)` | Danh sách permissions |
| GET | `/permissions/:id` | `fetchPermission(id)` | Chi tiết permission |
| POST | `/permissions` | `createPermission(data)` | Tạo permission |
| PUT | `/permissions/:id` | `updatePermission(id, data)` | Cập nhật permission |
| DELETE | `/permissions/:id` | `deletePermission(id)` | Xóa permission |

**Service**: `src/modules/permissions/services/permissionService.js`

---

## 5. Ecommerce

### Products (`/products`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/products` | `fetchProducts(params)` | Danh sách sản phẩm |
| GET | `/products/:id` | `fetchProduct(id)` | Chi tiết sản phẩm |
| POST | `/products` | `createProduct(data)` | Tạo sản phẩm |
| PUT | `/products/:id` | `updateProduct(id, data)` | Cập nhật sản phẩm |
| DELETE | `/products/:id` | `deleteProduct(id)` | Xóa sản phẩm |
| GET | `/products/export` | `exportProducts(params)` | Xuất Excel |

### Orders (`/orders`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/orders` | `fetchOrders(params)` | Danh sách đơn hàng |
| GET | `/orders/:id` | `fetchOrder(id)` | Chi tiết đơn hàng |
| PUT | `/orders/:id/status` | `updateOrderStatus(id, status)` | Cập nhật trạng thái |
| DELETE | `/orders/:id` | `deleteOrder(id)` | Xóa đơn hàng |
| GET | `/orders/export` | `exportOrders(params)` | Xuất Excel |

### Customers (`/customers`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/customers` | `fetchCustomers(params)` | Danh sách khách hàng |
| GET | `/customers/:id` | `fetchCustomer(id)` | Chi tiết khách hàng |
| POST | `/customers` | `createCustomer(data)` | Tạo khách hàng |
| PUT | `/customers/:id` | `updateCustomer(id, data)` | Cập nhật khách hàng |
| DELETE | `/customers/:id` | `deleteCustomer(id)` | Xóa khách hàng |

**Service**: `src/modules/ecommerce/services/ecommerceService.js`

---

## 6. Invoice (`/invoices`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/invoices` | `fetchInvoices(params)` | Danh sách hóa đơn |
| GET | `/invoices/:id` | `fetchInvoice(id)` | Chi tiết hóa đơn |
| POST | `/invoices` | `createInvoice(data)` | Tạo hóa đơn |
| PUT | `/invoices/:id` | `updateInvoice(id, data)` | Cập nhật hóa đơn |
| DELETE | `/invoices/:id` | `deleteInvoice(id)` | Xóa hóa đơn |
| GET | `/invoices/export` | `exportInvoices(params)` | Xuất Excel |
| GET | `/invoices/:id/pdf` | `downloadInvoicePdf(id)` | Tải PDF hóa đơn |

**Service**: `src/modules/invoice/services/invoiceService.js`

---

## 7. Academy (`/academy`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/academy` | `fetchCourses(params)` | Danh sách khóa học |
| GET | `/academy/:id` | `fetchCourse(id)` | Chi tiết khóa học |
| POST | `/academy` | `createCourse(data)` | Tạo khóa học |
| PUT | `/academy/:id` | `updateCourse(id, data)` | Cập nhật khóa học |
| DELETE | `/academy/:id` | `deleteCourse(id)` | Xóa khóa học |
| GET | `/academy/export` | `exportCourses(params)` | Xuất Excel |

**Service**: `src/modules/academy/services/academyService.js`

---

## 8. Calendar (`/calendar`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/calendar` | `fetchEvents(params)` | Danh sách sự kiện |
| POST | `/calendar` | `createEvent(data)` | Tạo sự kiện |
| PUT | `/calendar/:id` | `updateEvent(id, data)` | Cập nhật sự kiện |
| DELETE | `/calendar/:id` | `deleteEvent(id)` | Xóa sự kiện |

**Service**: `src/modules/calendar/services/calendarService.js`

---

## 9. Chat (`/chat`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/chat` | `fetchChats()` | Danh sách cuộc trò chuyện |
| GET | `/chat/:chatId/messages` | `fetchMessages(chatId)` | Tin nhắn trong chat |
| POST | `/chat/:chatId/messages` | `sendMessage(chatId, data)` | Gửi tin nhắn |
| PUT | `/chat/:chatId/read` | `markAsRead(chatId)` | Đánh dấu đã đọc |
| DELETE | `/chat/:chatId/messages/:id` | `deleteMessage(chatId, id)` | Xóa tin nhắn |

**Service**: `src/modules/chat/services/chatService.js`

---

## 10. Email (`/email`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/email` | `fetchEmails(params)` | Danh sách email |
| GET | `/email/:id` | `fetchEmail(id)` | Chi tiết email |
| POST | `/email` | `sendEmail(data)` | Gửi email |
| PUT | `/email/:id` | `updateEmail(id, data)` | Cập nhật email |
| DELETE | `/email/:id` | `deleteEmail(id)` | Xóa email |
| PUT | `/email/:id/folder` | `moveToFolder(id, folder)` | Chuyển folder |
| PUT | `/email/:id/star` | `toggleStar(id)` | Đánh dấu sao |
| PUT | `/email/mark-read` | `markAsRead(ids)` | Đánh dấu đã đọc |

**Service**: `src/modules/email/services/emailService.js`

---

## 11. Kanban (`/kanban`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/kanban` | `fetchBoards()` | Danh sách boards |
| GET | `/kanban/:id` | `fetchBoard(id)` | Chi tiết board |
| POST | `/kanban` | `createBoard(data)` | Tạo board |
| PUT | `/kanban/:id` | `updateBoard(id, data)` | Cập nhật board |
| DELETE | `/kanban/:id` | `deleteBoard(id)` | Xóa board |
| POST | `/kanban/:boardId/columns/:colId/cards` | `createCard(...)` | Tạo card |
| PUT | `/kanban/:boardId/cards/:cardId` | `updateCard(...)` | Cập nhật card |
| DELETE | `/kanban/:boardId/cards/:cardId` | `deleteCard(...)` | Xóa card |
| PUT | `/kanban/:boardId/cards/:cardId/move` | `moveCard(...)` | Di chuyển card |

**Service**: `src/modules/kanban/services/kanbanService.js`

---

## 12. Logistics (`/logistics`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/logistics/fleets` | `fetchFleets(params)` | Danh sách phương tiện |
| GET | `/logistics/fleets/:id` | `fetchFleet(id)` | Chi tiết phương tiện |
| POST | `/logistics/fleets` | `createFleet(data)` | Tạo phương tiện |
| PUT | `/logistics/fleets/:id` | `updateFleet(id, data)` | Cập nhật phương tiện |
| DELETE | `/logistics/fleets/:id` | `deleteFleet(id)` | Xóa phương tiện |
| GET | `/logistics/shipments` | `fetchShipments(params)` | Danh sách vận chuyện |
| GET | `/logistics/shipments/:id` | `fetchShipment(id)` | Chi tiết vận chuyển |
| POST | `/logistics/shipments` | `createShipment(data)` | Tạo vận chuyển |
| PUT | `/logistics/shipments/:id/status` | `updateShipmentStatus(...)` | Đổi trạng thái |

**Service**: `src/modules/logistics/services/logisticsService.js`

---

## 13. Dashboards (`/dashboards`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/dashboards/analytics` | `fetchAnalyticsData()` | Dữ liệu analytics |
| GET | `/dashboards/crm` | `fetchCrmData()` | Dữ liệu CRM |
| GET | `/dashboards/ecommerce` | `fetchEcommerceData()` | Dữ liệu ecommerce |
| GET | `/dashboards/statistics` | `fetchStatistics(params)` | Thống kê tổng hợp |

**Service**: `src/modules/dashboards/services/dashboardService.js`

---

## 14. Front Pages (`/front-pages`)

| Method | Endpoint | Service Function | Mô tả |
|--------|----------|-----------------|-------|
| GET | `/front-pages/:slug` | `fetchPageData(slug)` | Nội dung trang |
| GET | `/front-pages/pricing` | `fetchPricing()` | Bảng giá |
| GET | `/front-pages/faq` | `fetchFAQ()` | FAQ |
| POST | `/front-pages/contact` | `submitContactForm(data)` | Gửi liên hệ |

**Service**: `src/modules/front-pages/services/frontPageService.js`

## 15. Activity Logs Module
- **Trạng thái**: [NEW] Đã khởi tạo (Restructure navigation)
- **Base Path**: /activity-logs
- **Các models chính**: ActivityLog
- **APIs**:
  - GET /activity-logs (List)
  - GET /activity-logs/:id (View)
  - DELETE /activity-logs/:id (Delete)
  - GET /activity-logs/export (Export)

## 16. Meetings Module
- **Trạng thái**: [NEW] Đã khởi tạo (Restructure navigation)
- **Base Path**: /meetings
- **Các models chính**: Meeting, Vote, Document, Conclusion, Attendee, AttendeeGroup, DocumentType, MeetingType
- **APIs**:
  - GET /meetings (List)
  - POST /meetings (Create)
  - GET /meetings/:id (View)
  - PUT /meetings/:id (Update)
  - DELETE /meetings/:id (Delete)
  - GET /meetings/export (Export)
  - CRUD /meetings/votes
  - CRUD /meetings/documents
  - CRUD /meetings/conclusions
  - CRUD /meetings/attendees
  - CRUD /meetings/attendee-groups
  - CRUD /meetings/document-types
  - CRUD /meetings/meeting-types

## 17. Organizations Module
- **Trạng thái**: [NEW] Đã khởi tạo (Restructure navigation)
- **Base Path**: /organizations
- **Các models chính**: Organization
- **APIs**:
  - GET /organizations (List)
  - POST /organizations (Create)
  - GET /organizations/:id (View)
  - PUT /organizations/:id (Update)
  - DELETE /organizations/:id (Delete)

## 18. System Settings Module
- **Trạng thái**: [NEW] Đã khởi tạo (Restructure navigation)
- **Base Path**: /system-settings
- **Các models chính**: GeneralSetting, NotificationSetting
- **APIs**:
  - GET /system-settings/general (View General)
  - PUT /system-settings/general (Update General)
  - GET /system-settings/notifications (View Notifications)
  - PUT /system-settings/notifications (Update Notifications)
