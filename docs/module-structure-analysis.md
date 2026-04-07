# Module Structure Analysis

## Mục tiêu

Chuẩn hóa toàn bộ module trong dự án theo một khung thư mục thống nhất:

```text
module-name/
  components/
  composables/
  configs/
  models/
  router/
  services/
  utils/
  views/
```

Mục tiêu của cấu trúc này là:

- Dễ đọc, dễ tìm file, dễ onboarding.
- Tách rõ phần hiển thị, logic, cấu hình và truy cập dữ liệu.
- Giữ module độc lập tương đối, giảm việc code nằm rải rác trong `src`.
- Tạo nền tảng để sau này chuyển từ template demo sang sản phẩm thật.

## Kết luận ngắn

Có thể áp dụng cấu trúc này làm chuẩn cho mọi module.

Tuy nhiên, nên hiểu là:

- Đây là `module contract`, tức là khung chuẩn chung.
- Không nên ép mọi module phải có file trong đủ cả 8 thư mục nếu module đó không dùng tới.
- Có thể cho phép thư mục vắng mặt nếu không có nhu cầu thực tế, nhưng tên và ý nghĩa thư mục phải được giữ thống nhất trên toàn dự án.

Nói ngắn gọn: chuẩn này dùng được, và phù hợp để module hóa toàn bộ menu hiện có.

## Đánh giá cấu trúc hiện đề xuất

### 1. `components/`

Chứa component nội bộ của module.

Nên đặt tại đây:

- Table, filter bar, modal, form section, card, panel.
- Component chỉ phục vụ module đó.

Không nên đặt tại đây:

- Component dùng chung toàn app. Những component đó nên nằm ở `src/components` hoặc `src/@core`.

### 2. `composables/`

Chứa logic tái sử dụng trong phạm vi module.

Nên đặt tại đây:

- `useFilters`
- `useTableColumns`
- `usePermissionCheck`
- `useFormState`

Mục tiêu là giữ `views/` mỏng hơn và tránh nhồi toàn bộ logic vào `.vue`.

### 3. `configs/`

Chứa cấu hình tĩnh của module.

Ví dụ:

- Cấu hình cột bảng.
- Tabs config.
- Breadcrumb config.
- Form schema dạng tĩnh.
- Enum hiển thị, trạng thái, badge mapping.

Thư mục này hữu ích khi module có nhiều cấu hình UI hoặc business rules đơn giản.

### 4. `models/`

Chứa mô hình dữ liệu của module.

Trong codebase hiện tại là JavaScript, nên `models/` có thể chứa:

- shape dữ liệu
- mapper
- normalizer
- factory
- constants liên quan entity

Nếu sau này nâng lên TypeScript, đây là nơi rất phù hợp cho:

- `types`
- `interfaces`
- `dto`
- `entity`

Lưu ý: nếu team phân biệt rõ kiểu dữ liệu và validation, sau này có thể tách `models/` và `schemas/`. Ở giai đoạn hiện tại, để `models/` là đủ.

### 5. `router/`

Chứa routing của module.

Vai trò phù hợp:

- route records bổ sung
- route meta
- breadcrumb builders
- permission guard cấp module

Vì dự án hiện đang dùng file-based routing từ `src/pages`, nên `router/` không nên tranh quyền với `src/pages`.

Khuyến nghị:

- `src/pages` chỉ làm route entry.
- `module/router/` chứa route config phụ hoặc hàm hỗ trợ route meta.
- `src/pages/...` import màn hình từ `src/modules/.../views/...`.

Ví dụ:

```js
// src/pages/apps/ecommerce/product/list/index.vue
export { default } from '@/modules/ecommerce/views/product/ProductListPage.vue'
```

### 6. `services/`

Chứa phần làm việc với API và dữ liệu.

Nên đặt tại đây:

- HTTP calls
- service orchestration
- adapter dữ liệu vào/ra API
- mock gateway nếu module đang chạy fake API

Đây là thư mục rất quan trọng. Nếu làm tốt, `views/` và `components/` sẽ không biết quá nhiều về `ofetch`, endpoint hay payload.

### 7. `utils/`

Chứa helper riêng của module.

Ví dụ:

- formatter riêng
- helper transform data
- date range util đặc thù module

Không nên biến `utils/` thành nơi gom mọi thứ khó xếp. Nếu helper đủ lớn hoặc có logic trạng thái, chuyển sang `composables/` hoặc `services/`.

### 8. `views/`

Chứa màn hình chính của module.

Nên đặt tại đây:

- page-level container
- screen-level form
- page sections

`views/` là nơi ghép `components`, `composables`, `services` lại thành màn hình hoàn chỉnh.

## Có nên bắt buộc 100% không?

Có thể bắt buộc ở mức kiến trúc, nhưng không nên máy móc ở mức thư mục trống.

Khuyến nghị áp dụng:

- Bắt buộc tên và ý nghĩa các thư mục phải thống nhất.
- Bắt buộc module mới phải tuân theo cùng một chuẩn.
- Không bắt buộc tạo đủ 8 thư mục nếu module nhỏ chưa cần.
- Không cho phép tạo thêm thư mục ngẫu hứng nếu chưa có quy ước kiến trúc rõ ràng.

Nói cách khác:

- `structure is mandatory`
- `folder population is contextual`

## Ưu điểm

- Team nhìn vào module nào cũng hiểu ngay.
- Dễ tách code khỏi template hiện tại.
- Dễ giao việc theo module.
- Dễ kiểm soát import boundary.
- Dễ thêm test, mock, store sau này nếu cần.

## Nhược điểm

- Với module rất nhỏ, cấu trúc này có thể hơi nặng.
- Nếu không có quy ước import rõ ràng, code vẫn có thể bị phụ thuộc chéo giữa các module.
- `configs`, `models`, `utils` dễ bị dùng chồng lấn nếu không định nghĩa rõ.

## Quy ước phụ cần chốt thêm

Để cấu trúc này thực sự hiệu quả, nên chốt thêm các nguyên tắc sau:

### 0. Core inheritance và vùng cấm sửa

Module được phép kế thừa từ `core`, nhưng không được tùy tiện chỉnh sửa `core`.

Nguyên tắc này cần được xem là bắt buộc.

#### Mục tiêu

- Tận dụng lại nền tảng sẵn có của dự án.
- Giảm duplication giữa các module.
- Bảo vệ phần khung của hệ thống khỏi việc bị mỗi module sửa theo một kiểu.
- Giữ khả năng nâng cấp, refactor và kiểm soát regression.

#### Những gì module được phép kế thừa từ core

Module có thể sử dụng lại các thành phần dùng chung từ các khu vực như:

- `src/@core`
- `src/@layouts`
- `src/components`
- `src/composables`
- `src/utils`
- các plugin nền tảng trong `src/plugins`

Ví dụ kế thừa hợp lệ:

- dùng UI wrapper, app form field, shared dialog
- dùng composable dùng chung
- dùng helper format chung
- dùng theme, layout, permission primitives
- dùng API client chung như `$api`

#### Những gì bị cấm

Khi phát triển module business hoặc module reference, không được:

- sửa trực tiếp `src/@core`
- sửa trực tiếp `src/@layouts`
- sửa trực tiếp kiến trúc plugin nền tảng trong `src/plugins` nếu chỉ để phục vụ một module riêng
- sửa các helper/core component dùng chung theo nhu cầu cục bộ của một module
- thêm logic business của module vào `core`

Rule ngắn gọn:

- `core` là nơi để kế thừa, không phải nơi để customize theo từng module

#### Khi nào mới được phép sửa core

Chỉ được sửa `core` nếu thỏa đồng thời các điều kiện sau:

- thay đổi đó thực sự có giá trị dùng chung cho nhiều module
- không chứa logic nghiệp vụ riêng
- không phá hành vi hiện có của các module khác
- đã được review như thay đổi kiến trúc, không phải thay đổi cục bộ

Nếu không đạt các điều kiện trên, phải xử lý trong module thay vì sửa `core`.

#### Cách mở rộng đúng

Thay vì sửa `core`, ưu tiên các cách sau:

- bọc component core bằng component trong `module/components`
- viết composable riêng trong `module/composables`
- tạo config riêng trong `module/configs`
- tạo service/adapter riêng trong `module/services`
- map dữ liệu riêng trong `module/models`

Ví dụ đúng:

- `module/components/ProductTable.vue` dùng lại `AppTextField`, `AppSelect`, `VDataTable`
- `module/services/order.service.js` dùng `$api`
- `module/views/ProductListPage.vue` dùng layout và shared card từ hệ thống hiện có

Ví dụ sai:

- sửa `AppTextField` chỉ vì module A cần một behavior rất riêng
- nhét `product status formatter` vào `src/@core/utils`
- thêm guard đặc thù của `ecommerce` vào router core

#### Tác động lên quy trình làm việc

Khi tạo module mới, thứ tự quyết định nên là:

1. Xem `core/shared` đã có thứ có thể kế thừa chưa.
2. Nếu có, dùng lại nguyên trạng.
3. Nếu chưa đủ, mở rộng trong module.
4. Chỉ đề xuất sửa `core` khi đó là nhu cầu dùng chung thật sự.

#### Rule bắt buộc cho team

Có thể dùng nguyên văn rule sau:

> Module được phép kế thừa từ core và shared layer, nhưng không được sửa trực tiếp các phần liên quan đến core nếu thay đổi đó chỉ phục vụ một module cụ thể. Mọi thay đổi vào core phải được xem như thay đổi kiến trúc dùng chung.

### 1. Import boundary

- Module A không import trực tiếp `components` hoặc `utils` nội bộ của module B.
- Nếu cần dùng chéo, phải expose qua public entry của module B hoặc chuyển phần đó lên shared layer.

### 2. Route entry

- Toàn bộ route public vẫn đi qua `src/pages`.
- `src/pages` không giữ business logic lớn.
- `src/pages` chỉ re-export hoặc mount view từ module.

### 3. API access

- Chỉ `services/` được phép gọi `$api` trực tiếp.
- `views/` và `components/` không gọi endpoint thẳng nếu không thật sự cần.

### 4. Reusability

- Reusable toàn app đặt ở `src/components`, `src/composables`, `src/utils`.
- Chỉ reusable nội bộ module mới để trong module.

### 5. Naming

- Tên module theo domain, không theo widget.
- Ví dụ tốt: `ecommerce`, `invoice`, `user-management`.
- Ví dụ kém: `tables`, `cards`, `form-elements`.

## Cách áp vào menu hiện tại

Với navigation hiện có, nên chia như sau:

### Nhóm business module

- `dashboard`
- `academy`
- `logistics`
- `ecommerce`
- `email`
- `chat`
- `calendar`
- `kanban`
- `invoice`
- `user-management`
- `role-permission`
- `profile-settings`
- `auth`
- `access-control`

### Nhóm reference module

Các page demo của template không phải nghiệp vụ thật, nhưng vẫn có thể đưa vào module để quản lý thống nhất:

- `ui-reference`
- `forms-reference`
- `charts-reference`
- `tables-reference`
- `extensions-reference`
- `system-pages`

Khuyến nghị không trộn business module và reference module vào cùng một nhóm.

## Cấu trúc đề xuất trong dự án này

```text
src/
  modules/
    auth/
    role-permission/
    user-management/
  module-templates/
    _base-module/
    ecommerce/
    invoice/
    ...
```

`src/pages` sẽ tiếp tục tồn tại để tương thích với file-based router hiện tại.

## Active modules và module templates

Để phù hợp với hướng triển khai hiện tại, cần tách hai lớp rõ ràng:

### 1. `src/modules`

Đây là nơi chứa các module đang hoạt động thực sự trong app hiện tại.

Ở giai đoạn này chỉ giữ lại:

- `src/modules/auth`
- `src/modules/dashboard`
- `src/modules/role-permission`
- `src/modules/user-management`

Ý nghĩa:

- `auth` dùng cho luồng đăng nhập.
- `dashboard` hiện chỉ giữ logistics dashboard ở active layer.
- `role-permission` là module business đang được bật sau khi đăng nhập.
- `user-management` là module business active cho danh sách và chi tiết người dùng.

### 2. `src/module-templates`

Đây là kho template module.

Mọi module demo hoặc module tham khảo nên đặt ở đây để:

- làm nguồn kế thừa
- làm nguồn copy khi cần bật thêm tính năng
- tránh làm `src/modules` bị phình to bởi các module chưa dùng thực sự

Nguyên tắc:

- `src/modules` là active runtime layer
- `src/module-templates` là template source layer

## Workflow đề xuất

Khi cần dùng một module mới:

1. Chọn template trong `src/module-templates/<template-name>`.
2. Copy template đó sang `src/modules/<module-name>`.
3. Tùy biến trong module mới, không sửa trực tiếp template gốc.
4. Nối route/menu theo nhu cầu thực tế.

Điều này giúp:

- giữ module đang chạy luôn gọn
- tránh sửa nhầm template gốc
- dễ kiểm soát module nào đang thực sự được bật trong hệ thống

## Rule bổ sung cho template modules

- Không phát triển business logic thật trực tiếp trong `src/module-templates`.
- Mọi template chỉ là nguồn khởi tạo.
- Khi một template được kích hoạt để dùng thật, phải copy sang `src/modules`.
- Không cho phép import chéo từ module active sang template nếu đó là logic lõi cần ổn định lâu dài.

## Ví dụ module thực tế

```text
src/modules/ecommerce/
  components/
    ProductTable.vue
    ProductFilterBar.vue
    ProductStatusChip.vue
  composables/
    useProductFilters.js
    useProductTable.js
  configs/
    product-columns.js
    product-status-options.js
  models/
    product.mapper.js
    product.model.js
  router/
    meta.js
  services/
    product.service.js
  utils/
    product-formatters.js
  views/
    ProductListPage.vue
    ProductAddPage.vue
    ProductCategoryPage.vue
```

## Recommendation

Khuyến nghị chính thức:

- Chấp nhận cấu trúc này làm chuẩn module cho toàn dự án.
- Áp dụng ngay cho module mới.
- Module hóa dần các page/menu hiện tại theo chuẩn đó.
- Giữ `src/pages` làm lớp route adapter trong giai đoạn chuyển đổi.
- Cho phép module kế thừa từ `core/shared`, nhưng xem `core` là vùng bảo vệ, không sửa trực tiếp theo nhu cầu cục bộ của module.

## Migration strategy

Thứ tự hợp lý:

1. Tạo `src/modules`.
2. Chốt 1 module mẫu chuẩn, ví dụ `auth` hoặc `ecommerce`.
3. Chuyển `src/pages` sang dạng route entry mỏng.
4. Tách `services` và `views` trước, sau đó mới tách `components/composables/configs`.
5. Cuối cùng mới dọn shared layer để tránh duplication.

## Quyết định đề xuất

Nếu cần một rule ngắn gọn cho team, có thể dùng:

> Mọi module phải tuân theo cùng một module contract. Không bắt buộc tạo đủ toàn bộ thư mục khi chưa dùng, nhưng tuyệt đối không phá vỡ naming và trách nhiệm của từng thư mục.

Và thêm rule bắt buộc thứ hai:

> Module được phép dùng lại những gì có sẵn từ core và shared layer, nhưng không được sửa trực tiếp các phần liên quan đến core nếu thay đổi đó không phải nhu cầu dùng chung toàn hệ thống.
