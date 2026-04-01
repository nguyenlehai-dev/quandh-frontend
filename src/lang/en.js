/**
 * English locale — Auto-discovery
 *
 * Tự động scan tất cả file .js trong folder `en/`
 * và merge thành 1 object theo cấu trúc folder/file.
 *
 * Ví dụ: en/ecommerce/product.js → { ecommerce: { product: { ...keys } } }
 *
 * Khi thêm file mới vào en/, chỉ cần tạo file → tự động nhận diện.
 */
const modules = import.meta.glob('./en/**/*.js', { eager: true })

const messages = {}

Object.entries(modules).forEach(([path, mod]) => {
  // path: './en/ecommerce/product.js' → ['ecommerce', 'product']
  const segments = path
    .replace('./en/', '')
    .replace('.js', '')
    .split('/')

  let current = messages
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      // Leaf: merge exported default object
      current[segment] = { ...(current[segment] || {}), ...(mod.default || mod) }
    }
    else {
      // Branch: create namespace
      current[segment] = current[segment] || {}
      current = current[segment]
    }
  })
})

export default messages
