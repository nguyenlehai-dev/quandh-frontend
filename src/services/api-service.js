import axios from 'axios'
import { router } from '@/plugins/1.router'
import { getI18n } from '@/plugins/i18n'

const URL = import.meta.env.VITE_API_BASE_URL || '/api'

export default class ApiService {
  callApi(data) {
    if (data.method !== undefined && data.url !== undefined) {
      const method = data.method.toLowerCase()
      const url = data.url.toLowerCase()
      const param = data.param

      switch (method) {
      case 'get':
        return this.get(url, param).then(response => response)
      case 'delete':
        return this.delete(url, param).then(response => response)
      case 'post':
        return this.post(url, param).then(response => response)
      case 'put':
        return this.put(url, param).then(response => response)
      case 'put_upload':
        return this.putUpload(url, param).then(response => response)
      case 'upload':
        return this.upload(url, param).then(response => response)
      case 'image':
        return this.image(url, param).then(response => response)
      case 'download':
        return this.download(url, param).then(response => response)
      default:
        return { message: 'method not support', errors: null }
      }
    }
    else {
      return { message: 'call api fail', errors: null }
    }
  }

  authHeader(api = '') {
    const accessToken = useCookie('accessToken').value
    const orgId = useCookie('currentOrganizationId').value

    const headers = {
      Accept: 'application/json',
    }

    if (accessToken)
      headers.Authorization = `Bearer ${accessToken}`

    if (orgId && !api.includes('/auth/'))
      headers['X-Organization-Id'] = String(orgId)

    return headers
  }

  get(api, param) {
    return axios.get(URL + api, {
      headers: this.authHeader(api),
      params: param,
    })
      .then(res => {
        res.data.param = param

        return res.data
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  download(api, param, responseType = 'blob') {
    api = this.joinParamToUrl(api, param)

    return axios.get(URL + api, {
      headers: this.authHeader(api),
      responseType,
    })
      .then(res => {
        return res
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  delete(api, param) {
    if (!param?.ids)
      api = this.joinParamToUrl(api, param)

    return axios.delete(URL + api, {
      headers: this.authHeader(api),
      data: param,
    })
      .then(res => {
        return res.data
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  post(api, data) {
    return axios.post(URL + api, data, {
      headers: this.authHeader(api),
    })
      .then(res => {
        return res.data
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  putUpload(api, data) {
    data.append('_method', 'PUT')

    return axios.post(URL + api, data, {
      headers: this.authHeader(api),
    })
      .then(res => {
        return res.data
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  put(api, data) {
    return axios.put(URL + api, data, {
      headers: this.authHeader(api),
    })
      .then(res => {
        return res.data
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  upload(api, data) {
    return axios.post(URL + api, data, {
      headers: Object.assign(this.authHeader(api), {
        'Content-Type': 'multipart/form-data',
      }),
    })
      .then(res => {
        return res.data
      })
      .catch(err => {
        return this.processErrorResponse(err, api)
      })
  }

  image(api, param) {
    return fetch(URL + api + '/' + param.id, {
      headers: this.authHeader(api),
    })
  }

  joinParamToUrl(api, params) {
    let string = api
    if (params !== undefined) {
      let i = 0
      for (const index in params) {
        if (params[index]) {
          if (i === 0)
            string += `?${index}=${params[index]}`
          else
            string += `&${index}=${params[index]}`

          i++
        }
      }
    }

    return string
  }

  /**
   * Parse error keys cho validation errors (422)
   * Biến 'field.0.name' → 'field[0].name'
   */
  parseErrorKey(errors) {
    if (!errors || typeof errors !== 'object')
      return errors

    const parsed = {}

    for (const key of Object.keys(errors)) {
      const newKey = key.replace(/\.(\d+)\./g, '[$1].')

      parsed[newKey] = errors[key]
    }

    return parsed
  }

  processErrorResponse(err, api) {
    if (!err.response) {
      console.error('Network error:', err)

      return { message: 'Network error', errors: null, code: 0 }
    }

    const i18n = getI18n()
    const t = i18n.global.t
    const status = err.response.status

    err.response.data.code = status

    if (status === 401 && router.currentRoute.value.name !== 'login') {
      if (api !== '/user') {
        // Lưu trang hiện tại để redirect sau login
        localStorage.setItem('history_link', window.location.pathname)

        // Xóa auth cookies
        useCookie('accessToken').value = null
        useCookie('userData').value = null
        localStorage.removeItem('userAbilityRules')
        useCookie('currentOrganizationId').value = null
        localStorage.removeItem('availableOrganizations')

        return router.push('/login')
      }
    }
    else if (status === 403) {
      err.response.data.code = 403
      console.warn('[403] Forbidden:', api)
    }
    else if (status === 404) {
      err.response.data.code = 404
      console.warn('[404] Not Found:', api)
    }
    else if (status === 422) {
      err.response.data.code = 422
      err.response.data.errors = this.parseErrorKey(err.response.data.errors)
    }
    else if (status === 423) {
      err.response.data.code = 423
      console.warn('[423] Locked:', err.response.data.message)
    }
    else if (status === 500) {
      err.response.data.code = 500
      console.error('[500] Server Error:', api)
    }

    return err.response.data
  }
}
