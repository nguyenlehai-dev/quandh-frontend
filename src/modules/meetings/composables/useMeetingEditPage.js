/* eslint-disable camelcase */
/* eslint-disable padding-line-between-statements */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { fetchUsers } from '@/modules/auth/user/services/userService'
import {
  createMeeting,
  fetchAttendeeGroups,
  fetchMeeting,
  fetchMeetingTypes,
  updateMeeting,
} from '@/modules/meetings/services/meetingService'

const TAB_QUERY_ALIASES = {
  attendees: 'attendees',
  conclusions: 'conclusions',
  documents: 'documents',
  general: 'general',
  materials: 'documents',
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

function cloneInitialFormData() {
  return JSON.parse(JSON.stringify(initialFormData))
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

function buildMeetingPayload(formData) {
  const cleanAgendas = (formData.agendas || []).map(agenda => ({
    ...(agenda.id ? { id: agenda.id } : {}),
    title: agenda.title,
    duration: agenda.duration || null,
    presenter_id: agenda.presenter_id || null,
  }))

  return {
    title: formData.title,
    description: formData.description || null,
    location: formData.location || null,
    meeting_type_id: formData.meeting_type_id || null,
    start_at: formatMeetingDateToBackend(formData.start_at) || null,
    end_at: formatMeetingDateToBackend(formData.end_at) || null,
    status: formData.status || 'draft',
    agendas: cleanAgendas.length > 0 ? cleanAgendas : null,
  }
}

export function useMeetingEditPage() {
  const route = useRoute()
  const router = useRouter()

  const isEditMode = computed(() => !!route.params.id)
  const activeTab = ref('general')
  const loading = ref(false)
  const loadingGroups = ref(false)
  const submittingAction = ref(null)

  const snackbar = ref({
    show: false,
    message: '',
    color: 'success',
  })

  const formData = ref(cloneInitialFormData())
  const userList = ref([])
  const meetingTypeList = ref([])
  const attendeeGroupsForType = ref([])
  const selectedGroupIds = ref([])

  const showMessage = (message, color = 'success') => {
    snackbar.value = {
      show: true,
      message,
      color,
    }
  }

  const tabsConfig = computed(() => [
    { value: 'general', label: 'Thong tin & lich trinh', icon: 'tabler-list-details', editOnly: false },
    { value: 'documents', label: 'Tai lieu cuoc hop', icon: 'tabler-file-text', editOnly: true },
    { value: 'attendees', label: 'Thanh phan tham du', icon: 'tabler-users-group', editOnly: false },
    { value: 'voting', label: 'Bieu quyet cuoc hop', icon: 'tabler-checkbox', editOnly: true },
    { value: 'conclusions', label: 'Ket luan cuoc hop', icon: 'tabler-file-check', editOnly: true },
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

  const fetchMeetingDetails = async () => {
    loading.value = true

    try {
      const res = await fetchMeeting(route.params.id)
      const data = res.data

      if (!data) return

      formData.value = {
        title: data.title || '',
        meeting_type_id: data.meeting_type_id || null,
        description: data.description || '',
        location: data.location || '',
        start_at: formatMeetingDateToInput(data.start_at),
        end_at: formatMeetingDateToInput(data.end_at),
        status: data.status || 'draft',
        agendas: data.agendas || [],
        attendees: data.participants || [],
      }
    }
    catch (err) {
      console.error('Loi khi tai du lieu cuoc hop', err)
      showMessage('Co loi xay ra khi tai cuoc hop', 'error')
    }
    finally {
      loading.value = false
    }
  }

  const loadMeetingTypes = async () => {
    try {
      const res = await fetchMeetingTypes({ limit: 100 })
      const items = res.data?.data || res.data || []

      meetingTypeList.value = items.map(item => ({
        value: item.id,
        title: item.name,
      }))
    }
    catch (error) {
      console.error('Loi khi tai danh sach loai cuoc hop', error)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetchUsers({ limit: 100 })
      const items = res.data || []

      userList.value = items.map(item => ({
        value: item.id,
        title: item.full_name || item.name || item.email,
      }))
    }
    catch (error) {
      console.error('Loi khi tai danh sach nguoi dung', error)
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
      console.error('Loi khi tai nhom theo loai cuoc hop', error)
    }
    finally {
      loadingGroups.value = false
    }
  }

  const autoFillFromGroups = () => {
    const groups = attendeeGroupsForType.value.filter(group => selectedGroupIds.value.includes(group.id))
    const existingNames = new Set(formData.value.attendees.map(item => item.name?.toLowerCase()).filter(Boolean))

    groups.forEach(group => {
      ;(group.members || []).forEach(member => {
        const normalizedName = member.name?.toLowerCase()
        if (!normalizedName || existingNames.has(normalizedName)) return

        formData.value.attendees.push({
          name: member.name,
          position: 'member',
          type: 'internal',
          user_id: member.id,
        })

        existingNames.add(normalizedName)
      })
    })

    showMessage(`Da them thanh vien tu ${groups.length} nhom`)
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
      showMessage('Vui long nhap ten cuoc hop', 'error')
      activeTab.value = 'general'
      return
    }

    submittingAction.value = actionType

    try {
      const payload = buildMeetingPayload(formData.value)
      let savedMeetingId = route.params.id

      if (isEditMode.value) {
        await updateMeeting(route.params.id, payload)
        showMessage('Da cap nhat cuoc hop thanh cong')
      }
      else {
        const resp = await createMeeting(payload)
        savedMeetingId = resp.data?.id || resp.id
        showMessage('Da tao cuoc hop thanh cong')
      }

      if (actionType === 'save-add') {
        formData.value = cloneInitialFormData()
        router.replace({ name: 'meetings-create' })
      }
      else if (actionType === 'save-edit') {
        if (!isEditMode.value)
          router.replace({ name: 'meetings-edit', params: { id: savedMeetingId }, query: { tab: 'documents' } })
        else
          await fetchMeetingDetails()
      }
      else {
        router.push({ name: 'meetings-list' })
      }
    }
    catch (err) {
      console.error('Loi khi luu cuoc hop', err)

      const errData = err?.response?._data || err?.data
      if (errData)
        console.error('Backend validation errors:', errData)

      let message = 'Loi khi luu cuoc hop. Vui long kiem tra lai thong tin.'

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
