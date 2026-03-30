/**
 * Auth Service
 *
 * Quản lý tập trung: login, logout, session state.
 * Sử dụng: import { login, logout, switchOrganization } from '@/services/auth'
 */
import { ability } from '@/plugins/casl/ability'
import ApiService from '@/services/api-service'

const api = new ApiService()

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'userData'
const ABILITY_KEY = 'userAbilityRules'
const ORG_KEY = 'currentOrganizationId'
const ORGS_KEY = 'availableOrganizations'
const FETCH_ME_SYNC_WINDOW = 5000

let fetchMePromise = null
let lastFetchMeAt = 0

const clearClientSession = () => {
  useCookie(TOKEN_KEY).value = null
  useCookie(USER_KEY).value = null
  useCookie(ORG_KEY).value = null
  localStorage.removeItem(ABILITY_KEY)
  localStorage.removeItem(ORGS_KEY)
  ability.update([])
}

export const register = async payload => {
  const res = await api.callApi({
    method: 'POST',
    url: '/auth/register',
    param: payload,
  })

  if (res.errors || res.code || res.success === false) {
    throw res
  }

  return res.data || res
}

/**
 * Login
 * POST /auth/login → lưu cookies + update CASL ability
 *
 * Khi current_organization_id = null (nhiều org, chưa có preference)
 * → không lưu cookie org, trả data cho page hiển thị dialog chọn.
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

  // Lưu danh sách tổ chức user có quyền truy cập
  if (data.available_organizations) {
    localStorage.setItem(ORGS_KEY, JSON.stringify(data.available_organizations))
  }

  // Lưu organization (nếu BE đã xác định được)
  if (data.current_organization_id) {
    useCookie(ORG_KEY).value = data.current_organization_id
  }

  // Update CASL permissions
  ability.update(userAbilityRules)

  return data
}

/**
 * Chuyển tổ chức làm việc
 * POST /auth/switch-organization → lưu DB + cập nhật cookie & CASL
 */
export const switchOrganization = async orgId => {
  const res = await api.callApi({
    method: 'POST',
    url: '/auth/switch-organization',
    param: { organization_id: orgId },
  })

  if (res.errors || res.code || res.success === false) {
    throw res
  }

  const data = res.data || res

  // Lưu org đã chọn vào cookie
  useCookie(ORG_KEY).value = data.current_organization_id

  // Cập nhật CASL abilities theo org mới
  const userAbilityRules = data.abilities || []

  userAbilityRules.push({ action: 'read', subject: 'Dashboard' })
  userAbilityRules.push({ action: 'read', subject: 'Auth' })
  localStorage.setItem(ABILITY_KEY, JSON.stringify(userAbilityRules))
  ability.update(userAbilityRules)

  return data
}

/**
 * Logout
 * Xóa tất cả cookies → reset CASL → redirect /login
 */
export const logout = async router => {
  try {
    if (useCookie(TOKEN_KEY).value) {
      await api.callApi({
        method: 'POST',
        url: '/auth/logout',
        param: {},
      })
    }
  }
  catch (err) {
    console.warn('Logout API failed', err)
  }

  clearClientSession()

  // Redirect trước rồi mới reset ability (tránh flickering nav menu)
  if (router) {
    await router.push('/login')
  }
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
 * Đổi organization hiện tại (chỉ client-side, không gọi API)
 */
export const setCurrentOrganization = orgId => {
  useCookie(ORG_KEY).value = orgId
}

/**
 * Fetch lại thông tin user & quyền hạn mới nhất từ Server
 * Thường gọi khi ứng dụng vửa khởi tạo (reload / F5)
 */
export const fetchMe = async ({ force = false } = {}) => {
  if (!isAuthenticated()) return null

  // Middleware set.permissions.team yêu cầu X-Organization-Id header.
  // Nếu chưa có org (chưa chọn tổ chức) → skip, tránh lỗi 422.
  const orgId = useCookie('currentOrganizationId').value
  if (!orgId) return null

  const now = Date.now()
  if (!force && now - lastFetchMeAt < FETCH_ME_SYNC_WINDOW) {
    return null
  }

  if (fetchMePromise) {
    return fetchMePromise
  }

  fetchMePromise = (async () => {
    try {
      const res = await api.callApi({
        method: 'GET',
        url: '/user',
      })

      if (res.errors || res.code || res.success === false) {
        return null
      }

      const data = res.data || res

      if (data) {
        // 1. Cập nhật quyền
        const userAbilityRules = data.abilities || []
        
        userAbilityRules.push({ action: 'read', subject: 'Dashboard' })
        userAbilityRules.push({ action: 'read', subject: 'Auth' })
        
        localStorage.setItem(ABILITY_KEY, JSON.stringify(userAbilityRules))
        ability.update(userAbilityRules)

        // 2. Cập nhật User
        if (data.user) {
          useCookie(USER_KEY).value = data.user
        }

        // 3. Cập nhật Organizations
        if (data.available_organizations) {
          localStorage.setItem(ORGS_KEY, JSON.stringify(data.available_organizations))
        }

        lastFetchMeAt = Date.now()

        return data
      }
      
      return null
    }
    catch (err) {
      console.warn('Fetch auth/me failed', err)

      return null
    }
    finally {
      fetchMePromise = null
    }
  })()

  return fetchMePromise
}
