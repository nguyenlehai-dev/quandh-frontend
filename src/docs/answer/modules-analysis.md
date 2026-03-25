# Phân tích chức năng các Module

> Tài liệu mô tả chi tiết chức năng, mục đích, và phạm vi hoạt động của từng module trong hệ thống.

---

## 1. User — Quản lý người dùng

**Mục đích**: Quản lý toàn bộ lifecycle của user trong hệ thống.

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách user | Hiển thị bảng có phân trang, filter theo role/status/plan, tìm kiếm theo tên/email |
| Tạo user | Form tạo mới với validate email, gán role, plan |
| Sửa user | Cập nhật thông tin, đổi role/plan |
| Xóa user | Xóa với xác nhận, kiểm tra ràng buộc |
| Đổi trạng thái | Active / Pending / Inactive |
| Xuất Excel | Export danh sách user theo bộ lọc hiện tại |

**Trạng thái**: `active` (Đang hoạt động), `pending` (Chờ duyệt), `inactive` (Ngưng hoạt động)  
**Quyền**: `user.view`, `user.create`, `user.edit`, `user.delete`, `user.export`

---

## 2. Roles — Quản lý vai trò

**Mục đích**: Định nghĩa các vai trò (role) trong hệ thống, mỗi role chứa tập hợp quyền hạn.

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách roles | Hiển thị tất cả roles với số lượng user/permissions |
| Tạo role | Đặt tên, mô tả, chọn permissions |
| Sửa role | Cập nhật tên, mô tả, thay đổi permissions |
| Xóa role | Xóa role (kiểm tra còn user nào đang dùng) |
| Gán quyền | Chọn/bỏ chọn permissions cho role |

**Quyền**: `role.view`, `role.create`, `role.edit`, `role.delete`

---

## 3. Permissions — Quản lý quyền hạn

**Mục đích**: Quản lý danh sách permissions (quyền) chi tiết, dùng kết hợp với CASL để phân quyền frontend.

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách permissions | Bảng permissions có phân trang |
| Tạo permission | Định nghĩa quyền mới (action + subject) |
| Sửa permission | Cập nhật tên, mô tả |
| Xóa permission | Xóa quyền (kiểm tra role nào đang dùng) |

**Quyền**: `permission.view`, `permission.create`, `permission.edit`, `permission.delete`

---

## 4. Ecommerce — Thương mại điện tử

**Mục đích**: Quản lý toàn bộ hoạt động thương mại: sản phẩm, đơn hàng, khách hàng.

### 4.1 Products (Sản phẩm)
| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng sản phẩm có filter theo category, status, giá |
| CRUD | Tạo/sửa/xóa sản phẩm với hình ảnh, giá, mô tả |
| Export | Xuất Excel danh sách sản phẩm |

### 4.2 Orders (Đơn hàng)
| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng đơn hàng có filter theo trạng thái |
| Chi tiết | Xem chi tiết đơn hàng, sản phẩm, khách hàng |
| Đổi trạng thái | Pending → Processing → Shipped → Delivered |
| Export | Xuất Excel |

### 4.3 Customers (Khách hàng)
| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng khách hàng, tìm kiếm theo tên/email |
| CRUD | Tạo/sửa/xóa khách hàng |

**Quyền**: `ecommerce.view`, `ecommerce.create`, `ecommerce.edit`, `ecommerce.delete`

---

## 5. Invoice — Quản lý hóa đơn

**Mục đích**: Tạo, quản lý, và xuất hóa đơn cho khách hàng.

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng hóa đơn có filter theo trạng thái thanh toán |
| Tạo hóa đơn | Form tạo với khách hàng, items, thuế, giảm giá |
| Sửa hóa đơn | Cập nhật nội dung, trạng thái |
| Xóa | Xóa hóa đơn |
| Xuất PDF | Tải file PDF hóa đơn |
| Xuất Excel | Export danh sách |

**Quyền**: `invoice.view`, `invoice.create`, `invoice.edit`, `invoice.delete`

---

## 6. Academy — Quản lý khóa học

**Mục đích**: Quản lý nội dung giáo dục, khóa học online.

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng khóa học có filter theo category, instructor |
| CRUD | Tạo/sửa/xóa khóa học |
| Export | Xuất Excel |

**Quyền**: `academy.view`, `academy.create`, `academy.edit`, `academy.delete`

---

## 7. Calendar — Lịch / Sự kiện

**Mục đích**: Quản lý lịch trình, sự kiện, cuộc họp.

| Chức năng | Mô tả |
|-----------|-------|
| Xem lịch | Giao diện lịch (ngày/tuần/tháng) |
| Tạo sự kiện | Form tạo với thời gian, tiêu đề, màu sắc |
| Sửa sự kiện | Kéo thả hoặc form chỉnh sửa |
| Xóa sự kiện | Xóa sự kiện |

**Quyền**: `calendar.view`, `calendar.create`, `calendar.edit`, `calendar.delete`

---

## 8. Chat — Trò chuyện

**Mục đích**: Hệ thống nhắn tin realtime giữa các user.

| Chức năng | Mô tả |
|-----------|-------|
| Danh sách chat | Sidebar hiển thị các cuộc trò chuyện |
| Gửi tin nhắn | Gửi text vào cuộc trò chuyện |
| Đánh dấu đã đọc | Tự động mark as read khi mở chat |
| Xóa tin nhắn | Xóa tin nhắn cá nhân |

**Quyền**: `chat.view`, `chat.send`

---

## 9. Email — Quản lý email

**Mục đích**: Giao diện email client tích hợp (inbox, sent, draft, trash).

| Chức năng | Mô tả |
|-----------|-------|
| Inbox | Danh sách email đến |
| Gửi email | Compose email mới |
| Đọc email | Xem nội dung chi tiết |
| Di chuyển | Chuyển email giữa các folder |
| Đánh dấu sao | Toggle star |
| Đánh dấu đã đọc | Mark as read (batch) |
| Xóa | Xóa email |

**Quyền**: `email.view`, `email.send`, `email.edit`, `email.delete`

---

## 10. Kanban — Bảng công việc

**Mục đích**: Quản lý công việc theo phương pháp Kanban (columns + cards).

| Chức năng | Mô tả |
|-----------|-------|
| Boards | Tạo/sửa/xóa bảng Kanban |
| Cards | Tạo/sửa/xóa card trong column |
| Kéo thả | Di chuyển card giữa các column |

**Quyền**: `kanban.view`, `kanban.create`, `kanban.edit`, `kanban.delete`

---

## 11. Logistics — Hậu cần / Vận chuyển

**Mục đích**: Quản lý đội xe (fleet) và vận chuyển (shipments).

### 11.1 Fleet (Đội xe)
| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng phương tiện với trạng thái |
| CRUD | Tạo/sửa/xóa phương tiện |

### 11.2 Shipments (Vận chuyển)
| Chức năng | Mô tả |
|-----------|-------|
| Danh sách | Bảng shipments với tracking |
| Tạo | Tạo đơn vận chuyển |
| Đổi trạng thái | Pending → In Transit → Delivered |

**Quyền**: `logistics.view`, `logistics.create`, `logistics.edit`, `logistics.delete`

---

## 12. Dashboards — Bảng điều khiển

**Mục đích**: Tổng hợp dữ liệu thống kê, biểu đồ, KPI cho từng lĩnh vực.

| Chức năng | Mô tả |
|-----------|-------|
| Analytics | Biểu đồ traffic, sessions, bounce rate |
| CRM | Tổng khách hàng, deals, revenue |
| Ecommerce | Doanh thu, đơn hàng, sản phẩm bán chạy |
| Statistics | Thống kê tổng hợp theo thời gian |

**Quyền**: `dashboard.view`

---

## 13. Front Pages — Trang công khai

**Mục đích**: Quản lý nội dung trang công khai (landing, pricing, FAQ, liên hệ).

| Chức năng | Mô tả |
|-----------|-------|
| Landing page | Nội dung trang chủ |
| Pricing | Bảng giá các gói |
| FAQ | Câu hỏi thường gặp |
| Contact form | Form liên hệ |

**Quyền**: `frontpage.view`, `frontpage.edit`

---

## 14. Example (Template mẫu)

**Mục đích**: Module mẫu (template) để developer tham khảo khi tạo module mới. Bị bỏ qua trong `_loader.js`, không load lên app.

| Chức năng | Mô tả |
|-----------|-------|
| CRUD Employee | Ví dụ CRUD đầy đủ với phân trang, filter, export |

> ⚠️ Module này chỉ là template tham khảo, không chạy trên production.
