import is from '@sindresorhus/is'
import { destr } from 'destr'
import { HttpResponse, http } from 'msw'
import { db } from '@db/apps/permission/db'
import { paginateArray } from '@api-utils/paginateArray'

const allowedRoles = ['admin', 'author', 'editor', 'maintainer', 'subscriber']

const getRangeDate = (value, mode) => {
  if (!value)
    return undefined

  const date = new Date(value)

  if (Number.isNaN(date.getTime()))
    return undefined

  if (mode === 'start')
    date.setHours(0, 0, 0, 0)
  else
    date.setHours(23, 59, 59, 999)

  return date
}

const normalizeAssignedRoles = roles => {
  const roleList = Array.isArray(roles) ? roles : [roles]

  return [...new Set(
    roleList
      .map(role => String(role ?? '').trim().toLowerCase())
      .filter(role => allowedRoles.includes(role)),
  )]
}

const formatPermissionCreatedDate = value => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime()))
    return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${day} ${month} ${year}, ${time}`
}

export const handlerAppsPermission = [
  http.get(('/api/apps/permissions'), ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const role = url.searchParams.get('role') || ''
    const sortBy = url.searchParams.get('sortBy')
    const page = url.searchParams.get('page') || 1
    const itemsPerPage = url.searchParams.get('itemsPerPage') || 10
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const orderBy = url.searchParams.get('orderBy')
    const parsedSortBy = destr(sortBy)
    const sortByLocal = is.string(parsedSortBy) ? parsedSortBy : ''
    const parsedOrderBy = destr(orderBy)
    const orderByLocal = is.string(parsedOrderBy) ? parsedOrderBy : ''
    const parsedItemsPerPage = destr(itemsPerPage)
    const parsedPage = destr(page)
    const itemsPerPageLocal = is.number(parsedItemsPerPage) ? parsedItemsPerPage : 10
    const pageLocal = is.number(parsedPage) ? parsedPage : 1
    const searchQuery = is.string(q) ? q : undefined
    const roleLocal = is.string(role) ? role : undefined
    const queryLower = (searchQuery ?? '').toString().toLowerCase()
    const fromDateLocal = getRangeDate(fromDate, 'start')
    const toDateLocal = getRangeDate(toDate, 'end')
    let filteredPermissions = db.permissions.filter(permission => {
      const createdDate = new Date(permission.createdDate)
      const matchesFromDate = fromDateLocal ? createdDate >= fromDateLocal : true
      const matchesToDate = toDateLocal ? createdDate <= toDateLocal : true
      const matchesRole = roleLocal ? permission.assignedTo.includes(roleLocal) : true

      return (
        permission.name.toLowerCase().includes(queryLower)
        || permission.createdDate.toLowerCase().includes(queryLower)
        || permission.assignedTo.some(item => item.toLowerCase().startsWith(queryLower))
      ) && matchesFromDate && matchesToDate && matchesRole
    })

    if (sortByLocal === 'name') {
      filteredPermissions = filteredPermissions.sort((a, b) => {
        if (orderByLocal === 'asc')
          return a.name.localeCompare(b.name)

        return b.name.localeCompare(a.name)
      })
    }

    return HttpResponse.json({
      permissions: paginateArray(filteredPermissions, itemsPerPageLocal, pageLocal),
      totalPermissions: filteredPermissions.length,
    }, {
      status: 200,
    })
  }),

  http.delete(('/api/apps/permissions/:id'), ({ params }) => {
    const permissionId = Number(params.id)
    const permissionIndex = db.permissions.findIndex(permission => permission.id === permissionId)

    if (permissionIndex === -1)
      return HttpResponse.json('Permission not found', { status: 404 })

    db.permissions.splice(permissionIndex, 1)

    return new HttpResponse(null, {
      status: 204,
    })
  }),

  http.post(('/api/apps/permissions'), async ({ request }) => {
    const payload = await request.json()
    const permissionName = String(payload.name ?? '').trim()
    const assignedTo = normalizeAssignedRoles(payload.assignedTo)
    const createdDate = String(payload.createdDate ?? '').trim() || formatPermissionCreatedDate(new Date())

    if (!permissionName || !assignedTo.length)
      return HttpResponse.json('Invalid permission payload', { status: 400 })

    const nextId = db.permissions.reduce((max, permission) => Math.max(max, permission.id), 0) + 1
    const permission = {
      id: nextId,
      name: permissionName,
      assignedTo,
      createdDate,
    }

    db.permissions.unshift(permission)

    return HttpResponse.json({ permission }, { status: 201 })
  }),

  http.patch(('/api/apps/permissions/:id'), async ({ params, request }) => {
    const permissionId = Number(params.id)
    const payload = await request.json()
    const permission = db.permissions.find(item => item.id === permissionId)

    if (!permission)
      return HttpResponse.json('Permission not found', { status: 404 })

    if ('name' in payload) {
      const permissionName = String(payload.name ?? '').trim()

      if (!permissionName)
        return HttpResponse.json('Permission name is required', { status: 400 })

      permission.name = permissionName
    }

    if ('assignedTo' in payload) {
      const assignedTo = normalizeAssignedRoles(payload.assignedTo)

      if (!assignedTo.length)
        return HttpResponse.json('Assigned roles are required', { status: 400 })

      permission.assignedTo = assignedTo
    }

    if ('createdDate' in payload) {
      const createdDate = String(payload.createdDate ?? '').trim()

      permission.createdDate = createdDate || permission.createdDate
    }

    return HttpResponse.json({ permission }, { status: 200 })
  }),
]
