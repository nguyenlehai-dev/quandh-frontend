/**
 * Auth Service
 *
 * Quản lý tập trung: login, logout, session state.
 * Sử dụng: import { login, logout } from '@/services/auth'
 */
import { ability } from '@/plugins/casl/ability'
import ApiService from '@/services/api-service'

const api = new ApiService()

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'userData'
const ABILITY_KEY = 'userAbilityRules'
const ORG_KEY = 'currentOrganizationId'

/**
 * Login
 * POST /auth/login → lưu cookies + update CASL ability
 */
export const login = async (email, password) => {
  const res = await api.callApi({
    method: 'POST',
    url: '/auth/login',
    param: { email, password },
  })

  // Nếu có lỗi (422, network error, ...)
  if (res.errors || res.code || res.success === false) {
    throw res
  }

  // Laravel backend chuẩn trả về payload nằm trong property 'data'
  const data = res.data || res

  const accessToken = data.access_token
  const userData = data.user
  const userAbilityRules = data.abilities || []

  // Bổ sung quyền mặc định để truy cập Dashboard và các Route không được định nghĩa rõ ràng
  userAbilityRules.push({ action: 'read', subject: 'Dashboard' })
  userAbilityRules.push({ action: 'read', subject: 'Auth' })

  // Lưu session vào cookies
  useCookie(TOKEN_KEY).value = accessToken
  useCookie(USER_KEY).value = userData
  localStorage.setItem(ABILITY_KEY, JSON.stringify(userAbilityRules))

  // Lưu organization mặc định (nếu BE trả về)
  const orgId = data.current_organization_id || (data.available_organizations?.length ? data.available_organizations[0].id : null)
  if (orgId) {
    useCookie(ORG_KEY).value = orgId
  }

  // Update CASL permissions
  ability.update(userAbilityRules)

  return data
}

/**
 * Logout
 * Xóa tất cả cookies → reset CASL → redirect /login
 */
export const logout = async router => {
  // Xóa cookies
  useCookie(TOKEN_KEY).value = null
  useCookie(USER_KEY).value = null
  localStorage.removeItem(ABILITY_KEY)
  useCookie(ORG_KEY).value = null

  // Redirect trước rồi mới reset ability (tránh flickering nav menu)
  if (router) {
    await router.push('/login')
  }

  // Reset CASL abilities
  ability.update([])
}

/**
 * Lấy thông tin user hiện tại từ cookie
 */
export const getCurrentUser = () => {
  return useCookie(USER_KEY).value
}

/**
 * Kiểm tra đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  return !!(useCookie(TOKEN_KEY).value && useCookie(USER_KEY).value)
}

/**
 * Đổi organization hiện tại
 */
export const setCurrentOrganization = orgId => {
  useCookie(ORG_KEY).value = orgId
}
