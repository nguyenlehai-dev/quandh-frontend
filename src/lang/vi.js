/**
 * Vietnamese locale — Auto-discovery
 *
 * Tự động scan tất cả file .js trong folder `vi/`
 * và merge thành 1 object theo cấu trúc folder/file.
 *
 * Ví dụ: vi/ecommerce/product.js → { ecommerce: { product: { ...keys } } }
 *
 * Khi thêm file mới vào vi/, chỉ cần tạo file → tự động nhận diện.
 */
const modules = import.meta.glob('./vi/**/*.js', { eager: true })

const messages = {}

Object.entries(modules).forEach(([path, mod]) => {
  // path: './vi/ecommerce/product.js' → ['ecommerce', 'product']
  const segments = path
    .replace('./vi/', '')
    .replace('.js', '')
    .split('/')

  let current = messages
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = { ...(current[segment] || {}), ...(mod.default || mod) }
    }
    else {
      current[segment] = current[segment] || {}
      current = current[segment]
    }
  })
})

export default messages
