import is from '@sindresorhus/is'
import { destr } from 'destr'
import { HttpResponse, http } from 'msw'
import { db } from '@db/apps/users/db'
import { paginateArray } from '@api-utils/paginateArray'

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

const getUserCreatedDate = user => {
  const createdDate = new Date('2023-01-01')

  createdDate.setDate(createdDate.getDate() + user.id * 3)

  return createdDate
}

const getUserRoles = user => {
  if (Array.isArray(user.roles) && user.roles.length)
    return user.roles

  if (Array.isArray(user.roleAssignments) && user.roleAssignments.length)
    return user.roleAssignments.map(item => item.userRole).filter(Boolean)

  return user.role ? [user.role] : []
}

export const handlerAppsUsers = [
  // Get Users Details
  http.get(('/api/apps/users'), ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    const role = url.searchParams.get('role')
    const plan = url.searchParams.get('plan')
    const status = url.searchParams.get('status')
    const sortBy = url.searchParams.get('sortBy')
    const itemsPerPage = url.searchParams.get('itemsPerPage')
    const page = url.searchParams.get('page')
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const orderBy = url.searchParams.get('orderBy')
    const searchQuery = is.string(q) ? q : undefined
    const queryLower = (searchQuery ?? '').toString().toLowerCase()
    const parsedSortBy = destr(sortBy)
    const sortByLocal = is.string(parsedSortBy) ? parsedSortBy : ''
    const parsedOrderBy = destr(orderBy)
    const orderByLocal = is.string(parsedOrderBy) ? parsedOrderBy : ''
    const parsedItemsPerPage = destr(itemsPerPage)
    const parsedPage = destr(page)
    const itemsPerPageLocal = is.number(parsedItemsPerPage) ? parsedItemsPerPage : 10
    const pageLocal = is.number(parsedPage) ? parsedPage : 1
    const fromDateLocal = getRangeDate(fromDate, 'start')
    const toDateLocal = getRangeDate(toDate, 'end')

    // filter users
    let filteredUsers = db.users.filter(user => {
      const createdDate = getUserCreatedDate(user)
      const matchesFromDate = fromDateLocal ? createdDate >= fromDateLocal : true
      const matchesToDate = toDateLocal ? createdDate <= toDateLocal : true

      return ((user.fullName.toLowerCase().includes(queryLower) || user.email.toLowerCase().includes(queryLower))
        && (role ? getUserRoles(user).includes(role) : true)
        && user.currentPlan === (plan || user.currentPlan)
        && user.status === (status || user.status)
        && matchesFromDate
        && matchesToDate)
    }).reverse()

    // sort users
    if (sortByLocal) {
      console.log(sortByLocal)
      if (sortByLocal === 'user') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.fullName.localeCompare(b.fullName)
          else
            return b.fullName.localeCompare(a.fullName)
        })
      }
      if (sortByLocal === 'email') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.email.localeCompare(b.email)
          else
            return b.email.localeCompare(a.email)
        })
      }
      if (sortByLocal === 'role') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.role.localeCompare(b.role)
          else
            return b.role.localeCompare(a.role)
        })
      }
      if (sortByLocal === 'plan') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.currentPlan.localeCompare(b.currentPlan)
          else
            return b.currentPlan.localeCompare(a.currentPlan)
        })
      }
      if (sortByLocal === 'status') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.status.localeCompare(b.status)
          else
            return b.status.localeCompare(a.status)
        })
      }
      if (sortByLocal === 'billing') {
        filteredUsers = filteredUsers.sort((a, b) => {
          if (orderByLocal === 'asc')
            return a.billing.localeCompare(b.billing)
          else
            return b.billing.localeCompare(a.billing)
        })
      }
    }
    const totalUsers = filteredUsers.length

    // total pages
    const totalPages = Math.ceil(totalUsers / itemsPerPageLocal)
    
    return HttpResponse.json({
      users: paginateArray(filteredUsers, itemsPerPageLocal, pageLocal),
      totalPages,
      totalUsers,
      page: pageLocal > Math.ceil(totalUsers / itemsPerPageLocal) ? 1 : page,
    }, { status: 200 })
  }),

  // Get Single User Detail
  http.get(('/api/apps/users/:id'), ({ params }) => {
    const userId = Number(params.id)
    const user = db.users.find(e => e.id === userId)
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    else {
      return HttpResponse.json({
        ...user,
        ...{
          taskDone: 1230,
          projectDone: 568,
          taxId: 'Tax-8894',
          language: 'English',
        },
      }, { status: 200 })
    }
  }),

  // Delete User
  http.delete(('/api/apps/users/:id'), ({ params }) => {
    const userId = Number(params.id)
    const userIndex = db.users.findIndex(e => e.id === userId)
    if (userIndex === -1) {
      return HttpResponse.json('User not found', { status: 404 })
    }
    else {
      db.users.splice(userIndex, 1)
      
      return new HttpResponse(null, {
        status: 204,
      })
    }
  }),

  // Update User
  http.patch(('/api/apps/users/:id'), async ({ params, request }) => {
    const userId = Number(params.id)
    const payload = await request.json()
    const user = db.users.find(e => e.id === userId)

    if (!user)
      return HttpResponse.json('User not found', { status: 404 })

    Object.assign(user, payload)

    return HttpResponse.json({ user }, { status: 200 })
  }),

  // 👉 Add user
  http.post(('/api/apps/users'), async ({ request }) => {
    const user = await request.json()
    const createdUser = {
      ...user,
      id: db.users.length + 1,
    }

    db.users.push(createdUser)
    
    return HttpResponse.json({ body: createdUser, user: createdUser }, { status: 201 })
  }),
]
