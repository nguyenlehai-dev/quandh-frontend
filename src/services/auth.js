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
  if (res.errors || res.code) {
    throw res
  }

  const { accessToken, userData, userAbilityRules } = res

  // Lưu session vào cookies
  useCookie(TOKEN_KEY).value = accessToken
  useCookie(USER_KEY).value = userData
  useCookie(ABILITY_KEY).value = userAbilityRules

  // Lưu organization mặc định (nếu BE trả về)
  if (userData?.organizations?.length) {
    useCookie(ORG_KEY).value = userData.organizations[0].id
  }

  // Update CASL permissions
  ability.update(userAbilityRules)

  return res
}

/**
 * Logout
 * Xóa tất cả cookies → reset CASL → redirect /login
 */
export const logout = async router => {
  // Xóa cookies
  useCookie(TOKEN_KEY).value = null
  useCookie(USER_KEY).value = null
  useCookie(ABILITY_KEY).value = null
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
