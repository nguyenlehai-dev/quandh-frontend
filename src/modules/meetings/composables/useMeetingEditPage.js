/* eslint-disable camelcase */
/* eslint-disable padding-line-between-statements */
/* eslint-disable vue/no-irregular-whitespace */

import { fetchUsers } from '@/modules/auth/user/services/userService'
import { createMeeting, fetchAttendeeGroups, fetchMeeting, fetchMeetingTypes, updateMeeting } from '@/modules/meetings/services/meetingService'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const TAB_QUERY_ALIASES = {
  attendees: 'attendees',
  conclusions: 'conclusions',
  documents: 'documents',
  general: 'general',
  participants: 'attendees',
  voting: 'voting',
  votes: 'voting',
}

const dateTimeConfig = {
  enableTime: true,
  dateFormat: 'Y-m-d H:i',
}

const timeConfig = {
  enableTime: true,
  noCalendar: true,
  dateFormat: 'H:i',
}

const initialFormData = {
  title: '',
  description: '',
  room_name: '',
  location: '',
  meeting_type_id: null,
  start_at: '',
  end_at: '',
  status: 'draft',
  agendas: [],
  attendees: [],
}

function formatMeetingDateToInput(dateStr) {
  if (!dateStr) return ''

  if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')
    if (parts.length !== 2) return dateStr
    const timePart = parts[0]
    const datePart = parts[1].split('/')
    if (datePart.length !== 3) return dateStr

    return `${datePart[2]}-${datePart[1]}-${datePart[0]} ${timePart.slice(0, 5)}`
  }

  return dateStr.replace('T', ' ').slice(0, 16)
}

function formatMeetingDateToBackend(datetimeLocal) {
  if (!datetimeLocal) return ''
  if (datetimeLocal.length === 16 && datetimeLocal.includes(' '))
    return `${datetimeLocal}:00`

  return `${datetimeLocal.replace('T', ' ')}:00`
}

export function useMeetingEditPage() {
  const route = useRoute()
  const router = useRouter()
  const isEditMode = computed(() => !!route.params.id)

  const activeTab = ref('general')
  const loading = ref(false)
  const submittingAction = ref(null)
  const snackbar = ref({ show: false, message: '', color: 'success' })
  const formData = ref(JSON.parse(JSON.stringify(initialFormData)))
  const userList = ref([])
  const meetingTypeList = ref([])
  const attendeeGroupsForType = ref([])
  const loadingGroups = ref(false)
  const selectedGroupIds = ref([])

  const showMessage = (message, color = 'success') => {
    snackbar.value = { show: true, message, color }
  }

  const fetchMeetingDetails = async () => {
    loading.value = true
    try {
      const res = await fetchMeeting(route.params.id)
      if (res.data) {
        formData.value = {
          title: res.data.title || '',
          meeting_type_id: res.data.meeting_type_id || null,
          description: res.data.description || '',
          location: res.data.location || '',
          start_at: formatMeetingDateToInput(res.data.start_at),
          end_at: formatMeetingDateToInput(res.data.end_at),
          status: res.data.status || 'draft',
          agendas: res.data.agendas || [],
          attendees: res.data.participants || [],
        }
      }
    }
    catch (err) {
      console.error('Lá»—i khi táº£i dá»¯ liá»‡u cuá»™c há»p', err)
      showMessage('CÃ³ lá»—i xáº£y ra khi táº£i cuá»™c há»p', 'error')
    }
    finally {
      loading.value = false
    }
  }

  const loadMeetingTypes = async () => {
    try {
      const res = await fetchMeetingTypes({ limit: 100 })

      meetingTypeList.value = (res.data?.data || res.data || []).map(t => ({
        value: t.id,
        title: t.name,
      }))
    }
    catch (error) {
      console.error('Lá»—i khi táº£i danh sÃ¡ch loáº¡i cuá»™c há»p', error)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetchUsers({ limit: 100 })

      userList.value = (res.data || []).map(u => ({
        value: u.id,
        title: u.full_name || u.name || u.email,
      }))
    }
    catch (error) {
      console.error('Lá»—i khi táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng', error)
    }
  }

  const loadAttendeeGroupsForType = async meetingTypeId => {
    if (!meetingTypeId) {
      attendeeGroupsForType.value = []

      return
    }

    loadingGroups.value = true
    try {
      const res = await fetchAttendeeGroups({ meeting_type_id: meetingTypeId, limit: 100 })
      attendeeGroupsForType.value = res.data?.data || res.data || []
    }
    catch (error) {
      console.error('Lá»—i khi táº£i nhÃ³m theo loáº¡i cuá»™c há»p', error)
    }
    finally {
      loadingGroups.value = false
    }
  }

  const autoFillFromGroups = () => {
    const groups = attendeeGroupsForType.value.filter(g => selectedGroupIds.value.includes(g.id))
    const existingNames = new Set(formData.value.attendees.map(a => a.name?.toLowerCase()))

    groups.forEach(group => {
      if (!group.members) return

      group.members.forEach(member => {
        if (!existingNames.has(member.name?.toLowerCase())) {
          formData.value.attendees.push({
            name: member.name,
            position: 'member',
            type: 'internal',
            user_id: member.id,
          })
          existingNames.add(member.name?.toLowerCase())
        }
      })
    })

    showMessage(`ÄÃ£ thÃªm thÃ nh viÃªn tá»« ${groups.length} nhÃ³m`, 'success')
  }

  const addAgendaItem = () => {
    formData.value.agendas.push({
      title: '',
      duration: 0,
      presenter_id: null,
      start_time: '',
      end_time: '',
    })
  }

  const removeAgendaItem = index => {
    formData.value.agendas.splice(index, 1)
  }

  const addAttendeeItem = () => {
    formData.value.attendees.push({
      name: '',
      position: 'member',
      type: 'internal',
    })
  }

  const removeAttendeeItem = index => {
    formData.value.attendees.splice(index, 1)
  }

  const submitForm = async actionType => {
    if (!formData.value.title) {
      showMessage('Vui lÃ²ng nháº­p tÃªn cuá»™c há»p', 'error')
      activeTab.value = 'general'

      return
    }

    submittingAction.value = actionType
    try {
      const cleanAgendas = (formData.value.agendas || []).map(agenda => ({
        ...(agenda.id ? { id: agenda.id } : {}),
        title: agenda.title,
        duration: agenda.duration || null,
        presenter_id: agenda.presenter_id || null,
      }))

      const payload = {
        title: formData.value.title,
        description: formData.value.description || null,
        location: formData.value.location || null,
        meeting_type_id: formData.value.meeting_type_id || null,
        start_at: formatMeetingDateToBackend(formData.value.start_at) || null,
        end_at: formatMeetingDateToBackend(formData.value.end_at) || null,
        status: formData.value.status || 'draft',
        agendas: cleanAgendas.length > 0 ? cleanAgendas : null,
      }

      let savedMeetingId = route.params.id

      if (isEditMode.value) {
        await updateMeeting(route.params.id, payload)
        showMessage('ÄÃ£ cáº­p nháº­t cuá»™c há»p thÃ nh cÃ´ng')
      }
      else {
        const resp = await createMeeting(payload)
        savedMeetingId = resp.data?.id || resp.id
        showMessage('ÄÃ£ táº¡o cuá»™c há»p thÃ nh cÃ´ng')
      }

      if (actionType === 'save-add') {
        formData.value = JSON.parse(JSON.stringify(initialFormData))
        router.replace({ name: 'meetings-create' })
      }
      else if (actionType === 'save-edit') {
        if (!isEditMode.value)
          router.replace({ name: 'meetings-edit', params: { id: savedMeetingId } })
        else
          fetchMeetingDetails()
      }
      else {
        router.push({ name: 'meetings-list' })
      }
    }
    catch (err) {
      console.error('Lá»—i khi lÆ°u cuá»™c há»p', err)

      const errData = err?.response?._data || err?.data
      if (errData)
        console.error('Backend validation errors:', errData)

      let message = 'Lá»—i khi lÆ°u cuá»™c há»p. Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin.'
      if (errData?.errors) {
        const firstErrors = Object.values(errData.errors).map(error => Array.isArray(error) ? error[0] : error)
        message = firstErrors.join(' | ')
      }
      else if (errData?.message) {
        message = errData.message
      }

      showMessage(message, 'error')
    }
    finally {
      submittingAction.value = null
    }
  }

  const tabsConfig = computed(() => [
    { value: 'general', label: 'ThÃ´ng tin & Lá»‹ch trÃ¬nh', icon: 'tabler-list-details', editOnly: false },
    { value: 'documents', label: 'TÃ i liá»‡u Ä‘Ã­nh kÃ¨m', icon: 'tabler-file-text', editOnly: true },
    { value: 'attendees', label: 'ThÃ nh pháº§n tham dá»±', icon: 'tabler-users-group', editOnly: false },
    { value: 'voting', label: 'Biá»ƒu quyáº¿t', icon: 'tabler-checkbox', editOnly: true },
    { value: 'conclusions', label: 'Káº¿t luáº­n cuá»™c há»p', icon: 'tabler-file-check', editOnly: true },
  ])

  const isTabDisabled = tabValue => {
    const tab = tabsConfig.value.find(item => item.value === tabValue)

    return tab?.editOnly && !isEditMode.value
  }

  const syncActiveTabFromRoute = () => {
    const nextTab = TAB_QUERY_ALIASES[route.query.tab]
    if (!nextTab || isTabDisabled(nextTab)) return

    activeTab.value = nextTab
  }

  watch(() => formData.value.meeting_type_id, newValue => {
    selectedGroupIds.value = []
    loadAttendeeGroupsForType(newValue)
  })

  watch(() => route.query.tab, () => {
    syncActiveTabFromRoute()
  })

  watch(activeTab, tab => {
    const currentQueryTab = TAB_QUERY_ALIASES[route.query.tab] || route.query.tab
    if (currentQueryTab === tab) return

    router.replace({
      query: {
        ...route.query,
        tab,
      },
    })
  })

  onMounted(() => {
    loadUsers()
    loadMeetingTypes()
    if (isEditMode.value)
      fetchMeetingDetails()

    syncActiveTabFromRoute()
  })

  return {
    activeTab,
    addAgendaItem,
    addAttendeeItem,
    attendeeGroupsForType,
    autoFillFromGroups,
    dateTimeConfig,
    formData,
    isEditMode,
    isTabDisabled,
    loading,
    loadingGroups,
    meetingTypeList,
    removeAgendaItem,
    removeAttendeeItem,
    route,
    router,
    selectedGroupIds,
    snackbar,
    submitForm,
    submittingAction,
    tabsConfig,
    timeConfig,
    userList,
  }
}
